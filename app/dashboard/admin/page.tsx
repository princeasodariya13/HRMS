import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users, UserCheck, CalendarOff, Banknote, Sparkles, BarChart3, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/cards/StatCard";
import { AttendanceTrendChart } from "@/components/dashboard/charts/AttendanceTrendChart";
import { LeaveTrendChart } from "@/components/dashboard/charts/LeaveTrendChart";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Dashboard Overview</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96"></div>
            <div className="bg-[#111827] dark:bg-[#F3F4F6] rounded-2xl shadow-lg p-6 h-96"></div>
          </div>
        </div>
      }>
        <DashboardData />
      </Suspense>
    </div>
  );
}

async function DashboardData() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  let totalEmployees = 0;
  let presentToday = 0;
  let pendingLeaves = 0;
  let payrollRuns: { _sum: { totalAmount: number | null } } = { _sum: { totalAmount: null } };
  let chartData: any[] = [];
  let leaveTrendData: { month: string; approved: number; rejected: number; pending: number }[] = [];

  try {
    // Fetch the user's company from our Postgres schema
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true }
    });

    const userRole = dbUser?.role || "EMPLOYEE";

    if (userRole === "EMPLOYEE") {
      redirect("/dashboard/employee");
    }

    const companyId = dbUser?.companyId;
    const isSuperAdmin = userRole === "SUPER_ADMIN";

    // Real Database Queries (Only if company exists or is super admin)
    if (companyId || isSuperAdmin) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const last7DaysDate = new Date();
      last7DaysDate.setHours(0, 0, 0, 0);
      last7DaysDate.setDate(last7DaysDate.getDate() - 6);

      const results = await Promise.all([
        prisma.employee.count({ where: isSuperAdmin ? { status: 'ACTIVE' } : { companyId, status: 'ACTIVE' } }),
        prisma.attendance.count({ where: isSuperAdmin ? { date: { gte: today }, status: 'PRESENT' } : { employee: { companyId }, date: { gte: today }, status: 'PRESENT' } }),
        prisma.leaveRequest.count({ where: isSuperAdmin ? { status: 'PENDING' } : { companyId, status: 'PENDING' } }),
        prisma.payrollRun.aggregate({
          _sum: { totalAmount: true },
          where: isSuperAdmin ? { month: new Date().getMonth() + 1, year: new Date().getFullYear() } : { companyId, month: new Date().getMonth() + 1, year: new Date().getFullYear() }
        }),
        prisma.attendance.findMany({
          where: isSuperAdmin ? { date: { gte: last7DaysDate } } : { employee: { companyId }, date: { gte: last7DaysDate } },
          select: { date: true, status: true }
        })
      ]);
      totalEmployees = results[0];
      presentToday = results[1];
      pendingLeaves = results[2];
      payrollRuns = results[3] as any;
      const attendanceRecords = results[4];

      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      chartData = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        
        const dayRecords = attendanceRecords.filter(a => a.date >= date && a.date < nextDay);
        const present = dayRecords.filter(a => ['PRESENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME'].includes(a.status)).length;
        const leave = dayRecords.filter(a => a.status === 'LEAVE').length;
        const absent = Math.max(0, totalEmployees - present - leave);
        
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          present,
          absent,
          leave
        };
      });

      // Fetch leave trend for last 6 months
      const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1);
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: isSuperAdmin ? { createdAt: { gte: sixMonthsAgo } } : { companyId, createdAt: { gte: sixMonthsAgo } },
        select: { status: true, createdAt: true }
      });

      const leaveByMonth: Record<string, {approved:number;rejected:number;pending:number}> = {};
      leaveRequests.forEach(l => {
        const key = new Date(l.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        if (!leaveByMonth[key]) leaveByMonth[key] = { approved: 0, rejected: 0, pending: 0 };
        if (l.status === 'APPROVED') leaveByMonth[key].approved++;
        else if (l.status === 'REJECTED') leaveByMonth[key].rejected++;
        else leaveByMonth[key].pending++;
      });
      leaveTrendData = Object.entries(leaveByMonth).map(([month, v]) => ({ month, ...v }));
    }
  } catch (error) {
    console.warn("Prisma Database connection failed. Falling back to demo data mode.. Next.js Dev overlay suppressed.");
  }

  // Format currency
  const payrollCost = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    payrollRuns._sum.totalAmount ? Number(payrollRuns._sum.totalAmount) : 0
  );

  const displayTotalEmployees = totalEmployees.toString();
  const displayPresentToday = presentToday.toString();
  const displayPendingLeaves = pendingLeaves.toString();
  const displayPayrollCost = payrollCost;

  const isDemoMode = totalEmployees === 0;

  const stats = [
    { title: "Total Employees", value: displayTotalEmployees, icon: Users },
    { title: "Present Today", value: displayPresentToday, icon: UserCheck },
    { title: "Pending Leaves", value: displayPendingLeaves, icon: CalendarOff },
    { title: "Monthly Payroll", value: displayPayrollCost, icon: Banknote },
  ];

  return (
    <>
      <div className="flex items-center justify-end -mt-16 mb-8 gap-2 relative z-10 pointer-events-none">
        <span className="pointer-events-auto text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] px-3 py-1.5 rounded-lg shadow-sm">
          {(dbUser?.role || 'SUPER_ADMIN').replace(/_/g, ' ')} View
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'AI Assistant', href: '/dashboard/admin/ai-assistant', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Payroll', href: '/dashboard/admin/payroll', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(link => (
          <Link key={link.label} href={link.href} className="flex items-center gap-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl px-4 py-3 hover:border-[#6B7280] transition-colors group">
            <div className={`w-8 h-8 rounded-lg ${link.bg} flex items-center justify-center`}>
              <link.icon className={`w-4 h-4 ${link.color}`} />
            </div>
            <span className="text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] group-hover:text-[#111827] dark:group-hover:text-white transition-colors">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6] mb-4">Attendance — Last 7 Days</h3>
          <div className="flex-1 h-56">
            <AttendanceTrendChart chartData={chartData.length > 0 ? chartData : undefined} />
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-[#111827] dark:bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-lg p-6 text-white dark:text-[#111827] relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#0F172A]/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-bold">AI Copilot</h3>
          </div>
          
          <div className="flex-1 space-y-3 text-sm text-white/80 dark:text-[#374151] leading-relaxed">
            <div className="bg-white/10 dark:bg-[#111827]/10 rounded-xl p-3">
              <p className="font-medium text-white dark:text-[#111827] mb-1">🌴 Leave Analysis</p>
              <p>Run AI scan on the Leaves page to detect Mon/Fri patterns and department anomalies.</p>
            </div>
            <div className="bg-white/10 dark:bg-[#111827]/10 rounded-xl p-3">
              <p className="font-medium text-white dark:text-[#111827] mb-1">📊 Attendance Insights</p>
              <p>Get 30-day AI-powered attendance health report on the Attendance page.</p>
            </div>
          </div>
          
          <Link href="/dashboard/admin/ai-assistant" className="w-full mt-4 bg-white dark:bg-[#111827] text-[#111827] dark:text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F3F4F6] dark:hover:bg-[#1f2937] transition-colors text-center inline-block">
            Open AI Assistant
          </Link>
        </div>
      </div>

      {/* Leave Trend Chart */}
      {leaveTrendData.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6]">Leave Trend — Last 6 Months</h3>
            <Link href="/dashboard/admin/analytics" className="text-xs text-blue-600 hover:underline">Full Analytics →</Link>
          </div>
          <div className="h-52">
            <LeaveTrendChart data={leaveTrendData} />
          </div>
        </div>
      )}
    </>
  );
}

