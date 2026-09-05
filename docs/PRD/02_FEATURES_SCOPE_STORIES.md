# Part 2 — Features, Scope & User Stories

---

# § 7. Full Feature List (Module-Wise)

## Module 1: Authentication & Authorization
- Email/password login with JWT access + refresh tokens
- Company registration (self-service onboarding)
- User registration (invited by admin/HR)
- Forgot password → email reset link → reset password
- Email verification via OTP or magic link
- Token refresh with rotation (old refresh token invalidated)
- Logout (blacklist refresh token in Redis)
- RBAC middleware on every API route
- Permission-based granular access (module:action format)
- Protected frontend routes with role guards
- Session tracking (device, IP, last active)
- Password hashing with bcrypt (salt rounds: 12)
- Account lockout after 5 failed login attempts (15 min cooldown)
- Rate limiting: 5 login attempts/minute per IP

## Module 2: Company & Organization Management
- Company profile CRUD (name, logo, domain, address, industry, size)
- Branch management (name, code, address, city, country, is_headquarters)
- Department management (name, code, description, parent_department for hierarchy)
- Designation management (title, level, department association)
- Team management (name, department, team_lead assignment)
- Work location management (office, remote, hybrid with location details)
- Holiday calendar (name, date, type: national/regional/company, applicable branches)
- Company settings (fiscal year, week start, work hours, timezone, currency)
- Multi-tenant isolation via company_id foreign key on every entity

## Module 3: Employee Management
- Add employee with multi-step form (personal → job → contact → bank → documents)
- Edit employee profile (field-level edit permissions per role)
- Soft-delete / deactivate employee (status → inactive/terminated, retain records)
- Employee profile page with tabbed sections
- Personal info: name, DOB, gender, blood group, marital status, nationality, photo
- Job info: employee_id, department, designation, reporting_manager, join_date, employment_type (full-time/part-time/contract/intern), work_location, shift
- Contact info: email, phone, address (current + permanent)
- Emergency contact: name, relationship, phone, email
- Bank details: account_number (encrypted), IFSC, bank_name, branch
- Salary details: CTC, basic, HRA, allowances, deductions (linked to salary_structure)
- Document upload: multiple documents with type, expiry_date, verification_status
- Employment history: previous companies, designation, duration, reason for leaving
- Employee timeline: auto-generated log of all status changes, promotions, transfers
- Status management: active, inactive, probation, notice_period, terminated, absconding
- Advanced search: full-text search on name, email, employee_id, department
- Filters: department, designation, status, employment_type, join_date range, branch
- Sorting: name, join_date, department (asc/desc)
- Pagination: cursor-based for performance (default 20 per page)
- Bulk import via CSV upload
- Export employee list to CSV/Excel

## Module 4: Attendance Management
- Check-in: records timestamp, IP address, location (optional), device info
- Check-out: records timestamp, calculates work_hours automatically
- Daily attendance view: status (present/absent/half-day/on-leave/holiday/weekend)
- Monthly attendance report: calendar view + summary stats per employee
- Late mark: auto-flagged if check-in > configured grace period (e.g., 09:15 for 09:00 start)
- Half day: auto-marked if work_hours < configured threshold (e.g., < 4 hours)
- Overtime: auto-calculated if work_hours > configured standard hours
- Work hours: check-out minus check-in, excluding breaks if configured
- Attendance regularization: employee submits request with reason; manager approves/rejects
- Manager approval queue: list of pending regularization requests with approve/reject/comment
- Attendance analytics: department-wise present %, late trends, overtime trends, absenteeism patterns
- Integration with leave module: approved leaves auto-marked in attendance
- Integration with payroll: attendance data feeds into payroll calculations (LOP, overtime pay)

## Module 5: Leave Management
- Leave type CRUD: casual, sick, earned/privilege, maternity, paternity, compensatory, unpaid, bereavement, marriage (configurable per company)
- Leave balance: auto-allocated per policy (annual/monthly/quarterly), carry-forward rules, encashment rules
- Apply leave: date range, leave_type, reason, half-day option, attachment (medical certificate)
- Approve/reject leave: manager action with optional comment
- Cancel leave: employee can cancel if not yet processed; approved leaves require manager re-approval
- Leave history: filterable by type, status, date range
- Leave calendar: team calendar view showing who is on leave (color-coded by type)
- Leave policy configuration: accrual rules, max carry-forward, probation restrictions, sandwich rules, negative balance allowance
- Multi-level approval: employee → manager → HR (configurable per company)
- HR override: HR can approve/modify any leave regardless of workflow
- Leave notifications: email + in-app on apply, approve, reject, cancel
- Leave balance report: exportable, department-wise summary
- Public holidays auto-excluded from leave count

