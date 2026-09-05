import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AIChat } from "./AIChat";
import { Bot, Sparkles, HelpCircle, Shield, ArrowRight } from "lucide-react";

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2">
            AI HR Assistant <Sparkles className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-gray-500 mt-1">Ask questions, get instant HR support, and manage your data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Context / Help */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-3xl p-6 text-white dark:text-[#111827] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0F172A]/10 flex items-center justify-center mb-6">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Meet Nexa</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Nexa is your personal AI-powered HR Assistant. It has access to your corporate policies, leave balances, and payroll information to give you instant answers without waiting for HR.
            </p>
            
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Try asking about:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  <span>"What is my current leave balance?"</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                  <span>"Can you explain the remote work policy?"</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
                  <span>"When is my next payroll cycle?"</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <h3 className="font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-600" />
              Privacy & Security
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your conversations with Nexa are completely private and end-to-end encrypted. HR administrators cannot view your chat history.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-2">
          <AIChat />
        </div>
      </div>
    </div>
  );
}
