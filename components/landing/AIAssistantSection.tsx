"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionBadge } from "./SectionBadge";
import { Bot, User, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { GradientButton } from "./GradientButton";

const CHAT_MESSAGES = [
  {
    role: "user",
    text: "How many casual leaves do I have left?"
  },
  {
    role: "ai",
    text: "You have 6 casual leaves remaining this year. You've used 2 out of 8 allocated leaves. Would you like me to draft a leave request for you?"
  },
  {
    role: "user",
    text: "Generate a job description for a Senior React Developer."
  },
  {
    role: "ai",
    text: "Here is a drafted Job Description for Senior React Developer:\n\n**Role Overview:** We are looking for an experienced React Developer to join our core product team...\n\n**Requirements:**\n• 4+ years of React/Next.js experience\n• Strong TypeScript skills\n• Experience with state management (Zustand/Redux)"
  }
];

export function AIAssistantSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < CHAT_MESSAGES.length - 1 ? prev + 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden border-y border-[#E5E7EB]" id="ai">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-white rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1 relative"
          >
            {/* Chat Interface Mockup */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xl">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#111827]">Nexa AI Copilot</div>
                  <div className="text-xs text-[#6B7280] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              
              <div className="p-4 h-[350px] overflow-y-auto flex flex-col gap-4 bg-white">
                <AnimatePresence>
                  {CHAT_MESSAGES.slice(0, step + 1).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[#E5E7EB] ${msg.role === 'user' ? 'bg-[#F8FAFC] text-[#111827]' : 'bg-white text-[#111827]'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm whitespace-pre-line shadow-sm border ${msg.role === 'user' ? 'bg-[#F8FAFC] border-[#E5E7EB] rounded-tr-sm text-[#111827]' : 'bg-white border-[#E5E7EB] rounded-tl-sm text-[#111827]'}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {step < CHAT_MESSAGES.length - 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-center text-[#9CA3AF] text-xs ml-11"
                  >
                    AI is typing <span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span></span>
                  </motion.div>
                )}
              </div>
              
              <div className="p-3 border-t border-[#E5E7EB] bg-[#F8FAFC]">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask about leaves, payroll, policies..." 
                    className="w-full bg-white border border-[#E5E7EB] rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-[#111827] text-[#111827] shadow-sm"
                    disabled
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center">
                    <Send className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <SectionBadge className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" /> 
              Generative AI Built-In
            </SectionBadge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-[#111827]">
              Meet Your <span className="text-gradient">AI HR Copilot</span>
            </h2>
            <p className="text-lg text-[#6B7280] mb-8">
              Empower your employees with instant answers and supercharge your HR team with AI-driven insights, resume parsing, and automated document generation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                "Answer policy questions instantly",
                "Explain complex payslips",
                "Parse resumes to structured data",
                "Match candidates to open roles",
                "Detect attendance anomalies",
                "Generate performance summaries"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#111827] mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#111827]">{item}</span>
                </div>
              ))}
            </div>
            
            <GradientButton>Explore AI Features</GradientButton>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
