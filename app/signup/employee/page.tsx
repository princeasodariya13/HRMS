import Link from "next/link";
import { employeeSignup } from "@/app/auth-actions";
import { Bot, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function EmployeeSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A] shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#111827]">
          NexaHR <span className="text-[#6B7280]">AI</span>
        </span>
      </Link>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Value Prop */}
        <div className="hidden md:flex flex-col pr-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-6 tracking-tight leading-tight">
            Welcome to your new employee workspace.
          </h1>
          
          <div className="space-y-6">
            {[
              "View your personalized dashboard",
              "Check-in and track your attendance",
              "Download your salary slips instantly",
              "Ask the AI HR Assistant for help"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#0F172A]" />
                </div>
                <span className="text-[#6B7280] font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#F1F5F9] rounded-full blur-[40px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">Create Employee Account</h2>
            <p className="text-sm text-[#6B7280] mb-8">
              Join your company's NexaHR workspace.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827]" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Michael"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827]" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Scott"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827]" htmlFor="email">
                  Work Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827]" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  formAction={employeeSignup}
                  className="w-full bg-[#111827] text-white hover:bg-[#1f2937] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href="/login?type=employee"
                  className="w-full bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center"
                >
                  Log in instead
                </Link>
              </div>
            </form>
            
            <p className="text-xs text-[#9CA3AF] text-center mt-6">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-[#6B7280] mt-12">
        Already have an account?{" "}
        <Link href="/login?type=employee" className="text-[#111827] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
