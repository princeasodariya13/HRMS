import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ShieldCheck, User, Clock, Tag, ArrowRight, AlertCircle } from "lucide-react";

const ALLOWED_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN"];
const PAGE_SIZE = 20;

const ACTION_COLORS: Record<string, string> = {
  CREATE:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATE:  "bg-blue-50 text-blue-700 border-blue-200",
  DELETE:  "bg-red-50 text-red-700 border-red-200",
  APPROVE: "bg-purple-50 text-purple-700 border-purple-200",
  REJECT:  "bg-amber-50 text-amber-700 border-amber-200",
};

const MODULE_COLORS: Record<string, string> = {
  EMPLOYEE: "bg-slate-100 text-slate-700",
  LEAVE:    "bg-teal-100 text-teal-700",
  PAYROLL:  "bg-indigo-100 text-indigo-700",
  DOCUMENT: "bg-orange-100 text-orange-700",
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Role gate — only SUPER_ADMIN and COMPANY_ADMIN
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, role: true },
  });

  if (!dbUser || !ALLOWED_ROLES.includes(dbUser.role)) {
    redirect("/dashboard/admin");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  let logs: any[] = [];
  let totalCount = 0;

  try {
    [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: { companyId: dbUser.companyId },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.auditLog.count({ where: { companyId: dbUser.companyId } }),
    ]);
  } catch (e) {
    console.warn("AuditLog query failed:", e);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Audit Logs
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Compliance trail of all admin actions — {totalCount} total entries.
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full">
          Read-Only
        </span>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
            <AlertCircle className="w-10 h-10 mb-3 text-[#E5E7EB]" />
            <p className="font-semibold text-[#111827] dark:text-[#F3F4F6]">No audit logs yet</p>
            <p className="text-sm mt-1">Logs will appear here as admin actions are performed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Module</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Record ID</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#475569] dark:text-[#94A3B8]">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{format(new Date(log.createdAt), "dd MMM yyyy, HH:mm:ss")}</span>
                      </div>
                    </td>

                    {/* Module */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${MODULE_COLORS[log.module] ?? "bg-gray-100 text-gray-700"}`}>
                        {log.module}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${ACTION_COLORS[log.action] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Record ID */}
                    <td className="px-6 py-4">
                      <code className="text-xs text-[#6B7280] bg-[#F1F5F9] dark:bg-[#1E293B] px-2 py-0.5 rounded font-mono">
                        {String(log.recordId).slice(0, 16)}…
                      </code>
                    </td>

                    {/* Snapshot */}
                    <td className="px-6 py-4 max-w-xs">
                      {log.newData && (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-indigo-600 hover:underline font-medium list-none flex items-center gap-1">
                            View snapshot <ArrowRight className="w-3 h-3" />
                          </summary>
                          <pre className="mt-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-lg p-2 overflow-x-auto text-[#374151] dark:text-[#D1D5DB] whitespace-pre-wrap break-all">
                            {JSON.stringify(log.newData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#6B7280]">
          <span>
            Page {page} of {totalPages} &nbsp;·&nbsp; {totalCount} entries
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}`}
                className="px-4 py-2 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl hover:bg-[#F1F5F9] transition-colors font-medium text-[#111827] dark:text-[#F3F4F6]"
              >
                ← Prev
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}`}
                className="px-4 py-2 bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] rounded-xl hover:bg-[#1f2937] transition-colors font-medium"
              >
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
