"use client";

import { useState, useTransition } from "react";
import { X, Loader2, FileText } from "lucide-react";
import { createContract, updateContract } from "./actions";
import { ContractStatus } from "@prisma/client";

export function ContractModal({ 
  contract, 
  employees,
  salaryStructures,
  onClose 
}: { 
  contract?: any;
  employees: any[];
  salaryStructures: any[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    employeeId: contract?.employeeId || "",
    startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
    endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "",
    wage: contract?.wage || "",
    jobPosition: contract?.jobPosition || "",
    departmentId: contract?.departmentId || "",
    salaryStructureId: contract?.salaryStructureId || "",
    status: contract?.status || ContractStatus.DRAFT
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.startDate || !formData.wage) {
      alert("Please fill required fields (Employee, Start Date, Wage)");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        wage: parseFloat(formData.wage),
        endDate: formData.endDate || null,
        status: formData.status as ContractStatus
      };

      let res;
      if (contract?.id) {
        res = await updateContract(contract.id, payload);
      } else {
        res = await createContract(payload);
      }

      if (res.error) {
        alert(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 dark:bg-[#0F172A]/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#111827] dark:text-[#F3F4F6]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">
                {contract ? "Edit Contract" : "Create Contract"}
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Fill in the employment terms.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Employee <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                disabled={!!contract}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6] disabled:opacity-60"
              >
                <option value="" disabled>Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Job Position</label>
              <input 
                type="text"
                value={formData.jobPosition}
                onChange={(e) => setFormData({...formData, jobPosition: e.target.value})}
                placeholder="e.g. Senior Developer"
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Base Wage (₹/mo) <span className="text-red-500">*</span></label>
              <input 
                type="number"
                required
                min="0"
                value={formData.wage}
                onChange={(e) => setFormData({...formData, wage: e.target.value})}
                placeholder="50000"
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Start Date <span className="text-red-500">*</span></label>
              <input 
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">End Date <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Salary Structure</label>
              <select
                value={formData.salaryStructureId}
                onChange={(e) => setFormData({...formData, salaryStructureId: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              >
                <option value="">No Structure Linked</option>
                {salaryStructures.map(struct => (
                  <option key={struct.id} value={struct.id}>{struct.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as ContractStatus})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="RUNNING">RUNNING</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              {formData.status === 'RUNNING' && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  Setting this to RUNNING will automatically EXPIRE any other active contracts for this employee.
                </p>
              )}
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end gap-3 mt-auto">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#475569] dark:text-[#9CA3AF] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#334155]/80 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#111827] dark:bg-[#F3F4F6] dark:text-[#111827] rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {contract ? "Save Changes" : "Create Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}

