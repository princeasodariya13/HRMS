'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContractStatus } from '@prisma/client'
import { logAudit } from '@/lib/auditLog'

export async function getContracts(employeeId?: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    if (!isSuperAdmin && !companyId) throw new Error("Company ID required");

    const whereClause: any = {};
    if (!isSuperAdmin) {
      whereClause.companyId = companyId;
    }
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: {
        employee: true,
        salaryStructure: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return { data: contracts };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createContract(data: {
  employeeId: string;
  startDate: string;
  endDate?: string | null;
  wage: number;
  departmentId?: string | null;
  jobPosition?: string | null;
  salaryStructureId?: string | null;
  status: ContractStatus;
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

    const isActive = data.status === 'RUNNING';

    // If making this RUNNING, set all other contracts for this employee to EXPIRED
    if (isActive) {
      await prisma.contract.updateMany({
        where: { employeeId: data.employeeId, id: { not: undefined } },
        data: { status: 'EXPIRED', isActive: false }
      });
    }

    const contract = await prisma.contract.create({
      data: {
        companyId: employee.companyId,
        employeeId: data.employeeId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        wage: data.wage,
        departmentId: data.departmentId || null,
        jobPosition: data.jobPosition || null,
        salaryStructureId: data.salaryStructureId || null,
        status: data.status,
        isActive
      }
    });
    await logAudit({
      companyId: employee.companyId,
      userId: user.id,
      module: 'CONTRACT',
      action: 'CREATE',
      recordId: contract.id,
      oldData: null,
      newData: { status: data.status, wage: data.wage, startDate: data.startDate },
    });

    revalidatePath('/dashboard/admin/contracts');
    revalidatePath('/dashboard/admin/employees');
    return { success: true, contractId: contract.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateContract(id: string, data: {
  startDate: string;
  endDate?: string | null;
  wage: number;
  departmentId?: string | null;
  jobPosition?: string | null;
  salaryStructureId?: string | null;
  status: ContractStatus;
}) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    const existingContract = await prisma.contract.findUnique({ where: { id } });
    if (!existingContract || (!isSuperAdmin && existingContract.companyId !== companyId)) {
      throw new Error("Contract not found or access denied");
    }

    const isActive = data.status === 'RUNNING';

    if (isActive) {
      await prisma.contract.updateMany({
        where: { employeeId: existingContract.employeeId, id: { not: id } },
        data: { status: 'EXPIRED', isActive: false }
      });
    }

    await prisma.contract.update({
      where: { id },
      data: {
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        wage: data.wage,
        departmentId: data.departmentId || null,
        jobPosition: data.jobPosition || null,
        salaryStructureId: data.salaryStructureId || null,
        status: data.status,
        isActive
      }
    });
    await logAudit({
      companyId: existingContract.companyId,
      userId: user.id,
      module: 'CONTRACT',
      action: 'UPDATE',
      recordId: id,
      oldData: { status: existingContract.status, wage: existingContract.wage },
      newData: { status: data.status, wage: data.wage },
    });

    revalidatePath('/dashboard/admin/contracts');
    revalidatePath('/dashboard/admin/employees');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteContract(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    const existingContract = await prisma.contract.findUnique({ where: { id } });
    if (!existingContract || (!isSuperAdmin && existingContract.companyId !== companyId)) {
      throw new Error("Contract not found or access denied");
    }

    await prisma.contract.delete({ where: { id } });
    await logAudit({
      companyId: existingContract.companyId,
      userId: user.id,
      module: 'CONTRACT',
      action: 'DELETE',
      recordId: id,
      oldData: { status: existingContract.status, wage: existingContract.wage },
      newData: null,
    });

    revalidatePath('/dashboard/admin/contracts');
    revalidatePath('/dashboard/admin/employees');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

