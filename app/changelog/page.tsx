import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">Product Updates</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            Changelog
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8">
            New updates, improvements, and fixes to the NexaHR AI platform.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E5E7EB] before:to-transparent">
          {[
            {
              version: "v2.1.0",
              date: "October 20, 2024",
              title: "AI-Powered Insights & Payroll Automation",
              description: "We've completely overhauled the dashboard to include real-time AI attrition insights and one-click payroll approvals.",
              badges: ["Feature", "Improvement"]
            },
            {
              version: "v2.0.4",
              date: "October 10, 2024",
              title: "Enhanced Enterprise Security",
              description: "Added support for SAML-based SSO and advanced role-based access control (RBAC) to ensure stricter data governance.",
              badges: ["Security"]
            },
            {
              version: "v2.0.0",
              date: "September 1, 2024",
              title: "The Next Generation HRMS",
              description: "Launched NexaHR AI 2.0 with a brand new interface, improved performance, and our flagship AI conversational assistant for employees.",
              badges: ["Major Release"]
            }
          ].map((log, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#F3F4F6] text-[#111827] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-[#111827]"></div>
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-[#111827]">{log.version}</span>
                  <span className="text-sm text-[#9CA3AF]">{log.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111827]">{log.title}</h3>
                <p className="text-[#6B7280] mb-4 text-sm leading-relaxed">{log.description}</p>
                <div className="flex gap-2">
                  {log.badges.map((badge, j) => (
                    <span key={j} className="px-2 py-1 bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold rounded-md border border-[#E5E7EB]">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
