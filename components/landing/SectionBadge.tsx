import React from "react";
import { cn } from "@/lib/utils";

export function SectionBadge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7280] shadow-sm", className)}>
      <span className="flex h-1.5 w-1.5 rounded-full bg-[#111827] mr-2"></span>
      {children}
    </div>
  );
}
