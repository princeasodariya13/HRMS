import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getAttendanceInsights(companyId: string, userId: string): Promise<string> {
  try {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const records = await prisma.attendance.findMany({
      where: { employee: { companyId }, date: { gte: thirtyDaysAgo } },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    if (records.length === 0) return 'No attendance data found for the past 30 days.';
    const present = records.filter(r => ['PRESENT','LATE','HALF_DAY','WORK_FROM_HOME'].includes(r.status)).length;
    const late = records.filter(r => r.status === 'LATE').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const wfh = records.filter(r => r.status === 'WORK_FROM_HOME').length;
    const rate = ((present / records.length) * 100).toFixed(1);
    const lateByEmp: Record<string,number> = {};
    records.filter(r=>r.status==='LATE').forEach(r=>{ const n=`${r.employee.firstName} ${r.employee.lastName}`; lateByEmp[n]=(lateByEmp[n]||0)+1; });
    const topLate = Object.entries(lateByEmp).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,c])=>`- ${n}: ${c} late arrivals`).join('\n');
    const prompt = `HR analytics AI: Analyze attendance for past 30 days.\n\nTotal Records: ${records.length}\nAttendance Rate: ${rate}%\nPresent: ${present}, Late: ${late}, Absent: ${absent}, WFH: ${wfh}\nTop Late Employees:\n${topLate || 'None'}\n\nProvide: 1) Health summary 2) Key concerns 3) 3 recommendations 4) Positive trends. Be concise, use bullets.`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('no key');
    const result = await new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent(prompt);
    const response = result.response.text();
    try { await prisma.aILog.create({ data: { companyId, userId, actionType: 'ATTENDANCE_INSIGHT', prompt, response, tokensUsed: 0 } }); } catch (_) {}
    return response;
  } catch (err: any) {
    console.error('[AI] getAttendanceInsights:', err);
    return 'AI insights unavailable. Check GEMINI_API_KEY.\n\nTip: Review employees with 5+ late arrivals or 3+ absences in 30 days.';
  }
}
