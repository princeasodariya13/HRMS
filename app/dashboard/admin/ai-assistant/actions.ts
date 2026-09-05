'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

export async function sendMessageToAI(message: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    if (copilotRateLimit) {
      const { success } = await copilotRateLimit.limit(`copilot_${user.id}`);
      if (!success) throw new Error("Rate limit exceeded. Please wait before sending more messages.");
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found")
    const companyId = dbUser.companyId

    // Free for all

    // --- Fetch ALL employees with status breakdown ---
    const allEmployees = await prisma.employee.findMany({
      where: { companyId },
      select: {
        firstName: true,
        lastName: true,
        designation: true,
        status: true,
      }
    });

    const totalEmployees = allEmployees.length;
    const activeEmployees = allEmployees.filter(e => e.status === 'ACTIVE').length;
    const inactiveEmployees = allEmployees.filter(e => e.status === 'INACTIVE').length;
    const onLeaveEmployees = 0; // Derived from LeaveRequests in a full implementation
    const probationEmployees = allEmployees.filter(e => e.status === 'PROBATION').length;

    // Build a short name list for the AI (max 30 to keep prompt size reasonable)
    const employeeList = allEmployees
      .slice(0, 30)
      .map(e => `${e.firstName} ${e.lastName} (${e.designation ?? 'No Title'}, ${e.status})`)
      .join("; ");

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentRun = await prisma.payrollRun.findFirst({
      where: { companyId, month: currentMonth, year: currentYear }
    });
    const payrollCostStr = currentRun
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(currentRun.totalAmount))
      : "Not generated yet";
    const payrollStatus = currentRun ? currentRun.status : "N/A";

    const openJobs = await prisma.job.count({ where: { companyId, isActive: true } });
    const totalCandidates = await prisma.candidate.count({ where: { job: { companyId } } });
    const interviewing = await prisma.candidate.count({
      where: { job: { companyId }, status: { in: ['INTERVIEW_SCHEDULED', 'INTERVIEWED'] } }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentCount = await prisma.attendance.count({
      where: { employee: { companyId }, date: { gte: today }, status: 'PRESENT' }
    });

    const pendingLeaves = await prisma.leaveRequest.count({ where: { companyId, status: 'PENDING' } });
    const approvedLeaves = await prisma.leaveRequest.count({ where: { companyId, status: 'APPROVED' } });

    const totalDocs = await prisma.document.count({ where: { employee: { companyId } } });
    const policies = await prisma.document.count({ where: { employee: { companyId }, type: 'POLICY' } });
    const contracts = await prisma.document.count({ where: { employee: { companyId }, type: 'CONTRACT' } });

    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build Context-Aware Prompt with full employee breakdown
    const prompt = `
      You are an intelligent AI HR Assistant for NexaHR, speaking to a Company Admin.
      You must answer their questions accurately using the real-time company data provided below. Do not make up numbers.
      If the user asks something outside the scope of this data or HR in general, politely decline to answer.

      Real-Time Company Data Context:
      - Total Employees in Company: ${totalEmployees}
        - Active: ${activeEmployees}
        - Inactive: ${inactiveEmployees}
        - On Leave: ${onLeaveEmployees}
        - On Probation: ${probationEmployees}
      - Employee List (up to 30): ${employeeList || "No employees found"}
      - Payroll (This Month): Total Cost is ${payrollCostStr}. Status is ${payrollStatus}.
      - Recruitment: ${openJobs} Open Jobs, ${totalCandidates} Total Candidates, ${interviewing} currently interviewing.
      - Attendance (Today): ${presentCount} employees present today.
      - Leaves: ${pendingLeaves} pending approvals, ${approvedLeaves} approved leaves.
      - Documents: ${totalDocs} total documents (${policies} policies, ${contracts} contracts).

      User Question: "${message}"
      
      Respond directly, conversationally, and concisely. Use markdown for emphasis if needed. Always use the numbers above — never guess.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error: any) {
    console.error("AI Assistant Error:", error);

    // Fallback if Gemini fails or is not configured
    return "I'm having trouble connecting to my AI brain right now. Please check if your GEMINI_API_KEY is valid and correctly set in your environment variables.";
  }
}
