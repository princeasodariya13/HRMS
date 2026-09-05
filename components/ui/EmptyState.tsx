import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] dark:bg-[#1E293B] flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[#9CA3AF] dark:text-[#6B7280]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-xs">{description}</p>}
      {action && (
        <Link href={action.href} className="mt-4 inline-flex items-center px-4 py-2 bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] text-sm font-semibold rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-colors">
          {action.label}
        </Link>
      )}
    </div>
  );
}
