# Part 4B — API Requirements (§15)

## 15.1 API Design Standards

- **Base URL:** `/api/v1`
- **Format:** JSON request/response
- **Auth:** Bearer token in Authorization header
- **Pagination:** `?page=1&limit=20` (cursor-based for large sets)
- **Filtering:** `?status=active&department_id=uuid`
- **Sorting:** `?sort_by=created_at&sort_order=desc`
- **Search:** `?search=john`
- **Error format:** `{ "success": false, "error": { "code": "ERR_CODE", "message": "...", "details": [] } }`
- **Success format:** `{ "success": true, "data": {...}, "meta": { "page": 1, "total": 100 } }`

---

## 15.2 Auth APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/auth/register-company` | Register new company + admin | Public | `{company_name, admin_name, email, password}` | `{company, user, tokens}` |
| POST | `/auth/login` | User login | Public | `{email, password}` | `{user, access_token, refresh_token (cookie)}` |
| POST | `/auth/refresh` | Refresh access token | Authenticated | Cookie: refresh_token | `{access_token}` |
| POST | `/auth/logout` | Logout user | Authenticated | — | `{message}` |
| POST | `/auth/forgot-password` | Send reset email | Public | `{email}` | `{message}` |
| POST | `/auth/reset-password` | Reset password | Public (with token) | `{token, new_password}` | `{message}` |
| POST | `/auth/verify-email` | Verify email OTP | Public (with token) | `{token, otp}` | `{message}` |
| POST | `/auth/invite-user` | Invite user by email | HR, Admin | `{email, role_id, department_id}` | `{invitation}` |

## 15.3 Employee APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/employees` | List employees (paginated) | HR, Admin, Manager(team) | Query params | `{employees[], meta}` |
| GET | `/employees/:id` | Get employee detail | HR, Admin, Manager(team), Self | — | `{employee}` |
| POST | `/employees` | Create employee | HR, Admin | `{personal, job, contact, bank}` | `{employee}` |
| PATCH | `/employees/:id` | Update employee | HR, Admin, Self(limited) | `{fields to update}` | `{employee}` |
| DELETE | `/employees/:id` | Deactivate employee | HR, Admin | — | `{message}` |
| POST | `/employees/bulk-import` | Import from CSV | HR, Admin | `multipart/form-data: csv` | `{imported, errors[]}` |
| GET | `/employees/export` | Export to CSV | HR, Admin | Query params (filters) | CSV file download |
| GET | `/employees/:id/timeline` | Employee timeline | HR, Admin, Self | — | `{events[]}` |
| POST | `/employees/:id/documents` | Upload document | HR, Admin, Self | `multipart/form-data` | `{document}` |
| GET | `/employees/:id/documents` | List documents | HR, Admin, Self | — | `{documents[]}` |

## 15.4 Attendance APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/attendance/check-in` | Record check-in | All employees | `{optional: location}` | `{attendance}` |
| POST | `/attendance/check-out` | Record check-out | All employees | — | `{attendance}` |
| GET | `/attendance/my` | My attendance (monthly) | All employees | `?month=2026-07` | `{records[], summary}` |
| GET | `/attendance` | All attendance | HR, Admin | `?date=2026-07-01&dept_id=` | `{records[], summary}` |
| GET | `/attendance/team` | Team attendance | Manager | `?month=2026-07` | `{records[], summary}` |
| POST | `/attendance/regularize` | Request regularization | All employees | `{date, type, reason}` | `{request}` |
| GET | `/attendance/regularizations` | Pending regularizations | Manager, HR | `?status=pending` | `{requests[]}` |
| PATCH | `/attendance/regularizations/:id` | Approve/reject | Manager, HR | `{status, comment}` | `{request}` |
| GET | `/attendance/analytics` | Attendance analytics | HR, Admin | `?period=monthly` | `{charts_data}` |

## 15.5 Leave APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/leave/types` | List leave types | All | — | `{leave_types[]}` |
| POST | `/leave/types` | Create leave type | HR, Admin | `{name, code, is_paid, max_per_year, accrual}` | `{leave_type}` |
| GET | `/leave/balance` | My leave balance | All employees | — | `{balances[]}` |
| GET | `/leave/balance/:employee_id` | Employee balance | HR, Manager(team) | — | `{balances[]}` |
| POST | `/leave/apply` | Apply for leave | All employees | `{type_id, from, to, reason, is_half_day}` | `{request}` |
| GET | `/leave/requests` | My leave requests | All employees | `?status=&year=` | `{requests[]}` |
| GET | `/leave/pending` | Pending approvals | Manager, HR | — | `{requests[]}` |
| PATCH | `/leave/requests/:id/approve` | Approve leave | Manager, HR | `{comment}` | `{request}` |
| PATCH | `/leave/requests/:id/reject` | Reject leave | Manager, HR | `{comment}` | `{request}` |
| PATCH | `/leave/requests/:id/cancel` | Cancel leave | Requester, HR | — | `{request}` |
| GET | `/leave/calendar` | Team leave calendar | Manager, HR | `?month=2026-07` | `{calendar_data}` |
| GET | `/leave/policies` | Leave policies | HR, Admin | — | `{policies[]}` |
| PUT | `/leave/policies` | Update policies | HR, Admin | `{policy_config}` | `{policies}` |

