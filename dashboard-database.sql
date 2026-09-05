-- ==============================================================================
-- NEXA HR AI - ENTERPRISE HRMS DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'DEPT_MANAGER', 'EMPLOYEE', 'RECRUITER', 'PAYROLL_MANAGER'
);

CREATE TYPE employee_status AS ENUM (
  'ACTIVE', 'INACTIVE', 'PROBATION', 'NOTICE_PERIOD', 'TERMINATED', 'RESIGNED'
);

CREATE TYPE attendance_status AS ENUM (
  'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME', 'HOLIDAY', 'LEAVE'
);

CREATE TYPE leave_status AS ENUM (
  'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
);

CREATE TYPE payroll_status AS ENUM (
  'DRAFT', 'PROCESSING', 'APPROVED', 'PAID', 'FAILED'
);

CREATE TYPE candidate_status AS ENUM (
  'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'OFFERED', 'HIRED'
);

CREATE TYPE document_type AS ENUM (
  'IDENTITY', 'CONTRACT', 'POLICY', 'CERTIFICATE', 'OTHER'
);

CREATE TYPE ai_action_type AS ENUM (
  'CHAT_QUERY', 'RESUME_PARSING', 'CANDIDATE_MATCH', 'DOCUMENT_GENERATION', 'POLICY_SEARCH'
);

-- ------------------------------------------------------------------------------
-- 2. COMPANY & TENANT MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  employee_count INT DEFAULT 0,
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  subscription_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID, -- Will add FK later to avoid circular dependency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- ------------------------------------------------------------------------------
-- 3. AUTHENTICATION (Extending Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Maps directly to auth.users.id
  email VARCHAR(255) UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role user_role DEFAULT 'EMPLOYEE',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------------------------------------------
-- 4. EMPLOYEE MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  employee_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  joining_date DATE NOT NULL,
  status employee_status DEFAULT 'ACTIVE',
  work_email VARCHAR(255) NOT NULL,
  personal_email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(company_id, employee_code)
);

-- Add Foreign Key to departments now that employees table exists
ALTER TABLE departments ADD CONSTRAINT fk_department_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 5. ATTENDANCE MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status attendance_status NOT NULL,
  total_hours DECIMAL(5,2),
  ip_address VARCHAR(45),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ------------------------------------------------------------------------------
-- 6. LEAVE MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL, -- Assuming leave_types table exists
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL,
  reason TEXT NOT NULL,
  status leave_status DEFAULT 'PENDING',
  approved_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. PAYROLL MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  status payroll_status DEFAULT 'DRAFT',
  total_amount DECIMAL(12,2) NOT NULL,
  processed_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, month, year)
);

CREATE TABLE payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  basic_salary DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) NOT NULL,
  deductions DECIMAL(10,2) NOT NULL,
  net_salary DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(payroll_run_id, employee_id)
);

-- ------------------------------------------------------------------------------
-- 8. RECRUITMENT MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url TEXT,
  status candidate_status DEFAULT 'APPLIED',
  ai_match_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. DOCUMENT MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendances_employee_date ON attendances(employee_id, date);
CREATE INDEX idx_leave_requests_company ON leave_requests(company_id);
CREATE INDEX idx_payslips_employee ON payslips(employee_id);
CREATE INDEX idx_audit_logs_company_module ON audit_logs(company_id, module);
