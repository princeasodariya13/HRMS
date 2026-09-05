"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, Search, User, Sun, Moon, Menu, X,
  LayoutDashboard, Users, CalendarCheck, CalendarOff, 
  Banknote, Briefcase, FileText, Settings, Bot, 
  Target, Shield
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getNotifications, markAsRead } from "@/app/dashboard/notifications-actions";

const ADMIN_NAV_ITEMS = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Employees", href: "/dashboard/admin/employees", icon: Users },
  { name: "Attendance", href: "/dashboard/admin/attendance", icon: CalendarCheck },
  { name: "Leaves", href: "/dashboard/admin/leaves", icon: CalendarOff },
  { name: "Payroll", href: "/dashboard/admin/payroll", icon: Banknote },
  { name: "Recruitment", href: "/dashboard/admin/recruitment", icon: Briefcase },
  { name: "Documents", href: "/dashboard/admin/documents", icon: FileText },
  { name: "Resume AI", href: "/dashboard/admin/resume-analyzer", icon: Bot },
  { name: "AI Assistant", href: "/dashboard/admin/ai-assistant", icon: Bot },
];

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

export function TopNavbar({ 
  userEmail, 
  role = "EMPLOYEE",
  userName = ""
}: { 
  userEmail: string; 
  role?: string;
  userName?: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    // 1. Initial load
    async function fetchNotifications() {
      const res = await getNotifications();
      if (res.data) setNotifications(res.data);
    }
    fetchNotifications();

    // 2. Listen for real-time pushes from RealtimeProvider (SSE)
    const handleNewNotifs = (e: Event) => {
      const customEvent = e as CustomEvent;
      const incomingNotifs = customEvent.detail;
      
      setNotifications((prev) => {
        // Prevent duplicates
        const existingIds = new Set(prev.map(n => n.id));
        const uniqueNew = incomingNotifs.filter((n: any) => !existingIds.has(n.id));
        
        if (uniqueNew.length === 0) return prev;
        
        // Add new notifications to the top and sort by newest first
        return [...uniqueNew, ...prev].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    };

    window.addEventListener('new-notifications', handleNewNotifs);
    return () => {
      window.removeEventListener('new-notifications', handleNewNotifs);
    };
  }, []);

  const handleMarkAllRead = async () => {
    await markAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string, link?: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (link) router.push(link);
    setNotificationsOpen(false);
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = role === "EMPLOYEE" ? EMPLOYEE_NAV_ITEMS : ADMIN_NAV_ITEMS;

  const filteredItems = navItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchResults || filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = filteredItems[selectedIndex];
      if (selectedItem) {
        router.push(selectedItem.href);
        setShowSearchResults(false);
        setSearchQuery("");
      }
    } else if (e.key === "Escape") {
      setShowSearchResults(false);
    }
  };

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(userName);

  const formattedRole = role === "SUPER_ADMIN" 
    ? "Company Admin" 
    : role === "COMPANY_ADMIN" 
    ? "Company Admin" 
    : role === "HR_MANAGER" 
    ? "HR Manager" 
    : "Employee";



  return (
    <>
      <header className="h-16 shrink-0 bg-white dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between px-4 md:px-6 z-40 transition-colors duration-200">
        
        <div className="flex items-center gap-3 md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0F172A] dark:bg-[#F8FAFC]">
              <Bot className="w-4 h-4 text-white dark:text-[#0F172A]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827] dark:text-[#F3F4F6]">
              NexaHR
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-md relative hidden md:block" ref={searchRef}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input 
            type="text"
            placeholder="Search pages and modules..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-lg text-sm text-[#111827] dark:text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all"
          />
          
          {showSearchResults && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] shadow-xl rounded-xl z-50 overflow-hidden">
              {filteredItems.length > 0 ? (
                <div className="py-2">
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors",
                        index === selectedIndex 
                          ? "bg-[#F3F4F6] dark:bg-[#1E293B]" 
                          : "hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50"
                      )}
                    >
                      <item.icon className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-center text-[#6B7280] dark:text-[#9CA3AF]">
                  No pages found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button 
            onClick={toggleTheme}
            className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] rounded-full transition-all duration-200"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-[#475569]" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] rounded-full transition-colors hidden md:block"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0F172A]"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] shadow-xl rounded-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] dark:border-[#1E293B] flex justify-between items-center">
                  <h3 className="font-bold text-[#111827] dark:text-[#F3F4F6]">Notifications</h3>
                  {hasUnread && (
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                      <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">You have no notifications.</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((notif: any) => (
                        <div 
                          key={notif.id}
                          className={cn(
                            "p-4 border-b border-[#E5E7EB] dark:border-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors cursor-pointer",
                            !notif.isRead && "bg-[#F0F9FF] dark:bg-[#1E293B]/80"
                          )} 
                          onClick={() => handleMarkRead(notif.id, notif.link)}
                        >
                          <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2">
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                            {notif.title}
                          </p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-[#9CA3AF] dark:text-[#6B7280] mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-[#E5E7EB] dark:bg-[#1E293B] mx-1 md:mx-2 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">{formattedRole}</span>
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{userEmail}</span>
            </div>
            <Link 
              href={role === "EMPLOYEE" ? "/dashboard/employee/profile" : "/dashboard/admin/settings"}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#111827] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-white dark:text-[#F3F4F6] cursor-pointer hover:ring-2 hover:ring-[#E5E7EB] dark:hover:ring-[#334155] transition-all"
            >
              {userName ? (
                <span className="text-xs font-bold">{initials}</span>
              ) : (
                <User className="w-4 h-4 md:w-4 md:h-4" />
              )}
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="relative w-64 max-w-sm bg-white dark:bg-[#0F172A] h-full flex flex-col shadow-2xl transition-transform animate-in slide-in-from-left">
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-[#F8FAFC]">
                  <Bot className="w-5 h-5 text-white dark:text-[#0F172A]" />
                </div>
                <span className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                  NexaHR
                </span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/dashboard/employee" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-[#F3F4F6] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6]" 
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-[#111827] dark:text-[#F3F4F6]" : "text-[#9CA3AF] dark:text-[#6B7280]")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-[#E5E7EB] dark:border-[#1E293B]">
              <Link
                href={role === "EMPLOYEE" ? "/dashboard/employee/settings" : "/dashboard/admin/settings"}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname.endsWith("/settings")
                    ? "bg-[#F3F4F6] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6]"
                    : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40"
                )}
              >
                <Settings className={cn("w-5 h-5", pathname.endsWith("/settings") ? "text-[#111827] dark:text-[#F3F4F6]" : "text-[#9CA3AF] dark:text-[#6B7280]")} />
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
