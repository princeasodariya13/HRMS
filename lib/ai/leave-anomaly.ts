'use server'

﻿import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function detectLeaveAnomalies(companyId: string, userId: string): Promise<string> {
  try {
    const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const leaves = await prisma.leaveRequest.findMany({
      where: { companyId, startDate: { gte: ninetyDaysAgo } },
      include: { employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } }, leaveType: { select: { name: true } } },
      orderBy: { startDate: 'desc' },
    });
    if (leaves.length === 0) return 'No leave data found for the past 90 days.';
    const empDays: Record<string, number> = {};
    const monFriCount: Record<string, number> = {};
    const deptDays: Record<string, number> = {};
    leaves.forEach(l => {
      const name = `${l.employee.firstName} ${l.employee.lastName}`;
      empDays[name] = (empDays[name] || 0) + l.totalDays;
      const dept = l.employee.department?.name || 'Unknown';
      deptDays[dept] = (deptDays[dept] || 0) + l.totalDays;
      const sd = new Date(l.startDate).getDay(); const ed = new Date(l.endDate).getDay();
      if (sd === 1 || ed === 5) monFriCount[name] = (monFriCount[name] || 0) + 1;
    });
    const top = Object.entries(empDays).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,d])=>`- ${n}: ${d} days`).join('\n');
    const mf = Object.entries(monFriCount).filter(([,c])=>c>=2).map(([n,c])=>`- ${n}: ${c} Mon/Fri leaves`).join('\n');
    const ds = Object.entries(deptDays).sort((a,b)=>b[1]-a[1]).map(([d,days])=>`- ${d}: ${days} days`).join('\n');
    const prompt = `HR analytics AI: Analyze leave data for past 90 days and identify anomalies.\n\nTotal Requests: ${leaves.length}\nTop Leave Takers:\n${top}\nPossible Mon/Fri pattern:\n${mf || 'None'}\nDept Summary:\n${ds}\n\nIdentify anomalies, flag concerns, give 3 recommendations. Use bullet points.`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('no key');
    const genAI = new GoogleGenerativeAI(apiKey);
    const result = await genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent(prompt);
    const response = result.response.text();
    try { await prisma.aILog.create({ data: { companyId, userId, actionType: 'LEAVE_ANOMALY', prompt, response, tokensUsed: 0 } }); } catch (_) {}
    return response;
  } catch (err: any) {
    console.error('[AI] detectLeaveAnomalies:', err);
    return 'Unable to run AI anomaly detection. Check GEMINI_API_KEY.\n\nBasic tip: Review employees with more than 15 days leave in 90 days and consistent Mon/Fri patterns.';
  }
}
