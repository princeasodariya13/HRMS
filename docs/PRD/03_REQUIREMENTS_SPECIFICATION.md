# Part 3 — Requirements Specification

---

# § 11. Functional Requirements

## 11.1 Authentication & Authorization

| ID | Requirement | Details |
|---|---|---|
| FR-A01 | System shall support email/password authentication | bcrypt hashed (12 rounds), min 8 chars, 1 uppercase, 1 number, 1 special char |
| FR-A02 | System shall issue JWT access token on login | Payload: user_id, company_id, role, permissions. Expiry: 15 minutes. Algorithm: RS256 |
| FR-A03 | System shall issue refresh token on login | Stored in httpOnly secure cookie. Expiry: 7 days. Rotated on each use. Old token invalidated |
| FR-A04 | System shall support company self-registration | Captures: company_name, admin_name, admin_email, password. Creates company + admin user + default roles |
| FR-A05 | System shall support user invitation | HR/Admin enters email + role → system sends invite link → user sets password on first login |
| FR-A06 | System shall support forgot password flow | Email → validate → send reset link (expires 1hr) → new password → invalidate all sessions |
| FR-A07 | System shall verify email addresses | OTP (6-digit, expires 10min) or magic link sent on registration |
| FR-A08 | System shall enforce RBAC on every API | Middleware checks role + permissions before handler execution. 403 on unauthorized |
| FR-A09 | System shall lock accounts after failed attempts | 5 failures → 15 min lockout → email notification → admin manual unlock option |
| FR-A10 | System shall support logout | Blacklist refresh token in Redis; clear httpOnly cookie; frontend clears access token |

## 11.2 Employee Management

| ID | Requirement | Details |
|---|---|---|
| FR-E01 | System shall support multi-step employee creation | Steps: Personal → Job → Contact → Bank → Documents. Partial save supported (draft status) |
| FR-E02 | System shall auto-generate employee IDs | Format configurable: e.g., `{COMPANY_CODE}-{DEPT_CODE}-{SEQ}` → "TNS-ENG-0042" |
| FR-E03 | System shall encrypt sensitive employee fields | Bank account number, Aadhaar/SSN, PAN encrypted with AES-256 at rest |
| FR-E04 | System shall support employee status transitions | Valid transitions: active↔inactive, active→probation→active, active→notice_period→terminated |
| FR-E05 | System shall maintain employee timeline | Auto-log: status changes, department transfers, designation changes, salary revisions, manager changes |
| FR-E06 | System shall support advanced search | Full-text search via PostgreSQL tsvector on name, email, employee_id; response < 500ms |
| FR-E07 | System shall support CSV bulk import | Upload → validate → preview errors → confirm → create records. Max 1000 rows per upload |
| FR-E08 | System shall enforce field-level permissions | Employees can edit: personal info, contact, emergency contact. Cannot edit: job info, salary, status |

## 11.3 Attendance Management

| ID | Requirement | Details |
|---|---|---|
| FR-AT01 | System shall record check-in with metadata | Timestamp (server-side), IP address, user_agent, optional GPS coordinates |
| FR-AT02 | System shall prevent duplicate check-in | One check-in per day per employee. If already checked in, show check-out button |
| FR-AT03 | System shall auto-calculate work hours | check-out_time - check_in_time. Null if no check-out (flagged as incomplete) |
| FR-AT04 | System shall auto-flag late arrivals | If check-in_time > (shift_start + grace_period), mark is_late = true |
| FR-AT05 | System shall auto-flag half days | If work_hours < half_day_threshold (configurable, default 4hrs), mark is_half_day = true |
| FR-AT06 | System shall calculate overtime | If work_hours > standard_hours (configurable, default 8hrs), overtime = work_hours - standard_hours |
| FR-AT07 | System shall support regularization workflow | Employee creates request → manager approves/rejects → if approved, attendance record updated |
| FR-AT08 | System shall sync with leave module | Approved leave dates auto-marked as "on_leave" in attendance. No check-in required |

## 11.4 Leave Management

| ID | Requirement | Details |
|---|---|---|
| FR-L01 | System shall support configurable leave types | Admin creates leave types with: name, code, is_paid, max_per_year, accrual_type (annual/monthly/quarterly) |
| FR-L02 | System shall auto-allocate leave balances | On employee creation: allocate pro-rated balance. On fiscal year start: reset per accrual rules |
| FR-L03 | System shall validate leave applications | Check: sufficient balance, no overlap with existing approved leave, not on holiday, within policy constraints |
| FR-L04 | System shall support sandwich rule | If leave taken on Mon & Wed, Tuesday (working day between) auto-counted as leave (configurable) |
| FR-L05 | System shall support multi-level approval | Configurable chain: L1 (manager) → L2 (department_head) → L3 (HR). Each level can approve/reject |
| FR-L06 | System shall handle leave cancellation | Pending: direct cancel. Approved: requires manager re-approval. Past: HR override only |
| FR-L07 | System shall exclude holidays from leave count | Public holidays and weekends within leave date range not deducted from balance |
| FR-L08 | System shall support carry-forward | On fiscal year end: carry forward up to max_carry_forward days; excess forfeited or encashed |

