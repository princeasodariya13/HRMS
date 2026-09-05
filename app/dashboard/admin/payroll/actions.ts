'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PayrollStatus } from '@prisma/client'
import { logAudit } from '@/lib/auditLog';

export async function runPayrollAction() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found")

    // Fetch all active employees with their salary config
    const activeEmployees = await prisma.employee.findMany({
      where: { companyId: dbUser.companyId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        baseSalary: true,
        allowancePercent: true,
        deductionPercent: true,
      }
    })
    
    if (activeEmployees.length === 0) {
      return { error: "Cannot run payroll: No active employees found in the database. (Add employees first!)" }
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Check if payroll was already run for this month
    const existingRun = await prisma.payrollRun.findFirst({
      where: {
        companyId: dbUser.companyId,
        month: currentMonth,
        year: currentYear
      }
    })

    if (existingRun) {
      return { error: "Payroll has already been processed for this month." }
    }

    // --- Real per-employee calculation ---
    // Defaults: 20% allowance, 12% deduction (PF+tax placeholder)
    const DEFAULT_ALLOWANCE_PCT = 0.20
    const DEFAULT_DEDUCTION_PCT = 0.12
    const FALLBACK_BASE_SALARY  = 30000 // Used only if an employee has no baseSalary set

    type PayslipInput = {
      employeeId: string
      basicSalary: number
      allowances: number
      deductions: number
      netSalary: number
    }

    const payslipData: PayslipInput[] = activeEmployees.map((emp) => {
      const base       = emp.baseSalary ?? FALLBACK_BASE_SALARY
      const allowPct   = (emp.allowancePercent ?? DEFAULT_ALLOWANCE_PCT * 100) / 100
      const deductPct  = (emp.deductionPercent ?? DEFAULT_DEDUCTION_PCT * 100) / 100
      const allowances = parseFloat((base * allowPct).toFixed(2))
      const deductions = parseFloat((base * deductPct).toFixed(2))
      const netSalary  = parseFloat((base + allowances - deductions).toFixed(2))

      return {
        employeeId: emp.id,
        basicSalary: base,
        allowances,
        deductions,
        netSalary,
      }
    })

    const totalAmount = parseFloat(
      payslipData.reduce((sum, p) => sum + p.netSalary, 0).toFixed(2)
    )

    // Create the PayrollRun and all Payslips in one transaction
    let createdRunId = "";
    await prisma.$transaction(async (tx) => {
      const payrollRun = await tx.payrollRun.create({
        data: {
          companyId: dbUser.companyId,
          month: currentMonth,
          year: currentYear,
          totalAmount,
          status: 'PAID'
        }
      })
      createdRunId = payrollRun.id;

      await tx.payslip.createMany({
        data: payslipData.map((p) => ({
          payrollRunId: payrollRun.id,
          ...p,
        }))
      })
    })

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'PAYROLL',
      action: 'CREATE',
      recordId: createdRunId,
      newData: {
        month: currentMonth,
        year: currentYear,
        totalAmount,
        employeeCount: activeEmployees.length,
        status: 'PAID',
      },
    });

    revalidatePath('/dashboard/admin/payroll')
    return { success: true }
  } catch (error: any) {
    console.error("Run Payroll Error:", error)
    return { error: error.message || "Failed to run payroll" }
  }
}

export async function addIndividualPayrollAction(employeeId: string, amount: number) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found")

    // Security check: verify this employee belongs to the user's company
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== dbUser.companyId) {
      throw new Error("Employee not found or access denied.");
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Find or create payroll run for this month
    let payrollRun = await prisma.payrollRun.findFirst({
      where: { companyId: dbUser.companyId, month: currentMonth, year: currentYear }
    });

    if (!payrollRun) {
      payrollRun = await prisma.payrollRun.create({
        data: {
          companyId: dbUser.companyId,
          month: currentMonth,
          year: currentYear,
          totalAmount: 0,
          status: 'PROCESSING'
        }
      });
    }

    // Check if payslip already exists for this employee in this run
    const existingPayslip = await prisma.payslip.findUnique({
      where: {
        payrollRunId_employeeId: {
          payrollRunId: payrollRun.id,
          employeeId: employeeId
        }
      }
    });

    if (existingPayslip) {
      return { error: "Payroll has already been processed for this employee this month." }
    }

    // Create payslip
    await prisma.payslip.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: employeeId,
        basicSalary: amount,
        allowances: 0,
        deductions: 0,
        netSalary: amount
      }
    });

    // Update total amount in run manually to avoid Decimal increment errors
    const newTotal = Number(payrollRun.totalAmount) + amount;
    await prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: { totalAmount: newTotal }
    });

    revalidatePath('/dashboard/admin/payroll')
    return { success: true }
  } catch (error: any) {
    console.error("Add Individual Payroll Error:", error)
    return { error: error.message || "Failed to add individual payroll" }
  }
}
