import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Banknote, Calendar, Download, TrendingUp, AlertCircle } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default async function EmployeePayrollPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  let employee = null;
  let payslips: any[] = [];
  let stats = {
    ytdEarnings: 0,
    ytdDeductions: 0,
    latestNet: 0
  };

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (dbUser && dbUser.employee) {
      employee = dbUser.employee;

      payslips = await prisma.payslip.findMany({
        where: { employeeId: employee.id },
        include: { payrollRun: true },
        orderBy: [
          { payrollRun: { year: 'desc' } },
          { payrollRun: { month: 'desc' } }
        ]
      });

      const currentYear = new Date().getFullYear();

      payslips.forEach((slip, index) => {
        if (slip.payrollRun.year === currentYear) {
          stats.ytdEarnings += Number(slip.basicSalary) + Number(slip.allowances);
          stats.ytdDeductions += Number(slip.deductions);
        }
        
        // Assuming the first item is the latest (due to orderBy)
        if (index === 0) {
          stats.latestNet = Number(slip.netSalary);
        }
      });
    }
  } catch (error) {
    console.error("Database error fetching payslips", error);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">My Payslips</h1>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-3xl p-6 text-white dark:text-[#111827] shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 text-gray-300 mb-4">
              <Banknote className="w-5 h-5 text-emerald-400" />
              <h3 className="font-medium">Latest Net Salary</h3>
            </div>
            <div>
              <span className="text-4xl font-bold">₹{stats.latestNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              <p className="text-sm text-gray-300 mt-1">Most recent payroll cycle</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">YTD Gross Earnings</h3>
          </div>
          <div>
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">₹{stats.ytdEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <p className="text-sm font-medium text-gray-500 mt-1">For current year ({new Date().getFullYear()})</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium">YTD Deductions</h3>
          </div>
          <div>
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">₹{stats.ytdDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <p className="text-sm font-medium text-gray-500 mt-1">Taxes & other deductions</p>
          </div>
        </div>
      </div>

      {/* Payslips History */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between bg-gray-50/50 dark:bg-[#1E293B]/30">
          <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Salary Slips History</h2>
        </div>
        
        {payslips.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Banknote className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">No payslips generated yet</p>
            <p className="text-sm">Your payslips will appear here once payroll is processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/80 dark:bg-[#1E293B]/50">
                <tr>
                  <th className="px-6 py-4">Payroll Month</th>
                  <th className="px-6 py-4">Basic Salary</th>
                  <th className="px-6 py-4">Allowances</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4 text-slate-900 font-bold">Net Salary</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payslips.map((slip) => {
                  const basic = Number(slip.basicSalary);
                  const allow = Number(slip.allowances);
                  const deduct = Number(slip.deductions);
                  const net = Number(slip.netSalary);
                  const monthName = MONTH_NAMES[slip.payrollRun.month - 1] || "Unknown";
                  const year = slip.payrollRun.year;

                  return (
                    <tr key={slip.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/50 transition-colors border-b border-gray-100 dark:border-[#1E293B] last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{monthName} {year}</p>
                            <p className="text-xs text-gray-500">Processed</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">₹{basic.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">+₹{allow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-red-500 font-medium">-₹{deduct.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 text-base">₹{net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-[#111827] bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm focus:ring-2 focus:ring-slate-900/20">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
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
  );
}
