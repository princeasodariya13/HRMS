"use client";

import Link from "next/link";
import { signup } from "@/app/auth-actions";
import { Bot, ArrowRight, AlertCircle, CheckCircle2, CreditCard, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { use, useState, useRef } from "react";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = use(searchParams);
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = () => {
    if (formRef.current) {
      const company = (formRef.current.elements.namedItem('company') as HTMLInputElement).value;
      const email = (formRef.current.elements.namedItem('email') as HTMLInputElement).value;
      const password = (formRef.current.elements.namedItem('password') as HTMLInputElement).value;
      
      if (company && email && password) {
        setStep(2);
      } else {
        formRef.current.reportValidity();
      }
    }
  };

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
            Start transforming your HR operations today.
          </h1>
          
          <div className="space-y-6">
            {[
              "Automate payroll and attendance tracking",
              "Manage employee lifecycle seamlessly",
              "Leverage AI for smarter HR insights",
              "Enterprise-grade security and compliance"
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
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#F1F5F9] rounded-full blur-[40px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">
              {step === 1 ? "Create your account" : "Complete Payment"}
            </h2>
            <p className="text-sm text-[#6B7280] mb-8">
              {step === 1 ? "Join thousands of companies using NexaHR AI." : "Securely process your subscription."}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form ref={formRef} action={signup} className="space-y-5" onSubmit={() => setIsProcessing(true)}>
              {/* Step 1: Account Details */}
              <div className={step === 1 ? "block" : "hidden"}>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827]" htmlFor="company">
                      Company Name
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Inc."
                      required={step === 1}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                    />
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
                      required={step === 1}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827]" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        required={step === 1}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="w-full bg-[#111827] text-white hover:bg-[#1f2937] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link
                      href="/login?type=admin"
                      className="w-full bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center"
                    >
                      Log in instead
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Details */}
              <div className={step === 2 ? "block" : "hidden"}>
                <div className="space-y-5">
                  <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5 text-[#111827]" />
                      <span className="font-semibold text-[#111827]">Payment Details</span>
                    </div>
                    <p className="text-sm text-[#6B7280]">
                      Please enter your card information to complete the registration.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827]" htmlFor="card_number">
                      Card Number
                    </label>
                    <input
                      id="card_number"
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      required={step === 2}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#111827]" htmlFor="expiry">
                        Expiry Date
                      </label>
                      <input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        required={step === 2}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#111827]" htmlFor="cvc">
                        CVC
                      </label>
                      <input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        required={step === 2}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm placeholder:text-[#9CA3AF]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-[#111827] text-white hover:bg-[#1f2937] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isProcessing ? "Processing..." : "Pay & Create Account"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center"
                    >
                      Back to Account Details
                    </button>
                  </div>
                </div>
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
        <Link href="/login" className="text-[#111827] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
