import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { AIAssistantSection } from "@/components/landing/AIAssistantSection";
import { AnalyticsSection } from "@/components/landing/AnalyticsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      {/* Optimized background: Replaced expensive CSS blurs with lightweight radial gradients */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-white"
        style={{
          backgroundImage: `
            radial-gradient(circle at 0% 0%, #F8FAFC 0%, transparent 50%),
            radial-gradient(circle at 100% 40%, #F1F5F9 0%, transparent 50%),
            radial-gradient(circle at 30% 100%, #F8FAFC 0%, transparent 50%)
          `
        }}
      />

      <Navbar />
      
      <main>
        <Hero />
        <TrustedBy />
        <ProblemSection />
        <SolutionSection />
        <FeatureSection />
        <AIAssistantSection />
        <AnalyticsSection />
        <PricingSection />
        <Testimonials />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
