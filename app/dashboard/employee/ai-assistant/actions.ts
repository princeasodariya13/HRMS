'use server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function sendEmployeeMessageToAI(message: string): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return 'Please log in to use the AI assistant.';
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, include: { employee: true } });
    if (!dbUser?.employee) return 'Employee profile not found.';
    const emp = dbUser.employee;
    const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [attendance, leaves, payslips, allocations] = await Promise.all([
      prisma.attendance.findMany({ where: { employeeId: emp.id, date: { gte: thirtyAgo } }, orderBy: { date: 'desc' }, take: 30 }),
      prisma.leaveRequest.findMany({ where: { employeeId: emp.id, createdAt: { gte: sixMonthsAgo } }, include: { leaveType: true }, orderBy: { createdAt: 'desc' } }),
      prisma.payslip.findMany({ where: { employeeId: emp.id }, include: { payrollRun: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
      prisma.leaveAllocation.findMany({ where: { employeeId: emp.id, status: 'APPROVED' }, include: { leaveType: true } }),
    ]);

    const attendanceSummary = `Present: ${attendance.filter(a => a.status === 'PRESENT').length}, Late: ${attendance.filter(a => a.status === 'LATE').length}, Absent: ${attendance.filter(a => a.status === 'ABSENT').length}, WFH: ${attendance.filter(a => a.status === 'WORK_FROM_HOME').length}`;
    const leavesSummary = leaves.map(l => `${l.leaveType?.name || 'Leave'} (${l.status}): ${l.totalDays} days, ${new Date(l.startDate).toLocaleDateString()}`).join('\n');
    const balanceSummary = allocations.map(a => `${a.leaveType?.name || 'Leave'}: ${a.remainingDays} days remaining`).join('\n');
    const payslipSummary = payslips.map(p => `${p.payrollRun ? `${p.payrollRun.month}/${p.payrollRun.year}` : 'N/A'}: Net Rs ${p.netSalary.toFixed(0)}`).join('\n');

    const context = `You are an AI HR Assistant for NexaHR. You are helping employee ${emp.firstName} ${emp.lastName} (${emp.designation || 'Employee'}).
IMPORTANT: Only answer questions about THIS employee's data below. Never share other employees' information. Be friendly and helpful.

ATTENDANCE (last 30 days): ${attendanceSummary}
LEAVE BALANCE: ${balanceSummary || 'No active allocations'}
RECENT LEAVES: ${leavesSummary || 'No recent leave requests'}
RECENT PAYSLIPS: ${payslipSummary || 'No payslips found'}

If asked about something outside this data, politely say you can only help with their own HR information.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return 'AI assistant is not configured. Please contact your HR team.';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: context });
    const result = await model.generateContent(message);
    const response = result.response.text();
    try { await prisma.aILog.create({ data: { companyId: dbUser.companyId, userId: dbUser.id, actionType: 'CHAT_QUERY', prompt: message, response, tokensUsed: 0 } }); } catch (_) {}
    return response;
  } catch (err: any) {
    console.error('[AI] Employee assistant error:', err);
    return 'I encountered an error. Please try again or contact HR directly.';
  }
}
