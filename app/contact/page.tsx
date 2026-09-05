"use client";

import { useState, useTransition } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SectionBadge } from "@/components/landing/SectionBadge";
import { GradientButton } from "@/components/landing/GradientButton";
import { CheckCircle2 } from "lucide-react";
import { submitContactForm } from "./actions";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");

    startTransition(async () => {
      const res = await submitContactForm(formData);
      if (res.error) {
        setStatus("error");
      } else {
        setStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#E5E7EB] selection:text-[#111827]">
      <Navbar />

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge className="mb-6">Get in Touch</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
            Contact our <span className="text-gradient">Sales Team</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8">
            Have questions about NexaHR AI? Want to see a custom demo? We're here to help you transform your HR operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="bg-[#F8FAFC] rounded-3xl p-10 border border-[#E5E7EB]">
            <h3 className="text-2xl font-bold mb-6 text-[#111827]">Global Headquarters</h3>
            <div className="space-y-6 text-[#4B5563]">
              <div>
                <h4 className="font-semibold text-[#111827] mb-1">Address</h4>
                <p>Near Ambavadi Circle<br />SG Highway<br />Ahmedabad-380015<br />Gujarat, India</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#111827] mb-1">Email</h4>
                <p>princeasodariyaofficial13@gmail.com <br />support@nexahrai.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#111827] mb-1">Phone</h4>
                <p>+91 93134 71565</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-10 border border-[#E5E7EB] shadow-lg">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-[#111827]">Message Sent!</h3>
                <p className="text-[#6B7280]">
                  Thank you for reaching out. Our sales team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 text-blue-600 font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6 text-[#111827]">Send us a message</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#111827]">First Name</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="First Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#111827]">Last Name</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Last Name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#111827]">Work Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="support@nexahrai.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#111827]">Message</label>
                    <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help you?"></textarea>
                  </div>

                  {status === "error" && (
                    <div className="text-red-500 text-sm py-2">
                      Failed to send message. Please check your EmailJS configuration.
                    </div>
                  )}

                  <button type="submit" disabled={isPending} className="w-full pt-2 group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#111827] px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4">
                    {isPending ? "Sending..." : "Submit Request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
