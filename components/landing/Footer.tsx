import Link from "next/link";
import { Bot, MessageSquare, Users } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A] shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827]">
                NexaHR <span className="text-[#6B7280]">AI</span>
              </span>
            </Link>
            <p className="text-[#6B7280] mb-6 max-w-sm">
              The intelligent, unified enterprise HRMS platform designed to automate operations and empower your workforce.
            </p>
            <div className="flex gap-4">
              <Link href="/contact" className="w-10 h-10 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB] transition-all">
                <MessageSquare className="w-4 h-4" />
              </Link>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB] transition-all">
                <Users className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-[#111827]">Product</h4>
            <ul className="space-y-4 text-sm text-[#6B7280]">
              <li><Link href="/features" className="hover:text-[#111827] transition-colors">Features</Link></li>
              <li><Link href="/#ai" className="hover:text-[#111827] transition-colors">AI Assistant</Link></li>
              <li><Link href="/#pricing" className="hover:text-[#111827] transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-[#111827] transition-colors">Security</Link></li>
              <li><Link href="/changelog" className="hover:text-[#111827] transition-colors">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-[#111827]">Company</h4>
            <ul className="space-y-4 text-sm text-[#6B7280]">
              <li><Link href="/about" className="hover:text-[#111827] transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-[#111827] transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-[#111827] transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-[#111827] transition-colors">Contact</Link></li>
              <li><Link href="/partners" className="hover:text-[#111827] transition-colors">Partners</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-[#111827]">Legal</h4>
            <ul className="space-y-4 text-sm text-[#6B7280]">
              <li><Link href="/legal/terms" className="hover:text-[#111827] transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#111827] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-[#111827] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/legal/dpa" className="hover:text-[#111827] transition-colors">DPA</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-[#E5E7EB] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
          <p>© {new Date().getFullYear()} NexaHR AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
