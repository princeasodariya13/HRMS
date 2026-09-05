"use client";

import { useState, useTransition } from "react";
import { X, Loader2, ArrowRight } from "lucide-react";
import { getEligibleEmployees, createDraftPayrun } from "./actions";
import { useRouter } from "next/navigation";

export function Wizard({ 
  salaryStructures, 
  onClose 
}: { 
  salaryStructures: { id: string; name: string }[]; 
  onClose: () => void; 
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [structureId, setStructureId] = useState("");

  const [eligibleEmployees, setEligibleEmployees] = useState<any[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());

  const handleNext = async () => {
    if (!structureId) {
      alert("Please select a salary structure.");
      return;
    }

    startTransition(async () => {
      try {
        const emps = await getEligibleEmployees(month, year, structureId);
        setEligibleEmployees(emps);
        setSelectedEmpIds(new Set(emps.map(e => e.id)));
        setStep(2);
      } catch (err: any) {
        alert(err.message || "Failed to fetch eligible employees.");
      }
    });
  };

  const handleCreate = async () => {
    if (selectedEmpIds.size === 0) {
      alert("Please select at least one employee.");
      return;
    }

    startTransition(async () => {
      const res = await createDraftPayrun(month, year, structureId, Array.from(selectedEmpIds));
      if (res.error) {
        alert(res.error);
      } else {
        router.push(`/dashboard/admin/payroll/${res.runId}`);
      }
    });
  };

  const toggleEmp = (id: string) => {
    const next = new Set(selectedEmpIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmpIds(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 dark:bg-[#F3F4F6]/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">New Payrun Wizard</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">Salary Structure</label>
                <select
                  value={structureId}
                  onChange={(e) => setStructureId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
                >
                  <option value="" disabled>Select Structure...</option>
                  {salaryStructures.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
                  >
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#111827] dark:text-[#F3F4F6] mb-2 font-medium">Eligible Employees ({eligibleEmployees.length})</p>
              {eligibleEmployees.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
                  No eligible employees found with a RUNNING contract for this structure and period.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {eligibleEmployees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E5E7EB] dark:border-[#334155] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1E293B]/80 transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedEmpIds.has(emp.id)}
                        onChange={() => toggleEmp(emp.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#111827] focus:ring-[#111827]"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[#111827] dark:text-[#F3F4F6]">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{emp.designation}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end gap-3">
          {step === 1 ? (
            <button
              onClick={handleNext}
              disabled={isPending || !structureId}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#111827] dark:bg-[#F3F4F6] dark:text-[#111827] rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-sm font-semibold text-[#475569] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F1F5F9] transition-all dark:bg-[#1E293B] dark:border-[#334155] dark:text-[#F3F4F6]"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending || selectedEmpIds.size === 0}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#111827] dark:bg-[#F3F4F6] dark:text-[#111827] rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Draft Run
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

