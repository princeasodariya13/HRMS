import Link from "next/link";
import { ArrowLeft, CalendarCheck, CalendarDays, FileSignature, ListChecks } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true, role: true } });
  if (!user || user.role === "EMPLOYEE") redirect("/dashboard/employee");

  const employee = await prisma.employee.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      department: true,
      workingSchedule: true,
      _count: { select: { contracts: true, attendances: true, leaveRequests: true, leaveAllocations: true } }
    }
  });
  if (!employee) redirect("/dashboard/admin/employees");

  const buttons = [
    { label: "Contracts", count: employee._count.contracts, href: `/dashboard/admin/contracts?employee=${employee.id}`, icon: FileSignature },
    { label: "Attendance", count: employee._count.attendances, href: `/dashboard/admin/attendance?employee=${employee.id}`, icon: CalendarCheck },
    { label: "Time Off", count: employee._count.leaveRequests, href: `/dashboard/admin/leaves?employee=${employee.id}`, icon: CalendarDays },
    { label: "Allocations", count: employee._count.leaveAllocations, href: `/dashboard/admin/leave-allocations?employee=${employee.id}`, icon: ListChecks }
  ];

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white"><ArrowLeft className="w-4 h-4" /> Employee directory</Link>
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-2xl font-bold">{employee.firstName[0]}{employee.lastName[0]}</div>
          <div><h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{employee.firstName} {employee.lastName}</h1><p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{employee.designation || "Employee"} · {employee.employeeCode} · {employee.department?.name || "General"}</p><p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{employee.workEmail}</p></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {buttons.map(({ label, count, href, icon: Icon }) => <Link key={label} href={href} className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] px-4 py-3 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"><span className="flex items-center gap-2 text-sm font-semibold text-[#334155] dark:text-[#E2E8F0]"><Icon className="w-4 h-4 text-blue-600" />{label}</span><span className="text-lg font-bold text-[#111827] dark:text-white">{count}</span></Link>)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Info label="Status" value={employee.status} /><Info label="Schedule" value={employee.workingSchedule?.name || "Not assigned"} /><Info label="Joined" value={employee.joiningDate.toLocaleDateString("en-IN")} /></div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] p-4"><p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</p><p className="mt-1 font-semibold text-[#111827] dark:text-[#F3F4F6]">{value}</p></div>; }