import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  Briefcase,
  UserPlus,
  BarChart,
  FileText,
  ShieldCheck,
  Bell,
  Activity,
  Bot
} from "lucide-react";

export const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "AI Assistant", href: "#ai" },
  { name: "Solutions", href: "#solutions" },
  { name: "Pricing", href: "#pricing" },
  { name: "Security", href: "#security" },
];

export const TRUSTED_COMPANIES = [
  "NovaTech",
  "CloudSync",
  "PeopleGrid",
  "Workly",
  "TalentFlow",
  "ScaleOps"
];

export const PROBLEMS = [
  {
    title: "Manual Records",
    description: "Spreadsheets and scattered files lead to data inconsistency and lost hours.",
    icon: FileText
  },
  {
    title: "Attendance Errors",
    description: "Inaccurate tracking leads to payroll discrepancies and compliance risks.",
    icon: Clock
  },
  {
    title: "Approval Delays",
    description: "Leave requests lost in email threads cause frustration and poor planning.",
    icon: CalendarDays
  },
  {
    title: "Payroll Complexity",
    description: "Manual calculations across hundreds of employees are error-prone and slow.",
    icon: DollarSign
  },
  {
    title: "No Real-Time Insights",
    description: "Decision-making based on intuition rather than actionable workforce data.",
    icon: Activity
  },
  {
    title: "Slow Support",
    description: "HR teams overwhelmed with repetitive questions from employees.",
    icon: Users
  }
];

export const FEATURES = [
  {
    title: "Employee Management",
    description: "A centralized, secure database for all employee records, documents, and history.",
    icon: Users
  },
  {
    title: "Attendance Tracking",
    description: "Automated check-ins, late marks, half-days, and overtime calculations.",
    icon: Clock
  },
  {
    title: "Leave Management",
    description: "Smart workflows for leave applications, approvals, and balance tracking.",
    icon: CalendarDays
  },
  {
    title: "Payroll Processing",
    description: "One-click payroll generation with automated tax and compliance deductions.",
    icon: DollarSign
  },
  {
    title: "Recruitment Pipeline",
    description: "Track candidates, schedule interviews, and generate offer letters seamlessly.",
    icon: Briefcase
  },
  {
    title: "Onboarding Workflows",
    description: "Automated checklists and document collection for new hires.",
    icon: UserPlus
  },
  {
    title: "Performance Reviews",
    description: "Goal setting, 360-degree feedback, and performance cycle management.",
    icon: BarChart
  },
  {
    title: "AI HR Assistant",
    description: "Intelligent chatbot for answering employee queries and generating insights.",
    icon: Bot
  },
  {
    title: "Document Management",
    description: "Secure, role-based access to company policies and employee documents.",
    icon: FileText
  },
  {
    title: "Role-Based Access",
    description: "Granular permission controls for Admins, Managers, and Employees.",
    icon: ShieldCheck
  },
  {
    title: "Audit Logs",
    description: "Immutable tracking of every critical action taken within the platform.",
    icon: Activity
  },
  {
    title: "Smart Notifications",
    description: "Real-time alerts for pending approvals, anomalies, and important updates.",
    icon: Bell
  }
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$4",
    period: "per user/month",
    description: "For small teams starting their HR digital transformation.",
    features: [
      "Employee Database",
      "Attendance Tracking",
      "Leave Management",
      "Basic Reporting",
      "Email Support"
    ],
    popular: false,
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    price: "$9",
    period: "per user/month",
    description: "For growing companies needing automation and insights.",
    features: [
      "Everything in Starter",
      "Automated Payroll",
      "Recruitment Pipeline",
      "Performance Management",
      "AI HR Assistant",
      "Advanced Analytics"
    ],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "billed annually",
    description: "For large organizations with complex HR requirements.",
    features: [
      "Everything in Professional",
      "Custom RBAC Roles",
      "Multi-Branch Support",
      "Custom API Integrations",
      "Dedicated Success Manager",
      "SLA Guarantee"
    ],
    popular: false,
    cta: "Contact Sales"
  }
];

export const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "HR Director @ TechNova",
    content: "NexaHR AI completely transformed how we manage our workforce. The AI assistant alone saves my team over 20 hours a week in answering repetitive policy questions."
  },
  {
    name: "Rahul Desai",
    role: "Founder & CEO @ CloudSync",
    content: "We moved from 4 different disconnected tools to just NexaHR AI. The payroll automation and real-time attendance insights gave us exactly the visibility we needed to scale."
  },
  {
    name: "Anjali Verma",
    role: "Operations Head @ TalentFlow",
    content: "The design is incredible. Our employees actually enjoy using the portal, and the automated onboarding workflows make our new hires feel welcome from day one."
  }
];
