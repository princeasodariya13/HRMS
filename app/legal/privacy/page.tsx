import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-6">
        <SectionBadge className="mb-6">Legal Information</SectionBadge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#111827]">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#6B7280] mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-slate max-w-none text-[#4B5563] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">1. Introduction</h2>
            <p>
              At NexaHR AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our enterprise HRMS platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including employer details, employee records, payroll information, and platform usage data. Our AI features process this data strictly within your isolated tenant environment to provide insights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">3. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate, maintain, and improve our services, process payroll accurately, verify identities, and provide customer support. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">4. Data Security</h2>
            <p>
              We use enterprise-grade administrative, technical, and physical security measures to help protect your personal information. All data is encrypted at rest and in transit using industry-standard protocols.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
