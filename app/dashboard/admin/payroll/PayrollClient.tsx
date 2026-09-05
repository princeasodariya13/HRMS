"use client";

import { useTransition, useState } from "react";
import { Banknote, FileText, AlertCircle, ArrowRight, Loader2, Plus, X } from "lucide-react";
import { runPayrollAction, addIndividualPayrollAction } from "./actions";

export type PayrollRunData = {
  id: string;
  monthString: string;
  processedBy: string;
  totalAmountStr: string;
  status: string;
  payslips?: { id: string; employeeName: string; employeeCode: string; amountStr: string }[];
}

type PayrollClientProps = {
  stats: { currentMonthCost: string; payslipsGenerated: number; activeEmployees: number };
  recentRuns: PayrollRunData[];
  isDemo: boolean;
  employees: { id: string; name: string }[];
}

export function PayrollClient({ stats, recentRuns, isDemo, employees }: PayrollClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportRun, setSelectedReportRun] = useState<PayrollRunData | null>(null);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [amount, setAmount] = useState("");

  const handleRunPayroll = () => {
    startTransition(async () => {
      const res = await runPayrollAction();
      if (res.error) alert(res.error);
    });
  };

  const handleAddIndividual = () => {
    const numAmount = Number(amount);
    if (!selectedEmp || !amount || isNaN(numAmount) || numAmount <= 0) {
      alert("Please select an employee and enter a valid positive salary amount.");
      return;
    }
    
    startTransition(async () => {
      const res = await addIndividualPayrollAction(selectedEmp, numAmount);
      if (res.error) {
        alert(res.error);
      } else {
        setIsModalOpen(false);
        setSelectedEmp("");
        setAmount("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Payroll Management</h1> */}
          {/* <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm">Process monthly salaries and manage payslips.</p> */}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isDemo && (
            <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl shadow-sm animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Demo Data
            </span>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={isPending || isDemo}
            className="bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Plus className="w-4 h-4" />
            Individual Payroll
          </button>
          <button 
            onClick={handleRunPayroll}
            disabled={isPending || isDemo}
            className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Run All Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Current Month Cost</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6] tracking-tight">{stats.currentMonthCost}</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm mt-1">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Payslips Generated</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6] tracking-tight">{stats.payslipsGenerated}</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm mt-1">Out of {stats.activeEmployees} active employees</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-red-100 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-semibold text-red-900">Action Needed</h3>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xl font-bold text-red-700 tracking-tight">0 Failed Transfers</p>
            <p className="text-red-600/80 text-sm mt-1 font-medium">All clear</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Recent Payroll Runs</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
              <tr>
                <th className="px-6 py-4 font-semibold">Month</th>
                <th className="px-6 py-4 font-semibold">Processed By</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {recentRuns.map((run) => (
                <tr key={run.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#111827] dark:text-[#F3F4F6]">{run.monthString}</td>
                  <td className="px-6 py-4 text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">{run.processedBy}</td>
                  <td className="px-6 py-4 font-medium text-[#111827] dark:text-[#F3F4F6]">{run.totalAmountStr}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      run.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      run.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      run.status === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {run.status === 'PAID' ? 'Paid' : run.status === 'PROCESSING' ? 'Processing' : run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedReportRun(run)}
                      className="text-[#111827] dark:text-[#F3F4F6] font-medium hover:underline"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
              {recentRuns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                    No payroll runs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Individual Payroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827] dark:bg-[#F3F4F6]/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B]">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Add Individual Payroll</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">Select Employee</label>
                <select
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all shadow-sm text-[#111827] dark:text-[#F3F4F6]"
                >
                  <option value="" disabled>Select an employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">Salary Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all shadow-sm text-[#111827] dark:text-[#F3F4F6]"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl hover:bg-[#F1F5F9] dark:bg-[#1E293B] transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIndividual}
                disabled={isPending || !selectedEmp || !amount}
                className="px-4 py-2 text-sm font-semibold text-white dark:text-[#111827] bg-[#111827] dark:bg-[#F3F4F6] rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Payroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {selectedReportRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827] dark:bg-[#F3F4F6]/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B]">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <div>
                <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6]">Payroll Report - {selectedReportRun.monthString}</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Total Processed: {selectedReportRun.totalAmountStr}</p>
              </div>
              <button onClick={() => setSelectedReportRun(null)} className="text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6] transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF] sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee ID</th>
                    <th className="px-6 py-4 font-semibold">Employee Name</th>
                    <th className="px-6 py-4 font-semibold text-right">Net Salary Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                  {selectedReportRun.payslips && selectedReportRun.payslips.length > 0 ? (
                    selectedReportRun.payslips.map(ps => (
                      <tr key={ps.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">{ps.employeeCode}</td>
                        <td className="px-6 py-4 font-semibold text-[#111827] dark:text-[#F3F4F6]">{ps.employeeName}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-500 text-right">{ps.amountStr}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                        No individual payslip details found for this run.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] flex justify-end">
              <button
                onClick={() => setSelectedReportRun(null)}
                className="px-6 py-2.5 text-sm font-bold text-[#111827] dark:text-[#F3F4F6] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-all shadow-sm"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
