import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-6">
        <SectionBadge className="mb-6">Legal Information</SectionBadge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#111827]">
          Cookie Policy
        </h1>
        <p className="text-sm text-[#6B7280] mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-slate max-w-none text-[#4B5563] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help the site remember your actions and preferences over time, so you don't have to keep re-entering them whenever you come back to the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">2. How We Use Cookies</h2>
            <p>
              NexaHR AI uses cookies for several purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Authentication and ensuring secure logins.</li>
              <li>Remembering your site preferences and settings.</li>
              <li>Analyzing site traffic and performance to improve our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">3. Managing Your Cookies</h2>
            <p>
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
