"use client";

import { useState, useTransition } from "react";
import { X, Loader2, CalendarRange } from "lucide-react";
import { createLeaveAllocation } from "./actions";

export function AllocationModal({ 
  employees,
  leaveTypes,
  onClose 
}: { 
  employees: any[];
  leaveTypes: any[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    numberOfDays: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.leaveTypeId || !formData.numberOfDays || !formData.dateFrom || !formData.dateTo) {
      alert("Please fill all required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        employeeId: formData.employeeId,
        leaveTypeId: formData.leaveTypeId,
        numberOfDays: parseFloat(formData.numberOfDays),
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
      };

      const res = await createLeaveAllocation(payload);
      if (res.error) {
        alert(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 dark:bg-[#0F172A]/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center">
              <CalendarRange className="w-5 h-5 text-[#111827] dark:text-[#F3F4F6]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Create Allocation</h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Allocate leave balance to an employee.</p>
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
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Employee <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
            >
              <option value="" disabled>Select Employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Leave Type <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.leaveTypeId}
              onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
            >
              <option value="" disabled>Select Leave Type...</option>
              {leaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name} {lt.isPaid ? '(Paid)' : '(Unpaid)'}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Number of Days <span className="text-red-500">*</span></label>
            <input 
              type="number"
              required
              min="0.5"
              step="0.5"
              value={formData.numberOfDays}
              onChange={(e) => setFormData({...formData, numberOfDays: e.target.value})}
              placeholder="e.g. 15"
              className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Valid From <span className="text-red-500">*</span></label>
              <input 
                type="date"
                required
                value={formData.dateFrom}
                onChange={(e) => setFormData({...formData, dateFrom: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Valid To <span className="text-red-500">*</span></label>
              <input 
                type="date"
                required
                value={formData.dateTo}
                onChange={(e) => setFormData({...formData, dateTo: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
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
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

