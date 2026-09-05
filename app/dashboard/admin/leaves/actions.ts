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

    const leave = await prisma.leaveRequest.update({
      where: { 
        id: leaveId,
        companyId: dbUser.companyId
      },
      data: { status },
      include: { employee: true }
    })

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
