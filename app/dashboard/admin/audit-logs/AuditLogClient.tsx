'use client';
import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

const MODULE_COLORS: Record<string,string> = {
  EMPLOYEE:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  LEAVE:'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  PAYROLL:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  CONTRACT:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DOCUMENT:'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  SALARY_STRUCTURE:'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  SETTINGS:'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};
const ACTION_COLORS: Record<string,string> = {
  CREATE:'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPDATE:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  APPROVE:'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  REJECT:'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  MANAGER_APPROVE:'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

type AuditEntry = { id:string; module:string; action:string; recordId:string; userId:string|null; userEmail:string; ipAddress:string|null; oldData:string|null; newData:string|null; createdAt:string; };

export function AuditLogClient({ logs }: { logs: AuditEntry[] }) {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const modules = ['ALL', ...Array.from(new Set(logs.map(l=>l.module)))];
  const actions = ['ALL', ...Array.from(new Set(logs.map(l=>l.action)))];

  const filtered = useMemo(() => logs.filter(l => {
    if (moduleFilter !== 'ALL' && l.module !== moduleFilter) return false;
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (search && !`${l.userEmail} ${l.module} ${l.action} ${l.recordId}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [logs, search, moduleFilter, actionFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs..." className="bg-transparent text-sm text-[#111827] dark:text-[#F3F4F6] placeholder-[#9CA3AF] outline-none flex-1" />
        </div>
        <select value={moduleFilter} onChange={e=>setModuleFilter(e.target.value)} className="text-sm bg-[#F9FAFB] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#111827] dark:text-[#F3F4F6] rounded-lg px-3 py-1.5 outline-none">
          {modules.map(m=><option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m}</option>)}
        </select>
        <select value={actionFilter} onChange={e=>setActionFilter(e.target.value)} className="text-sm bg-[#F9FAFB] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#111827] dark:text-[#F3F4F6] rounded-lg px-3 py-1.5 outline-none">
          {actions.map(a=><option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>)}
        </select>
        <span className="text-xs text-[#9CA3AF] ml-auto">{filtered.length} entries</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl">
          <EmptyState icon={Filter} title="No audit logs found" description="No activity matches your current filters." />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E293B]/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Date/Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Module</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Record ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">Changes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={log.id} className={`border-b border-[#F3F4F6] dark:border-[#1E293B] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]/30 transition-colors ${i % 2 === 0 ? '' : 'bg-[#FAFAFA] dark:bg-[#0F172A]/50'}`}>
                    <td className="px-4 py-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[#374151] dark:text-[#D1D5DB]">{log.userEmail}</span>
                      {log.ipAddress && <div className="text-xs text-[#9CA3AF]">{log.ipAddress}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[log.module] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{log.module}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">{log.recordId.slice(0,12)}...</td>
                    <td className="px-4 py-3 max-w-xs">
                      {(log.oldData || log.newData) ? (
                        <div className="space-y-0.5">
                          {log.oldData && <div className="text-xs text-red-500 dark:text-red-400 truncate">− {log.oldData}</div>}
                          {log.newData && <div className="text-xs text-emerald-600 dark:text-emerald-400 truncate">+ {log.newData}</div>}
                        </div>
                      ) : <span className="text-xs text-[#9CA3AF]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
