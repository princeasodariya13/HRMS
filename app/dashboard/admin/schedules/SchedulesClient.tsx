"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarClock, Plus, Search, MoreVertical, Clock
} from "lucide-react";
import { ScheduleModal } from "./ScheduleModal";
import { deleteSchedule } from "./actions";

export function SchedulesClient({ initialSchedules }: { initialSchedules: any[] }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  React.useEffect(() => { setSchedules(initialSchedules); }, [initialSchedules]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredSchedules = schedules.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    startTransition(async () => {
      const res = await deleteSchedule(id);
      if (res.success) {
        setSchedules(schedules.filter(s => s.id !== id));
      } else {
        alert(res.error || "Failed to delete schedule");
      }
    });
  };

  const openEditModal = (schedule: any) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Working Schedules</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Define and manage company working hours and shifts.</p>
        </div>
        <button
          onClick={() => { setSelectedSchedule(null); setIsModalOpen(true); }}
          className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-visible">
        <div className="p-4 md:p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text"
              placeholder="Search by schedule name or type..."
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
                <th className="px-6 py-4 font-semibold">Schedule Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Weekly Hours</th>
                <th className="px-6 py-4 font-semibold">Employees Assigned</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                    <CalendarClock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>{searchQuery ? `No schedules found matching "${searchQuery}".` : "No working schedules configured."}</p>
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{schedule.name}</div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{schedule.lines.length} working days</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {schedule.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-[#111827] dark:text-[#F3F4F6]">
                        <Clock className="w-4 h-4 text-[#9CA3AF]" />
                        {schedule.weeklyHours} hrs
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#111827] dark:text-[#F3F4F6]">
                      {schedule._count?.employees || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`relative inline-block text-left ${activeMenu === schedule.id ? "z-50" : ""}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === schedule.id ? null : schedule.id); }}
                          className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#334155] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        </button>
                        
                        {activeMenu === schedule.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#1E293B] z-50 py-1 overflow-hidden">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenu(null); openEditModal(schedule); }}
                                className="w-full px-4 py-2 text-left text-sm text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                              >
                                Edit Schedule
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenu(null); handleDelete(schedule.id); }}
                                disabled={isPending}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50"
                              >
                                Delete Schedule
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
        <ScheduleModal 
          schedule={selectedSchedule}
          onClose={() => {
            setIsModalOpen(false);
            router.refresh(); 
          }} 
        />
      )}
    </div>
  );
}

