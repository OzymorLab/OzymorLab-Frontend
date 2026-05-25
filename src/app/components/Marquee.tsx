"use client";

import React from "react";
import { Cpu, FlaskConical, Globe, GraduationCap, Microscope, ShieldCheck } from "lucide-react";

export const Marquee: React.FC = () => {
  const partners = [
    { name: "Stanford BioLab", icon: Microscope },
    { name: "MIT Lab Center", icon: FlaskConical },
    { name: "YCombinator Science", icon: Globe },
    { name: "Harvard Academy", icon: GraduationCap },
    { name: "OpenAI Labs", icon: Cpu },
    { name: "Genentech Research", icon: ShieldCheck },
  ];

  // Duplicate the array to create a seamless infinite scrolling illusion
  const doubledPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="py-10 bg-white border-y border-solid border-[#e5e6e6] overflow-hidden relative">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 mb-4">
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#888780]">
          Orchestrating pipelines for the world's leading research teams
        </p>
      </div>

      <div className="relative w-full overflow-hidden flex items-center">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling Inner */}
        <div className="animate-marquee gap-12 py-3">
          {doubledPartners.map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-[#fafaf9] border border-solid border-[#e5e6e6] rounded-xl hover:border-[#1f2223] hover:bg-white transition-all duration-200 shadow-sm cursor-default"
              >
                <Icon size={16} className="text-[#5f5e5a]" />
                <span className="text-[12.5px] font-bold text-[#1f2223]">
                  {partner.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
