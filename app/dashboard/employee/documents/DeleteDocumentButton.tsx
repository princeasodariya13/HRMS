"use client";

import { useState } from "react";
import { deleteDocument } from "./actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    const result = await deleteDocument(documentId);
    
    if (result?.error) {
      alert(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Delete Document"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
