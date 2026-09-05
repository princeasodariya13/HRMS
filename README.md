# NexaHR AI - Enterprise Human Resource Management System

NexaHR AI is a comprehensive, modern, and AI-powered Enterprise Human Resource Management System (HRMS) built with Next.js, Prisma, and MongoDB. It aims to streamline HR operations, payroll processing, leave management, employee onboarding, recruitment, and more with an intelligent AI assistant layer.

## 🚀 Features

*   **Multi-Tenant Architecture**: Robust company and tenant management supporting different subscription tiers.
*   **Role-Based Access Control (RBAC)**: Fine-grained access control with specialized dashboards for Admin, HR, Manager, and Employee roles.
*   **AI-Powered Recruitment**: Resume parsing, candidate matching, and automated job applicant scoring using Google Gemini AI.
*   **Employee Management**: Complete employee lifecycle management, document verification, and performance goals.
*   **Leave & Attendance**: Configurable leave policies, leave application workflows, and daily attendance tracking.
*   **Payroll Processing**: Dynamic salary calculations, basic pay, allowances, deductions, and automatic payslip generation.
*   **Secure Authentication**: NextAuth integration for Google OAuth and Credentials-based login with Edge rate-limiting via Upstash Redis.
*   **Billing & Subscriptions**: Stripe integration for Growth and Enterprise subscription tiers.
*   **Real-time Notifications & Audit Logs**: Full traceability of actions and real-time alerts for leave approvals and payroll updates.

## 🛠️ Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
*   **Database:** MongoDB
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** NextAuth.js
*   **Styling:** Tailwind CSS, Framer Motion
*   **AI Integration:** Google Generative AI (Gemini)
*   **Rate Limiting:** Upstash Redis
*   **Payments:** Stripe
*   **Emails:** Nodemailer (SMTP)
*   **Testing:** Vitest & Playwright

## 📦 Getting Started

### Prerequisites

*   Node.js (v24.x recommended)
*   MongoDB Cluster (e.g., MongoDB Atlas)
*   Upstash Redis Account
*   Google Cloud Console (for OAuth & Gemini APIs)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nexahr.git
    cd nexahr
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Copy the example environment file and populate it with your credentials:
    ```bash
    cp .env.example .env
    ```
    *Ensure you fill out the `MONGO_URI`, `NEXTAUTH_SECRET`, `GEMINI_API_KEY`, and `UPSTASH_REDIS_REST_URL` in `.env`.*

4.  **Database Setup:**
    Generate the Prisma client:
    ```bash
    npx prisma generate
    ```

    To enable credentials login for an admin user, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your local or Vercel environment, then run:
    ```bash
    npm run admin:setup
    ```
    The credentials login returns `401 Unauthorized` until that user has a password. Google login is independent of these credentials.

5.  **Seed the Database (Optional):**
    If you want to populate your database with dummy data and a master admin account, run:
    ```bash
    node seed.js
    ```

6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing

NexaHR AI includes a suite of unit tests and end-to-end (E2E) tests to ensure robust functionality.

*   **Run Unit Tests:** `npm run test`
*   **Run E2E Tests:** `npm run test:e2e`

## 📁 Documentation

For an in-depth look at the vision, architecture, and feature specification, please check the Product Requirements Document (PRD) located in the `/docs/PRD` directory.

## Future Roadmap

* Expand payroll reporting with tax filings, configurable local compliance rules, and scheduled payroll delivery.
* Add richer workforce planning with compensation bands, succession planning, and skills-based headcount forecasting.
* Introduce self-service workflow automation for onboarding, document expiry reminders, and policy acknowledgements.
* Extend the analytics layer with configurable dashboards, exports, and anomaly explanations for HR teams.

## 📄 License

This project is proprietary and intended for Enterprise use.
