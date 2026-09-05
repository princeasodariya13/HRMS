import Link from "next/link";
import { ArrowLeft, Bot, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 w-fit">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A]">
            <Bot className="w-5 h-5 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#111827]">
            NexaHR <span className="text-[#6B7280]">AI</span>
          </span>
        </Link>

        <section className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F1F5F9] mb-5">
            <Mail className="w-6 h-6 text-[#111827]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">Password recovery</h1>
          <p className="text-sm leading-6 text-[#6B7280] mb-6">
            Password recovery by email is not enabled yet. Please contact your administrator to reset your password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}
