import { PayrollClient, PayrollRunData } from "./PayrollClient";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Payroll Management</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Process monthly payroll and generate payslips securely.</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
          </div>
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96 flex items-center justify-center">
            <div className="text-[#9CA3AF] dark:text-[#6B7280]">Loading payroll records...</div>
          </div>
        </div>
      }>
        <PayrollData />
      </Suspense>
    </div>
  );
}

async function PayrollData() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  let recentRuns: PayrollRunData[] = [];
  let stats = { currentMonthCost: "₹0", payslipsGenerated: 0, activeEmployees: 0 };
  let isDemo = true;

  let employeesList: { id: string; name: string }[] = [];

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true }
    });

    const companyId = dbUser?.companyId;

    if (companyId) {
      const dbEmployees = await prisma.employee.findMany({
        where: { companyId, status: 'ACTIVE' },
        select: { id: true, firstName: true, lastName: true }
      });
      employeesList = dbEmployees.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`
      }));
      
      const activeEmployeesCount = dbEmployees.length;
      
      const rawRuns = await prisma.payrollRun.findMany({
        where: { companyId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 12,
        include: {
          payslips: {
            include: { employee: true }
          }
        }
      });

      isDemo = activeEmployeesCount === 0 && rawRuns.length === 0;

      recentRuns = rawRuns.map(run => {
        const date = new Date(run.year, run.month - 1);
        return {
          id: run.id,
          monthString: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          processedBy: 'Admin',
          totalAmountStr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(run.totalAmount)),
          status: run.status,
          payslips: run.payslips.map(ps => ({
            id: ps.id,
            employeeName: `${ps.employee.firstName} ${ps.employee.lastName}`,
            employeeCode: ps.employee.employeeCode,
            amountStr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(ps.netSalary))
          }))
        };
      });

      stats.activeEmployees = activeEmployeesCount;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentRun = rawRuns.find(r => r.month === currentMonth && r.year === currentYear);

      if (currentRun) {
        stats.currentMonthCost = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(currentRun.totalAmount));
        stats.payslipsGenerated = activeEmployeesCount;
      } else {
        stats.currentMonthCost = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(0);
        stats.payslipsGenerated = 0;
      }
    }
  } catch (error) {
    console.warn("Prisma Database connection failed in Payroll:. Next.js Dev overlay suppressed.");
  }

  return <PayrollClient stats={stats} recentRuns={recentRuns} isDemo={isDemo} employees={employeesList} />;
}
