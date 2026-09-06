"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Calculator, CheckCircle2, Lock, FileOutput, Loader2, AlertTriangle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { computePayrun, validatePayrun, markPayrunPaid, sendPayrunPayslips } from "../actions";

export function PayrunDetailClient({ run, canWritePayroll, canControlPayroll }: { run: any; canWritePayroll: boolean; canControlPayroll: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const handleCompute = () => {
    startTransition(async () => {
      const res = await computePayrun(run.id);
      if (res.error) {
        alert(res.error);
      } else {
        if (res.warnings && res.warnings.length > 0) {
          setWarnings(res.warnings);
        } else {
          setWarnings([]);
        }
      }
    });
  };

  const handleValidate = () => {
    if (warnings.length > 0) {
      if (!confirm("There are warnings. Are you sure you want to validate?")) return;
    }
    startTransition(async () => {
      const res = await validatePayrun(run.id);
      if (res.error) alert(res.error);
    });
  };

  const handleMarkPaid = () => {
    if (!confirm("Are you sure? This will lock the payroll run permanently.")) return;
    startTransition(async () => {
      const res = await markPayrunPaid(run.id);
      if (res.error) alert(res.error);
    });
  };

  const handleSendPayslips = () => {
    setSendResult(null);
    startTransition(async () => {
      const res = await sendPayrunPayslips(run.id);
      if (res.error) alert(res.error);
      else setSendResult(`${res.sent} sent, ${res.failed} failed`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/admin/payroll')}
            className="w-10 h-10 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Payrun: {run.monthString}</h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Structure: {run.salaryStructure?.name} • Status: <span className="font-semibold">{run.status}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {run.status === 'DRAFT' && canWritePayroll && (
            <button 
              onClick={handleCompute}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Compute
            </button>
          )}

          {run.status === 'PROCESSING' && canWritePayroll && (
            <button 
              onClick={handleValidate}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Validate
            </button>
          )}

          {run.status === 'APPROVED' && canControlPayroll && (
            <button 
              onClick={handleMarkPaid}
              disabled={isPending}
              className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Mark Paid
            </button>
          )}

          {run.status === 'PAID' && canControlPayroll && (
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              onClick={handleSendPayslips}
              disabled={isPending}
            >
              <Send className="w-4 h-4" />
              Send Payslips
            </button>
          )}
        </div>
      </div>

      {sendResult && <p className="text-sm font-semibold text-emerald-700">{sendResult}</p>}

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 font-bold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Computation Warnings
          </div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold text-center">Days Worked</th>
                <th className="px-6 py-4 font-semibold text-right">Basic Salary</th>
                <th className="px-6 py-4 font-semibold text-right">Allowances</th>
                <th className="px-6 py-4 font-semibold text-right">Deductions</th>
                <th className="px-6 py-4 font-semibold text-right">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {run.payslips.map((ps: any) => (
                <tr key={ps.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#111827] dark:text-[#F3F4F6]">{ps.employeeName}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{ps.employeeCode}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{ps.workedDays}</span>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF] text-xs"> / {ps.totalWorkingDays}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#111827] dark:text-[#F3F4F6]">
                    ₹{ps.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">
                    +₹{ps.allowances.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">
                    -₹{ps.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#111827] dark:text-[#F3F4F6]">
                    {ps.amountStr}
                  </td>
                </tr>
              ))}
              {run.payslips.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                    No employees in this run.
                  </td>
                </tr>
              )}
            </tbody>
            {run.payslips.length > 0 && run.status !== 'DRAFT' && (
              <tfoot className="bg-[#F8FAFC] dark:bg-[#1E293B] font-bold text-[#111827] dark:text-[#F3F4F6]">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right">Total Payout:</td>
                  <td className="px-6 py-4 text-right text-lg">{run.totalAmountStr}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

