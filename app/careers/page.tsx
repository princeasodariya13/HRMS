import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";
import { GradientButton } from "@/components/landing/GradientButton";
import Link from "next/link";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">Join the Team</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            Help Us Shape the <span className="text-gradient">Future</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8">
            We're always looking for talented, passionate people to join our mission of building the world's most intelligent HR platform.
          </p>
          <GradientButton>View Open Positions</GradientButton>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#111827]">Open Roles</h2>
          
          <div className="space-y-4">
            {[
              { title: "Senior React Developer", dept: "Engineering", loc: "Remote (US)", type: "Full-time" },
              { title: "AI Research Scientist", dept: "Machine Learning", loc: "San Francisco, CA", type: "Full-time" },
              { title: "Product Marketing Manager", dept: "Marketing", loc: "Remote", type: "Full-time" },
              { title: "Enterprise Account Executive", dept: "Sales", loc: "New York, NY", type: "Full-time" }
            ].map((job, i) => (
              <Link href="/contact" key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#111827] transition-all hover:shadow-md cursor-pointer group block">
                <div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                    <span className="font-medium">{job.dept}</span>
                    <span>•</span>
                    <span>{job.loc}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="text-sm font-semibold text-[#111827] group-hover:underline">Apply Now &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
