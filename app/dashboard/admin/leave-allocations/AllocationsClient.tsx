"use client";

import { useState, useTransition } from "react";
import { 
  CalendarRange, Plus, Search, Filter, MoreVertical, Trash2, CheckCircle2, XCircle
} from "lucide-react";
import { format } from "date-fns";
import { AllocationModal } from "./AllocationModal";
import { deleteLeaveAllocation, updateLeaveAllocationStatus } from "./actions";
import { LeaveAllocationStatus } from "@prisma/client";

export function AllocationsClient({ 
  initialAllocations, 
  employees,
  leaveTypes
}: { 
  initialAllocations: any[];
  employees: any[];
  leaveTypes: any[];
}) {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredAllocations = allocations.filter(a => {
    const matchesSearch = 
      `${a.employee?.firstName} ${a.employee?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.leaveType?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this allocation?")) return;
    
    startTransition(async () => {
      const res = await deleteLeaveAllocation(id);
      if (res.success) {
        setAllocations(allocations.filter(a => a.id !== id));
      } else {
        alert(res.error || "Failed to delete allocation");
      }
    });
  };

  const handleUpdateStatus = async (id: string, status: LeaveAllocationStatus) => {
    startTransition(async () => {
      const res = await updateLeaveAllocationStatus(id, status);
      if (res.success) {
        setAllocations(allocations.map(a => a.id === id ? { ...a, status } : a));
      } else {
        alert(res.error || "Failed to update status");
      }
      setActiveMenu(null);
    });
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'APPROVED': return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case 'DRAFT': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case 'REFUSED': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Leave Allocations</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Allocate leave days to employees and manage balances.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Allocation
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-visible">
        <div className="p-4 md:p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text"
              placeholder="Search by employee or leave type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-[#111827] dark:text-[#F3F4F6]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Leave Type</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Usage (Rem. / Total)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                    <CalendarRange className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No leave allocations found.</p>
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">
                        {alloc.employee?.firstName} {alloc.employee?.lastName}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                        {alloc.employee?.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#111827] dark:text-[#F3F4F6]">{alloc.leaveType?.name}</div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {alloc.leaveType?.isPaid ? "Paid" : "Unpaid"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#111827] dark:text-[#F3F4F6]">
                          <span className="text-[#6B7280]">From:</span> {format(new Date(alloc.dateFrom), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#111827] dark:text-[#F3F4F6]">
                          <span className="text-[#6B7280]">To:</span> {format(new Date(alloc.dateTo), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111827] dark:text-[#F3F4F6]">{alloc.remainingDays}</span>
                        <span className="text-[#6B7280] dark:text-[#9CA3AF]">/ {alloc.numberOfDays} days</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min(100, (alloc.takenDays / alloc.numberOfDays) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md border ${getStatusStyle(alloc.status)}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === alloc.id ? null : alloc.id)}
                          className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#334155] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        </button>
                        
                        {activeMenu === alloc.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#1E293B] z-20 py-1 overflow-hidden">
                              {alloc.status === 'DRAFT' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(alloc.id, 'APPROVED')}
                                    className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(alloc.id, 'REFUSED')}
                                    className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" /> Refuse
                                  </button>
                                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                </>
                              )}
                              <button 
                                onClick={() => handleDelete(alloc.id)}
                                disabled={isPending}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AllocationModal 
          employees={employees}
          leaveTypes={leaveTypes}
          onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); 
          }} 
        />
      )}
    </div>
  );
}