## 11.5 Payroll Management

| ID | Requirement | Details |
|---|---|---|
| FR-P01 | System shall support configurable salary components | Earnings: basic (% of CTC), HRA (% of basic), DA, special_allowance, etc. Deductions: PF, ESI, PT, TDS |
| FR-P02 | System shall calculate payroll for all active employees | Payroll run: fetch attendance → calculate LOP → calculate earnings → calculate deductions → net_pay |
| FR-P03 | System shall support LOP deduction | LOP_amount = (monthly_gross / total_working_days) × absent_days_without_leave |
| FR-P04 | System shall generate payslips | Per employee: company info, employee info, month, earnings breakdown, deductions breakdown, net_pay |
| FR-P05 | System shall generate payslip PDFs | Using Puppeteer/PDFKit: professional template, company branding, downloadable by employee |
| FR-P06 | System shall support payroll approval | Draft → Pending Approval → Approved → Paid. Only admin can approve. Once approved, immutable |
| FR-P07 | System shall track salary revisions | Revision: effective_date, old_ctc, new_ctc, old_components, new_components, reason, approved_by |
| FR-P08 | System shall process reimbursements | Employee submits (amount, type, receipt) → Manager approves → Added to next payroll cycle |

## 11.6 AI Module

| ID | Requirement | Details |
|---|---|---|
| FR-AI01 | System shall provide conversational AI interface | Chat UI with message history, typing indicator, markdown rendering |
| FR-AI02 | System shall scope AI responses to user's role | Employee: own data. Manager: team data. HR: company data. Enforced at API level before AI call |
| FR-AI03 | System shall store all AI conversations | Database table: user_id, session_id, role, prompt, response, tokens_used, timestamp |
| FR-AI04 | System shall not send raw sensitive data to AI | Anonymize/aggregate data before sending. Never send: bank details, Aadhaar, passwords |
| FR-AI05 | System shall add AI disclaimers | Every AI response prefixed with: "AI-generated suggestion. Final decisions should be made by authorized personnel." |
| FR-AI06 | System shall support AI resume parsing | Input: PDF/DOCX file. Output: structured JSON {name, email, phone, skills[], experience[], education[]} |
| FR-AI07 | System shall support AI candidate matching | Input: job requirements + candidate profile. Output: match_score (0-100), matched_skills, gaps |

---

# § 12. Non-Functional Requirements

## 12.1 Performance

| Metric | Target | Measurement |
|---|---|---|
| API response time (p50) | < 100ms | Application Performance Monitoring (APM) |
| API response time (p95) | < 300ms | APM |
| API response time (p99) | < 1000ms | APM |
| Dashboard initial load | < 3 seconds | Lighthouse / Web Vitals |
| Subsequent page navigation | < 500ms | Client-side measurement |
| Database query time | < 50ms for indexed queries | Query logging |
| AI response time | < 5 seconds | API response measurement |
| PDF generation time | < 3 seconds per payslip | Server-side measurement |
| Bulk import (1000 records) | < 30 seconds | Background job monitoring |
| Concurrent users supported | 10,000 | Load testing (k6/Artillery) |

## 12.2 Scalability

- **Horizontal scaling:** Stateless API servers behind load balancer; no server-side sessions
- **Database scaling:** Connection pooling (PgBouncer), read replicas for analytics queries
- **Caching:** Redis for frequently accessed data (dashboard counts, leave balances, permissions)
- **Background jobs:** BullMQ for payroll runs, bulk imports, PDF generation, email sending
- **File storage:** S3/Cloudinary — infinitely scalable object storage
- **Database indexing:** Composite indexes on (company_id, status), (company_id, department_id), (employee_id, date)

## 12.3 Security