## 15.6 Payroll APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/payroll/structures` | List salary structures | HR, Payroll, Admin | — | `{structures[]}` |
| POST | `/payroll/structures` | Create structure | HR, Payroll, Admin | `{name, components[]}` | `{structure}` |
| POST | `/payroll/structures/assign` | Assign to employee | HR, Payroll | `{employee_id, structure_id, overrides}` | `{assignment}` |
| POST | `/payroll/run` | Run monthly payroll | Payroll, Admin | `{month, year}` | `{payroll_run}` (background job) |
| GET | `/payroll/runs` | List payroll runs | HR, Payroll, Admin | `?year=2026` | `{runs[]}` |
| GET | `/payroll/runs/:id` | Payroll run detail | HR, Payroll, Admin | — | `{run, payslips[]}` |
| PATCH | `/payroll/runs/:id/approve` | Approve payroll | Admin | — | `{run}` |
| GET | `/payroll/payslips/my` | My payslips | All employees | `?year=2026` | `{payslips[]}` |
| GET | `/payroll/payslips/:id/download` | Download PDF | Employee(own), HR, Payroll | — | PDF file |
| POST | `/payroll/revisions` | Salary revision | HR, Admin | `{employee_id, new_ctc, effective_date, reason}` | `{revision}` |
| POST | `/payroll/reimbursements` | Submit reimbursement | All employees | `{amount, type, receipt}` | `{reimbursement}` |

## 15.7 Recruitment APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/jobs` | List jobs | Recruiter, HR, Admin | `?status=open` | `{jobs[]}` |
| POST | `/jobs` | Create job | Recruiter, HR | `{title, dept, description, requirements}` | `{job}` |
| PATCH | `/jobs/:id` | Update job | Recruiter, HR | `{fields}` | `{job}` |
| GET | `/candidates` | List candidates | Recruiter, HR | `?job_id=&status=` | `{candidates[]}` |
| POST | `/candidates` | Add candidate | Recruiter, HR | `{name, email, phone, job_id, resume}` | `{candidate}` |
| PATCH | `/candidates/:id/stage` | Move pipeline stage | Recruiter, HR | `{stage}` | `{candidate}` |
| POST | `/interviews` | Schedule interview | Recruiter, HR | `{candidate_id, date, interviewer_ids, round}` | `{interview}` |
| POST | `/interviews/:id/feedback` | Submit feedback | Interviewer | `{rating, feedback, recommendation}` | `{feedback}` |
| POST | `/candidates/:id/offer` | Generate offer | Recruiter, HR | `{ctc, join_date, designation}` | `{offer_letter}` |

## 15.8 Performance APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/performance/cycles` | List cycles | HR, Admin | — | `{cycles[]}` |
| POST | `/performance/cycles` | Create cycle | HR, Admin | `{name, start, end, departments[]}` | `{cycle}` |
| GET | `/goals` | My goals | All employees | `?cycle_id=` | `{goals[]}` |
| POST | `/goals` | Create goal | All employees | `{title, description, key_results[], weight}` | `{goal}` |
| PATCH | `/goals/:id` | Update goal progress | All employees(own), Manager(team) | `{current_value, status}` | `{goal}` |
| POST | `/reviews` | Submit review | All employees, Manager | `{employee_id, cycle_id, type, ratings, text}` | `{review}` |
| GET | `/reviews` | Get reviews | HR, Manager(team), Self | `?cycle_id=&employee_id=` | `{reviews[]}` |

## 15.9 Document APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/documents/upload` | Upload document | All (scoped) | `multipart/form-data` | `{document}` |
| GET | `/documents` | List documents | All (scoped) | `?category=&employee_id=` | `{documents[]}` |
| GET | `/documents/:id/download` | Download document | All (scoped) | — | File download |
| DELETE | `/documents/:id` | Delete document | HR, Admin | — | `{message}` |
| GET | `/policies` | List company policies | All employees | — | `{policies[]}` |
| POST | `/policies` | Upload policy | HR, Admin | `multipart/form-data` | `{policy}` |

## 15.10 AI APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/ai/chat` | Chat with AI assistant | All (scoped) | `{message, session_id?}` | `{response, session_id}` |
| GET | `/ai/conversations` | My AI conversations | All (own) | `?limit=20` | `{conversations[]}` |
| POST | `/ai/parse-resume` | Parse resume | Recruiter, HR | `multipart/form-data: file` | `{parsed_data}` |
| POST | `/ai/match-candidate` | Match candidate to job | Recruiter, HR | `{candidate_id, job_id}` | `{match_result}` |
| POST | `/ai/generate-jd` | Generate job description | Recruiter, HR | `{title, department, level}` | `{description}` |
| POST | `/ai/performance-summary` | Generate review summary | Manager, HR | `{employee_id, cycle_id}` | `{summary}` |
| GET | `/ai/leave-anomalies` | Detect leave anomalies | HR, Admin | `?period=6months` | `{anomalies[]}` |
| GET | `/ai/hr-insights` | HR analytics summary | HR, Admin | `?period=monthly` | `{insights}` |

## 15.11 Dashboard APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/dashboard/admin` | Admin dashboard data | Admin | — | `{stats, charts}` |
| GET | `/dashboard/hr` | HR dashboard data | HR | — | `{stats, pending_items}` |
| GET | `/dashboard/manager` | Manager dashboard | Manager | — | `{team_stats}` |
| GET | `/dashboard/employee` | Employee dashboard | Employee | — | `{my_stats}` |

## 15.12 Notification & Audit APIs

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/notifications` | My notifications | All | `?is_read=false` | `{notifications[], unread_count}` |
| PATCH | `/notifications/:id/read` | Mark as read | All (own) | — | `{notification}` |
| PATCH | `/notifications/read-all` | Mark all read | All (own) | — | `{message}` |
| GET | `/notifications/preferences` | Get preferences | All (own) | — | `{preferences}` |
| PUT | `/notifications/preferences` | Update preferences | All (own) | `{preferences}` | `{preferences}` |
| GET | `/audit-logs` | List audit logs | Admin, HR(read) | `?user_id=&module=&action=&from=&to=` | `{logs[], meta}` |
| GET | `/audit-logs/export` | Export audit logs | Admin | `?from=&to=` | CSV file |
