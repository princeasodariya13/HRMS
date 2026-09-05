import { AttendanceClient } from "./AttendanceClient";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Suspense } from "react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Daily Attendance</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Monitor check-ins, check-outs, and employee status.</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96 flex items-center justify-center animate-pulse">
          <div className="text-[#9CA3AF] dark:text-[#6B7280]">Loading attendance records...</div>
        </div>
      }>
        <AttendanceData />
      </Suspense>
    </div>
  );
}

async function AttendanceData() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  let initialLogs: any[] = [];
  let isCheckedIn = false;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    const companyId = dbUser?.companyId;

    if (companyId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logs = await prisma.attendance.findMany({
        where: {
          employee: { companyId },
          date: { gte: today }
        },
        include: {
          employee: true
        },
        orderBy: { checkInTime: 'desc' }
      });

      initialLogs = logs.map(log => ({
        id: log.id,
        employeeName: `${log.employee.firstName} ${log.employee.lastName}`,
        initials: `${log.employee.firstName[0]}${log.employee.lastName[0]}`,
        role: log.employee.designation || 'Employee',
        checkIn: log.checkInTime ? format(log.checkInTime, "hh:mm a") : "-",
        checkOut: log.checkOutTime ? format(log.checkOutTime, "hh:mm a") : null,
        status: log.status
      }));

      if (dbUser && dbUser.employee) {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const userAttendanceToday = await prisma.attendance.findFirst({
          where: {
            employeeId: dbUser.employee.id,
            date: { gte: today, lte: endOfDay }
          }
        });
        isCheckedIn = !!userAttendanceToday?.checkInTime && !userAttendanceToday?.checkOutTime;
      }
    }
  } catch (error) {
    console.warn("Prisma Database connection failed in Attendance:. Next.js Dev overlay suppressed.");
  }

  return <AttendanceClient initialLogs={initialLogs} isInitiallyCheckedIn={isCheckedIn} />;
}
