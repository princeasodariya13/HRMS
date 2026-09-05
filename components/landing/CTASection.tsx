"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GradientButton } from "./GradientButton";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#F8FAFC] rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden border border-[#E5E7EB] shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent pointer-events-none opacity-50" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
              Ready to Upgrade Your <span className="text-gradient">HR Operations?</span>
            </h2>
            <p className="text-lg md:text-xl text-[#6B7280] mb-10">
              Join thousands of forward-thinking companies that have transformed their workforce management with NexaHR AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <GradientButton variant="primary" showArrow className="w-full sm:w-auto px-8">
                  Start 14-Day Free Trial
                </GradientButton>
              </Link>
            </div>
            <p className="text-sm text-[#9CA3AF] mt-6">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
