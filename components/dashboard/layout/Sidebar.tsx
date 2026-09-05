"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarOff, 
  Banknote, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings,
  Bot,
  User,
  Target,
  Shield,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS = [
  { name: "Overview",     href: "/dashboard/admin",                icon: LayoutDashboard },
  { name: "Employees",    href: "/dashboard/admin/employees",      icon: Users },
  { name: "Attendance",   href: "/dashboard/admin/attendance",     icon: CalendarCheck },
  { name: "Leaves",       href: "/dashboard/admin/leaves",         icon: CalendarOff },
  { name: "Payroll",      href: "/dashboard/admin/payroll",        icon: Banknote },
  { name: "Recruitment",  href: "/dashboard/admin/recruitment",    icon: Briefcase },
  { name: "Documents",    href: "/dashboard/admin/documents",      icon: FileText },
  { name: "Resume AI",    href: "/dashboard/admin/resume-analyzer",icon: FileText },
  { name: "AI Assistant", href: "/dashboard/admin/ai-assistant",   icon: Bot },
];

// Only shown to privileged admin roles
const AUDIT_NAV_ITEM = {
  name: "Audit Logs",
  href: "/dashboard/admin/audit-logs",
  icon: ShieldCheck,
};

const EMPLOYEE_NAV_ITEMS = [
  { name: "My Dashboard", href: "/dashboard/employee", icon: LayoutDashboard },
  { name: "My Profile", href: "/dashboard/employee/profile", icon: User },
  { name: "Attendance", href: "/dashboard/employee/attendance", icon: CalendarCheck },
  { name: "Leaves", href: "/dashboard/employee/leaves", icon: CalendarOff },
  { name: "Payslips", href: "/dashboard/employee/payroll", icon: Banknote },
  { name: "Documents", href: "/dashboard/employee/documents", icon: FileText },
  { name: "Performance", href: "/dashboard/employee/performance", icon: Target },
  { name: "Policies", href: "/dashboard/employee/policies", icon: Shield },
  { name: "AI HR", href: "/dashboard/employee/ai-assistant", icon: Bot },
];

export function Sidebar({ role = "SUPER_ADMIN" }: { role?: string }) {
  const pathname = usePathname();

  const navItems = role === "EMPLOYEE" ? EMPLOYEE_NAV_ITEMS : [
    ...ADMIN_NAV_ITEMS,
    // Audit Logs only visible to privileged admin roles
    ...(role === "SUPER_ADMIN" || role === "COMPANY_ADMIN" ? [AUDIT_NAV_ITEM] : []),
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white dark:bg-[#0F172A] border-r border-[#E5E7EB] dark:border-[#1E293B] flex-col h-screen sticky top-0 transition-colors duration-200 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-[#F8FAFC] shadow-sm transition-colors">
            <Bot className="w-5 h-5 text-white dark:text-[#0F172A]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#111827] dark:text-[#F3F4F6]">
            NexaHR <span className="text-[#6B7280] dark:text-[#9CA3AF]">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/dashboard/employee" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-[#F3F4F6] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6]" 
                  : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 hover:text-[#111827] dark:hover:text-[#F3F4F6]"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-[#111827] dark:text-[#F3F4F6]" : "text-[#9CA3AF] dark:text-[#6B7280]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E5E7EB] dark:border-[#1E293B]">
        <Link
          href={role === "EMPLOYEE" ? "/dashboard/employee/settings" : "/dashboard/admin/settings"}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            pathname.endsWith("/settings")
              ? "bg-[#F3F4F6] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6]"
              : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 hover:text-[#111827] dark:hover:text-[#F3F4F6]"
          )}
        >
          <Settings className={cn("w-5 h-5 transition-colors", pathname.endsWith("/settings") ? "text-[#111827] dark:text-[#F3F4F6]" : "text-[#9CA3AF] dark:text-[#6B7280]")} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
