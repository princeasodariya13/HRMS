"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GradientButton } from "./GradientButton";
import { SectionBadge } from "./SectionBadge";
import { CheckCircle2, TrendingUp, Users, Calendar, DollarSign, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionBadge className="mb-6 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#111827]" />
              Enterprise HRMS Platform
            </SectionBadge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-[#111827]"
          >
            Run Your Entire Workforce with <span className="text-[#6B7280]">AI-Powered HR</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-[#6B7280] mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            NexaHR AI helps modern companies manage employees, attendance, leave, payroll, recruitment, performance, and HR operations from one intelligent enterprise platform.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <GradientButton variant="primary" showArrow className="w-full sm:w-auto">
                Start Free Trial
              </GradientButton>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-[#6B7280]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111827]" /> No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111827]" /> 14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111827]" /> Setup in 5 minutes
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto max-w-5xl animate-float"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 top-1/2" />
          <div className="bg-white rounded-2xl p-2 md:p-4 border border-[#E5E7EB] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative z-0">
            {/* Fake Mac Header */}
            <div className="flex items-center gap-2 px-3 pb-3 pt-1 border-b border-[#E5E7EB] mb-4">
              <div className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
              <div className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
              <div className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 md:p-4 bg-[#F8FAFC] rounded-xl">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col gap-4 border-r border-[#E5E7EB] pr-4">
                <div className="h-8 w-24 bg-[#E5E7EB] rounded animate-pulse" />
                <div className="space-y-3 mt-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-8 w-full bg-white border border-[#E5E7EB] rounded shadow-sm" />
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="col-span-3 space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-8 w-48 bg-[#E5E7EB] rounded animate-pulse" />
                  <div className="h-10 w-10 bg-white border border-[#E5E7EB] rounded-full shadow-sm" />
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#E5E7EB] shadow-sm p-4 rounded-xl flex flex-col gap-2">
                    <Users className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">Total Employees</span>
                    <span className="text-2xl font-bold text-[#111827]">1,248</span>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] shadow-sm p-4 rounded-xl flex flex-col gap-2">
                    <Calendar className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">Present Today</span>
                    <span className="text-2xl font-bold text-[#111827]">1,180</span>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] shadow-sm p-4 rounded-xl flex flex-col gap-2">
                    <DollarSign className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">Monthly Payroll</span>
                    <span className="text-2xl font-bold text-[#111827]">$1.2M</span>
                  </div>
                  <div className="bg-[#0F172A] p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden text-white shadow-md">
                    <TrendingUp className="w-5 h-5 text-white/80" />
                    <span className="text-xs text-white/70">AI Insight</span>
                    <span className="text-sm font-medium">Attrition risk -12%</span>
                  </div>
                </div>
                
                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white border border-[#E5E7EB] shadow-sm p-4 rounded-xl h-48 flex flex-col justify-end gap-2 items-end pb-0 overflow-hidden">
                    <div className="w-full flex items-end justify-between gap-2 h-32 px-4 pb-4">
                      {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                        <div key={i} className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-t-md transition-all" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] shadow-sm p-4 rounded-xl h-48 space-y-4">
                    <div className="h-4 w-24 bg-[#E5E7EB] rounded" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F3F4F6]" />
                          <div className="space-y-1 flex-1">
                            <div className="h-3 w-full bg-[#F3F4F6] rounded" />
                            <div className="h-2 w-2/3 bg-[#F3F4F6] rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
