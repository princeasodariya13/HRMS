import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { EmployeeAttendanceAction } from "../EmployeeAttendanceAction";
import { 
  CalendarCheck, 
  Clock, 
  CalendarDays,
  CalendarRange,
  ArrowRight
} from "lucide-react";

export default async function EmployeeAttendancePage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  let employee = null;
  let attendanceRecords: any[] = [];
  let attendanceToday = null;
  let stats = {
    present: 0,
    absent: 0,
    totalHours: 0,
    avgHours: 0
  };
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (dbUser && dbUser.employee) {
      employee = dbUser.employee;
      
      // Get today's attendance for the widget
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      attendanceToday = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: { gte: startOfDay, lte: endOfDay }
        }
      });
      
      // Fetch all attendance for history table
      attendanceRecords = await prisma.attendance.findMany({
        where: { employeeId: employee.id },
        orderBy: { date: 'desc' },
        take: 30 // Last 30 records
      });
      
      // Calculate current month stats
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const monthRecords = attendanceRecords.filter(r => new Date(r.date) >= firstDayOfMonth);
      
      monthRecords.forEach(req => {
        if (req.status === 'PRESENT') stats.present += 1;
        if (req.status === 'ABSENT') stats.absent += 1;
        if (req.totalHours) {
          stats.totalHours += Number(req.totalHours);
        }
      });
      
      if (stats.present > 0) {
        stats.avgHours = stats.totalHours / stats.present;
      }
    }
  } catch (error) {
    console.error("Database connection issue.", error);
  }

  const isCheckedIn = !!attendanceToday?.checkInTime && !attendanceToday?.checkOutTime;
  const isCheckedOut = !!attendanceToday?.checkOutTime;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Attendance Log</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Days Present</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.present}</span>
            <span className="text-sm font-medium text-gray-500">this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-medium">Total Hours</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{Math.round(stats.totalHours)}</span>
            <span className="text-sm font-medium text-gray-500">hrs this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <CalendarRange className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium">Avg. Hours/Day</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.avgHours.toFixed(1)}</span>
            <span className="text-sm font-medium text-gray-500">hrs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <CalendarDays className="w-5 h-5 text-red-500" />
            <h3 className="font-medium">Days Absent</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.absent}</span>
            <span className="text-sm font-medium text-gray-500">this month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Action */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Quick Check-In
            </h2>
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
        </div>

        {/* Right Column: Attendance History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Recent Attendance Log</h2>
            </div>
            
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No attendance records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#1E293B]/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Date</th>
                      <th className="px-4 py-3">Check In</th>
                      <th className="px-4 py-3">Check Out</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => {
                      const dateObj = new Date(record.date);
                      return (
                        <tr key={record.id} className="border-b border-gray-100 dark:border-[#1E293B] last:border-0 hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/50 transition-colors">
                          <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                          </td>
                          <td className="px-4 py-4 text-gray-600 font-medium">
                            {record.totalHours ? `${record.totalHours}h` : '--'}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
