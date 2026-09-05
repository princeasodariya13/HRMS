# Part 4A — System Architecture (§14)

## 14.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  Next.js 14 (App Router) + TypeScript + Tailwind + shadcn   │
│  TanStack Query │ React Hook Form │ Zod │ Framer Motion     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (TLS 1.3)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY / LB                        │
│              Nginx / AWS ALB / Vercel Edge                  │
│         Rate Limiting │ CORS │ SSL Termination              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│           NestJS / Express.js + TypeScript                  │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Auth Module│ │Employee  │ │Attendance│ │Leave Module  │  │
│  │JWT+RBAC   │ │Module    │ │Module    │ │              │  │
│  └───────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Payroll   │ │Recruit   │ │Perform   │ │AI Module     │  │
│  │Module    │ │Module    │ │Module    │ │OpenAI/Gemini │  │
│  └───────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐                   │
│  │Document  │ │Notif     │ │Audit Log │                   │
│  │Module    │ │Module    │ │Module    │                   │
│  └───────────┘ └──────────┘ └──────────┘                   │
└────┬──────────────┬──────────────┬──────────────────────────┘
     │              │              │
     ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│PostgreSQL│  │  Redis   │  │ S3/Cloudinary│
│ (Prisma) │  │Cache+Bull│  │ File Storage │
└──────────┘  └──────────┘  └──────────────┘
```

## 14.2 Frontend Architecture

**Framework:** Next.js 14 with App Router
**Language:** TypeScript (strict mode)
**State Management:** TanStack Query for server state; React Context for auth/theme
**Styling:** Tailwind CSS + shadcn/ui component library
**Forms:** React Hook Form + Zod validation schemas
**Animations:** Framer Motion for page transitions, micro-interactions
**HTTP Client:** Axios with interceptors for token refresh
**Routing:** Next.js App Router with middleware for auth guards

### Frontend Patterns
- **Feature-based folder structure** — each module has its own folder with components, hooks, types, services
- **Custom hooks** — `useAuth`, `useEmployee`, `useAttendance`, `useLeave`, `usePayroll`, `useAI`
- **API service layer** — centralized API functions per module with TypeScript types
- **Error boundaries** — React error boundaries per route segment
- **Optimistic updates** — TanStack Query mutations with optimistic UI for better UX
- **Code splitting** — dynamic imports for heavy components (charts, PDF viewer, rich text editor)

## 14.3 Backend Architecture

**Framework:** NestJS (preferred) or Express.js with modular architecture
**Language:** TypeScript (strict mode)
**ORM:** Prisma with PostgreSQL
**Auth:** Passport.js with JWT strategy
**Validation:** class-validator + class-transformer (NestJS) or Zod (Express)
**Documentation:** Swagger/OpenAPI auto-generated from decorators

### Backend Patterns
- **Modular monolith** — each module is a NestJS module (self-contained, independently testable)
- **Controller → Service → Repository** pattern
- **DTOs** — Data Transfer Objects for request/response validation
- **Guards** — Auth guard (JWT validation), Role guard (RBAC check), Permission guard (PBAC check)
- **Interceptors** — Response transformation, logging, audit trail
- **Exception filters** — Global error handling with structured error responses
- **Middleware** — Rate limiting, CORS, Helmet, request logging, tenant isolation

### Request Flow
```
Request → Middleware (rate limit, CORS, Helmet)
       → Auth Guard (JWT validation)
       → Role Guard (RBAC check)
       → Permission Guard (PBAC check)
       → Validation Pipe (DTO validation)
       → Controller (route handler)
       → Service (business logic)
       → Prisma (database query)
       → Interceptor (response transform, audit log)
       → Response
```

## 14.4 Database Architecture

**Engine:** PostgreSQL 15+
**ORM:** Prisma
**Multi-tenancy:** Shared database, shared schema, `company_id` discriminator on all tenant-scoped tables
**Migrations:** Prisma Migrate for schema versioning
**Connection pooling:** PgBouncer or Prisma connection pool (pool_size configurable)

### Indexing Strategy
- All `company_id` columns indexed (tenant isolation queries)
- Composite indexes: `(company_id, status)`, `(company_id, department_id)`, `(employee_id, date)`
- Full-text search index on `employees(first_name, last_name, email, employee_code)`
- Unique constraints: `(company_id, employee_code)`, `(email)`, `(company_id, department_code)`

## 14.5 AI Architecture

```
User Query → Backend API → AI Service
                              │
                    ┌─────────┴──────────┐
                    │                    │
              [Data Fetcher]      [PII Sanitizer]
              Fetch scoped data   Remove sensitive fields
                    │                    │
                    └─────────┬──────────┘
                              │
                    [Prompt Constructor]
                    System prompt + context + query
                              │
                    [AI Provider Adapter]
                    OpenAI / Gemini (switchable)
                              │
                    [Response Processor]
                    Validate + add disclaimer
                              │
                    [Conversation Logger]
                    Store in DB
                              │
                        Response to User
```

**AI Provider Abstraction:** Interface `AIProvider` with methods `chat()`, `parseResume()`, `matchCandidate()`. Implementations: `OpenAIProvider`, `GeminiProvider`. Switchable via environment variable.

## 14.6 Caching Architecture (Redis)

| Cache Key Pattern | TTL | Purpose |
|---|---|---|
| `auth:blacklist:{token}` | 7 days | Blacklisted refresh tokens |
| `user:permissions:{user_id}` | 15 min | User's resolved permissions |
| `dashboard:{company_id}:{role}` | 5 min | Dashboard aggregate counts |
| `leave:balance:{employee_id}` | 10 min | Leave balance (invalidated on change) |
| `attendance:today:{company_id}` | 2 min | Today's attendance summary |
| `company:settings:{company_id}` | 30 min | Company settings |
| `rate_limit:{ip}:{endpoint}` | 1 min | Rate limiting counters |

## 14.7 Background Jobs (BullMQ)

| Queue | Jobs | Priority |
|---|---|---|
| `email` | Send verification email, password reset, leave notification, payroll notification | High |
| `payroll` | Run payroll calculation, generate payslips, generate PDFs | Medium |
| `import` | Bulk employee CSV import, data validation | Medium |
| `ai` | Resume parsing, candidate matching, analytics summary | Low |
| `cleanup` | Session cleanup, temp file deletion, audit log archival | Low |
| `notifications` | In-app notification creation, push notifications | High |

## 14.8 Deployment Architecture

```
┌─────────────────────────────────────────┐
│              GitHub Repository          │
│         Push to main / PR merge         │
└──────────────────┬──────────────────────┘
                   │ GitHub Actions CI/CD
                   ▼
┌──────────────────────────────────────────┐
│  Build Stage: Lint → Test → Build → Push │
│  Docker images to Container Registry     │
└──────────────────┬───────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ Frontend     │    │ Backend          │
│ Vercel /     │    │ AWS ECS / Railway│
│ Netlify      │    │ / Render         │
└──────────────┘    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │PostgreSQL│  │  Redis   │  │S3/Cloudin│
        │ Supabase │  │ Upstash  │  │ary       │
        │ /Neon    │  │ /Railway │  │          │
        └──────────┘  └──────────┘  └──────────┘
```