## Module 6: Payroll Management
- Salary structure templates: configurable components (basic, HRA, DA, conveyance, special allowance, medical, LTA)
- Earnings: base components + variable components (bonus, incentive, overtime_pay)
- Deductions: PF (12% employer + 12% employee), ESI, professional_tax, TDS (placeholder), loan_recovery
- Salary structure assignment: assign template to employee, override individual components
- Payroll run: select month → auto-calculate for all active employees → review → approve → finalize
- Calculation engine: gross = sum(earnings); deductions = sum(deductions) + LOP; net = gross - deductions
- LOP calculation: (monthly_salary / working_days) × absent_days (from attendance module)
- Payslip generation: auto-generated per employee after payroll approval
- Payslip PDF: downloadable PDF with company header, employee details, earnings/deductions breakdown, net pay
- Payroll history: month-wise payroll run records with status (draft/pending_approval/approved/paid)
- Salary revision: effective_date, previous_ctc, new_ctc, revision_reason, approved_by
- Payroll approval workflow: payroll_manager runs → company_admin approves
- Reimbursement: employee submits claim → manager approves → added to next payroll
- Bonus management: ad-hoc or festival bonus, added to specific month payroll
- Payroll analytics: total cost trends, department-wise cost, average CTC, CTC distribution

## Module 7: Recruitment Management
- Job posting: title, department, designation, experience_range, skills, job_type (full-time/contract), location, salary_range, description, status (draft/open/closed/on_hold)
- Job description: rich text editor with AI-generation capability
- Candidate application: apply via public job link or manual entry by recruiter
- Resume upload: PDF/DOCX upload to S3/Cloudinary
- AI resume parsing: extract name, email, phone, skills, experience, education from resume
- Candidate pipeline: Kanban board with stages (applied → screening → shortlisted → interview → offered → hired → rejected)
- Interview scheduling: date, time, round_number, interviewer assignment, video_link, location
- Interview rounds: phone_screen, technical_1, technical_2, HR, managerial, final (configurable)
- Interview feedback: rating (1-5), strengths, weaknesses, recommendation (strong_hire/hire/no_hire/strong_no_hire), private notes
- Candidate status tracking: real-time status updates with timeline view
- Offer letter generation: template-based with merge fields (name, designation, CTC, join_date)
- AI candidate-job matching: score candidates against job requirements (skills, experience, education match %)

## Module 8: Onboarding Management
- Onboarding checklist template: configurable per designation/department
- Checklist items: document_submission, ID_card_photo, bank_details, emergency_contact, IT_setup, seat_allocation, buddy_assignment, orientation_schedule
- Document collection: required documents list with upload status tracking
- Offer letter: auto-generated from recruitment module, digitally shared
- Joining letter: generated on join_date confirmation
- Asset allocation: laptop, ID_card, access_card, parking (tracked in onboarding)
- HR task assignment: background_verification, insurance_enrollment, policy_sharing
- Manager task assignment: team_introduction, project_briefing, buddy_assignment, KRA_setting
- Progress tracking: percentage completion, overdue items highlighted, notifications for pending tasks

## Module 9: Performance Management
- Goal setting: title, description, key_results, target_value, current_value, due_date, weight, status
- OKRs: Objectives linked to multiple Key Results; progress auto-calculated from key result completion
- Self-review: employee rates own goals, writes self-assessment (once per cycle)
- Manager review: manager rates employee goals, writes assessment, provides rating
- HR review: HR calibrates ratings across departments for fairness
- Rating scale: 1-5 (Needs Improvement, Below Expectations, Meets Expectations, Exceeds Expectations, Outstanding)
- 360 feedback: peer feedback requests (optional, advanced scope)
- Performance cycle: name, start_date, end_date, status (upcoming/active/review/closed), applicable_departments
- Promotion recommendation: manager can flag for promotion with justification
- AI performance summary: auto-generate narrative summary from goals, ratings, and feedback data

## Module 10: Document Management
- Employee documents: ID_proof, address_proof, education_certificates, experience_letters, offer_letter, PAN, Aadhaar (category-tagged)
- Company policies: HR_policy, leave_policy, code_of_conduct, anti_harassment, IT_policy, travel_policy (PDF/DOCX upload)
- HR documents: templates for offer_letter, appointment_letter, experience_letter, relieving_letter, warning_letter
- Auto-generated documents: payslips, offer letters, joining letters (from templates with merge fields)
- Document expiry reminder: configurable reminder (30/15/7 days before expiry) for passport, visa, certifications
- Secure file upload: virus scanning placeholder, file type validation (PDF/DOCX/JPG/PNG only), max size 10MB
- Role-based access: employees see own documents; managers see team documents; HR sees all; documents marked as confidential visible only to HR/Admin
- Document versioning: new upload creates new version; old versions retained
- Bulk download: HR can download all documents of an employee as ZIP

