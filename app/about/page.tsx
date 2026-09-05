import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">About NexaHR AI</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            Building the Future of <span className="text-gradient">Work</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed">
            We're on a mission to free HR teams from administrative burden so they can focus on what truly matters: their people.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="bg-[#F8FAFC] rounded-3xl p-8 h-80 flex items-center justify-center border border-[#E5E7EB]">
             <div className="text-[#9CA3AF] font-medium">Team Photo Placeholder</div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#111827]">Our Story</h2>
            <p className="text-[#4B5563] mb-4 leading-relaxed">
              Founded in 2024, NexaHR AI started with a simple observation: HR professionals spend too much time on paperwork and not enough time developing talent.
            </p>
            <p className="text-[#4B5563] leading-relaxed">
              We built an intelligent platform that combines cutting-edge AI with robust enterprise workflows to automate the mundane and elevate the strategic. Today, thousands of growing companies rely on us to run their workforce.
            </p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-3xl p-10 md:p-16 border border-[#E5E7EB] text-center">
          <h2 className="text-3xl font-bold mb-10 text-[#111827]">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-4 font-bold text-[#111827]">1</div>
              <h3 className="font-bold text-xl mb-2">People First</h3>
              <p className="text-[#6B7280]">Technology should serve humanity, not the other way around. We design for the end-user.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-4 font-bold text-[#111827]">2</div>
              <h3 className="font-bold text-xl mb-2">Radical Simplicity</h3>
              <p className="text-[#6B7280]">Enterprise software doesn't have to be complicated. We make the complex feel effortless.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-4 font-bold text-[#111827]">3</div>
              <h3 className="font-bold text-xl mb-2">Constant Innovation</h3>
              <p className="text-[#6B7280]">We aggressively adopt new technologies like GenAI to keep our customers ahead of the curve.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
