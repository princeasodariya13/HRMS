import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-6">
        <SectionBadge className="mb-6">Legal Information</SectionBadge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#111827]">
          Data Processing Agreement (DPA)
        </h1>
        <p className="text-sm text-[#6B7280] mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-slate max-w-none text-[#4B5563] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">1. Scope and Applicability</h2>
            <p>
              This Data Processing Agreement ("DPA") forms part of the Terms of Service between NexaHR AI ("Data Processor") and the customer ("Data Controller"). It reflects the parties' agreement with regard to the processing of personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">2. Processing of Personal Data</h2>
            <p>
              NexaHR AI will process personal data strictly in accordance with the Data Controller's documented instructions and to the extent necessary to provide the agreed-upon HRMS and payroll services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">3. Security Measures</h2>
            <p>
              We implement and maintain appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption of personal data, continuous monitoring, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">4. Sub-processors</h2>
            <p>
              The Data Controller provides general authorization for NexaHR AI to engage sub-processors. We will inform the Data Controller of any intended changes concerning the addition or replacement of sub-processors.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
