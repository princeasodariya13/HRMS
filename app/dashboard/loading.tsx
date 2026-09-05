import { Users, UserCheck, CalendarOff, Banknote, Sparkles } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-[#E5E7EB] rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-[#F3F4F6] dark:bg-[#1E293B] rounded-md"></div>
        </div>
        <div className="h-8 w-24 bg-[#E5E7EB] rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-24 bg-[#F3F4F6] dark:bg-[#1E293B] rounded-md mb-3"></div>
                <div className="h-8 w-16 bg-[#E5E7EB] rounded-lg"></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B]"></div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-3 w-32 bg-[#F3F4F6] dark:bg-[#1E293B] rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96 flex flex-col justify-between animate-pulse">
          <div className="h-6 w-48 bg-[#E5E7EB] rounded-lg mb-4"></div>
          <div className="flex-1 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl w-full"></div>
        </div>

        {/* AI Insight Skeleton */}
        <div className="bg-[#111827] dark:bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-lg p-6 h-96 flex flex-col relative overflow-hidden animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-white dark:bg-[#0F172A]/20 rounded-md"></div>
            <div className="h-6 w-32 bg-white dark:bg-[#0F172A]/20 rounded-lg"></div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="h-4 w-full bg-white dark:bg-[#0F172A]/10 rounded-md"></div>
            <div className="h-4 w-4/5 bg-white dark:bg-[#0F172A]/10 rounded-md"></div>
            <div className="h-4 w-full bg-white dark:bg-[#0F172A]/10 rounded-md mt-4"></div>
            <div className="h-4 w-3/5 bg-white dark:bg-[#0F172A]/10 rounded-md"></div>
          </div>
          
          <div className="w-full h-10 mt-6 bg-white dark:bg-[#0F172A]/20 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
