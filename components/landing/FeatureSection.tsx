"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/constants/landing";
import { SectionBadge } from "./SectionBadge";

export function FeatureSection() {
  return (
    <section className="py-24 bg-white relative" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <SectionBadge className="mb-4">Enterprise Capabilities</SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
            Everything You Need to <span className="text-gradient">Scale</span>
          </h2>
          <p className="text-lg text-[#6B7280]">
            A comprehensive suite of tools designed to handle every aspect of the employee lifecycle from hire to retire.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
              }}
              className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all group overflow-hidden relative"
            >
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mb-5 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <feature.icon className="w-6 h-6 text-[#6B7280] group-hover:text-[#111827] transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#111827] group-hover:text-[#0F172A] transition-colors">{feature.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
