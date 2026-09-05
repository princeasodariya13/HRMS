"use client";

import { useState, useTransition } from "react";
import { X, Loader2, CalendarClock, Plus, Trash2 } from "lucide-react";
import { createSchedule, updateSchedule } from "./actions";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ScheduleModal({ 
  schedule, 
  onClose 
}: { 
  schedule?: any;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: schedule?.name || "",
    type: schedule?.type || "Standard",
  });
  const [lines, setLines] = useState<any[]>(
    schedule?.lines || [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", breakMinutes: 60 },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", breakMinutes: 60 },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", breakMinutes: 60 },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", breakMinutes: 60 },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", breakMinutes: 60 },
    ]
  );

  const addLine = () => {
    setLines([...lines, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", breakMinutes: 60 }]);
  };

  const updateLine = (index: number, key: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [key]: value };
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      alert("Please fill required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formData.name,
        type: formData.type,
        lines: lines.map(l => ({
          dayOfWeek: Number(l.dayOfWeek),
          startTime: l.startTime,
          endTime: l.endTime,
          breakMinutes: Number(l.breakMinutes)
        }))
      };

      let res;
      if (schedule?.id) {
        res = await updateSchedule(schedule.id, payload);
      } else {
        res = await createSchedule(payload);
      }

      if (res.error) {
        alert(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 dark:bg-[#0F172A]/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-[#111827] dark:text-[#F3F4F6]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">
                {schedule ? "Edit Working Schedule" : "Create Working Schedule"}
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Define weekly shifts and working hours.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Schedule Name <span className="text-red-500">*</span></label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Standard 9 to 5"
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Schedule Type <span className="text-red-500">*</span></label>
              <input 
                type="text"
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                placeholder="e.g. Standard, Flexible, Shift"
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B]">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">Working Days</label>
              <button 
                type="button" 
                onClick={addLine}
                className="text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Day
              </button>
            </div>
            
            <div className="space-y-2">
              {lines.map((line, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E5E7EB] dark:border-[#334155]">
                  <select
                    value={line.dayOfWeek}
                    onChange={(e) => updateLine(index, 'dayOfWeek', e.target.value)}
                    className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-lg text-sm text-[#111827] dark:text-[#F3F4F6]"
                  >
                    {DAYS_OF_WEEK.map((day, i) => (
                      <option key={i} value={i}>{day}</option>
                    ))}
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      required
                      value={line.startTime}
                      onChange={(e) => updateLine(index, 'startTime', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-lg text-sm text-[#111827] dark:text-[#F3F4F6]"
                    />
                    <span className="text-[#6B7280] text-sm">to</span>
                    <input 
                      type="time" 
                      required
                      value={line.endTime}
                      onChange={(e) => updateLine(index, 'endTime', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-lg text-sm text-[#111827] dark:text-[#F3F4F6]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Break (mins)"
                      value={line.breakMinutes}
                      onChange={(e) => updateLine(index, 'breakMinutes', e.target.value)}
                      className="w-24 px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-lg text-sm text-[#111827] dark:text-[#F3F4F6]"
                      title="Break Minutes"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeLine(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {lines.length === 0 && (
                <div className="text-center py-6 text-sm text-[#6B7280]">
                  No working days defined.
                </div>
              )}
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end gap-3 mt-auto">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#475569] dark:text-[#9CA3AF] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#334155]/80 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#111827] dark:bg-[#F3F4F6] dark:text-[#111827] rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {schedule ? "Save Changes" : "Create Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

