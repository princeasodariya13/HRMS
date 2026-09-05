import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-6">
        <SectionBadge className="mb-6">Legal Information</SectionBadge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#111827]">
          Terms of Service
        </h1>
        <p className="text-sm text-[#6B7280] mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-slate max-w-none text-[#4B5563] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the NexaHR AI enterprise platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">2. Description of Service</h2>
            <p>
              NexaHR AI provides a comprehensive cloud-based Human Resource Management System (HRMS) incorporating AI-driven insights, payroll processing, attendance tracking, and employee management tools. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">3. Data Privacy and Security</h2>
            <p>
              We take the security of your employee data seriously. Your use of the service is also governed by our Privacy Policy and Data Processing Agreement (DPA). You maintain ownership of all data you input into the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">4. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to ensure that your use of the platform complies with all applicable local, state, national, and international laws, particularly those regarding labor and data protection.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">5. Subscription and Billing</h2>
            <p>
              Services are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (monthly or annually) depending on your selected subscription plan.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
