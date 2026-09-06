import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { canViewAnalytics } from '@/lib/permissions';
import { Suspense } from 'react';
import { LeaveTrendChart } from '@/components/dashboard/charts/LeaveTrendChart';
import { PayrollCostTrendChart } from '@/components/dashboard/charts/PayrollCostTrendChart';
import { DepartmentHeadcountChart } from '@/components/dashboard/charts/DepartmentHeadcountChart';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Analytics & Reports</h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Company-wide HR and payroll insights.</p>
      </div>
      <Suspense fallback={<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">{[...Array(3)].map((_,i)=><div key={i} className="h-72 bg-[#F3F4F6] dark:bg-[#1E293B] rounded-2xl animate-pulse"/>)}</div>}>
        <AnalyticsData />
      </Suspense>
    </div>
  );
}

async function AnalyticsData() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN';
  if (!dbUser || !canViewAnalytics(dbUser.role)) redirect('/dashboard/admin');

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [payrollRuns, leaveRequests, departments] = await Promise.all([
    prisma.payrollRun.findMany({ where: { ...(isSuperAdmin ? {} : { companyId: dbUser.companyId }), periodStart: { gte: twelveMonthsAgo } }, orderBy: { periodStart: 'asc' } }),
    prisma.leaveRequest.findMany({ where: { ...(isSuperAdmin ? {} : { companyId: dbUser.companyId }), createdAt: { gte: twelveMonthsAgo } } }),
    prisma.department.findMany({ where: isSuperAdmin ? {} : { companyId: dbUser.companyId }, include: { employees: { where: { deletedAt: null }, select: { id: true } } } }),
  ]);

  // Payroll cost trend
  const payrollByMonth: Record<string, number> = {};
  payrollRuns.forEach(r => {
    const key = new Date(r.periodStart).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    payrollByMonth[key] = (payrollByMonth[key] || 0) + r.totalAmount;
  });
  const payrollData = Object.entries(payrollByMonth).map(([month, amount]) => ({ month, amount }));

  // Leave trend by month
  const leaveByMonth: Record<string, {approved:number;rejected:number;pending:number}> = {};
  leaveRequests.forEach(l => {
    const key = new Date(l.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    if (!leaveByMonth[key]) leaveByMonth[key] = { approved: 0, rejected: 0, pending: 0 };
    if (l.status === 'APPROVED') leaveByMonth[key].approved++;
    else if (l.status === 'REJECTED') leaveByMonth[key].rejected++;
    else leaveByMonth[key].pending++;
  });
  const leaveData = Object.entries(leaveByMonth).map(([month, v]) => ({ month, ...v }));

  // Dept headcount
  const deptData = departments.map(d => ({ department: d.name, count: d.employees.length }));

  // Summary stats
  const totalPayroll = payrollRuns.reduce((s, r) => s + r.totalAmount, 0);
  const totalLeaves = leaveRequests.length;
  const approvedLeaves = leaveRequests.filter(l => l.status === 'APPROVED').length;
  const totalEmployees = deptData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: totalEmployees, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '12-Month Payroll', value: `₹${(totalPayroll/100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Total Leaves (12mo)', value: totalLeaves, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Leave Approval Rate', value: `${totalLeaves ? Math.round((approvedLeaves/totalLeaves)*100) : 0}%`, icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-4">Payroll Cost Trend (12 months)</h3>
          <div className="h-60"><PayrollCostTrendChart data={payrollData} /></div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-4">Leave Trend (12 months)</h3>
          <div className="h-60"><LeaveTrendChart data={leaveData} /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-4">Department Headcount</h3>
        <div className="h-56"><DepartmentHeadcountChart data={deptData} /></div>
      </div>

      {/* Department Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Department Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F9FAFB] dark:bg-[#1E293B]/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Department</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Employees</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Leave Requests</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => {
              const deptLeaveCount = leaveRequests.filter(l => l.companyId === dbUser.companyId).length;
              return (
                <tr key={d.id} className="border-t border-[#F3F4F6] dark:border-[#1E293B]">
                  <td className="px-5 py-3 font-medium text-[#111827] dark:text-[#F3F4F6]">{d.name}</td>
                  <td className="px-5 py-3 text-right text-[#6B7280]">{d.employees.length}</td>
                  <td className="px-5 py-3 text-right text-[#6B7280]">—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
