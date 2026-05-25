"use client";

import React from "react";
import { Button } from "./Button";
import { ArrowRight, Terminal } from "lucide-react";

export const CTA: React.FC = () => {
  return (
    <section className="py-24 bg-[#fafaf9] px-6 relative overflow-hidden border-t border-solid border-[#e5e6e6]">
      {/* Absolute glow decorative circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#e3ff8f]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto bg-[#1f2223] rounded-3xl p-8 md:p-16 text-center border border-solid border-[#2e3133] shadow-2xl relative z-10 overflow-hidden">
        {/* Abstract grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Action Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#e3ff8f] text-[#1f2223] border border-solid border-[#cbeb59] flex items-center justify-center mx-auto mb-6 shadow-[0_4px_14px_rgba(227,255,143,0.35)]">
          <Terminal size={22} />
        </div>

        {/* Title */}
        <h2 className="text-[28px] md:text-[46px] font-black text-white tracking-tight leading-tight max-w-2xl mx-auto mb-6">
          Ready to orchestrate your laboratory pipelines?
        </h2>

        {/* Description */}
        <p className="text-[13.5px] md:text-[15.5px] text-[#fafaf9]/75 font-semibold max-w-lg mx-auto mb-10 leading-relaxed">
          Create a free account today to trigger multi-phase grading cycles, index raw scientific datasets, and coordinate with Ozymor AI Copilot instantly.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="neon" href="/login?tab=signup" className="w-full sm:w-auto px-8 py-3.5">
            Get Started Free
            <ArrowRight size={15} />
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto px-8 py-3.5 text-white hover:bg-white/10 hover:text-white">
            Schedule Live Demo
          </Button>
        </div>

      </div>
    </section>
  );
};
