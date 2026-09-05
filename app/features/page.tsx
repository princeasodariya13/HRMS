"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FEATURES } from "@/constants/landing";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionBadge className="mb-6">
                Comprehensive HR Platform
              </SectionBadge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]"
            >
              All the <span className="text-gradient">Features</span> You Need
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-[#6B7280] leading-relaxed"
            >
              Discover the full suite of intelligent tools designed to streamline your HR operations, automate payroll, and empower your workforce.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mb-6 text-[#0F172A] group-hover:scale-105 transition-all">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111827] group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
