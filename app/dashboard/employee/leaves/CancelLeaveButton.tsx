"use client";

import { useState } from "react";
import { deleteLeave } from "./actions";
import { X, Loader2 } from "lucide-react";

export function CancelLeaveButton({ leaveId }: { leaveId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    
    setIsDeleting(true);
    const result = await deleteLeave(leaveId);
    
    if (result?.error) {
      alert(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isDeleting}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-2 disabled:opacity-50"
      title="Cancel Request"
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
    </button>
  );
}
