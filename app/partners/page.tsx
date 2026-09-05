import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";
import { GradientButton } from "@/components/landing/GradientButton";
import Link from "next/link";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">Partner Program</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            Grow with <span className="text-gradient">NexaHR AI</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8">
            Join our ecosystem of technology partners, consultants, and resellers to deliver next-generation HR solutions to your clients.
          </p>
          <Link href="/contact">
            <GradientButton>Apply to Partner Program</GradientButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center">
          <div className="p-8 bg-white border border-[#E5E7EB] rounded-3xl hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold mb-4 text-[#111827]">Technology Partners</h3>
            <p className="text-[#6B7280]">
              Integrate your software with NexaHR AI via our open APIs to create seamless workflows for mutual customers.
            </p>
          </div>
          <div className="p-8 bg-white border border-[#E5E7EB] rounded-3xl hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold mb-4 text-[#111827]">Solution Providers</h3>
            <p className="text-[#6B7280]">
              Consultants and agencies who want to implement NexaHR AI for their enterprise clients and earn implementation fees.
            </p>
          </div>
          <div className="p-8 bg-white border border-[#E5E7EB] rounded-3xl hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold mb-4 text-[#111827]">Referral Partners</h3>
            <p className="text-[#6B7280]">
              Recommend NexaHR AI to your network and earn recurring commission for every successful conversion.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
