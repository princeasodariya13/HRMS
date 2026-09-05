"use client";

import { useState, useTransition } from "react";
import { Briefcase, X, Loader2 } from "lucide-react";
import { createJob } from "./actions";

export function CreateJobModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      department: formData.get("department") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
    };

    startTransition(async () => {
      const res = await createJob(data);
      if (res.error) {
        alert(res.error);
      } else {
        handleClose();
      }
    });
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
      >
        <Briefcase className="w-4 h-4" />
        Post New Job
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-2xl shadow-xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <h2 className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6]">Post New Job</h2>
              <button 
                onClick={handleClose} 
                className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Job Title</label>
                  <input required name="title" type="text" placeholder="e.g. Senior Software Engineer" className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Department</label>
                  <input required name="department" type="text" placeholder="e.g. Engineering" className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Location</label>
                  <input required name="location" type="text" placeholder="e.g. Remote, San Francisco, CA" className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Job Type</label>
                  <select required name="type" className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Job Description</label>
                <textarea required name="description" rows={4} placeholder="Describe the responsibilities and role..." className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Requirements & Qualifications</label>
                <textarea required name="requirements" rows={4} placeholder="List the requirements, skills, and qualifications..." className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white resize-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E5E7EB] dark:border-[#1E293B]">
                <button type="button" onClick={handleClose} className="px-5 py-2.5 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
