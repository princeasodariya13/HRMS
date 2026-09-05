import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { renderPayslipPdf } from '@/lib/payroll/payslip-pdf';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { employee: true } });
  const payslip = await prisma.payslip.findUnique({
    where: { id },
    include: { employee: true, payrollRun: true, lines: { orderBy: { sequence: 'asc' } } }
  });
  if (!user || !payslip || payslip.employee.companyId !== user.companyId) return new NextResponse('Not found', { status: 404 });
  const isAdmin = user.role !== 'EMPLOYEE';
  if (!isAdmin && user.employee?.id !== payslip.employeeId) return new NextResponse('Forbidden', { status: 403 });

  const pdf = await renderPayslipPdf(payslip);
  return new NextResponse(pdf as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="payslip-${payslip.employee.employeeCode}-${payslip.payrollRun.year}-${payslip.payrollRun.month}.pdf"`,
      'Cache-Control': 'private, no-store'
    }
  });
}