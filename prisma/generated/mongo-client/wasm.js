
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  logoUrl: 'logoUrl',
  website: 'website',
  industry: 'industry',
  employeeCount: 'employeeCount',
  timezone: 'timezone',
  currency: 'currency',
  subscriptionId: 'subscriptionId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  description: 'description',
  managerId: 'managerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  password: 'password',
  image: 'image',
  companyId: 'companyId',
  role: 'role',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  departmentId: 'departmentId',
  employeeCode: 'employeeCode',
  firstName: 'firstName',
  lastName: 'lastName',
  designation: 'designation',
  joiningDate: 'joiningDate',
  status: 'status',
  workEmail: 'workEmail',
  personalEmail: 'personalEmail',
  phone: 'phone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  date: 'date',
  checkInTime: 'checkInTime',
  checkOutTime: 'checkOutTime',
  status: 'status',
  totalHours: 'totalHours',
  ipAddress: 'ipAddress',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  employeeId: 'employeeId',
  leaveTypeId: 'leaveTypeId',
  startDate: 'startDate',
  endDate: 'endDate',
  totalDays: 'totalDays',
  reason: 'reason',
  status: 'status',
  approvedById: 'approvedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollRunScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  month: 'month',
  year: 'year',
  status: 'status',
  totalAmount: 'totalAmount',
  processedById: 'processedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayslipScalarFieldEnum = {
  id: 'id',
  payrollRunId: 'payrollRunId',
  employeeId: 'employeeId',
  basicSalary: 'basicSalary',
  allowances: 'allowances',
  deductions: 'deductions',
  netSalary: 'netSalary',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  title: 'title',
  department: 'department',
  location: 'location',
  type: 'type',
  description: 'description',
  requirements: 'requirements',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CandidateScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  resumeUrl: 'resumeUrl',
  status: 'status',
  aiMatchScore: 'aiMatchScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  title: 'title',
  type: 'type',
  fileUrl: 'fileUrl',
  isVerified: 'isVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  module: 'module',
  action: 'action',
  recordId: 'recordId',
  oldData: 'oldData',
  newData: 'newData',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.AILogScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  actionType: 'actionType',
  prompt: 'prompt',
  response: 'response',
  tokensUsed: 'tokensUsed',
  createdAt: 'createdAt'
};

exports.Prisma.GoalScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  title: 'title',
  description: 'description',
  status: 'status',
  progress: 'progress',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PolicyScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  title: 'title',
  description: 'description',
  category: 'category',
  fileUrl: 'fileUrl',
  effectiveDate: 'effectiveDate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.UserRole = exports.$Enums.UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  DEPT_MANAGER: 'DEPT_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  RECRUITER: 'RECRUITER',
  PAYROLL_MANAGER: 'PAYROLL_MANAGER'
};

exports.EmployeeStatus = exports.$Enums.EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PROBATION: 'PROBATION',
  NOTICE_PERIOD: 'NOTICE_PERIOD',
  TERMINATED: 'TERMINATED',
  RESIGNED: 'RESIGNED'
};

exports.AttendanceStatus = exports.$Enums.AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  WORK_FROM_HOME: 'WORK_FROM_HOME',
  HOLIDAY: 'HOLIDAY',
  LEAVE: 'LEAVE'
};

exports.LeaveStatus = exports.$Enums.LeaveStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

exports.PayrollStatus = exports.$Enums.PayrollStatus = {
  DRAFT: 'DRAFT',
  PROCESSING: 'PROCESSING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  FAILED: 'FAILED'
};

exports.CandidateStatus = exports.$Enums.CandidateStatus = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEWED: 'INTERVIEWED',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  OFFERED: 'OFFERED',
  HIRED: 'HIRED'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  IDENTITY: 'IDENTITY',
  CONTRACT: 'CONTRACT',
  POLICY: 'POLICY',
  CERTIFICATE: 'CERTIFICATE',
  OTHER: 'OTHER'
};

exports.AIActionType = exports.$Enums.AIActionType = {
  CHAT_QUERY: 'CHAT_QUERY',
  RESUME_PARSING: 'RESUME_PARSING',
  CANDIDATE_MATCH: 'CANDIDATE_MATCH',
  DOCUMENT_GENERATION: 'DOCUMENT_GENERATION',
  POLICY_SEARCH: 'POLICY_SEARCH'
};

exports.GoalStatus = exports.$Enums.GoalStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD'
};

exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Company: 'Company',
  Department: 'Department',
  User: 'User',
  Employee: 'Employee',
  Attendance: 'Attendance',
  LeaveRequest: 'LeaveRequest',
  PayrollRun: 'PayrollRun',
  Payslip: 'Payslip',
  Job: 'Job',
  Candidate: 'Candidate',
  Document: 'Document',
  AuditLog: 'AuditLog',
  AILog: 'AILog',
  Goal: 'Goal',
  Policy: 'Policy'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
