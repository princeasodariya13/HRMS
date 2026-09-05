"use client";

import { motion } from "framer-motion";
import { PROBLEMS } from "@/constants/landing";
import { SectionBadge } from "./SectionBadge";

export function ProblemSection() {
  return (
    <section className="py-24 bg-white relative" id="problems">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <SectionBadge className="mb-4">
            The Old Way
          </SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
            Traditional HR is <span className="text-[#9CA3AF]">Broken</span>
          </h2>
          <p className="text-lg text-[#6B7280]">
            Growing companies waste thousands of hours every year on manual processes, scattered data, and disconnected systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PROBLEMS.map((problem, idx) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mb-6 text-[#0F172A] group-hover:scale-105 transition-all">
                <problem.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#111827]">{problem.title}</h3>
              <p className="text-[#6B7280] leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
