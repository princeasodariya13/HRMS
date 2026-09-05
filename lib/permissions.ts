/**
 * lib/permissions.ts
 * Central Role-Based Access Control (RBAC) helpers.
 *
 * Usage:
 *   import { canReadPayroll, canManageEmployees } from '@/lib/permissions'
 *   if (!canManageEmployees(user.role)) return { error: 'Forbidden' }
 */

export type AppRole =
  | "SUPER_ADMIN"
  | "COMPANY_ADMIN"
  | "HR_MANAGER"
  | "HR_PAYROLL_USER"
  | "HR_PAYROLL_MANAGER"
  | "PAYROLL_MANAGER"
  | "DEPT_MANAGER"
  | "RECRUITER"
  | "EMPLOYEE";

/** All roles that are considered admin-level (see full company data) */
const ADMIN_ROLES: AppRole[] = [
  "SUPER_ADMIN",
  "COMPANY_ADMIN",
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "PAYROLL_MANAGER",
];

// ─── Payroll ───────────────────────────────────────────────────────────────

export function canReadPayroll(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole);
}

export function canWritePayroll(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_PAYROLL_USER", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);
}

export function canControlPayroll(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);
}

// ─── Employee Management ───────────────────────────────────────────────────

export function canManageEmployees(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

export function canViewAllEmployees(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole) || role === "DEPT_MANAGER";
}

export function canChangeEmployeeStatus(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

export function canDeleteEmployee(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN"].includes(role);
}

// ─── Leave Management ─────────────────────────────────────────────────────

/** Can approve a leave as a manager (first-level approval) */
export function canManagerApproveLeave(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "DEPT_MANAGER"].includes(role);
}

/** Can give final HR-level approval (second-level approval) */
export function canHrApproveLeave(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

/** Can view all leave requests across company */
export function canViewAllLeaves(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole) || role === "DEPT_MANAGER";
}

export function canManageLeaveTypes(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

export function canManageLeaveAllocations(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

// ─── Attendance ────────────────────────────────────────────────────────────

export function canViewAllAttendance(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole) || role === "DEPT_MANAGER";
}

export function canEditAttendance(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

// ─── Documents ────────────────────────────────────────────────────────────

export function canManageDocuments(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

export function canVerifyDocuments(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

// ─── Contracts ────────────────────────────────────────────────────────────

export function canManageContracts(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"].includes(role);
}

// ─── Audit Logs ───────────────────────────────────────────────────────────

export function canViewAuditLogs(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"].includes(role);
}

// ─── AI Features ─────────────────────────────────────────────────────────

/** Can use the full admin AI assistant with company-wide context */
export function canAccessAdminAI(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole);
}

/** Can request AI anomaly scans on company data */
export function canRunAIScans(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

// ─── Analytics & Reporting ────────────────────────────────────────────────

export function canViewAnalytics(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole);
}

export function canViewDepartmentAnalytics(role: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole) || role === "DEPT_MANAGER";
}

// ─── Settings & Company ───────────────────────────────────────────────────

export function canManageCompanySettings(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN"].includes(role);
}

export function canManageSalaryStructures(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);
}

// ─── Recruitment ──────────────────────────────────────────────────────────

export function canManageRecruitment(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "RECRUITER"].includes(role);
}

// ─── Notifications ────────────────────────────────────────────────────────

export function canSendBroadcastNotifications(role: string): boolean {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(role);
}

// ─── Utility ─────────────────────────────────────────────────────────────

/** Check if a user has at minimum one of the provided roles */
export function hasRole(role: string, ...roles: AppRole[]): boolean {
  return roles.includes(role as AppRole);
}

/** Check if the user is any kind of admin (not a pure employee) */
export function isAdminRole(role: string): boolean {
  return role !== "EMPLOYEE";
}

/** Returns a user-friendly display name for a role */
export function getRoleDisplayName(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    COMPANY_ADMIN: "Company Admin",
    HR_MANAGER: "HR Manager",
    HR_PAYROLL_USER: "HR Payroll User",
    HR_PAYROLL_MANAGER: "HR Payroll Manager",
    PAYROLL_MANAGER: "Payroll Manager",
    DEPT_MANAGER: "Department Manager",
    RECRUITER: "Recruiter",
    EMPLOYEE: "Employee",
  };
  return map[role] ?? role;
}

/**
 * Returns a forbidden response object — use this in Server Actions
 * to return a consistent error when the user lacks permission.
 */
export function forbidden() {
  return { error: "Forbidden: You do not have permission to perform this action." };
}