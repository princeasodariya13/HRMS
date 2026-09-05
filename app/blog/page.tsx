import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">Resources & Insights</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            The NexaHR <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8">
            Insights, guides, and best practices for modern HR teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "How AI is Reshaping Performance Reviews", date: "Oct 24, 2024", cat: "Artificial Intelligence" },
            { title: "5 Employee Retention Strategies for 2025", date: "Oct 18, 2024", cat: "Company Culture" },
            { title: "Automating Payroll: A Step-by-Step Guide", date: "Oct 12, 2024", cat: "Payroll & Compliance" },
            { title: "The True Cost of Manual HR Processes", date: "Sep 30, 2024", cat: "HR Strategy" },
            { title: "Building a Remote-First Onboarding Experience", date: "Sep 22, 2024", cat: "Onboarding" },
            { title: "NexaHR Q3 Product Updates & Features", date: "Sep 15, 2024", cat: "Product News" },
          ].map((post, i) => (
            <div key={i} className="flex flex-col bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
              <div className="h-48 bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">
                Image Placeholder
              </div>
              <div className="p-6">
                <div className="text-sm font-medium text-blue-600 mb-2">{post.cat}</div>
                <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-[#6B7280] text-sm mb-4">
                  Discover how modern HR teams are leveraging new strategies to streamline their operations...
                </p>
                <div className="text-sm text-[#9CA3AF] font-medium">{post.date}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