## Module 11: AI Assistant
*Detailed in § 13 AI Requirements*

## Module 12: Dashboard & Analytics
*Detailed in § 19 Reports and Analytics*

## Module 13: Notifications
- Email notifications via Nodemailer/SendGrid (templated HTML emails)
- In-app notifications via database + real-time polling (or WebSocket for advanced)
- Notification preferences: user can toggle email/in-app per notification type
- Notification center: bell icon with unread count, mark as read, mark all as read
- Triggers listed in § 20

## Module 14: Audit Logs
- Every CUD (Create/Update/Delete) operation logged automatically
- Log fields: user_id, user_role, action (CREATE/UPDATE/DELETE), module, entity_type, entity_id, previous_value (JSON), new_value (JSON), ip_address, user_agent, timestamp
- Immutable: audit logs cannot be edited or deleted (soft-delete disabled)
- Filterable: by user, action, module, date range
- Exportable: CSV export for compliance
- Retention: configurable (default 2 years)

## Module 15: Settings
- Company settings: name, logo, timezone, currency, fiscal year, work hours, week start
- User profile: name, avatar, phone, password change
- Role management: CRUD custom roles, assign permissions
- Permission management: view permission catalog, assign to roles
- Leave policy: accrual rules, carry-forward, sandwich rules, negative balance
- Attendance policy: grace period, half-day threshold, overtime threshold, work hours
- Payroll settings: salary components, tax rules, PF rates, payment schedule
- Notification settings: per-user toggle for each notification type
- AI settings: enable/disable AI features, select AI provider (OpenAI/Gemini), API key management

---

# § 8. MVP Scope (Interview Demonstrable)

## 8.1 MVP Module Matrix

| Module | MVP Features | Priority |
|---|---|---|
| **Authentication** | Login, register company, register user (invite), forgot/reset password, JWT + refresh tokens, RBAC middleware, protected routes | P0 — Critical |
| **Company Setup** | Company profile, departments, designations, holiday calendar | P0 — Critical |
| **Employee Management** | Full CRUD, profile with all tabs, search/filter/sort/pagination, bulk import CSV, status management | P0 — Critical |
| **Attendance** | Check-in/out, daily/monthly view, late mark, half day, regularization with approval, basic analytics | P0 — Critical |
| **Leave Management** | Leave types, balance, apply/approve/reject/cancel, leave calendar, policy config, multi-level approval | P0 — Critical |
| **Payroll (Basic)** | Salary structure, payroll run, payslip generation + PDF download, payroll history | P1 — High |
| **AI HR Assistant** | Chatbot interface, leave balance query, payslip explainer, attendance summary, JD generator, policy Q&A | P1 — High |
| **Dashboard** | Role-based dashboards (Admin, HR, Manager, Employee) with summary cards and charts | P0 — Critical |
| **Notifications** | In-app notifications for leave, attendance, payroll events | P1 — High |
| **Audit Logs** | Auto-logging of all CUD operations, filterable log viewer | P1 — High |
| **Settings** | Company settings, user profile, role/permission management | P1 — High |

## 8.2 MVP Acceptance Criteria

1. A new company can register and set up their organization (departments, designations, holidays)
2. HR can invite and onboard employees with complete profiles
3. Employees can check-in/out and view their attendance
4. Employees can apply for leave; managers can approve/reject
5. Payroll manager can run monthly payroll and generate payslips
6. Every user sees a role-appropriate dashboard
7. AI assistant can answer basic HR queries per user's role scope
8. All actions are audit-logged
9. The application is responsive, secure, and deployed via Docker

## 8.3 MVP Timeline: 9 Weeks

| Week | Focus |
|---|---|
| 1 | Project setup, architecture, database schema, Docker, CI/CD skeleton |
| 2 | Auth module (login, register, JWT, RBAC, protected routes) |
| 3 | Company setup + Employee management (CRUD, profile, search/filter) |
| 4 | Attendance module (check-in/out, regularization, approval) |
| 5 | Leave module (types, balance, apply/approve, calendar, policy) |
| 6 | Payroll module (structure, run, payslip generation, PDF) |
| 7 | AI assistant (chatbot, leave query, payslip explainer, JD generator) |
| 8 | Dashboard + Notifications + Audit Logs + Settings |
| 9 | Testing, bug fixes, polishing, deployment, documentation |

