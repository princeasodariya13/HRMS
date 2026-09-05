"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PRICING_PLANS } from "@/constants/landing";
import { SectionBadge } from "./SectionBadge";
import { Check, Sparkles } from "lucide-react";
import { GradientButton } from "./GradientButton";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section className="py-24 bg-[#F8FAFC] relative border-t border-[#E5E7EB]" id="pricing">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <SectionBadge className="mb-4">Transparent Pricing</SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
            Scale Without <span className="text-gradient">Limits</span>
          </h2>
          <p className="text-lg text-[#6B7280]">
            Simple, predictable pricing that grows with your team. No hidden fees or surprise charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "relative bg-white rounded-3xl p-8 border flex flex-col h-full transition-shadow hover:shadow-xl",
                plan.popular 
                  ? "border-[#111827] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] md:-mt-4 md:mb-4 ring-1 ring-[#111827]" 
                  : "border-[#E5E7EB] shadow-sm"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-[#111827] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-[#111827]">{plan.name}</h3>
                <p className="text-sm text-[#6B7280] h-10">{plan.description}</p>
              </div>
              
              <div className="mb-8 pb-8 border-b border-[#E5E7EB]">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-[#111827]">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-[#6B7280]">{plan.period}</span>}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#0F172A] flex-shrink-0" />
                    <span className="text-sm text-[#111827]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="w-full mt-auto">
                <GradientButton 
                  variant={plan.popular ? "primary" : "outline"} 
                  className="w-full"
                >
                  {plan.cta}
                </GradientButton>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
