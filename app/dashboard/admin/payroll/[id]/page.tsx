import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PayrunDetailClient } from "./PayrunDetailClient";
import { canControlPayroll, canWritePayroll } from "@/lib/permissions";

export default async function PayrunDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const runId = params.id;
  
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true, role: true } });
  const run = await prisma.payrollRun.findFirst({
    where: { id: runId, companyId: dbUser?.companyId },
    include: {
      salaryStructure: true,
      payslips: {
        include: { employee: true }
      }
    }
  });

  if (!run) redirect('/dashboard/admin/payroll');

  const formattedRun = {
    ...run,
    monthString: new Date(run.year, run.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
    totalAmountStr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(run.totalAmount)),
    payslips: run.payslips.map(ps => ({
      ...ps,
      employeeName: `${ps.employee.firstName} ${ps.employee.lastName}`,
      employeeCode: ps.employee.employeeCode,
      amountStr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(ps.netSalary))
    }))
  };

  return <PayrunDetailClient run={formattedRun} canWritePayroll={canWritePayroll(dbUser?.role || "")} canControlPayroll={canControlPayroll(dbUser?.role || "")} />;
}

