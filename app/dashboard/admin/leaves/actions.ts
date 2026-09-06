'use server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAudit } from '@/lib/auditLog';
import { canManagerApproveLeave, canHrApproveLeave } from '@/lib/permissions';

async function getActor() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

async function adjustAllocation(employeeId: string, leaveTypeId: string | null, startDate: Date, endDate: Date, totalDays: number, direction: 'deduct' | 'refund') {
  if (!leaveTypeId) return;
  const allocation = await prisma.leaveAllocation.findFirst({
    where: { employeeId, leaveTypeId, status: 'APPROVED', dateFrom: { lte: startDate }, dateTo: { gte: endDate } },
    orderBy: { dateTo: 'asc' }
  });
  if (!allocation) return;
  if (direction === 'deduct') {
    await prisma.leaveAllocation.update({ where: { id: allocation.id }, data: { takenDays: { increment: totalDays }, remainingDays: { decrement: totalDays } } });
  } else {
    await prisma.leaveAllocation.update({ where: { id: allocation.id }, data: { takenDays: { decrement: totalDays }, remainingDays: { increment: totalDays } } });
  }
}

async function notifyEmployee(companyId: string, employeeUserId: string, title: string, message: string, link: string) {
  try {
    await prisma.notification.create({ data: { companyId, userId: employeeUserId, title, message, type: "LEAVE", link } });
  } catch (e) { console.warn("[Notify] Could not create notification:", e); }
}

export async function updateLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
  if (leaveId.length < 10) return { error: "Cannot modify demo data." };
  try {
    const actor = await getActor();
    if (!canManagerApproveLeave(actor.role)) return { error: "Forbidden: You cannot approve/reject leave." };
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: actor.role === 'SUPER_ADMIN' ? { id: leaveId } : { id: leaveId, companyId: actor.companyId! },
      include: { employee: true, leaveType: true }
    });
    if (!leaveRequest) throw new Error("Leave request not found");
    if (leaveRequest.status === status) return { success: true };
    if (status === 'APPROVED' && leaveRequest.leaveTypeId) {
      const allocation = await prisma.leaveAllocation.findFirst({
        where: { employeeId: leaveRequest.employeeId, leaveTypeId: leaveRequest.leaveTypeId, status: 'APPROVED', dateFrom: { lte: leaveRequest.startDate }, dateTo: { gte: leaveRequest.endDate } }
      });
      if (!allocation) return { error: "No valid approved leave allocation covers this date range." };
      if (allocation.remainingDays < leaveRequest.totalDays) return { error: `Insufficient balance. Only ${allocation.remainingDays} days remaining.` };
    }
    if (leaveRequest.status === 'APPROVED' && status === 'REJECTED') {
      await adjustAllocation(leaveRequest.employeeId, leaveRequest.leaveTypeId, leaveRequest.startDate, leaveRequest.endDate, leaveRequest.totalDays, 'refund');
    }
    if (status === 'APPROVED') {
      await adjustAllocation(leaveRequest.employeeId, leaveRequest.leaveTypeId, leaveRequest.startDate, leaveRequest.endDate, leaveRequest.totalDays, 'deduct');
    }
    const isHrRole = canHrApproveLeave(actor.role);
    const updateData: any = { status, approvedById: actor.id, rejectionReason: status === 'REJECTED' ? (rejectionReason || null) : null };
    if (isHrRole) {
      updateData.hrApprovalStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      updateData.approvedByHrId = actor.id;
      if (status === 'APPROVED') updateData.managerApprovalStatus = 'APPROVED';
    } else {
      updateData.managerApprovalStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    }
    const leave = await prisma.leaveRequest.update({ where: { id: leaveId }, data: updateData, include: { employee: true, leaveType: true } });
    if (leave.employee?.userId) {
      const leaveTypeName = leave.leaveType?.name ?? 'Leave';
      await notifyEmployee(leaveRequest.companyId, leave.employee.userId,
        `${leaveTypeName} ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        status === 'APPROVED' ? `Your ${leaveTypeName} for ${leave.totalDays} day(s) has been approved.` : `Your ${leaveTypeName} for ${leave.totalDays} day(s) was rejected.${rejectionReason ? ' Reason: '+rejectionReason : ''}`,
        "/dashboard/employee/leaves"
      );
    }
    await logAudit({ companyId: leaveRequest.companyId, userId: actor.id, module: 'LEAVE', action: status === 'APPROVED' ? 'APPROVE' : 'REJECT', recordId: leaveId, oldData: { status: leaveRequest.status }, newData: { status, totalDays: leave.totalDays, rejectionReason } });
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error("Update Leave Error:", error);
    return { error: error.message || "Failed to update leave request" };
  }
}

export async function managerApproveLeave(leaveId: string) {
  if (leaveId.length < 10) return { error: "Cannot modify demo data." };
  try {
    const actor = await getActor();
    if (!canManagerApproveLeave(actor.role)) return { error: "Forbidden." };
    const leaveRequest = await prisma.leaveRequest.findUnique({ where: actor.role === 'SUPER_ADMIN' ? { id: leaveId } : { id: leaveId, companyId: actor.companyId }, include: { employee: true, leaveType: true } });
    if (!leaveRequest) throw new Error("Leave request not found");
    if (leaveRequest.managerApprovalStatus === 'APPROVED') return { success: true, message: "Already manager-approved" };
    await prisma.leaveRequest.update({ where: { id: leaveId }, data: { managerApprovalStatus: 'APPROVED', approvedById: actor.id } });
    if (leaveRequest.employee?.userId) {
      await notifyEmployee(leaveRequest.companyId, leaveRequest.employee.userId, "Leave — Manager Approved", `Your ${leaveRequest.leaveType?.name ?? 'leave'} was approved by your manager. Awaiting HR.`, "/dashboard/employee/leaves");
    }
    await logAudit({ companyId: leaveRequest.companyId, userId: actor.id, module: 'LEAVE', action: 'MANAGER_APPROVE', recordId: leaveId, oldData: { managerApprovalStatus: 'PENDING' }, newData: { managerApprovalStatus: 'APPROVED' } });
    revalidatePath('/dashboard', 'layout');
    return { success: true, message: "Manager approval recorded." };
  } catch (error: any) {
    return { error: error.message || "Failed to record manager approval" };
  }
}
