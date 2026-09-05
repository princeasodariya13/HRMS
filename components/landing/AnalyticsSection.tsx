"use client";

import { motion } from "framer-motion";
import { SectionBadge } from "./SectionBadge";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

export function AnalyticsSection() {
  return (
    <section className="py-24 bg-white relative" id="analytics">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <SectionBadge className="mb-4">
            Data-Driven HR
          </SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
            Real-Time Insights at Your <span className="text-gradient">Fingertips</span>
          </h2>
          <p className="text-lg text-[#6B7280]">
            Stop guessing. Make strategic workforce decisions backed by real-time data, predictive analytics, and AI-generated summaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#E5E7EB] hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Workforce Growth</h3>
                <p className="text-sm text-[#6B7280]">Department-wise breakdown</p>
              </div>
            </div>
            <div className="h-48 w-full flex items-end justify-between gap-4">
              {[30, 45, 60, 50, 75, 90, 100].map((h, i) => (
                <div key={i} className="w-full bg-[#E5E7EB] rounded-t-sm relative group cursor-pointer hover:bg-[#D1D5DB] transition-colors" style={{ height: `${h}%` }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-full h-1 bg-[#0F172A] rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#E5E7EB] hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Payroll Trends</h3>
                <p className="text-sm text-[#6B7280]">Monthly cost analysis</p>
              </div>
            </div>
            <div className="relative h-48 w-full">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                <path d="M 0 40 Q 20 30, 40 35 T 70 20 T 100 10" fill="none" className="stroke-[#0F172A] stroke-2" />
                <path d="M 0 50 L 0 40 Q 20 30, 40 35 T 70 20 T 100 10 L 100 50 Z" fill="url(#silver-gradient)" opacity="0.3" />
                <defs>
                  <linearGradient id="silver-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
