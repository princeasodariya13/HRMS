'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LeaveAllocationStatus } from '@prisma/client'

export async function createLeaveAllocation(data: {
  employeeId: string;
  leaveTypeId: string;
  numberOfDays: number;
  dateFrom: string;
  dateTo: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    if (!isSuperAdmin && !companyId) throw new Error("Access denied");

    // Check employee access
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee || (!isSuperAdmin && employee.companyId !== companyId)) {
      throw new Error("Employee not found or access denied");
    }

    await prisma.leaveAllocation.create({
      data: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        numberOfDays: data.numberOfDays,
        remainingDays: data.numberOfDays,
        takenDays: 0,
        dateFrom: new Date(data.dateFrom),
        dateTo: new Date(data.dateTo),
        status: 'DRAFT'
      }
    });

    revalidatePath('/dashboard/admin/leave-allocations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateLeaveAllocationStatus(id: string, status: LeaveAllocationStatus) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    const existing = await prisma.leaveAllocation.findUnique({ 
      where: { id },
      include: { employee: true }
    });

    if (!existing || (!isSuperAdmin && existing.employee.companyId !== companyId)) {
      throw new Error("Allocation not found or access denied");
    }

    await prisma.leaveAllocation.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/dashboard/admin/leave-allocations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteLeaveAllocation(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    const existing = await prisma.leaveAllocation.findUnique({ 
      where: { id },
      include: { employee: true }
    });

    if (!existing || (!isSuperAdmin && existing.employee.companyId !== companyId)) {
      throw new Error("Allocation not found or access denied");
    }

    await prisma.leaveAllocation.delete({ where: { id } });

    revalidatePath('/dashboard/admin/leave-allocations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
