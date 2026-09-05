"use client";

import { useEffect, useState, useTransition } from "react";
import { User, Shield, Moon, Sun, Save, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { updateEmployeeProfile, changePassword } from "./actions";

type EmployeeSettingsProps = {
  employee: {
    firstName: string;
    lastName: string;
    workEmail: string;
    employeeCode: string;
    designation: string | null;
    joiningDate: string;
  } | null;
};

export function SettingsClient({ employee }: EmployeeSettingsProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isPendingProfile, startTransitionProfile] = useTransition();

  const [firstName, setFirstName] = useState(employee?.firstName || "");
  const [lastName, setLastName] = useState(employee?.lastName || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPendingPassword, startTransitionPassword] = useTransition();

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleToggleTheme = (selectedTheme: "light" | "dark") => {
    setTheme(selectedTheme);
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransitionProfile(async () => {
      const res = await updateEmployeeProfile({ firstName, lastName });
      if (res.error) {
        setFeedback({ type: "error", message: res.error });
      } else {
        setFeedback({ type: "success", message: "Personal preferences saved successfully." });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "New password must be at least 6 characters long." });
      return;
    }

    startTransitionPassword(async () => {
      const res = await changePassword(currentPassword, newPassword);
      if (res.error) {
        setFeedback({ type: "error", message: res.error });
      } else {
        setFeedback({ type: "success", message: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Settings</h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Configure your personal preferences, theme, and view corporate details.</p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-start gap-2 text-sm transition-all ${
          feedback.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300"
        }`}>
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="font-medium">{feedback.message}</p>
        </div>
      )}



      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 space-y-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Personal Preferences</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Manage details shown on your profile.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPendingProfile}
            className="w-full bg-[#111827] dark:bg-[#1F2937] text-white hover:bg-[#1f2937] dark:hover:bg-[#374151] rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-75"
          >
            <Save className="w-4 h-4" />
            {isPendingProfile ? "Saving Changes..." : "Save Preferences"}
          </button>
        </form>

        {/* Corporate Details (Read-only) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 space-y-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Corporate Details</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Your corporate registry and employment files.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">Employee Code</span>
              <span className="font-bold text-[#111827] dark:text-[#F3F4F6] bg-[#F1F5F9] dark:bg-[#1E293B] px-2.5 py-1 rounded-lg border border-[#E5E7EB] dark:border-[#334155]">{employee?.employeeCode}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">Designation</span>
              <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{employee?.designation || "Staff"}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">Work Email</span>
              <span className="font-semibold text-[#111827] dark:text-[#F3F4F6] truncate max-w-[200px]">{employee?.workEmail}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">Joining Date</span>
              <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{employee?.joiningDate}</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-xl border border-[#E5E7EB] dark:border-[#334155] text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
            Corporate fields are locked for security. To update your job title or work parameters, please contact your company administrator.
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 space-y-4 transition-all mt-8 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Security & Password</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Update your account password.</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPendingPassword}
          className="bg-[#111827] dark:bg-[#1F2937] text-white hover:bg-[#1f2937] dark:hover:bg-[#374151] rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-75 mt-2"
        >
          <Save className="w-4 h-4" />
          {isPendingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
