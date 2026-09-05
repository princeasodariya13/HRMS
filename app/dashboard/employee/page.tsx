import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { 
  Clock, 
  Calendar, 
  FileText, 
  Target,
  ArrowRight,
  Coffee
} from "lucide-react";
import Link from "next/link";
import { EmployeeAttendanceAction } from "./EmployeeAttendanceAction";

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  // Fetch employee record and user profile
  let employee = null;
  let attendanceToday = null;
  let leaveBalance = 24;
  let activeGoalsCount = 0;
  let recentActivity: any[] = [];
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (dbUser && dbUser.employee) {
      employee = dbUser.employee;
      
      // Get today's attendance
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      attendanceToday = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      // Calculate Leave Balance dynamically based on company LeaveTypes
      const leaveTypes = await prisma.leaveType.findMany({
        where: { companyId: dbUser.companyId }
      });
      const totalAnnualQuota = leaveTypes.reduce((acc, lt) => acc + lt.annualQuota, 0) || 0;

      const approvedLeaves = await prisma.leaveRequest.aggregate({
        where: {
          employeeId: employee.id,
          status: 'APPROVED'
        },
        _sum: {
          totalDays: true
        }
      });
      
      leaveBalance = totalAnnualQuota - Number(approvedLeaves._sum.totalDays || 0);

      // Fetch Active Goals count
      try {
        // @ts-ignore
        if (prisma.goal) {
          // @ts-ignore
          activeGoalsCount = await prisma.goal.count({
            where: {
              employeeId: employee.id,
              status: 'IN_PROGRESS'
            }
          });
        }
      } catch (e) {}

      // Fetch Recent Activity (Last 5 attendances)
      const recentAttendances = await prisma.attendance.findMany({
        where: { employeeId: employee.id },
        orderBy: { date: 'desc' },
        take: 5
      });
      
      recentActivity = recentAttendances.map(record => ({
        id: record.id,
        type: 'attendance',
        title: 'Attendance Marked',
        date: record.date,
        time: record.checkInTime ? record.checkInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
        description: record.checkOutTime 
          ? `Checked out at ${record.checkOutTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Total hours: ${record.totalHours || 'N/A'}`
          : `Successfully checked in from ${record.ipAddress || 'Office IP'}.`
      }));
    }
  } catch (error) {
    console.warn("Database connection issue. Showing demo data.");
  }

  const firstName = employee?.firstName || "Employee";
  const isCheckedIn = !!attendanceToday?.checkInTime && !attendanceToday?.checkOutTime;
  const isCheckedOut = !!attendanceToday?.checkOutTime;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-3xl p-8 text-white dark:text-[#111827] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Coffee className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}! 👋</h1>
          <p className="text-gray-300 max-w-lg text-lg">
            Here is what's happening today. You have no pending tasks and your attendance is looking good.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Action Widget */}
        <div className="md:col-span-1 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Today's Attendance</h2>
          </div>
          
          <EmployeeAttendanceAction 
            employeeId={employee?.id || ""} 
            initialStatus={{
              isCheckedIn,
              isCheckedOut,
              checkInTime: attendanceToday?.checkInTime || null,
              checkOutTime: attendanceToday?.checkOutTime || null,
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Leave Balance */}
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-gray-300 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Leave Balance</h2>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{leaveBalance}</span>
                <span className="text-gray-500 ml-2">Days Available</span>
              </div>
              <Link href="/dashboard/employee/leaves" className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#111827] dark:bg-[#F3F4F6] group-hover:text-white dark:text-[#111827] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pending Goals */}
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-gray-300 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Active Goals</h2>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                  {typeof activeGoalsCount !== 'undefined' ? activeGoalsCount : 0}
                </span>
                <span className="text-gray-500 ml-2">In Progress</span>
              </div>
              <Link href="/dashboard/employee/performance" className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#111827] dark:bg-[#F3F4F6] group-hover:text-white dark:text-[#111827] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <h2 className="font-semibold text-[#111827] dark:text-[#F3F4F6] text-lg mb-6">Recent Activity</h2>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Coffee className="w-6 h-6 text-gray-400" />
            </div>
            <p>No recent activity found. Check in to get started!</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${index === 0 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-[#1E293B] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${index === 0 ? 'bg-blue-600 text-white dark:text-[#F3F4F6]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900 dark:text-white">{activity.title}</div>
                    <time className={`text-xs font-medium ${index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {new Date(activity.date).toLocaleDateString()} {activity.time}
                    </time>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">{activity.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
