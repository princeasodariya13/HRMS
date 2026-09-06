"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/auditLog";
import prisma from "@/lib/prisma";

export async function applyLeave(formData: FormData) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { employee: true }
  });

  if (!dbUser || !dbUser.employee) {
    throw new Error("Employee record not found");
  }

  const employee = dbUser.employee;
  const leaveTypeId = formData.get("leaveTypeId") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const reason = formData.get("reason") as string;

  if (!startDateStr || !endDateStr || !reason) {
    throw new Error("Missing required fields");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Calculate total days (inclusive, skipping weekends for a real app, but simple math for now)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end

  if (diffDays <= 0) {
    throw new Error("End date must be after start date");
  }

  try {
    const record = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        companyId: employee.companyId,
        leaveTypeId: leaveTypeId || "Casual Leave",
        startDate: startDate,
        endDate: endDate,
        totalDays: diffDays,
        reason: reason,
        status: "PENDING"
      }
    });

    await logAudit({
      companyId: employee.companyId,
      userId: user.id,
      module: 'LEAVE',
      action: 'CREATE',
      recordId: record.id,
      oldData: null,
      newData: { status: "PENDING", startDate, endDate, totalDays: diffDays },
    });

    // Notify Admins
    try {
      const admins = await prisma.user.findMany({
        where: { companyId: employee.companyId, role: { in: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'] } }
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            companyId: employee.companyId,
            userId: admin.id,
            title: "New Leave Request",
            message: `${employee.firstName} ${employee.lastName} has requested ${diffDays} day(s) of leave.`,
            type: "LEAVE",
            link: "/dashboard/admin/leaves"
          }))
        });
      }
    } catch (e) {
      console.warn("Could not create notification for leave");
    }

    revalidatePath('/dashboard', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error("Leave request error:", error);
    return { error: error.message || "Failed to submit leave request" };
  }
}

export async function deleteLeave(leaveId: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (!dbUser || !dbUser.employee) throw new Error("Employee not found");

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId }
    });

    if (!leave || leave.status !== 'PENDING') {
      return { error: "Only pending leaves can be cancelled" };
    }

    // Security check: verify this leave belongs to the current employee
    if (leave.employeeId !== dbUser.employee.id) {
      return { error: "Access denied" };
    }

    await prisma.leaveRequest.delete({
      where: { id: leaveId }
    });

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'LEAVE',
      action: 'DELETE',
      recordId: leaveId,
      oldData: { status: leave.status },
      newData: null,
    });

    revalidatePath("/dashboard/employee/leaves");
    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (error: any) {
    console.error("Delete leave error:", error);
    return { error: "Failed to cancel leave request" };
  }
}
