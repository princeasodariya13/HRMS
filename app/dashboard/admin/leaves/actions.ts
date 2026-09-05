'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LeaveStatus } from '@prisma/client'
import { logAudit } from '@/lib/auditLog';

export async function updateLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED') {
  if (leaveId.length < 10) return { error: "Cannot modify demo data." }

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found")

    // Fetch the leave request first
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { 
        id: leaveId,
        companyId: dbUser.companyId
      }
    });

    if (!leaveRequest) throw new Error("Leave request not found");
    if (leaveRequest.status === status) return { success: true };

    if (status === 'APPROVED' && leaveRequest.leaveTypeId) {
      // Find a matching allocation
      const allocation = await prisma.leaveAllocation.findFirst({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          status: 'APPROVED',
          dateFrom: { lte: leaveRequest.startDate },
          dateTo: { gte: leaveRequest.endDate }
        },
        orderBy: { dateTo: 'asc' }
      });

      if (!allocation) {
        return { error: "No valid approved leave allocation covers this date range." };
      }
      if (allocation.remainingDays < leaveRequest.totalDays) {
        return { error: `Insufficient balance. Only ${allocation.remainingDays} days remaining.` };
      }

      await prisma.leaveAllocation.update({
        where: { id: allocation.id },
        data: {
          takenDays: { increment: leaveRequest.totalDays },
          remainingDays: { decrement: leaveRequest.totalDays }
        }
      });
    } else if (leaveRequest.status === 'APPROVED' && status === 'REJECTED' && leaveRequest.leaveTypeId) {
      // If it was already approved and is now being rejected, we need to refund the balance.
      const allocation = await prisma.leaveAllocation.findFirst({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          status: 'APPROVED',
          dateFrom: { lte: leaveRequest.startDate },
          dateTo: { gte: leaveRequest.endDate }
        },
        orderBy: { dateTo: 'asc' }
      });

      if (allocation) {
        await prisma.leaveAllocation.update({
          where: { id: allocation.id },
          data: {
            takenDays: { decrement: leaveRequest.totalDays },
            remainingDays: { increment: leaveRequest.totalDays }
          }
        });
      }
    }

    const leave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status, approvedById: user.id },
      include: { employee: true }
    });

    if (leave.employee?.userId) {
      try {
        await prisma.notification.create({
          data: {
            companyId: dbUser.companyId,
            userId: leave.employee.userId,
            title: `Leave ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
            message: `Your leave request for ${leave.totalDays} day(s) has been ${status.toLowerCase()}.`,
            type: "LEAVE",
            link: "/dashboard/employee/leaves"
          }
        });
      } catch (e) {
        console.warn("Could not create notification");
      }
    }

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'LEAVE',
      action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
      recordId: leaveId,
      oldData: { status: 'PENDING' },
      newData: { status, totalDays: leave.totalDays, leaveTypeId: leave.leaveTypeId },
    });

    revalidatePath('/dashboard', 'layout')
    return { success: true }
  } catch (error: any) {
    console.error("Update Leave Error:", error)
    return { error: error.message || "Failed to update leave request" }
  }
}
