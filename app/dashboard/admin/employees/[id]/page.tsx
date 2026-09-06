import Link from "next/link";
import { ArrowLeft, CalendarCheck, CalendarDays, FileSignature, ListChecks, FileText, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { EmployeeStatusBadge } from "@/components/ui/StatusBadge";

const DOC_TYPE_COLORS: Record<string,string> = {
  IDENTITY:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CONTRACT:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  POLICY:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CERTIFICATE:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  OTHER:'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true, role: true } });
  if (!user || user.role === "EMPLOYEE") redirect("/dashboard/employee");

  const [employee, documents] = await Promise.all([
    prisma.employee.findFirst({
      where: user.role === 'SUPER_ADMIN' ? { id } : { id, companyId: user.companyId },
      include: { department: true, workingSchedule: true, _count: { select: { contracts: true, attendances: true, leaveRequests: true, leaveAllocations: true } } }
    }),
    prisma.document.findMany({ where: { employeeId: id }, orderBy: { createdAt: "desc" } }),
  ]);
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
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{employee.firstName} {employee.lastName}</h1>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{employee.designation ?? "Employee"} {employee.employeeCode} {employee.department?.name ?? "General"}</p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{employee.workEmail}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {buttons.map(({ label, count, href, icon: Icon }) => (
            <Link key={label} href={href} className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] px-4 py-3 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#334155] dark:text-[#E2E8F0]"><Icon className="w-4 h-4 text-blue-600" />{label}</span>
              <span className="text-lg font-bold text-[#111827] dark:text-white">{count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Info label="Status" value={employee.status.replace(/_/g, " ")} />
        <Info label="Schedule" value={employee.workingSchedule?.name ?? "Not assigned"} />
        <Info label="Joined" value={employee.joiningDate.toLocaleDateString("en-IN")} />
      </div>
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2">
            <FileText className="w-4 h-4" /> Documents
            <span className="bg-[#F3F4F6] dark:bg-[#1E293B] text-[#6B7280] text-xs font-medium px-2 py-0.5 rounded-full">{documents.length}</span>
          </h2>
          <Link href="/dashboard/admin/documents" className="text-xs text-blue-600 hover:underline">Manage Documents</Link>
        </div>
        {documents.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6] dark:divide-[#1E293B]">
            {documents.map(doc => (
              <div key={doc.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (DOC_TYPE_COLORS[doc.type] ?? "bg-gray-100 text-gray-600")}>{doc.type}</span>
                  <span className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">{doc.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {doc.isVerified ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-[#9CA3AF]" />}
                  <span className="text-xs text-[#9CA3AF]">{new Date(doc.createdAt).toLocaleDateString("en-IN")}</span>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors"><ExternalLink className="w-4 h-4" /></a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] p-4">
      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</p>
      <p className="mt-1 font-semibold text-[#111827] dark:text-[#F3F4F6]">{value}</p>
    </div>
  );
}