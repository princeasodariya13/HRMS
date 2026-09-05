"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X, Clock, CalendarDays, Loader2 } from "lucide-react";
import { updateLeaveStatus } from "./actions";

export type LeaveRequestData = {
  id: string;
  employeeName: string;
  initials: string;
  department: string;
  type: string;
  durationString: string;
  days: number;
  reason: string;
  status: string;
};

type LeavesClientProps = {
  stats: { pending: number; approved: number; onLeaveToday: number };
  leaves: LeaveRequestData[];
};

export function LeavesClient({ stats, leaves }: LeavesClientProps) {
  const [activeTab, setActiveTab] = useState("pending");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (id: string, status: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
      const res = await updateLeaveStatus(id, status);
      if (res.error) alert(res.error);
    });
  };

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const historyLeaves = leaves.filter(l => l.status !== 'PENDING');

  const displayLeaves = activeTab === 'pending' ? pendingLeaves : historyLeaves;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Leave Management</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm">Review, approve, and track employee time off.</p>
        </div>
        <button className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm font-medium">Pending Requests</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm font-medium">Approved This Month</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm font-medium">On Leave Today</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.onLeaveToday}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-6 px-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#111827] text-[#111827] dark:text-[#F3F4F6]' : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6]'}`}
          >
            Pending Approvals ({pendingLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#111827] text-[#111827] dark:text-[#F3F4F6]' : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6]'}`}
          >
            Leave History ({historyLeaves.length})
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold text-right">Actions / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {displayLeaves.map((leave, i) => (
                <tr key={leave.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i % 2 === 0 ? 'bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827]' : 'bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-[#F3F4F6]'}`}>
                        {leave.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{leave.employeeName}</div>
                        <div className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-xs">{leave.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-200">
                      {leave.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#111827] dark:text-[#F3F4F6]">{leave.durationString}</div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">{leave.days} day(s)</div>
                  </td>
                  <td className="px-6 py-4 text-[#475569] max-w-xs truncate">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {activeTab === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdate(leave.id, 'APPROVED')}
                          disabled={isPending}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdate(leave.id, 'REJECTED')}
                          disabled={isPending}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                          {leave.status}
                        </span>
                        {leave.status === 'REJECTED' && (
                          <button
                            onClick={() => handleUpdate(leave.id, 'APPROVED')}
                            disabled={isPending}
                            className="p-1.5 bg-gray-50 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors border border-gray-200 disabled:opacity-50"
                            title="Change to Approved"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {leave.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdate(leave.id, 'REJECTED')}
                            disabled={isPending}
                            className="p-1.5 bg-gray-50 hover:bg-red-50 text-red-600 rounded-md transition-colors border border-gray-200 disabled:opacity-50"
                            title="Change to Rejected"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {displayLeaves.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
