import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">{title}</p>
          <h3 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6] mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#0F172A]" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">vs last month</span>
        </div>
      )}
    </div>
  );
}