| Control | Implementation |
|---|---|
| Authentication | JWT (RS256) + refresh token rotation |
| Authorization | RBAC middleware + permission checks + data scope validation |
| Password storage | bcrypt with 12 salt rounds |
| Data encryption at rest | AES-256 for sensitive fields (bank details, government IDs) |
| Data encryption in transit | TLS 1.3 (HTTPS enforced) |
| Input validation | Zod schemas on frontend; class-validator/Zod on backend; Prisma parameterized queries |
| Rate limiting | express-rate-limit: 100 requests/min general, 5/min login, 3/min password reset |
| Security headers | Helmet.js: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy |
| CORS | Whitelist specific origins; no wildcard in production |
| File upload | Type validation (magic bytes, not just extension), size limit (10MB), virus scan placeholder |
| XSS protection | React auto-escaping, DOMPurify for user-generated content, CSP headers |
| CSRF protection | SameSite cookies + CSRF token for state-changing requests |
| SQL injection | Prisma ORM parameterized queries (no raw SQL without parameterization) |
| Audit logging | Immutable logs for all CUD operations with user, IP, timestamp |
| Soft delete | Critical entities (employees, companies, payroll) use is_deleted flag; never hard-deleted |
| Secret management | Environment variables via .env (dev), cloud secret manager (prod); never committed to git |

## 12.4 Usability

- **Responsive design:** All pages functional on 320px (mobile) to 2560px (4K) screens
- **Accessibility:** WCAG 2.1 AA compliance; ARIA labels, keyboard navigation, color contrast ratios
- **Loading states:** Skeleton loaders for data fetching; spinners for actions; progress bars for uploads
- **Error states:** Meaningful error messages; retry buttons; never show raw error traces
- **Empty states:** Illustrated empty states with call-to-action for every list/table
- **Internationalization:** Architecture supports i18n (English default; locale files for future languages)
- **Browser support:** Chrome 90+, Firefox 90+, Safari 14+, Edge 90+

## 12.5 Reliability

- **Error recovery:** API errors return structured JSON with error_code, message, timestamp; never crash
- **Data consistency:** Database transactions for multi-table operations (payroll run, employee creation)
- **Backup:** Automated daily database backups with 30-day retention
- **Health checks:** `/health` endpoint returning database/Redis/S3 connectivity status
- **Graceful shutdown:** On SIGTERM: stop accepting requests, complete in-flight requests, close connections

## 12.6 Maintainability

- **Code style:** ESLint + Prettier enforced via pre-commit hooks (Husky + lint-staged)
- **Type safety:** Strict TypeScript (`strict: true`) across frontend and backend
- **Documentation:** JSDoc for complex functions; README per module; Swagger for APIs
- **Modularity:** Each module self-contained with its own routes, controllers, services, DTOs, tests
- **Dependency management:** Renovate/Dependabot for automated dependency updates; lockfile committed

## 12.7 Compliance

- **Data privacy:** GDPR-ready data export/deletion capabilities per employee
- **Audit trail:** Complete audit log for all data modifications (who, what, when, from where)
- **Data retention:** Configurable retention policies; automated archival of old records
- **Access control:** Principle of least privilege enforced through RBAC + PBAC

---

# § 13. AI Requirements

## 13.1 AI HR Chatbot

| Attribute | Detail |
|---|---|
| **Input** | Natural language text query from user (max 500 chars) |
| **Processing** | 1. Classify intent (leave_query, payslip_query, attendance_query, policy_query, jd_generation, general_hr). 2. Fetch relevant data from DB scoped to user's role. 3. Construct prompt with system instructions + user context + query. 4. Send to OpenAI/Gemini API. 5. Parse response. 6. Store conversation |
| **Output** | Natural language response with structured data where applicable (tables, lists) |
| **Access Control** | Employee: own data only. Manager: team aggregate data. HR/Admin: company-wide data |
| **Safety Rule** | Response always includes disclaimer: "This is an AI-generated suggestion." Never includes bank details, passwords, or government IDs in responses |
| **Example Prompt** | Employee: "How many casual leaves do I have left this year?" |
| **Example Response** | "You have **5 casual leaves** remaining out of 12 allocated for FY 2026-27. You've used 7 casual leaves so far. *This is an AI-generated suggestion. Please verify with HR for official records.*" |

## 13.2 AI Resume Parser

| Attribute | Detail |
|---|---|
| **Input** | PDF or DOCX file (max 5MB) |
| **Processing** | 1. Extract text from document (pdf-parse / mammoth). 2. Send extracted text to AI with structured extraction prompt. 3. AI returns JSON with extracted fields. 4. Validate and map to candidate schema |
| **Output** | Structured JSON: `{name, email, phone, skills: [], experience: [{company, title, duration, description}], education: [{institution, degree, year}], summary}` |
| **Access Control** | Recruiter, HR Manager, Company Admin only |
| **Safety Rule** | Extracted data presented for human review before saving. Never auto-create candidate without confirmation |
| **Example Prompt** | System: "Extract structured candidate information from the following resume text..." |
| **Example Response** | `{"name": "Ananya Singh", "email": "ananya@email.com", "skills": ["React", "TypeScript", "Node.js"], "experience": [{"company": "TechCorp", "title": "Frontend Developer", "duration": "2 years"}]}` |

## 13.3 AI Candidate-Job Matching

