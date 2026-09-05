"use client";

import { useState } from "react";
import { uploadDocument } from "./actions";
import { Upload, FileType, CheckCircle2, AlertCircle } from "lucide-react";

export function UploadDocumentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(formData: FormData) {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select a file to upload" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const result = await uploadDocument(formData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: "Document uploaded successfully!" });
      const form = document.getElementById("upload-form") as HTMLFormElement;
      form.reset();
      setSelectedFile(null);
    }
    
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <form id="upload-form" action={handleSubmit} className="space-y-5">
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
        <label className="text-sm font-medium text-gray-700">Document Title</label>
        <input 
          type="text" 
          name="title" 
          required
          placeholder="e.g. Passport Copy"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Document Type</label>
        <select 
          name="type" 
          required
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#111827] dark:focus:ring-white focus:border-transparent transition-all outline-none"
        >
          <option value="IDENTITY">Identity Proof</option>
          <option value="CERTIFICATE">Certificate / Degree</option>
          <option value="CONTRACT">Contract / Agreement</option>
          <option value="POLICY">Policy Acknowledgement</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">File</label>
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors text-center group cursor-pointer">
          <input 
            type="file" 
            name="file" 
            required
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-gray-700 transition-colors pointer-events-none">
            {selectedFile ? (
              <>
                <FileType className="w-8 h-8 text-blue-500" />
                <span className="font-medium text-sm text-gray-900 truncate max-w-full px-4">{selectedFile.name}</span>
                <span className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-1" />
                <span className="font-medium text-sm">Click to upload or drag and drop</span>
                <span className="text-xs">PDF, JPG, PNG or DOC (Max 5MB)</span>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedFile}
        className="w-full bg-[#111827] dark:bg-[#F3F4F6] hover:bg-gray-800 text-white dark:text-[#111827] font-medium py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Document
          </>
        )}
      </button>
    </form>
  );
}
