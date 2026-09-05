"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bot } from "lucide-react";
import { NAV_LINKS } from "@/constants/landing";
import { GradientButton } from "./GradientButton";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] py-3 shadow-sm" : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A] shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827]">
              NexaHR <span className="text-[#6B7280]">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#111827] hover:text-[#6B7280] transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <GradientButton variant="primary" className="py-2 px-5 h-auto text-sm">
                Get Started
              </GradientButton>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-[#111827] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-[#E5E7EB] p-4 md:hidden flex flex-col gap-4 shadow-xl"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#111827] p-2 hover:bg-[#F3F4F6] rounded-md"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px w-full bg-[#E5E7EB] my-2" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="text-center text-base font-medium p-2 border border-[#E5E7EB] rounded-md hover:bg-[#F3F4F6] text-[#111827]"
              >
                Login
              </Link>
              <Link href="/signup">
                <GradientButton variant="primary" className="w-full">
                  Get Started
                </GradientButton>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
