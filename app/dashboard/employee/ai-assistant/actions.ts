"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const copilotRateLimit = redisUrl && redisToken
  ? new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
  })
  : null;

export async function processChatQuery(message: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return "I'm sorry, you must be logged in to access HR records.";
  }

  if (copilotRateLimit) {
    const { success } = await copilotRateLimit.limit(`copilot_${user.id}`);
    if (!success) return "Rate limit exceeded. Please wait a minute before sending more messages.";
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true, company: { include: { subscription: true } } }
    });

    if (!dbUser || !dbUser.employee) {
      return "I could not locate your employee profile in the system.";
    }

    // Free for all

    const employee = dbUser.employee;
    const lowerMessage = message.toLowerCase();

    // 1. Leave Queries
    if (lowerMessage.includes("leave") || lowerMessage.includes("holiday") || lowerMessage.includes("vacation") || lowerMessage.includes("time off")) {
      const leaveTypes = await prisma.leaveType.findMany({
        where: { companyId: dbUser.companyId }
      });
      const totalAnnualQuota = leaveTypes.reduce((acc, lt) => acc + lt.annualQuota, 0) || 0;

      const approvedLeaves = await prisma.leaveRequest.aggregate({
        where: { employeeId: employee.id, status: 'APPROVED' },
        _sum: { totalDays: true }
      });
      const pendingLeaves = await prisma.leaveRequest.count({
        where: { employeeId: employee.id, status: 'PENDING' }
      });

      const usedDays = Number(approvedLeaves._sum.totalDays?.toString() || 0);
      const remainingDays = totalAnnualQuota - usedDays;

      let response = `According to your records, you have ${remainingDays} days of leave remaining this year out of a total quota of ${totalAnnualQuota} days. You have used ${usedDays} days.`;
      if (pendingLeaves > 0) {
        response += ` You also have ${pendingLeaves} leave request(s) currently pending approval.`;
      }
      return response;
    }

    // 2. Attendance Queries
    if (lowerMessage.includes("attendance") || lowerMessage.includes("check in") || lowerMessage.includes("time") || lowerMessage.includes("hours")) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: { gte: startOfDay }
        }
      });

      if (!todayAttendance) {
        return "You have not checked in today yet. Would you like to go to your dashboard to check in?";
      } else if (todayAttendance.checkOutTime) {
        return `You checked in at ${todayAttendance.checkInTime?.toLocaleTimeString()} and checked out at ${todayAttendance.checkOutTime?.toLocaleTimeString()}. Total hours logged: ${todayAttendance.totalHours?.toString() || '0'}.`;
      } else {
        return `You checked in today at ${todayAttendance.checkInTime?.toLocaleTimeString()}. You are currently active.`;
      }
    }

    // 3. Payroll Queries
    if (lowerMessage.includes("payroll") || lowerMessage.includes("salary") || lowerMessage.includes("payslip") || lowerMessage.includes("pay")) {
      const latestPayslip = await prisma.payslip.findFirst({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' },
        include: { payrollRun: true }
      });

      if (latestPayslip) {
        const net = Number(latestPayslip.netSalary?.toString() || 0).toLocaleString('en-IN');
        return `Your most recent payslip is for month ${latestPayslip.payrollRun.month}/${latestPayslip.payrollRun.year}. Your net salary was ₹${net}. You can download the full PDF from the Payslips section.`;
      }
      return "I couldn't find any generated payslips for your account yet. If you are a new employee, your first payslip will be generated at the end of the month.";
    }

    // 4. Performance / Goals Queries
    if (lowerMessage.includes("goal") || lowerMessage.includes("performance") || lowerMessage.includes("objective")) {
      const activeGoals = await prisma.goal.count({
        where: { employeeId: employee.id, status: 'IN_PROGRESS' }
      });
      const completedGoals = await prisma.goal.count({
        where: { employeeId: employee.id, status: 'COMPLETED' }
      });

      return `You currently have ${activeGoals} active goals in progress, and you have successfully completed ${completedGoals} goals. Keep up the great work!`;
    }

    // 5. Greeting
    if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
      return `Hello ${employee.firstName}! I am Nexa, your personal HR assistant. I am connected directly to your employee database. You can ask me about your leaves, attendance, payroll, or goals.`;
    }

    // Default Fallback
    return "I'm sorry, I am a specialized HR assistant. I can help you with queries regarding your Leaves, Attendance, Payroll, and Performance Goals. Could you please rephrase your question?";

  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return `System error: ${error?.message || 'Unknown error occurred.'}`;
  }
}
