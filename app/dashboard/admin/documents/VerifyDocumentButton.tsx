"use client";

import { useState } from "react";
import { verifyDocument } from "./actions";
import { CheckCircle2, Loader2 } from "lucide-react";

export function VerifyDocumentButton({ documentId, isVerified }: { documentId: string, isVerified: boolean }) {
  const [isVerifying, setIsVerifying] = useState(false);

  if (isVerified) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Verified
      </div>
    );
  }

  const handleVerify = async () => {
    setIsVerifying(true);
    const result = await verifyDocument(documentId);
    if (result.error) {
      alert(result.error);
    }
    setIsVerifying(false);
  };

  return (
    <button
      onClick={handleVerify}
      disabled={isVerifying}
      className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#1E293B] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
      title="Verify Document"
    >
      {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      Verify
    </button>
  );
}
