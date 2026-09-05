"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";

import { processChatQuery } from "./actions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hi there! I am Nexa, your AI HR Assistant. I can help you check your leave balance, explain company policies, or provide details about your payroll. How can I help you today?"
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Call the Server Action which queries Prisma directly
    try {
      const responseText = await processChatQuery(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered a network error. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#1E293B] rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-gray-50 dark:bg-[#1E293B]/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white dark:text-[#111827] shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-[#111827] dark:text-[#F3F4F6]">Nexa AI</h2>
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Online & Ready
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 bg-white dark:bg-[#0F172A] px-3 py-1.5 rounded-full border border-gray-200">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Powered by NexaHR AI
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === "user" ? "bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827]" : "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white dark:text-[#111827]"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
              msg.role === "user" 
                ? "bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] rounded-tr-sm" 
                : "bg-white dark:bg-[#0F172A] border border-gray-100 text-gray-800 rounded-tl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white dark:text-[#111827] shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-[#0F172A] border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0F172A] border-t border-[#E5E7EB] dark:border-[#1E293B] shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your HR data..."
            className="w-full pl-5 pr-14 py-3.5 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-full text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-white focus:border-blue-500 transition-all outline-none text-[15px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white dark:text-[#111827] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-3">
          AI-generated responses may occasionally contain inaccuracies.
        </p>
      </div>
    </div>
  );
}
