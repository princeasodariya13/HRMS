"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface GradientButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  showArrow?: boolean;
}

export function GradientButton({
  children,
  variant = "primary",
  showArrow = false,
  className,
  ...props
}: GradientButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";
  
  const variants = {
    primary: "bg-[#111827] text-white hover:bg-[#1f2937] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
    secondary: "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] border border-[#E5E7EB]",
    outline: "bg-white text-[#111827] hover:bg-[#F9FAFB] border border-[#E5E7EB] shadow-sm"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {showArrow && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
      </span>
    </motion.button>
  );
}
