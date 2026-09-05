"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Bot, FileText, UserCheck, MessageSquare, Loader2 } from "lucide-react";
import { sendMessageToAI } from "./actions";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AiChatClient({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your NexaHR AI Copilot. I am connected directly to your MongoDB database. You can ask me real-time queries about your **employees**, **payroll**, **attendance**, or **recruitment** pipelines. Try asking: *'What is our total payroll cost?'*"
    }
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isPending) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      const response = await sendMessageToAI(userMessage.content);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
      setMessages(prev => [...prev, aiMessage]);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like bold rendering for "**text**"
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col overflow-hidden">
      
      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] dark:bg-[#1E293B]">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' ? (
                <div className="w-10 h-10 rounded-xl bg-[#111827] dark:bg-[#F3F4F6] flex-shrink-0 flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-white dark:text-[#111827]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-[#111827] dark:text-[#F3F4F6] text-sm">
                  {userName[0]}
                </div>
              )}
              
              <div className={`space-y-2 max-w-2xl flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] text-sm mt-2">
                  {msg.role === 'assistant' ? 'NexaHR AI' : 'You'}
                </p>
                
                {msg.role === 'assistant' ? (
                  <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] p-4 rounded-2xl rounded-tl-sm text-[#475569] text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                    {renderContent(msg.content)}
                  </div>
                ) : (
                  <div className="bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] p-4 rounded-2xl rounded-tr-sm text-sm shadow-md">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#111827] dark:bg-[#F3F4F6] flex-shrink-0 flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-white dark:text-[#111827]" />
              </div>
              <div className="space-y-2 max-w-2xl">
                <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] text-sm mt-2">NexaHR AI</p>
                <div className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] p-4 rounded-2xl rounded-tl-sm text-[#475569] text-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]" />
                  <span className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">Querying database...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0F172A] border-t border-[#E5E7EB] dark:border-[#1E293B]">
        <div className="max-w-3xl mx-auto relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            placeholder="Ask the HR Copilot anything..." 
            className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-[#F3F4F6] text-sm rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] transition-all shadow-inner disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] rounded-lg hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB] transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-3 flex items-center justify-center gap-4 text-xs text-[#9CA3AF] dark:text-[#6B7280]">
          <button onClick={() => setInput("How many employees do we have?")} className="hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">Count Employees</button>
          <span>•</span>
          <button onClick={() => setInput("What is our total payroll cost?")} className="hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">Check Payroll</button>
          <span>•</span>
          <button onClick={() => setInput("How many open jobs do we have?")} className="hover:text-[#111827] dark:text-[#F3F4F6] transition-colors">Analyze Recruitment</button>
        </div>
      </div>
    </div>
  );
}
