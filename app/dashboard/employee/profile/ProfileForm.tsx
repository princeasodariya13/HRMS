"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { Save, AlertCircle, CheckCircle2, User } from "lucide-react";

type EmployeeData = {
  firstName: string;
  lastName: string;
  designation: string | null;
  personalEmail: string | null;
  phone: string | null;
};

export function ProfileForm({ employee }: { employee: EmployeeData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    const result = await updateProfile(formData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }

    setIsSubmitting(false);

    // Clear success message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === "success"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
          <input
            type="text"
            name="firstName"
            defaultValue={employee.firstName}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
          <input
            type="text"
            name="lastName"
            defaultValue={employee.lastName}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Designation / Role</label>
          <input
            type="text"
            name="designation"
            defaultValue={employee.designation || ""}
            placeholder="e.g. Software Engineer"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
          <input
            type="tel"
            name="phone"
            defaultValue={employee.phone || ""}
            placeholder="+91 1234567890"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal Email</label>
          <input
            type="email"
            name="personalEmail"
            defaultValue={employee.personalEmail || ""}
            placeholder="For emergency contact or recovery"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#111827] dark:bg-[#F3F4F6] hover:bg-gray-800 text-white dark:text-[#111827] font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
