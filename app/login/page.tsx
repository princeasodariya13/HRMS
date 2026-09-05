"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Bot, ArrowRight, AlertCircle, Building, User, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, FormEvent } from "react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const type = searchParams.get("type");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(error || "");

  const handleCredentialsLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setAuthError(res.error);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setAuthError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
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

      <div className="w-full max-w-md">
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#F1F5F9] rounded-full blur-[40px] pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#6B7280] mb-6">
              Sign in to your account to continue to NexaHR AI.
            </p>



            {message && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{message}</p>
              </div>
            )}

            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{authError}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleCredentialsLogin}>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[#111827]" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all text-sm text-[#111827] placeholder:text-[#9CA3AF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111827] text-white hover:bg-[#1f2937] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

            </form>

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-[#E5E7EB]"></div>
              <span className="flex-shrink-0 mx-4 text-[#9CA3AF] text-xs font-medium">Or continue with</span>
              <div className="flex-grow border-t border-[#E5E7EB]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F8FAFC] shadow-sm rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-8">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#111827] font-semibold hover:underline">
            Register your company
          </Link>
        </p>
      </div>
    </div>
  );
}
