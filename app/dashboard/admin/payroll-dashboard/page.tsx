import { AlertTriangle, Banknote, CalendarCheck, CalendarClock, ClipboardCheck, Clock3, Users, UserRoundCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { PayrollDashboardCharts } from "./PayrollDashboardCharts";

type SearchParams = Promise<{ period?: string; department?: string; employeeType?: string }>;

const currency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const percent = (value: number) => `${value.toFixed(1)}%`;
const monthLabel = (year: number, month: number) => new Date(year, month - 1).toLocaleString("en-IN", { month: "short", year: "numeric" });
const filterClass = "h-10 w-full rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] px-3 text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const alertTone: Record<string, string> = {
  "Missing contracts": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Duplicate payslips": "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Pending leave requests": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Attendance anomalies": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
};

function getPeriod(value?: string) {
  const fallback = new Date();
  const [yearValue, monthValue] = (value || "").split("-").map(Number);
  const year = yearValue >= 2000 && yearValue <= 2100 ? yearValue : fallback.getFullYear();
  const month = monthValue >= 1 && monthValue <= 12 ? monthValue : fallback.getMonth() + 1;
  return { year, month, value: `${year}-${String(month).padStart(2, "0")}` };
}

export default async function PayrollDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const period = getPeriod(params.period);
  const start = new Date(period.year, period.month - 1, 1);
  const end = new Date(period.year, period.month, 1);
  const trendStart = new Date(period.year, period.month - 12, 1);

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true, role: true } });
  if (!user || user.role === "EMPLOYEE") redirect("/dashboard/employee");

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const employeeFilter: any = {
    ...(isSuperAdmin ? {} : { companyId: user.companyId }),
    status: "ACTIVE",
    ...(params.department && params.department !== "ALL" ? { departmentId: params.department } : {}),
    ...(params.employeeType === "UNASSIGNED"
      ? { workingScheduleId: null }
      : params.employeeType && params.employeeType !== "ALL"
        ? { workingSchedule: { is: { type: params.employeeType } } }
        : {})
  };
  const payslipWhere: any = {
    payrollRun: { is: { ...(isSuperAdmin ? {} : { companyId: user.companyId }), month: period.month, year: period.year } },
    employee: { is: employeeFilter }
  };
  const overlap = { lte: end };
  const dateOverlap = { startDate: overlap, endDate: { gte: start } };

  const [employees, departments, payslips, approvedLeaves, pendingLeaves, attendances, missingContracts, trendPayslips] = await Promise.all([
    prisma.employee.findMany({ where: employeeFilter, include: { department: true, workingSchedule: true }, orderBy: { firstName: "asc" } }),
    prisma.department.findMany({ where: isSuperAdmin ? {} : { companyId: user.companyId }, orderBy: { name: "asc" } }),
    prisma.payslip.findMany({ where: payslipWhere, include: { employee: { include: { department: true } }, payrollRun: true } }),
    prisma.leaveRequest.findMany({ where: { ...(isSuperAdmin ? {} : { companyId: user.companyId }), status: "APPROVED", ...dateOverlap, employee: { is: employeeFilter } }, select: { totalDays: true } }),
    prisma.leaveRequest.count({ where: { ...(isSuperAdmin ? {} : { companyId: user.companyId }), status: "PENDING", ...dateOverlap, employee: { is: employeeFilter } } }),
    prisma.attendance.findMany({ where: { date: { gte: start, lt: end }, employee: { is: employeeFilter } }, select: { status: true } }),
    prisma.employee.count({ where: { ...employeeFilter, contracts: { none: { status: "RUNNING", startDate: { lte: end }, OR: [{ endDate: null }, { endDate: { gte: start } }] } } } }),
    prisma.payslip.findMany({ where: { payrollRun: { is: { ...(isSuperAdmin ? {} : { companyId: user.companyId }), status: "PAID", periodStart: { gte: trendStart, lt: end } } }, employee: { is: employeeFilter } }, include: { payrollRun: true } })
  ]);

  const paidPayslips = payslips.filter(payslip => payslip.payrollRun.status === "PAID");
  const totalNetPaid = paidPayslips.reduce((sum, payslip) => sum + Number(payslip.netSalary), 0);
  const averageNet = paidPayslips.length ? totalNetPaid / paidPayslips.length : 0;
  const approvedTimeOff = approvedLeaves.reduce((sum, leave) => sum + Number(leave.totalDays), 0);
  const consideredAttendance = attendances.filter(record => !["HOLIDAY", "LEAVE"].includes(record.status));
  const healthyAttendance = consideredAttendance.filter(record => ["PRESENT", "WORK_FROM_HOME"].includes(record.status)).length;
  const attendanceHealth = consideredAttendance.length ? (healthyAttendance / consideredAttendance.length) * 100 : 0;
  const duplicatePayslips = payslips.length - new Set(payslips.map(payslip => payslip.employeeId)).size;
  const attendanceAnomalies = attendances.filter(record => ["ABSENT", "LATE", "HALF_DAY"].includes(record.status)).length;

  const departmentTotals = new Map<string, { name: string; headcount: number; salary: number }>();
  for (const department of departments) departmentTotals.set(department.id, { name: department.name, headcount: 0, salary: 0 });
  for (const employee of employees) {
    const key = employee.departmentId || "unassigned";
    const current = departmentTotals.get(key) || { name: employee.department?.name || "Unassigned", headcount: 0, salary: 0 };
    current.headcount += 1;
    departmentTotals.set(key, current);
  }
  for (const payslip of paidPayslips) {
    const key = payslip.employee.departmentId || "unassigned";
    const current = departmentTotals.get(key) || { name: payslip.employee.department?.name || "Unassigned", headcount: 0, salary: 0 };
    current.salary += Number(payslip.netSalary);
    departmentTotals.set(key, current);
  }
  const departmentBreakdown = [...departmentTotals.values()].filter(department => department.headcount > 0 || department.salary > 0);
  const trend = new Map<string, number>();
  for (let index = 0; index < 12; index += 1) {
    const date = new Date(period.year, period.month - 11 + index - 1, 1);
    trend.set(`${date.getFullYear()}-${date.getMonth() + 1}`, 0);
  }
  for (const payslip of trendPayslips) {
    const key = `${payslip.payrollRun.year}-${payslip.payrollRun.month}`;
    trend.set(key, (trend.get(key) || 0) + Number(payslip.netSalary));
  }
  const trendData = [...trend.entries()].map(([key, value]) => {
    const [year, month] = key.split("-").map(Number);
    return { name: monthLabel(year, month), value };
  });
  const employeeTypes = [...new Set(employees.map(employee => employee.workingSchedule?.type).filter(Boolean))].sort() as string[];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Payroll Dashboard</h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Live payroll, attendance, and time-off operations for {monthLabel(period.year, period.month)}.</p>
      </div>

      <form className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] p-4 flex flex-col md:flex-row gap-3 items-end">
        <Filter label="Period"><input name="period" type="month" defaultValue={period.value} className={filterClass} /></Filter>
        <Filter label="Department"><select name="department" defaultValue={params.department || "ALL"} className={filterClass}><option value="ALL">All departments</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}</select></Filter>
        <Filter label="Employee Type"><select name="employeeType" defaultValue={params.employeeType || "ALL"} className={filterClass}><option value="ALL">All employee types</option><option value="UNASSIGNED">Unassigned</option>{employeeTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></Filter>
        <button className="h-10 px-4 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937]" type="submit">Apply filters</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Kpi title="Total Net Salary Paid" value={currency(totalNetPaid)} icon={Banknote} />
        <Kpi title="Payslips Generated" value={payslips.length.toString()} icon={ClipboardCheck} />
        <Kpi title="Average Net Salary" value={currency(averageNet)} icon={Users} />
        <Kpi title="Approved Time Off Days" value={approvedTimeOff.toLocaleString("en-IN")} icon={CalendarCheck} />
        <Kpi title="Attendance Health" value={percent(attendanceHealth)} icon={UserRoundCheck} />
      </div>

      <PayrollDashboardCharts departmentData={departmentBreakdown.filter(item => item.salary > 0).map(item => ({ name: item.name, value: item.salary }))} trendData={trendData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] p-6">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Operational Alerts</h2></div>
          <div className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">{[
            ["Missing contracts", missingContracts, "Contracts", "amber"],
            ["Duplicate payslips", duplicatePayslips, "Payroll", "red"],
            ["Pending leave requests", pendingLeaves, "Leave management", "blue"],
            ["Attendance anomalies", attendanceAnomalies, "Attendance", "orange"]
          ].map(([label, value, detail]) => <div key={label as string} className="py-3 flex items-center justify-between"><div><p className="font-semibold text-sm text-[#111827] dark:text-[#F3F4F6]">{label}</p><p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{detail}</p></div><span className={`min-w-8 text-center px-2 py-1 rounded-lg text-sm font-bold ${Number(value) > 0 ? alertTone[label as string] : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>{value}</span></div>)}</div>
        </section>
        <section className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] p-6">
          <div className="flex items-center gap-2 mb-4"><CalendarClock className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Attendance & Time Off</h2></div>
          <div className="grid grid-cols-2 gap-4"><OverviewCard title="Attendance records" value={attendances.length} icon={Clock3} /><OverviewCard title="Approved days" value={approvedTimeOff} icon={CalendarCheck} /><OverviewCard title="Pending requests" value={pendingLeaves} icon={CalendarClock} /><OverviewCard title="Anomalies" value={attendanceAnomalies} icon={AlertTriangle} /></div>
        </section>
      </div>

      <section className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]"><h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Department Breakdown</h2><p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Active headcount and paid net salary for the selected period.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]"><tr><th className="px-6 py-3">Department</th><th className="px-6 py-3">Headcount</th><th className="px-6 py-3 text-right">Total salary</th></tr></thead><tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">{departmentBreakdown.map(department => <tr key={department.name}><td className="px-6 py-3 font-semibold text-[#111827] dark:text-[#F3F4F6]">{department.name}</td><td className="px-6 py-3 text-[#475569] dark:text-[#CBD5E1]">{department.headcount}</td><td className="px-6 py-3 text-right font-semibold text-[#111827] dark:text-[#F3F4F6]">{currency(department.salary)}</td></tr>)}{departmentBreakdown.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">No employees match these filters.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) { return <label className="flex-1 w-full"><span className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">{label}</span>{children}</label>; }
function Kpi({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Banknote }) { return <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] p-5"><div className="flex justify-between gap-3"><p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">{title}</p><Icon className="w-5 h-5 text-blue-600 shrink-0" /></div><p className="mt-3 text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{value}</p></div>; }
function OverviewCard({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Clock3 }) { return <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] p-4"><Icon className="w-4 h-4 text-[#2563EB] mb-3" /><p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{title}</p><p className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6] mt-1">{value.toLocaleString("en-IN")}</p></div>; }