"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Edit2, UserX, UserCheck, Shield, X, Loader2, Search, Filter, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateEmployeeRole, updateEmployeeStatus, deleteEmployee } from "@/app/dashboard/admin/employees/actions";


interface EmployeeData {
  id: string;
  code: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export function EmployeeTable({ employees = [] }: { employees?: EmployeeData[] }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Modal states
  const [selectedEmp, setSelectedEmp] = useState<EmployeeData | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Action states
  const [isLoading, setIsLoading] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [localEmployees, setLocalEmployees] = useState<EmployeeData[]>(employees);

  useEffect(() => {
    setLocalEmployees(employees);
  }, [employees]);

  const filteredEmployees = localEmployees.filter(emp => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.code.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q);
      
    const matchesStatus = statusFilter === "ALL" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenRoleModal = (emp: EmployeeData) => {
    setSelectedEmp(emp);
    setNewRole(emp.role);
    setIsRoleModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenDeactivateModal = (emp: EmployeeData) => {
    setSelectedEmp(emp);
    setIsDeactivateModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenDeleteModal = (emp: EmployeeData) => {
    setSelectedEmp(emp);
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedEmp) return;
    setIsLoading(true);
    
    if (selectedEmp.id.length < 10) {
      setTimeout(() => {
        setLocalEmployees(prev => prev.map(emp => emp.id === selectedEmp.id ? { ...emp, role: newRole } : emp));
        setIsLoading(false);
        setIsRoleModalOpen(false);
      }, 500);
      return;
    }

    const res = await updateEmployeeRole(selectedEmp.id, newRole);
    setIsLoading(false);
    if (res?.error) alert(res.error);
    else setIsRoleModalOpen(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedEmp) return;
    setIsLoading(true);

    if (selectedEmp.id.length < 10) {
      setTimeout(() => {
        setLocalEmployees(prev => prev.map(emp => emp.id === selectedEmp.id ? { ...emp, status } : emp));
        setIsLoading(false);
        setIsDeactivateModalOpen(false);
      }, 500);
      return;
    }

    const res = await updateEmployeeStatus(selectedEmp.id, status);
    setIsLoading(false);
    if (res?.error) alert(res.error);
    else setIsDeactivateModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedEmp) return;
    setIsLoading(true);

    if (selectedEmp.id.length < 10) {
      setTimeout(() => {
        setLocalEmployees(prev => prev.filter(emp => emp.id !== selectedEmp.id));
        setIsLoading(false);
        setIsDeleteModalOpen(false);
      }, 500);
      return;
    }

    const res = await deleteEmployee(selectedEmp.id);
    setIsLoading(false);
    if (res?.error) alert(res.error);
    else {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, email, or ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all shadow-sm dark:text-white"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all shadow-sm"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden" ref={tableRef}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                    No employees found matching "{searchQuery}".
                  </td>
                </tr>
              )}
              {filteredEmployees.length > 0 && filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-center text-[#111827] dark:text-[#F3F4F6] font-semibold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{emp.name}</div>
                        <div className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-xs">{emp.email} • {emp.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#111827] dark:text-[#F3F4F6] font-medium">{emp.role}</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] px-2.5 py-1 rounded-md text-xs font-medium border border-[#E2E8F0]">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit",
                      emp.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        emp.status === 'ACTIVE' ? "bg-emerald-500" : "bg-amber-500"
                      )}></span>
                      {emp.status === 'ACTIVE' ? 'Active' : 'On Leave'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                      className="p-1.5 text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {activeMenu === emp.id && (
                      <div className="absolute right-8 top-10 w-48 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] shadow-xl rounded-xl py-1 z-10 flex flex-col">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#475569] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] hover:text-[#111827] dark:text-[#F3F4F6] text-left">
                          <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                        <button
                          onClick={() => handleOpenRoleModal(emp)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#475569] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] hover:text-[#111827] dark:text-[#F3F4F6] text-left w-full"
                        >
                          <Shield className="w-4 h-4" /> Change Role
                        </button>
                        <div className="h-px bg-[#E5E7EB] my-1"></div>
                        {emp.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleOpenDeactivateModal(emp)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left w-full"
                          >
                            <UserX className="w-4 h-4" /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedEmp(emp); handleUpdateStatus('ACTIVE'); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 text-left w-full"
                          >
                            <UserCheck className="w-4 h-4" /> Reactivate
                          </button>
                        )}
                        <div className="h-px bg-[#E5E7EB] my-1"></div>
                        <button
                          onClick={() => handleOpenDeleteModal(emp)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left w-full rounded-b-xl"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Employee
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Change Role Modal */}
        {isRoleModalOpen && selectedEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827] dark:bg-[#F3F4F6]/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
                <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Change Role</h3>
                <button onClick={() => setIsRoleModalOpen(false)} className="text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">Update the job title for <strong>{selectedEmp.name}</strong>.</p>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">New Job Title</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all shadow-sm text-[#111827] dark:text-[#F3F4F6]"
                  >
                    <option value="" disabled>Select a new role...</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Senior Engineer">Senior Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="UX Designer">UX Designer</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Marketing Specialist">Marketing Specialist</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Finance Analyst">Finance Analyst</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] flex justify-end gap-3">
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl hover:bg-[#F1F5F9] dark:bg-[#1E293B] transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-white dark:text-[#111827] bg-[#111827] dark:bg-[#F3F4F6] rounded-xl hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Modal */}
        {isDeactivateModalOpen && selectedEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827] dark:bg-[#F3F4F6]/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
                <h3 className="text-lg font-bold text-red-600">Deactivate Employee</h3>
                <button onClick={() => setIsDeactivateModalOpen(false)} className="text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm text-[#475569]">
                  Are you sure you want to deactivate <strong>{selectedEmp.name}</strong>? They will no longer have access to the NexaHR portal, and their status will change to INACTIVE.
                </p>
              </div>
              <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] flex justify-end gap-3">
                <button
                  onClick={() => setIsDeactivateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl hover:bg-[#F1F5F9] dark:bg-[#1E293B] transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus('INACTIVE')}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-white dark:text-[#111827] bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Yes, Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827] dark:bg-[#F3F4F6]/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
                <h3 className="text-lg font-bold text-red-600">Delete Employee</h3>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm text-[#475569]">
                  Are you absolutely sure you want to <strong>delete {selectedEmp.name}</strong> from the system? This action is permanent and cannot be undone. All of their associated records may also be removed.
                </p>
              </div>
              <div className="p-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl hover:bg-[#F1F5F9] dark:bg-[#1E293B] transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-white dark:text-[#111827] bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
