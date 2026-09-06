import { LeavesClient, LeaveRequestData } from "./LeavesClient";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Suspense } from "react";
import { AiAnomalyPanel } from "./AiAnomalyPanel";

export default function LeavesPage({ searchParams }: { searchParams: Promise<{ employee?: string }> }) {
  return (
    <div className="space-y-6">

      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm h-32"></div>
          </div>
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96 flex items-center justify-center">
            <div className="text-[#9CA3AF] dark:text-[#6B7280]">Loading leave requests...</div>
          </div>
        </div>
      }>
        <LeavesData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LeavesData({ searchParams }: { searchParams: Promise<{ employee?: string }> }) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }
  const { employee: employeeId } = await searchParams;

  let dbUser = null;
  let leavesData: LeaveRequestData[] = [];
  let stats = { pending: 0, approved: 0, onLeaveToday: 0 };

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true }
    });

    const companyId = dbUser?.companyId;
    const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN';

    if (companyId || isSuperAdmin) {
      const rawLeaves = await prisma.leaveRequest.findMany({
        where: { ...(isSuperAdmin ? {} : { companyId }), ...(employeeId ? { employeeId } : {}) },
        include: { 
          employee: { include: { department: true } },
          leaveType: true 
        },
        orderBy: { createdAt: 'desc' }
      });

      const activeAllocations = await prisma.leaveAllocation.findMany({
        where: { ...(isSuperAdmin ? {} : { employee: { companyId } }), status: 'APPROVED' },
      });

      leavesData = rawLeaves.map(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

        // Find relevant allocation
        const alloc = activeAllocations.find(a => 
          a.employeeId === leave.employeeId && 
          a.leaveTypeId === leave.leaveTypeId &&
          new Date(a.dateFrom) <= start && 
          new Date(a.dateTo) >= end
        );
        const balance = alloc ? `${alloc.remainingDays} days left` : 'No valid allocation';

        return {
          id: leave.id,
          employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
          initials: `${leave.employee.firstName[0]}${leave.employee.lastName[0]}`,
          department: leave.employee.department?.name || 'General',
          type: leave.leaveType?.name || leave.leaveTypeId || 'GENERAL',
          durationString: `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`,
          days: diffDays,
          reason: leave.reason,
          status: leave.status,
          balance: balance
        };
      });

      stats.pending = rawLeaves.filter(l => l.status === 'PENDING').length;
      stats.approved = rawLeaves.filter(l => l.status === 'APPROVED').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      stats.onLeaveToday = rawLeaves.filter(l =>
        l.status === 'APPROVED' &&
        new Date(l.startDate) <= today &&
        new Date(l.endDate) >= today
      ).length;
    }
  } catch (error) {
    console.warn("Prisma Database connection failed in Leaves:. Next.js Dev overlay suppressed.");
  }

  return (
    <div className="space-y-6">
      <AiAnomalyPanel companyId={dbUser?.companyId ?? ''} userId={user.id} />
      <LeavesClient stats={stats} leaves={leavesData} />
    </div>
  );
}
