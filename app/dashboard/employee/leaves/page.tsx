import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ApplyLeaveForm } from "./ApplyLeaveForm";
import { CancelLeaveButton } from "./CancelLeaveButton";
import { 
  CalendarOff, 
  CalendarCheck, 
  Clock, 
  Ban,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default async function EmployeeLeavesPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  // Fetch employee record
  let employee = null;
  let leaveRequests: any[] = [];
  let leaveTypes: any[] = [];
  let stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (dbUser && dbUser.employee) {
      employee = dbUser.employee;
      
      leaveTypes = await prisma.leaveType.findMany({
        where: { companyId: dbUser.companyId }
      });

      if (leaveTypes.length === 0) {
        // Auto-provision standard leave types if the company has none
        await prisma.leaveType.createMany({
          data: [
            { companyId: dbUser.companyId, name: 'Casual Leave', annualQuota: 12, isPaid: true, carryForwardAllowed: false },
            { companyId: dbUser.companyId, name: 'Sick Leave', annualQuota: 7, isPaid: true, carryForwardAllowed: false },
            { companyId: dbUser.companyId, name: 'Earned Leave', annualQuota: 15, isPaid: true, carryForwardAllowed: true }
          ]
        });
        leaveTypes = await prisma.leaveType.findMany({
          where: { companyId: dbUser.companyId }
        });
      }
      
      stats.total = leaveTypes.reduce((acc, lt) => acc + lt.annualQuota, 0);

      leaveRequests = await prisma.leaveRequest.findMany({
        where: { employeeId: employee.id },
        include: { leaveType: true },
        orderBy: { createdAt: 'desc' }
      });
      
      // Calculate stats
      leaveRequests.forEach(req => {
        const days = Number(req.totalDays || 0);
        if (req.status === 'APPROVED') stats.approved += days;
        if (req.status === 'PENDING') stats.pending += days;
        if (req.status === 'REJECTED') stats.rejected += days;
      });
    }
  } catch (error) {
    console.error("Database connection issue.", error);
  }

  const remainingLeaves = Math.max(0, stats.total - stats.approved);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Leave Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-medium">Available Balance</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{remainingLeaves}</span>
            <span className="text-sm font-medium text-gray-500">/ {stats.total} days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Approved Leaves</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.approved}</span>
            <span className="text-sm font-medium text-gray-500">days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium">Pending Leaves</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.pending}</span>
            <span className="text-sm font-medium text-gray-500">days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <Ban className="w-5 h-5 text-red-500" />
            <h3 className="font-medium">Rejected</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.rejected}</span>
            <span className="text-sm font-medium text-gray-500">days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Apply Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6 flex items-center gap-2">
              <CalendarOff className="w-5 h-5" />
              Apply for Leave
            </h2>
            <ApplyLeaveForm leaveTypes={leaveTypes} />
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6">Leave History</h2>
            
            {leaveRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No leave requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#1E293B]/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Type</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-100 dark:border-[#1E293B] last:border-0 hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-200">
                          {req.leaveType?.name || req.leaveTypeId}
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                          {Number(req.totalDays)}
                        </td>
                        <td className="px-4 py-4 text-gray-500 max-w-[200px] truncate">
                          {req.reason}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                            {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {req.status === 'REJECTED' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {req.status}
                          </span>
                          {req.status === 'PENDING' && <CancelLeaveButton leaveId={req.id} />}
                        </td>
                      </tr>
                    ))}
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
