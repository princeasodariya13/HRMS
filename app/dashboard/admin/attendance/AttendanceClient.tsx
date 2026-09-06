"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Clock, CheckCircle2, Search, Filter, Loader2 } from "lucide-react";
import { checkInAction, checkOutAction } from "./actions";

type AttendanceLog = {
  id: string;
  employeeName: string;
  role: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  initials: string;
}

const getStatusStyle = (status: string) => {
  switch(status.toUpperCase()) {
    case 'PRESENT': return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case 'LATE': return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case 'ABSENT': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case 'HALF_DAY': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

export function AttendanceClient({ 
  initialLogs,
  isInitiallyCheckedIn = false
}: { 
  initialLogs: AttendanceLog[];
  isInitiallyCheckedIn?: boolean;
}) {
  const [checkedIn, setCheckedIn] = useState(isInitiallyCheckedIn);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTime = format(new Date(), "hh:mm a");
  const currentDate = format(new Date(), "EEEE, MMMM do, yyyy");

  const handleCheckIn = () => {
    startTransition(async () => {
      const res = await checkInAction();
      if (res.error) {
        alert(res.error);
      } else {
        setCheckedIn(true);
      }
    });
  };

  const handleCheckOut = () => {
    startTransition(async () => {
      const res = await checkOutAction();
      if (res.error) {
        alert(res.error);
      } else {
        setCheckedIn(false);
      }
    });
  };

  const filteredLogs = initialLogs.filter(log => {
    const matchesSearch = log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || log.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Attendance</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Track your daily work hours and check-in status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Check-in Card */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#F3F4F6] dark:bg-[#1E293B] flex items-center justify-center mb-4 border border-[#E5E7EB] dark:border-[#1E293B]">
            <Clock className="w-8 h-8 text-[#111827] dark:text-[#F3F4F6]" />
          </div>
          <h2 className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6] tracking-tight">{currentTime}</h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm mt-1">{currentDate}</p>
          
          <div className="mt-8 w-full">
            {!checkedIn ? (
              <button 
                onClick={handleCheckIn}
                disabled={isPending}
                className="w-full bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] py-3 rounded-xl font-semibold hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Check In Now
              </button>
            ) : (
              <button 
                onClick={handleCheckOut}
                disabled={isPending}
                className="w-full bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#1E293B] py-3 rounded-xl font-semibold hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                Check Out
              </button>
            )}
          </div>
          
          {checkedIn && (
            <p className="mt-4 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              You are currently clocked in.
            </p>
          )}
        </div>

        {/* Attendance Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Today's Logs</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-[#6B7280]" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:text-white"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-[#E5E7EB] dark:border-[#1E293B] rounded-lg text-sm text-[#111827] dark:text-white bg-[#F8FAFC] dark:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Check In</th>
                  <th className="px-6 py-4 font-semibold">Check Out</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                {filteredLogs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i % 2 === 0 ? 'bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827]' : 'bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-[#F3F4F6]'}`}>
                          {log.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{log.employeeName}</div>
                          <div className="text-[#6B7280] dark:text-[#9CA3AF] text-xs">{log.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{log.checkIn}</td>
                    <td className="px-6 py-4 text-[#9CA3AF] dark:text-[#6B7280] font-medium">{log.checkOut || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(log.status)}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                      {searchQuery ? `No attendance records found matching "${searchQuery}".` : "No attendance records found for today."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
