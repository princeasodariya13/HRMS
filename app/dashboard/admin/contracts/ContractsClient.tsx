"use client";

import { useState, useTransition } from "react";
import { 
  FileText, Plus, Search, Filter, Briefcase, 
  MoreVertical, CheckCircle2, AlertCircle, Calendar, 
  Banknote, Building, User
} from "lucide-react";
import { format } from "date-fns";
import { ContractModal } from "./ContractModal";
import { deleteContract } from "./actions";

export function ContractsClient({ 
  initialContracts, 
  employees,
  salaryStructures,
  selectedEmployeeId 
}: { 
  initialContracts: any[];
  employees: any[];
  salaryStructures: any[];
  selectedEmployeeId?: string;
}) {
  const [contracts, setContracts] = useState(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState(selectedEmployeeId || "ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      `${c.employee?.firstName} ${c.employee?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobPosition?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesEmployee = employeeFilter === "ALL" || c.employeeId === employeeFilter;

    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    
    startTransition(async () => {
      const res = await deleteContract(id);
      if (res.success) {
        setContracts(contracts.filter(c => c.id !== id));
      } else {
        alert(res.error || "Failed to delete contract");
      }
    });
  };

  const openEditModal = (contract: any) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'RUNNING': return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case 'DRAFT': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case 'EXPIRED': return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      case 'CANCELLED': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Contracts</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Manage employee contracts and salary structures.</p>
        </div>
        <button
          onClick={() => { setSelectedContract(null); setIsModalOpen(true); }}
          className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Contract
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-visible">
        <div className="p-4 md:p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input 
                type="text"
                placeholder="Search by employee or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-[#111827] dark:text-[#F3F4F6]"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-[#111827] dark:text-[#F3F4F6] min-w-[160px]"
                >
                  <option value="ALL">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-[#111827] dark:text-[#F3F4F6]"
                >
                  <option value="ALL">All Status</option>
                  <option value="RUNNING">Running</option>
                  <option value="DRAFT">Draft</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Job Position</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Wage (₹)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No contracts found.</p>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr 
                    key={contract.id} 
                    className={`hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors ${contract.isActive ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] flex items-center justify-center font-bold text-xs">
                          {contract.employee?.firstName?.[0]}{contract.employee?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">
                            {contract.employee?.firstName} {contract.employee?.lastName}
                          </div>
                          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{contract.employee?.workEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="text-[#111827] dark:text-[#F3F4F6] font-medium">{contract.jobPosition || contract.employee?.designation || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#111827] dark:text-[#F3F4F6]">
                          <span className="text-[#6B7280]">Start:</span> {format(new Date(contract.startDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#111827] dark:text-[#F3F4F6]">
                          <span className="text-[#6B7280]">End:</span> {contract.endDate ? format(new Date(contract.endDate), 'MMM d, yyyy') : 'Indefinite'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-[#111827] dark:text-[#F3F4F6]">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(contract.wage)}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === contract.id ? null : contract.id)}
                          className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#334155] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        </button>
                        
                        {activeMenu === contract.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#1E293B] z-20 py-1 overflow-hidden">
                              <button 
                                onClick={() => openEditModal(contract)}
                                className="w-full px-4 py-2 text-left text-sm text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2"
                              >
                                Edit Contract
                              </button>
                              <button 
                                onClick={() => handleDelete(contract.id)}
                                disabled={isPending}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 disabled:opacity-50"
                              >
                                Delete Contract
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ContractModal 
          contract={selectedContract}
          employees={employees}
          salaryStructures={salaryStructures}
          onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); // Simple refresh for now, or use router.refresh() if router is passed
          }} 
        />
      )}
    </div>
  );
}
