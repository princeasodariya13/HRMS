"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/constants/landing";
import { SectionBadge } from "./SectionBadge";
import { Quote, Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%] bg-[#F8FAFC] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <SectionBadge className="mb-4">Customer Success</SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
            Loved by <span className="text-gradient">HR Leaders</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[#F3F4F6]" />
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-[#0F172A] text-[#0F172A]" />
                ))}
              </div>
              <p className="text-[#4B5563] leading-relaxed mb-8 relative z-10">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-bold text-sm text-[#111827]">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111827]">{testimonial.name}</div>
                  <div className="text-xs text-[#6B7280]">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
