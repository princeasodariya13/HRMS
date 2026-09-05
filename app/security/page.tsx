import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";
import { Shield, Lock, Server, Key } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">Enterprise Security</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            Your Data is <span className="text-gradient">Secure</span> with Us
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8">
            NexaHR AI is built on a foundation of enterprise-grade security, privacy, and compliance to protect your most sensitive workforce data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 text-[#111827]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#111827]">Data Encryption</h3>
            <p className="text-[#6B7280] leading-relaxed">
              All data is encrypted both in transit (using TLS 1.3) and at rest (using AES-256). We utilize advanced cryptographic key management to ensure your HR records remain confidential and secure.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 text-[#111827]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#111827]">Compliance & Privacy</h3>
            <p className="text-[#6B7280] leading-relaxed">
              NexaHR AI is fully compliant with GDPR, CCPA, and SOC 2 Type II standards. We conduct regular third-party penetration testing and vulnerability assessments to maintain compliance.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 text-[#111827]">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#111827]">Access Control</h3>
            <p className="text-[#6B7280] leading-relaxed">
              Implement strict Role-Based Access Control (RBAC), Single Sign-On (SSO) integrations, and enforce Multi-Factor Authentication (MFA) to govern exactly who can view and edit employee data.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 text-[#111827]">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#111827]">Infrastructure</h3>
            <p className="text-[#6B7280] leading-relaxed">
              Hosted on isolated, highly available cloud architecture with continuous backups, automated disaster recovery protocols, and 99.99% guaranteed uptime SLAs.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
