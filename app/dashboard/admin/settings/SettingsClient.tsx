"use client";

import { useEffect, useState, useTransition } from "react";
import { Building, User, Moon, Sun, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { updateCompanySettings, updateAdminProfile } from "./actions";

type AdminSettingsProps = {
  company: { name: string; website: string | null } | null;
  employee: { firstName: string; lastName: string } | null;
  leaveTypes: any[];
};

export function SettingsClient({ company, employee, leaveTypes }: AdminSettingsProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isPendingCompany, startTransitionCompany] = useTransition();
  const [isPendingProfile, startTransitionProfile] = useTransition();

  const [companyName, setCompanyName] = useState(company?.name || "");
  const [companyWebsite, setCompanyWebsite] = useState(company?.website || "");
  const [firstName, setFirstName] = useState(employee?.firstName || "");
  const [lastName, setLastName] = useState(employee?.lastName || "");

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

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransitionCompany(async () => {
      const res = await updateCompanySettings({ name: companyName, website: companyWebsite });
      if (res.error) {
        setFeedback({ type: "error", message: res.error });
      } else {
        setFeedback({ type: "success", message: "Company settings updated successfully." });
      }
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransitionProfile(async () => {
      const res = await updateAdminProfile({ firstName, lastName });
      if (res.error) {
        setFeedback({ type: "error", message: res.error });
      } else {
        setFeedback({ type: "success", message: "Admin profile updated successfully." });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Settings</h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Configure system preferences, company details, and accounts.</p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-start gap-2 text-sm transition-all ${feedback.type === "success"
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
        {/* Company Settings */}
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 space-y-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Company Details</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Manage company details and identity.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">Corporate Website</label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://acme.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPendingCompany}
            className="w-full bg-[#111827] dark:bg-[#1F2937] text-white hover:bg-[#1f2937] dark:hover:bg-[#374151] rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-75"
          >
            <Save className="w-4 h-4" />
            {isPendingCompany ? "Saving Changes..." : "Save Company Info"}
          </button>
        </form>

        {/* Profile Settings */}
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 space-y-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Admin Profile</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Manage administrator account info.</p>
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
                placeholder="Prince"
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
                placeholder="Asodariya"
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
            {isPendingProfile ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </form>
      </div>

      {/* Leave Types Management */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 space-y-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Leave Policies</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Manage company leave types and annual quotas.</p>
            </div>
          </div>

          {leaveTypes.length === 0 && (
            <button
              onClick={() => {
                import('./actions').then(m => m.seedDefaultLeaveTypes().then(res => {
                  setFeedback(res.error ? { type: 'error', message: res.error } : { type: 'success', message: 'Seeded default leave types' });
                }))
              }}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200"
            >
              Seed Defaults
            </button>
          )}
        </div>

        <div className="pt-2 overflow-hidden border border-[#E5E7EB] dark:border-[#334155] rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#6B7280]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Annual Quota</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {leaveTypes.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No leave types configured.</td></tr>
              ) : (
                leaveTypes.map((lt) => (
                  <tr key={lt.id}>
                    <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F3F4F6]">{lt.name}</td>
                    <td className="px-4 py-3">{lt.annualQuota} days</td>
                    <td className="px-4 py-3">{lt.isPaid ? 'Paid' : 'Unpaid'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Delete this leave type?')) {
                            import('./actions').then(m => m.deleteLeaveType(lt.id).then(res => {
                              if (res.error) setFeedback({ type: 'error', message: res.error });
                            }));
                          }
                        }}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form
          className="mt-4 flex flex-col md:flex-row gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B]"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const annualQuota = parseInt(formData.get('annualQuota') as string);
            const isPaid = formData.get('isPaid') === 'on';

            import('./actions').then(m => m.createLeaveType({ name, annualQuota, isPaid }).then(res => {
              if (res.error) setFeedback({ type: 'error', message: res.error });
              else {
                setFeedback({ type: 'success', message: 'Leave type created' });
                (e.target as HTMLFormElement).reset();
              }
            }));
          }}
        >
          <input type="text" name="name" placeholder="Leave Name (e.g. Maternity)" required className="flex-1 px-3 py-2 border rounded-lg text-sm bg-transparent" />
          <input type="number" name="annualQuota" placeholder="Days/Year" required min={0} className="w-32 px-3 py-2 border rounded-lg text-sm bg-transparent" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPaid" defaultChecked /> Paid
          </label>
          <button type="submit" className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm">Add</button>
        </form>
      </div>

    </div>
  );
}
