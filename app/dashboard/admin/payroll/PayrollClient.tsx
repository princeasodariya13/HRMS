"use client";

import { useState } from "react";
import { Plus, CheckCircle, Clock, Search, AlertCircle, ArrowRight } from "lucide-react";
import { Wizard } from "./Wizard";
import { useRouter } from "next/navigation";

export type PayrollRunData = {
  id: string;
  monthString: string;
  structureName: string;
  processedBy: string;
  totalAmountStr: string;
  status: string;
  payslips: any[];
};

type PayrollClientProps = {
  stats: {
    currentMonthCost: string;
    payslipsGenerated: number;
    activeEmployees: number;
  };
  recentRuns: PayrollRunData[];
  isDemo: boolean;
  employees: { id: string; name: string }[];
  salaryStructures: { id: string; name: string }[];
  role: string;
}

export function PayrollClient({ stats, recentRuns, isDemo, salaryStructures, role }: PayrollClientProps) {
  const router = useRouter();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const canWritePayroll = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_PAYROLL_USER", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Payroll Management</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Process monthly salaries and manage payslips.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isDemo && (
            <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl shadow-sm animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Demo Data
            </span>
          )}
          <button 
            onClick={() => setIsWizardOpen(true)}
            disabled={isDemo || !canWritePayroll}
            className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Plus className="w-4 h-4" />
            {canWritePayroll ? "New Payrun" : "Payroll read-only"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#6B7280] dark:text-[#9CA3AF] font-medium text-sm">Total Current Month</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              ₹
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.currentMonthCost}</h2>
            <p className="text-sm text-emerald-600 font-medium mt-1">Processed</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#6B7280] dark:text-[#9CA3AF] font-medium text-sm">Payslips Generated</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.payslipsGenerated}</h2>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">This month</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#6B7280] dark:text-[#9CA3AF] font-medium text-sm">Next Pay Date</h3>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">1st {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'short' })}</h2>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Upcoming run</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Payroll History</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all w-64 text-[#111827] dark:text-[#F3F4F6]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]">
              <tr>
                <th className="px-6 py-4 font-semibold">Period</th>
                <th className="px-6 py-4 font-semibold">Structure</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {recentRuns.filter(r => r.monthString.toLowerCase().includes(searchQuery.toLowerCase()) || r.structureName.toLowerCase().includes(searchQuery.toLowerCase())).map((run) => (
                <tr key={run.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{run.monthString}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[#475569] dark:text-[#9CA3AF]">{run.structureName}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111827] dark:text-[#F3F4F6]">
                    {run.totalAmountStr}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      run.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30' :
                      run.status === 'FAILED' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/30' :
                      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
                    }`}>
                      {run.status === 'PAID' ? 'Paid' : run.status === 'PROCESSING' ? 'Computed' : run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/dashboard/admin/payroll/${run.id}`)}
                      className="text-[#111827] dark:text-[#F3F4F6] font-medium hover:underline flex items-center justify-end gap-1 w-full"
                    >
                      View Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {recentRuns.filter(r => r.monthString.toLowerCase().includes(searchQuery.toLowerCase()) || r.structureName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                    {searchQuery ? "No runs found matching your search." : "No payroll runs found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isWizardOpen && (
        <Wizard 
          salaryStructures={salaryStructures}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
}
