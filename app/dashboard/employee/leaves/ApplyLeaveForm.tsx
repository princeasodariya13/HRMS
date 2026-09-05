"use client";

import { useState } from "react";
import { applyLeave } from "./actions";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export function ApplyLeaveForm({ leaveTypes = [] }: { leaveTypes?: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    const result = await applyLeave(formData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: "Leave request submitted successfully!" });
      const form = document.getElementById("leave-form") as HTMLFormElement;
      form.reset();
    }
    
    setIsSubmitting(false);
  }

  return (
    <form id="leave-form" action={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
            : "bg-red-50 text-red-600 border border-red-100"
        }`}>
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Leave Type</label>
        <select 
          name="leaveTypeId" 
          required
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
        >
          {leaveTypes.length === 0 ? (
            <option value="Unpaid Leave">Unpaid Leave (Fallback)</option>
          ) : (
            leaveTypes.map(lt => (
              <option key={lt.id} value={lt.id}>{lt.name} (Quota: {lt.annualQuota})</option>
            ))
          )}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Start Date</label>
          <input 
            type="date" 
            name="startDate" 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">End Date</label>
          <input 
            type="date" 
            name="endDate" 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Reason</label>
        <textarea 
          name="reason" 
          rows={3}
          required
          placeholder="Please briefly explain why you are requesting leave..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#111827] dark:bg-[#F3F4F6] hover:bg-gray-800 text-white dark:text-[#111827] font-medium py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
        ) : (
          <>
            <Calendar className="w-5 h-5" />
            Submit Request
          </>
        )}
      </button>
    </form>
  );
}
