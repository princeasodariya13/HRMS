import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users, UserCheck, CalendarOff, Banknote, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard/cards/StatCard";
import { AttendanceTrendChart } from "@/components/dashboard/charts/AttendanceTrendChart";
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
    { title: "Total Employees", value: displayTotalEmployees, icon: Users, trend: isDemoMode ? "0%" : "12%", trendUp: true },
    { title: "Present Today", value: displayPresentToday, icon: UserCheck, trend: isDemoMode ? "0%" : "2.4%", trendUp: true },
    { title: "Pending Leaves", value: displayPendingLeaves, icon: CalendarOff, trend: isDemoMode ? "0%" : "5%", trendUp: false },
    { title: "Monthly Payroll", value: displayPayrollCost, icon: Banknote, trend: isDemoMode ? "0%" : "4.3%", trendUp: true },
  ];

  return (
    <>
      <div className="flex items-center justify-end -mt-16 mb-8 gap-2 relative z-10 pointer-events-none">
        <span className="pointer-events-auto text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] px-3 py-1.5 rounded-lg shadow-sm">
          {(dbUser?.role || 'SUPER_ADMIN').replace('_', ' ')} View
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Attendance Trends</h3>
          <div className="flex-1 flex items-center justify-center text-[#9CA3AF] dark:text-[#6B7280] text-sm w-full">
            <AttendanceTrendChart chartData={chartData.length > 0 ? chartData : undefined} />
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-[#111827] dark:bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-lg p-6 text-white dark:text-[#111827] relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#0F172A]/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-white dark:text-[#111827]/80" />
            <h3 className="text-lg font-bold">AI HR Insight</h3>
          </div>
          
          <div className="flex-1 space-y-4 text-sm text-white dark:text-[#111827]/80 leading-relaxed">
            <p>
              I noticed a <strong className="text-white dark:text-[#111827]">15% increase</strong> in sick leaves from the Engineering department this week.
            </p>
            <p>
              Also, 3 candidates in the recruitment pipeline have been pending in the "Interviewed" stage for over 7 days.
            </p>
          </div>
          
          <Link href="/dashboard/admin/ai-assistant" className="w-full mt-6 bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F3F4F6] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F3F4F6] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] transition-colors text-center inline-block">
            Ask AI Copilot
          </Link>
        </div>
      </div>
    </>
  );
}