| Attribute | Detail |
|---|---|
| **Input** | Job requirements (skills, experience, education) + Candidate profile (skills, experience, education) |
| **Processing** | 1. Create comparison prompt with job requirements and candidate profile. 2. AI analyzes skill overlap, experience relevance, education fit. 3. Returns structured match assessment |
| **Output** | `{match_score: 0-100, matched_skills: [], missing_skills: [], experience_fit: "strong/moderate/weak", summary: "..."}` |
| **Access Control** | Recruiter, HR Manager only |
| **Safety Rule** | Score is advisory only. Never auto-reject candidates based on AI score. Bias warning displayed |
| **Example Prompt** | "Compare this candidate's profile against the Senior React Developer job requirements..." |
| **Example Response** | "Match Score: **78/100**. ✅ Matched: React, TypeScript, Node.js. ❌ Missing: GraphQL, AWS. Experience fit: Strong (4 years relevant). *AI assessment — review with hiring team before decisions.*" |

## 13.4 AI Performance Review Generator

| Attribute | Detail |
|---|---|
| **Input** | Employee goals (title, target, achievement %), self-review text, manager ratings |
| **Processing** | Synthesize structured performance data into narrative review paragraph |
| **Output** | Professional performance review text (200-400 words) covering achievements, areas of strength, development areas, recommendations |
| **Access Control** | Manager (for their team), HR Manager (for all employees) |
| **Safety Rule** | Generated text is a draft — manager must review, edit, and explicitly approve before it becomes official |
| **Example Prompt** | "Generate a performance summary for an employee who achieved 4/5 goals, received 4.2/5 rating..." |
| **Example Response** | "Ananya has demonstrated exceptional performance this cycle, achieving 80% of her key objectives including the successful delivery of the customer portal redesign ahead of schedule..." |

## 13.5 AI Policy Q&A

| Attribute | Detail |
|---|---|
| **Input** | User question about company policy + relevant policy document content |
| **Processing** | 1. Retrieve relevant policy documents for the company. 2. Use RAG (Retrieval Augmented Generation) to find relevant sections. 3. Generate answer grounded in policy text |
| **Output** | Answer with policy reference (document name, section) |
| **Access Control** | All employees can query policies marked as "company-wide". Confidential policies restricted by role |
| **Safety Rule** | AI must cite the source policy document. If no relevant policy found, respond: "I couldn't find a specific policy for this. Please contact HR." |

## 13.6 AI Leave Anomaly Detector

| Attribute | Detail |
|---|---|
| **Input** | Leave history data for all employees (past 6-12 months), aggregated by patterns |
| **Processing** | Analyze patterns: frequent Monday/Friday leaves, leaves before/after holidays, sudden spike in sick leaves, unusual patterns compared to department average |
| **Output** | Anomaly report: list of flagged employees with pattern description and severity (low/medium/high) |
| **Access Control** | HR Manager and Company Admin only. Never visible to employees or managers |
| **Safety Rule** | Report is informational only. No automated actions. HR must investigate manually. Report includes: "Patterns may have legitimate explanations. Investigate sensitively." |

## 13.7 AI Payslip Explainer

| Attribute | Detail |
|---|---|
| **Input** | Employee's payslip data (earnings, deductions, net pay) |
| **Processing** | Translate financial data into plain-language explanation |
| **Output** | Conversational explanation of each payslip component |
| **Access Control** | Employee: own payslip only. HR/Payroll Manager: any employee's payslip |
| **Safety Rule** | Never display raw bank account numbers. Show only last 4 digits if referenced |

## 13.8 AI HR Analytics Summary

| Attribute | Detail |
|---|---|
| **Input** | Aggregated company metrics (headcount, attrition, attendance %, leave utilization, payroll costs) |
| **Processing** | Generate executive summary with trends, highlights, concerns, and recommendations |
| **Output** | 3-5 paragraph summary with bullet-point insights |
| **Access Control** | Company Admin and HR Manager only |
| **Safety Rule** | Uses aggregated data only — no individual employee data sent to AI. Summary includes data period and disclaimer |

## 13.9 AI Safety Architecture

```
User Query
    │
    ▼
[Role Check] ── Unauthorized → 403 Response
    │
    ▼
[Data Scope Filter] ── Fetch only user-scoped data from DB
    │
    ▼
[PII Sanitizer] ── Remove/mask sensitive fields (bank, govt IDs, passwords)
    │
    ▼
[Prompt Constructor] ── System prompt + context + user query
    │
    ▼
[AI Provider API] ── OpenAI / Gemini
    │
    ▼
[Response Validator] ── Check for PII leakage, add disclaimer
    │
    ▼
[Conversation Logger] ── Store in ai_conversations table
    │
    ▼
[Response to User]
```
