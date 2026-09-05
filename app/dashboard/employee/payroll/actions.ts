'use server'
import { explainPayslip } from '@/lib/ai/payslip-explainer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function explainMyPayslip(payslipId: string): Promise<{ data: string } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: 'Unauthorized' };
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return { error: 'User not found' };
    const explanation = await explainPayslip(payslipId, dbUser.id, dbUser.companyId);
    return { data: explanation };
  } catch (err: any) {
    return { error: err.message || 'Failed to generate explanation' };
  }
}
