"use client";

import { TRUSTED_COMPANIES } from "@/constants/landing";

export function TrustedBy() {
  return (
    <section className="py-12 border-y border-[#E5E7EB] bg-[#F8FAFC]">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm font-medium text-[#6B7280] mb-8">
          Trusted by modern teams and growing businesses worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {TRUSTED_COMPANIES.map((company) => (
            <div key={company} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#E5E7EB]" />
              <span className="text-xl font-bold tracking-tighter text-[#111827]">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
