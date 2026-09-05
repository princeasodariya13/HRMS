import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function explainPayslip(payslipId: string, userId: string, companyId: string): Promise<string> {
  try {
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
      include: { employee: { select: { firstName: true, lastName: true } }, lines: { orderBy: { sequence: 'asc' } }, payrollRun: { select: { month: true, year: true } } },
    });
    if (!payslip) return 'Payslip not found.';
    const period = payslip.payrollRun ? new Date(payslip.payrollRun.year, payslip.payrollRun.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A';
    const linesText = payslip.lines.map(l => `- ${l.name} (${l.category}): Rs ${l.amount.toFixed(2)}`).join('\n');
    const prompt = `You are a helpful HR payroll assistant. Explain this payslip in simple language.\n\nEmployee: ${payslip.employee.firstName} ${payslip.employee.lastName}\nPeriod: ${period}\nDays Worked: ${payslip.workedDays} / ${payslip.totalWorkingDays}\nBasic Salary: Rs ${payslip.basicSalary.toFixed(2)}\nAllowances: Rs ${payslip.allowances.toFixed(2)}\nDeductions: Rs ${payslip.deductions.toFixed(2)}\nNet Salary: Rs ${payslip.netSalary.toFixed(2)}\n\nLine Items:\n${linesText}\n\nExplain each component in plain language. End with a summary.`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    const genAI = new GoogleGenerativeAI(apiKey);
    const result = await genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent(prompt);
    const response = result.response.text();
    try { await prisma.aILog.create({ data: { companyId, userId, actionType: 'PAYSLIP_EXPLAIN', prompt, response, tokensUsed: 0 } }); } catch (_) {}
    return response;
  } catch (err: any) {
    console.error('[AI] explainPayslip:', err);
    const p = await prisma.payslip.findUnique({ where: { id: payslipId }, include: { lines: true } }).catch(() => null);
    if (!p) return 'Unable to load payslip data.';
    return `**Payslip Summary**\n\n- **Basic Salary**: Rs ${p.basicSalary.toFixed(2)} — your base monthly pay\n- **Allowances**: Rs ${p.allowances.toFixed(2)} — HRA, transport, and other benefits\n- **Deductions**: Rs ${p.deductions.toFixed(2)} — PF, Professional Tax, and statutory deductions\n- **Net Take-Home**: Rs ${p.netSalary.toFixed(2)}\n\nYou worked ${p.workedDays} out of ${p.totalWorkingDays} working days this period.`;
  }
}
