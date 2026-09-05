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

export function canReadPayroll(role: string) {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "HR_PAYROLL_USER", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);
}

export function canWritePayroll(role: string) {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_PAYROLL_USER", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);
}

export function canControlPayroll(role: string) {
  return ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"].includes(role);
}