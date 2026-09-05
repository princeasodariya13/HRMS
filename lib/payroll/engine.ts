import prisma from "@/lib/prisma";
import { AmountType, SalaryRuleCategory, ContractStatus, AttendanceStatus, LeaveStatus } from "@prisma/client";

export async function getApplicableContract(employeeId: string, periodStart: Date, periodEnd: Date) {
  const contract = await prisma.contract.findFirst({
    where: {
      employeeId,
      status: 'RUNNING',
      isActive: true,
      startDate: { lte: periodEnd },
      OR: [
        { endDate: null },
        { endDate: { gte: periodStart } }
      ]
    },
    include: {
      salaryStructure: {
        include: {
          rules: {
            orderBy: { sequence: 'asc' }
          }
        }
      }
    }
  });

  return contract;
}

export async function calculateWorkedDays(employeeId: string, periodStart: Date, periodEnd: Date) {
  // 1. Determine Working Schedule
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { 
      workingSchedule: {
        include: { lines: true }
      } 
    }
  });

  let workingDaysSet = new Set([1, 2, 3, 4, 5]); // Default Mon(1) to Fri(5)
  if (employee?.workingSchedule?.lines && employee.workingSchedule.lines.length > 0) {
    workingDaysSet = new Set(employee.workingSchedule.lines.map(l => l.dayOfWeek));
  }

  // 2. Compute totalWorkingDays
  let totalWorkingDays = 0;
  let currentDate = new Date(periodStart);
  while (currentDate <= periodEnd) {
    if (workingDaysSet.has(currentDate.getDay())) {
      totalWorkingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 3. Process Attendances
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: periodStart, lte: periodEnd }
    }
  });

  let workedDays = 0;
  attendances.forEach(att => {
    if (att.status === 'PRESENT' || att.status === 'LATE' || att.status === 'WORK_FROM_HOME') {
      workedDays += 1;
    } else if (att.status === 'HALF_DAY') {
      workedDays += 0.5;
    }
  });

  // 4. Process Leaves (paid vs unpaid)
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { lte: periodEnd },
      endDate: { gte: periodStart }
    },
    include: { leaveType: true }
  });

  leaveRequests.forEach(leave => {
    if (leave.leaveType?.isPaid) {
      let lDate = new Date(leave.startDate < periodStart ? periodStart : leave.startDate);
      let lEnd = new Date(leave.endDate > periodEnd ? periodEnd : leave.endDate);
      while (lDate <= lEnd) {
        if (workingDaysSet.has(lDate.getDay())) {
          // Check if not already counted via Attendance to avoid double-counting
          const dateStr = lDate.toISOString().split('T')[0];
          const attExists = attendances.some(a => a.date.toISOString().split('T')[0] === dateStr);
          const attStatus = attendances.find(a => a.date.toISOString().split('T')[0] === dateStr)?.status;
          
          if (!attExists || attStatus === 'LEAVE') {
            workedDays += 1;
          }
        }
        lDate.setDate(lDate.getDate() + 1);
      }
    }
  });

  // Cap workedDays to totalWorkingDays
  if (workedDays > totalWorkingDays && totalWorkingDays > 0) {
    workedDays = totalWorkingDays;
  }

  return { totalWorkingDays, workedDays };
}

export function computePayslip(contract: any, structure: any, workedDays: number, totalWorkingDays: number) {
  const lines: any[] = [];
  const results: Record<string, number> = {};
  
  const ratio = totalWorkingDays > 0 ? (workedDays / totalWorkingDays) : 1;

  let basic = 0;
  let gross = 0;
  let totalAllowances = 0;
  let totalDeductions = 0;
  let net = 0;

  for (const rule of structure.rules) {
    let amount = 0;

    if (rule.amountType === 'FIXED') {
      if (rule.category === 'BASIC') {
        amount = contract.wage * ratio;
      } else if (rule.category === 'ALLOWANCE') {
        amount = (rule.amount || 0) * ratio;
      } else if (rule.category === 'DEDUCTION') {
        amount = (rule.amount || 0); 
      }
    } else if (rule.amountType === 'PERCENTAGE') {
      amount = basic * ((rule.percentage || 0) / 100);
    } else if (rule.amountType === 'FORMULA') {
      if (rule.category === 'GROSS') {
        amount = basic + totalAllowances;
      } else if (rule.category === 'NET') {
        amount = gross - totalDeductions;
      }
    }

    if (rule.category === 'BASIC') basic = amount;
    if (rule.category === 'ALLOWANCE') totalAllowances += amount;
    if (rule.category === 'GROSS') gross = amount;
    if (rule.category === 'DEDUCTION') totalDeductions += amount;
    if (rule.category === 'NET') net = amount;

    results[rule.code] = amount;

    if (rule.appearsOnPayslip) {
      lines.push({
        ruleId: rule.id,
        name: rule.name,
        code: rule.code,
        category: rule.category,
        amount: parseFloat(amount.toFixed(2))
      });
    }
  }

  return {
    lines,
    basic: parseFloat(basic.toFixed(2)),
    gross: parseFloat(gross.toFixed(2)),
    deductions: parseFloat(totalDeductions.toFixed(2)),
    net: parseFloat(net.toFixed(2))
  };
}

