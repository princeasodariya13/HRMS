"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionBadge } from "./SectionBadge";
import { CheckCircle2 } from "lucide-react";
import { GradientButton } from "./GradientButton";

const SOLUTIONS = [
  "Unified, secure employee database",
  "Automated attendance & real-time tracking",
  "Smart leave workflows with auto-approvals",
  "1-click payroll automation & payslips",
  "AI-powered HR support & natural language queries",
  "Actionable real-time analytics & dashboards",
  "Centralized secure document management"
];

export function SolutionSection() {
  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden border-y border-[#E5E7EB]" id="solutions">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-white blur-[100px] z-0" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionBadge className="mb-6">The NexaHR AI Solution</SectionBadge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-[#111827]">
              A Unified Platform for <br/><span className="text-gradient">Modern Workforces</span>
            </h2>
            <p className="text-lg text-[#6B7280] mb-8">
              Replace multiple disjointed tools with a single, intelligent platform. NexaHR AI automates routine tasks, ensures compliance, and gives you actionable insights.
            </p>
            
            <ul className="space-y-4 mb-10">
              {SOLUTIONS.map((solution, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-[#111827] font-medium"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  {solution}
                </motion.li>
              ))}
            </ul>
            
            <Link href="/features">
              <GradientButton showArrow>See All Features</GradientButton>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-xl relative z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-[#F8FAFC]" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                  <h3 className="text-xl font-bold text-[#111827]">Platform Overview</h3>
                  <div className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#0F172A] border border-[#E5E7EB] text-xs font-semibold">
                    System Healthy
                  </div>
                </div>
                
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center font-bold text-[#0F172A]">
                        0{i}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#111827]">Module Synchronization</div>
                        <div className="text-xs text-[#6B7280] mt-1">Real-time data flow active</div>
                      </div>
                    </div>
                    <div className="w-16 h-8">
                      {/* Fake mini sparkline */}
                      <svg viewBox="0 0 100 30" className="w-full h-full stroke-[#9CA3AF] fill-none stroke-2">
                        <path d={`M 0 15 Q 10 5, 20 15 T 40 15 T 60 5 T 80 25 T 100 10`} />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E5E7EB] rounded-full blur-[40px] z-0" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F1F5F9] rounded-full blur-[40px] z-0" />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
