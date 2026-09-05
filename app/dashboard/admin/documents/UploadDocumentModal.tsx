"use client";

import { useState, useTransition } from "react";
import { Upload, X, Loader2, FileUp } from "lucide-react";
import { uploadAdminDocument } from "./actions";

export function UploadDocumentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await uploadAdminDocument(formData);
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
        <Upload className="w-4 h-4" />
        Upload Document
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-2xl shadow-xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <h2 className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6]">Upload to Google Drive</h2>
              <button 
                onClick={handleClose} 
                className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Document Title</label>
                <input required name="title" type="text" placeholder="e.g. Q3 Employee Handbook" className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">Document Type</label>
                <select required name="type" className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#F3F4F6]/20 transition-all text-sm dark:text-white">
                  <option value="POLICY">Company Policy</option>
                  <option value="CONTRACT">Employee Contract</option>
                  <option value="ID_PROOF">ID Proof</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">File Attachment</label>
                <div className="border-2 border-dashed border-[#E5E7EB] dark:border-[#334155] rounded-xl p-6 flex flex-col items-center justify-center text-center bg-[#F8FAFC] dark:bg-[#1E293B]">
                  <FileUp className="w-8 h-8 text-[#9CA3AF] mb-2" />
                  <p className="text-sm font-medium text-[#475569] dark:text-[#9CA3AF]">Drag and drop your file here, or click to browse</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Supports PDF, DOCX, PNG (Max 5MB)</p>
                  <input required name="file" type="file" className="mt-4 text-sm" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E5E7EB] dark:border-[#1E293B]">
                <button type="button" onClick={handleClose} className="px-5 py-2.5 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? "Uploading to Drive..." : "Upload to Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