---

# § 9. Advanced Scope (Post-MVP)

| Module | Features | Priority | Estimated Effort |
|---|---|---|---|
| **Recruitment** | Job posting, candidate pipeline, interview scheduling, feedback, offer letter | P2 | 2 weeks |
| **AI Resume Parser** | Upload resume → extract structured data → auto-fill candidate profile | P2 | 1 week |
| **AI Candidate Matching** | Score candidates against job requirements, rank by fit % | P2 | 1 week |
| **Performance Management** | Goals, OKRs, self/manager/HR review, rating, performance cycles | P2 | 2 weeks |
| **Onboarding** | Checklist templates, task assignment, progress tracking | P3 | 1 week |
| **Document Management** | Centralized repository, expiry reminders, versioning, templates | P3 | 1 week |
| **Advanced Analytics** | Attrition prediction, department cost analysis, headcount forecasting | P3 | 1 week |
| **Branch Management** | Multi-branch support, branch-specific settings | P3 | 3 days |
| **Mobile App** | React Native companion app | P4 | 4 weeks |
| **SSO Integration** | Google, Microsoft, SAML | P4 | 1 week |

---

# § 10. User Stories

## 10.1 Authentication

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-A01 | As a **company owner**, I want to register my company on the platform, so that I can start managing HR operations digitally. | Company created with admin account; redirected to setup wizard; email verification sent. |
| US-A02 | As an **HR manager**, I want to invite new users by email, so that they can create accounts with assigned roles. | Invitation email sent with signup link; role pre-assigned; link expires in 48 hours. |
| US-A03 | As a **user**, I want to log in with email and password, so that I can access my role-specific dashboard. | JWT issued on success; refresh token stored in httpOnly cookie; redirected to dashboard. |
| US-A04 | As a **user**, I want to reset my forgotten password, so that I can regain access to my account. | Reset email sent within 30s; link expires in 1 hour; password updated on submission. |
| US-A05 | As a **system**, I want to lock accounts after 5 failed login attempts, so that brute-force attacks are prevented. | Account locked for 15 minutes; user notified via email; admin can manually unlock. |

## 10.2 Employee Management

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-E01 | As an **HR manager**, I want to add a new employee with complete profile details, so that the employee record is created in the system. | Multi-step form validates all fields; employee created with "active" status; audit log entry created. |
| US-E02 | As an **HR manager**, I want to search employees by name, ID, or department, so that I can quickly find employee records. | Results appear within 500ms; supports partial matching; results paginated. |
| US-E03 | As an **employee**, I want to view and update my own profile, so that my information stays current. | Employee can edit personal info and contact; cannot edit job info or salary; changes audit-logged. |
| US-E04 | As an **HR manager**, I want to deactivate an employee, so that terminated employees no longer have system access. | Status changed to "terminated"; user account disabled; all active sessions invalidated; records retained. |
| US-E05 | As an **HR manager**, I want to bulk import employees via CSV, so that initial data migration is efficient. | CSV template downloadable; validation errors reported per row; successful imports create employee records. |

## 10.3 Attendance

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-AT01 | As an **employee**, I want to check in when I start work, so that my attendance is recorded. | Single button click records timestamp; prevents duplicate check-in; shows confirmation. |
| US-AT02 | As an **employee**, I want to view my monthly attendance, so that I can track my work patterns. | Calendar view shows daily status (present/absent/leave/holiday); summary shows total present, absent, late, half-day, overtime hours. |
| US-AT03 | As an **employee**, I want to request attendance regularization, so that missed check-ins/outs are corrected. | Form captures date, type (missed check-in/out), reason; sent to manager for approval. |
| US-AT04 | As a **manager**, I want to approve/reject regularization requests, so that my team's attendance is accurate. | List shows pending requests with employee details; approve/reject with optional comment; employee notified. |
| US-AT05 | As an **HR manager**, I want to view attendance analytics, so that I can identify patterns and issues. | Charts show department-wise present %, late trends over time, top absentees, overtime distribution. |

## 10.4 Leave Management

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-L01 | As an **employee**, I want to check my leave balance, so that I know how many leaves are available. | Dashboard card shows balance per leave type; color-coded (green/yellow/red based on remaining). |
| US-L02 | As an **employee**, I want to apply for leave, so that I can take time off with proper approval. | Form with date picker, leave type, reason, half-day option; validates against balance; sends to manager. |
| US-L03 | As a **manager**, I want to approve/reject leave requests, so that team schedules are managed properly. | Pending requests list with employee name, dates, type, reason; approve/reject with comment; conflict check with team calendar. |
| US-L04 | As an **HR manager**, I want to configure leave policies, so that leave rules are enforced automatically. | Configure accrual rules, carry-forward limits, probation restrictions, sandwich rules per leave type. |
| US-L05 | As a **manager**, I want to view the team leave calendar, so that I can see who is off and plan accordingly. | Calendar shows team members' leave with color-coded types; filterable by member. |

