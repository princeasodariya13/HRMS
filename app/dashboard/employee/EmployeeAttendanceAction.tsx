"use client";

import { useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { checkIn, checkOut } from "./actions";
import { cn } from "@/lib/utils";

interface AttendanceStatus {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime: Date | null;
  checkOutTime: Date | null;
}

export function EmployeeAttendanceAction({ 
  employeeId, 
  initialStatus 
}: { 
  employeeId: string;
  initialStatus: AttendanceStatus;
}) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      if (!status.isCheckedIn) {
        // Check in
        const res = await checkIn(employeeId);
        if (res.success) {
          setStatus({
            ...status,
            isCheckedIn: true,
            checkInTime: new Date()
          });
        }
      } else if (!status.isCheckedOut) {
        // Check out
        const res = await checkOut(employeeId);
        if (res.success) {
          setStatus({
            ...status,
            isCheckedOut: true,
            checkOutTime: new Date()
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (status.isCheckedOut) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
        <p className="font-medium text-center">You have successfully completed your shift for today.</p>
        <p className="text-sm mt-1 opacity-80" suppressHydrationWarning>
          In: {status.checkInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
          Out: {status.checkOutTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleAction}
        disabled={loading}
        className={cn(
          "relative w-full h-32 rounded-2xl flex flex-col items-center justify-center transition-all group overflow-hidden shadow-sm hover:shadow-md border",
          !status.isCheckedIn 
            ? "bg-white dark:bg-[#0F172A] border-[#E5E7EB] dark:border-[#1E293B] hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-[#111827] dark:text-[#F3F4F6]" 
            : "bg-[#111827] dark:bg-[#F3F4F6] border-[#111827] dark:border-[#F3F4F6] text-white dark:text-[#111827] hover:bg-slate-800 dark:hover:bg-white"
        )}
      >
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <>
            {!status.isCheckedIn ? (
              <LogIn className="w-8 h-8 mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            ) : (
              <LogOut className="w-8 h-8 mb-2 text-rose-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="font-bold text-lg">
              {!status.isCheckedIn ? "Check In" : "Check Out"}
            </span>
          </>
        )}
      </button>

      {status.isCheckedIn && status.checkInTime && (
        <p className="text-sm text-gray-500 font-medium" suppressHydrationWarning>
          Checked in at {status.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
