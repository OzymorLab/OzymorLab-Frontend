"use client";

import React from "react";
import { Card } from "./Card";
import { 
  Bot, 
  Database, 
  Layers, 
  Terminal, 
  ShieldAlert, 
  Workflow 
} from "lucide-react";

export const Features: React.FC = () => {
  const featureList = [
    {
      title: "Automated Research Pipelines",
      description: "Ingest datasets, verify laboratory credentials, and trigger pipeline processing sequences in parallel with direct worker feedback.",
      icon: Workflow,
      badge: "Automation"
    },
    {
      title: "Unified Scientific Databases",
      description: "Read, parse, and index complex multimodal formats, experimental papers, student lists, and rubrics from a single unified database.",
      icon: Database,
      badge: "Storage"
    },
    {
      title: "Explainable AI Assessment",
      description: "Component-wise evaluation traces trace each result back to structured rubrics, giving complete, audit-proof scientific insights.",
      icon: Bot,
      badge: "Cognitive AI"
    },
    {
      title: "Interactive AI DB Copilot",
      description: "Execute complex database operations, retrieve PDF traces, and generate formatted reports directly from an interactive command console.",
      icon: Terminal,
      badge: "Interactive"
    },
    {
      title: "Real-time Laboratory Telemetry",
      description: "Track execution progress, CPU throughput efficiency, database connection status, and ingestion latency with fluid UI layouts.",
      icon: Layers,
      badge: "Monitoring"
    },
    {
      title: "Enterprise Hardening",
      description: "Fully sandboxed environment utilizing state-of-the-art encryption, client credential protection, and automated threat auditing.",
      icon: ShieldAlert,
      badge: "Security"
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#fafaf9] border-t border-solid border-[#e5e6e6] relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Features Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1f2223] text-[#e3ff8f] text-[10px] font-bold tracking-wider uppercase mb-4">
            Advanced Capabilities
          </div>
          <h2 className="text-[32px] md:text-[50px] font-extrabold text-[#1f2223] tracking-tight leading-tight mb-4">
            Built for High-Velocity <br />Scientific Laboratories.
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#5f5e5a] font-medium max-w-xl">
            OzymorLab connects raw research data with advanced automation pipelines, providing modern teams with a pristine space to execute, query, and verify discoveries.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={idx} 
                variant="white"
                className="flex flex-col justify-between min-h-[250px] relative hover:border-[#1f2223] group transition-all duration-300"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#fafaf9] border border-solid border-[#e5e6e6] group-hover:border-[#1f2223] group-hover:bg-[#e3ff8f]/20 flex items-center justify-center transition-all duration-300">
                      <Icon size={18} className="text-[#1f2223] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-[10px] font-bold text-[#888780] bg-[#fafaf9] px-2 py-0.5 rounded-md border border-solid border-[#e5e6e6]">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-[16px] font-extrabold text-[#1f2223] tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[12.5px] text-[#5f5e5a] font-semibold leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Sub-indicator */}
                <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold text-[#1f2223] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore Feature</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
};