## 10.5 Payroll

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-P01 | As a **payroll manager**, I want to configure salary structures, so that salary components are standardized. | Create template with earnings/deductions components; assign to employees; override individual values. |
| US-P02 | As a **payroll manager**, I want to run monthly payroll, so that salaries are calculated automatically. | Select month → system calculates for all active employees (factoring attendance, LOP, overtime) → review screen with totals. |
| US-P03 | As a **company admin**, I want to approve payroll before finalization, so that salary disbursement is authorized. | Review summary → approve → payslips generated → status changes to "approved". |
| US-P04 | As an **employee**, I want to download my payslip as PDF, so that I have a record of my salary. | PDF includes company header, employee details, month, earnings breakdown, deductions breakdown, net pay, YTD totals. |
| US-P05 | As an **HR manager**, I want to process salary revisions, so that employee compensation is updated with history. | Enter new CTC, effective date, reason; system recalculates components; previous structure archived. |

## 10.6 AI Assistant

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-AI01 | As an **employee**, I want to ask the AI "How many leaves do I have left?", so that I get an instant answer without contacting HR. | AI queries employee's leave balance; responds with breakdown per type; response within 3 seconds. |
| US-AI02 | As an **employee**, I want to ask the AI "Explain my last payslip", so that I understand my salary breakdown. | AI retrieves latest payslip; explains each component in plain language; highlights any deductions with reasons. |
| US-AI03 | As an **HR manager**, I want to ask the AI "Generate a job description for Senior React Developer", so that I can quickly create job postings. | AI generates professional JD with role summary, responsibilities, requirements, preferred skills, benefits; editable before saving. |
| US-AI04 | As an **HR manager**, I want the AI to parse uploaded resumes, so that candidate data is auto-extracted. | Upload PDF/DOCX → AI extracts name, email, phone, skills, experience, education → auto-fills candidate form; accuracy > 85%. |
| US-AI05 | As an **HR manager**, I want the AI to detect leave anomalies, so that policy abuse is identified early. | AI analyzes leave patterns → flags employees with unusual patterns (e.g., frequent Monday/Friday leaves); generates report with explanations. |

## 10.7 Recruitment

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-R01 | As a **recruiter**, I want to create a job posting, so that open positions are published. | Form with title, department, requirements; option for AI-generated description; publish to job board. |
| US-R02 | As a **recruiter**, I want to move candidates through pipeline stages, so that hiring progress is tracked. | Kanban drag-drop interface; stage changes logged; notifications sent to relevant stakeholders. |
| US-R03 | As an **interviewer**, I want to submit interview feedback, so that hiring decisions are informed. | Rating scale, text feedback, recommendation; visible to recruiter and HR; not visible to candidate. |
| US-R04 | As a **recruiter**, I want to generate offer letters, so that selected candidates receive formal offers. | Template-based generation with merge fields; preview before sending; track acceptance status. |

## 10.8 Performance

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-PF01 | As an **employee**, I want to set my goals for the performance cycle, so that my work is aligned with expectations. | Create goals with title, description, key results, target values; submit for manager review. |
| US-PF02 | As a **manager**, I want to review my team's performance, so that ratings are fair and documented. | View each employee's goals, self-assessment; provide ratings and written review; submit to HR. |
| US-PF03 | As an **HR manager**, I want to calibrate performance ratings across departments, so that ratings are consistent company-wide. | View department-wise rating distribution; adjust outliers; finalize cycle. |

## 10.9 Dashboard

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-D01 | As a **company admin**, I want to see a comprehensive dashboard, so that I have real-time organizational visibility. | Cards: total/active employees, new joiners, attrition, present today, pending leaves, payroll cost; charts: department distribution, attendance trends, leave trends. |
| US-D02 | As an **employee**, I want a personal dashboard, so that I can see my HR information at a glance. | Cards: attendance this month, leave balance, recent payslip, pending tasks; quick actions: check-in, apply leave, AI assistant. |
| US-D03 | As a **manager**, I want a team dashboard, so that I can manage my direct reports effectively. | Cards: team size, present today, pending approvals; lists: team leave calendar, pending requests, team performance snapshot. |
