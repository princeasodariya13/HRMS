'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PayrollStatus } from '@prisma/client'
import { logAudit } from '@/lib/auditLog';
import { getApplicableContract, calculateWorkedDays, computePayslip } from '@/lib/payroll/engine';
import { renderPayslipPdf } from '@/lib/payroll/payslip-pdf';
import { sendPayslipEmail } from '@/lib/mail';

export async function getEligibleEmployees(month: number, year: number, structureId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) throw new Error("User not found");

  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0); // Last day of month

  // Find all ACTIVE employees in company
  const employees = await prisma.employee.findMany({
    where: { companyId: dbUser.companyId, status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, designation: true }
  });

  const eligible = [];
  for (const emp of employees) {
    const contract = await getApplicableContract(emp.id, periodStart, periodEnd);
    if (contract && contract.salaryStructureId === structureId) {
      eligible.push(emp);
    }
  }

  return eligible;
}

export async function createDraftPayrun(month: number, year: number, structureId: string, employeeIds: string[]) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    const existingRun = await prisma.payrollRun.findUnique({
      where: { companyId_month_year: { companyId: dbUser.companyId, month, year } }
    });

    if (existingRun) {
      return { error: "A payrun already exists for this month." };
    }

    let createdRunId = "";
    await prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: {
          companyId: dbUser.companyId,
          month,
          year,
          periodStart,
          periodEnd,
          salaryStructureId: structureId,
          status: 'DRAFT',
          totalAmount: 0,
        }
      });
      createdRunId = run.id;

      // Create draft payslips (zeroes)
      for (const empId of employeeIds) {
        await tx.payslip.create({
          data: {
            payrollRunId: run.id,
            employeeId: empId,
            basicSalary: 0,
            allowances: 0,
            deductions: 0,
            netSalary: 0
          }
        });
      }
    });

    revalidatePath('/dashboard/admin/payroll');
    return { success: true, runId: createdRunId };
  } catch (error: any) {
    console.error("Create Draft Payrun Error:", error);
    return { error: error.message || "Failed to create payrun." };
  }
}

export async function computePayrun(runId: string) {
  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: runId },
      include: { payslips: true, salaryStructure: { include: { rules: { orderBy: { sequence: 'asc' } } } } }
    });

    if (!run || !run.salaryStructure) throw new Error("Run or structure not found");
    if (run.status === 'PAID') throw new Error("Run is already paid");

    const warnings: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const ps of run.payslips) {
        // Clear old lines
        await tx.payslipLine.deleteMany({ where: { payslipId: ps.id } });

        const contract = await getApplicableContract(ps.employeeId, run.periodStart, run.periodEnd);
        if (!contract) {
          warnings.push(`Employee ${ps.employeeId} has no applicable contract.`);
          continue;
        }

        const { totalWorkingDays, workedDays } = await calculateWorkedDays(ps.employeeId, run.periodStart, run.periodEnd);
        if (workedDays === 0) {
          warnings.push(`Employee ${ps.employeeId} has 0 worked days.`);
        }

        const computed = computePayslip(contract, run.salaryStructure, workedDays, totalWorkingDays);

        await tx.payslip.update({
          where: { id: ps.id },
          data: {
            contractId: contract.id,
            structureId: run.salaryStructureId,
            workedDays,
            totalWorkingDays,
            basicSalary: computed.basic,
            allowances: computed.gross - computed.basic,
            deductions: computed.deductions,
            netSalary: computed.net,
            lines: {
              create: computed.lines.map(line => ({
                code: line.code,
                name: line.name,
                category: line.category,
                amount: line.amount,
                sequence: run.salaryStructure!.rules.find(r => r.id === line.ruleId)?.sequence || 0
              }))
            }
          }
        });
      }

      await tx.payrollRun.update({
        where: { id: runId },
        data: { status: 'PROCESSING' }
      });
    });

    revalidatePath(`/dashboard/admin/payroll/${runId}`);
    return { success: true, warnings };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function validatePayrun(runId: string) {
  try {
    await prisma.payrollRun.update({
      where: { id: runId },
      data: { status: 'APPROVED' }
    });
    revalidatePath(`/dashboard/admin/payroll/${runId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markPayrunPaid(runId: string) {
  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: runId },
      include: { payslips: true }
    });
    if (!run) throw new Error("Run not found");

    const totalAmount = run.payslips.reduce((sum, ps) => sum + ps.netSalary, 0);

    await prisma.payrollRun.update({
      where: { id: runId },
      data: { status: 'PAID', totalAmount }
    });
    revalidatePath(`/dashboard/admin/payroll/${runId}`);
    revalidatePath('/dashboard/admin/payroll');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function sendPayrunPayslips(runId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role === 'EMPLOYEE') throw new Error('Only payroll administrators can send payslips.');

    const run = await prisma.payrollRun.findFirst({
      where: { id: runId, companyId: user.companyId },
      include: { payslips: { include: { employee: true, lines: { orderBy: { sequence: 'asc' } } } } }
    });
    if (!run) throw new Error('Payrun not found');
    if (run.status !== 'PAID') throw new Error('Only paid payruns can be sent.');

    let sent = 0;
    let failed = 0;
    for (const payslip of run.payslips) {
      if (!payslip.employee.workEmail) { failed++; continue; }
      const pdf = await renderPayslipPdf({ ...payslip, payrollRun: run });
      const delivered = await sendPayslipEmail(
        payslip.employee.workEmail,
        `${payslip.employee.firstName} ${payslip.employee.lastName}`,
        `${new Date(run.year, run.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`,
        pdf
      );
      if (delivered) sent++; else failed++;
    }
    return { success: true, sent, failed, total: run.payslips.length };
  } catch (error: any) {
    return { error: error.message || 'Failed to send payslips.' };
  }
}

export async function deletePayrun(runId: string) {
  try {
    const run = await prisma.payrollRun.findUnique({ where: { id: runId } });
    if (!run || run.status === 'PAID') throw new Error("Cannot delete run");
    await prisma.payrollRun.delete({ where: { id: runId } });
    revalidatePath('/dashboard/admin/payroll');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

