"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { 
  Play, 
  Terminal, 
  Database, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Layers, 
  Cpu, 
  Zap 
} from "lucide-react";

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "database" | "grader">("dashboard");

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden bg-[#fafaf9]">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-[#e3ff8f]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Accent Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-solid border-[#e5e6e6] shadow-sm mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c6ee3c] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b5e027]"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider text-[#5f5e5a] uppercase">
            Intelligent Laboratory Operating System
          </span>
        </div>

        {/* Epic Headline */}
        <h1 className="text-[40px] md:text-[68px] font-extrabold tracking-tight text-[#1f2223] leading-[1.05] max-w-4xl mb-6 font-sans">
          Automating Research, <br />
          <span className="text-[#5f5e5a] bg-clip-text">Orchestrating Discovery.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[15px] md:text-[18px] text-[#5f5e5a] leading-relaxed max-w-2xl mb-10 font-medium">
          OzymorLab connects your scientific pipelines, databases, and evaluation structures into a unified, high-fidelity research hub. Designed for modern laboratories and startups.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Button variant="neon" href="/login?tab=signup" className="w-full sm:w-auto px-8 py-3.5">
            Get Started Free
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" href="#about" className="w-full sm:w-auto px-8 py-3.5">
            Book a Demo
          </Button>
        </div>

        {/* Interactive Desktop Application Mockup (Remotebymodula Style) */}
        <div className="w-full max-w-5xl bg-white border border-solid border-[#e5e6e6] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.08)]">
          {/* App Header / Toolbar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-solid border-[#f2f3f3] bg-[#fafaf9]">
            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            {/* App Nav Tabs */}
            <div className="flex items-center bg-[#f2f3f3] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white text-[#1f2223] shadow-sm"
                    : "text-[#5f5e5a] hover:text-[#1f2223]"
                }`}
              >
                <Layers size={13} />
                Workspace
              </button>
              <button
                onClick={() => setActiveTab("database")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "database"
                    ? "bg-white text-[#1f2223] shadow-sm"
                    : "text-[#5f5e5a] hover:text-[#1f2223]"
                }`}
              >
                <Database size={13} />
                Live Database
              </button>
              <button
                onClick={() => setActiveTab("grader")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "grader"
                    ? "bg-white text-[#1f2223] shadow-sm"
                    : "text-[#5f5e5a] hover:text-[#1f2223]"
                }`}
              >
                <Bot size={13} />
                AI Copilot
              </button>
            </div>

            {/* Connection Status Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#e3ff8f]/20 border border-solid border-[#e3ff8f]/50 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9fcd1b] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#628509] uppercase tracking-wide">
                Live Server Connected
              </span>
            </div>
          </div>

          {/* App Body (Sleek Sidebar & Workspace Layout) */}
          <div className="flex h-[450px] text-left">
            {/* Left Sidebar */}
            <aside className="w-52 border-r border-solid border-[#f2f3f3] bg-[#fafaf9] p-4 flex flex-col justify-between hidden sm:flex">
              <div className="flex flex-col gap-6">
                {/* Section title */}
                <div>
                  <h4 className="text-[10px] font-bold text-[#888780] uppercase tracking-wider mb-2">
                    Research Modules
                  </h4>
                  <ul className="flex flex-col gap-1">
                    <li className="flex items-center justify-between px-2 py-1.5 bg-white border border-solid border-[#e5e6e6] rounded-lg text-[12px] font-bold text-[#1f2223]">
                      <span className="flex items-center gap-2">
                        <Layers size={13} className="text-[#5f5e5a]" /> Dashboard
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b5e027]"></span>
                    </li>
                    <li className="flex items-center px-2 py-1.5 hover:bg-white/50 rounded-lg text-[12px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Database size={13} /> Multimodal DB
                      </span>
                    </li>
                    <li className="flex items-center px-2 py-1.5 hover:bg-white/50 rounded-lg text-[12px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Bot size={13} /> AI Copilot
                      </span>
                    </li>
                    <li className="flex items-center px-2 py-1.5 hover:bg-white/50 rounded-lg text-[12px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Terminal size={13} /> Pipeline CLI
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Sub projects */}
                <div>
                  <h4 className="text-[10px] font-bold text-[#888780] uppercase tracking-wider mb-2">
                    Active Pipelines
                  </h4>
                  <div className="flex flex-col gap-1.5 px-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1f2223]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" /> Batch Evaluator
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1f2223]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" /> Rubric Ingester
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar footer */}
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-solid border-[#e5e6e6] shadow-sm">
                <div className="w-7 h-7 bg-[#1f2223] text-white rounded-lg flex items-center justify-center text-[10px] font-bold">
                  OL
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#1f2223] leading-none">OzymorLab</span>
                  <span className="text-[9px] text-[#888780] font-semibold">v1.2.6 &bull; Stable</span>
                </div>
              </div>
            </aside>

            {/* Main Workspace Display Content */}
            <main className="flex-1 p-6 overflow-y-auto bg-white flex flex-col justify-between">
              {activeTab === "dashboard" && (
                <div className="flex flex-col gap-5 h-full justify-between">
                  {/* Dashboard Header */}
                  <div>
                    <h3 className="text-[18px] font-extrabold text-[#1f2223] tracking-tight mb-1">
                      Laboratory Workspace Overview
                    </h3>
                    <p className="text-[12px] text-[#5f5e5a] font-medium">
                      Real-time scientific telemetry, ingestion triggers, and pipeline health checks.
                    </p>
                  </div>

                  {/* Grid Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border border-solid border-[#e5e6e6] bg-[#fafaf9] rounded-xl flex flex-col gap-1 hover:border-[#1f2223] transition-colors">
                      <span className="text-[10px] font-bold text-[#888780] uppercase tracking-wider">Active Pipelines</span>
                      <span className="text-[22px] font-extrabold text-[#1f2223]">12 / 12</span>
                      <span className="text-[9px] text-[#628509] font-bold flex items-center gap-1">
                        <Zap size={10} /> 100% execution speed
                      </span>
                    </div>

                    <div className="p-4 border border-solid border-[#e5e6e6] bg-[#fafaf9] rounded-xl flex flex-col gap-1 hover:border-[#1f2223] transition-colors">
                      <span className="text-[10px] font-bold text-[#888780] uppercase tracking-wider">Rubric Evaluation</span>
                      <span className="text-[22px] font-extrabold text-[#1f2223]">849 Papers</span>
                      <span className="text-[9px] text-[#628509] font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> 0 errors reported
                      </span>
                    </div>

                    <div className="p-4 border border-solid border-[#e5e6e6] bg-[#fafaf9] rounded-xl flex flex-col gap-1 hover:border-[#1f2223] transition-colors">
                      <span className="text-[10px] font-bold text-[#888780] uppercase tracking-wider">Copilot Response</span>
                      <span className="text-[22px] font-extrabold text-[#1f2223]">45ms</span>
                      <span className="text-[9px] text-[#628509] font-bold flex items-center gap-1">
                        <Cpu size={10} /> High efficiency
                      </span>
                    </div>
                  </div>

                  {/* Bottom Pipeline Progress View */}
                  <div className="p-4 border border-solid border-[#e5e6e6] rounded-xl bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#1f2223]">Multimodal Paper Processing Pipeline</span>
                      <span className="text-[11px] font-bold text-[#5f5e5a]">Active Ingestion</span>
                    </div>
                    <div className="w-full bg-[#f2f3f3] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#e3ff8f] h-full w-[78%] rounded-full border-r border-[#9fcd1b]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5f5e5a] font-semibold">
                      <span>AnalyzingTanugiri.pdf</span>
                      <span>78% &bull; Phase 3: Rubric Decomposition</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "database" && (
                <div className="flex flex-col gap-4 h-full justify-between">
                  <div>
                    <h3 className="text-[18px] font-extrabold text-[#1f2223] tracking-tight mb-1">
                      Multimodal Document Database
                    </h3>
                    <p className="text-[12px] text-[#5f5e5a] font-medium">
                      Directly query and preview ingested scientific papers, exam papers, and rubrics.
                    </p>
                  </div>

                  {/* Table mock */}
                  <div className="border border-solid border-[#e5e6e6] rounded-xl overflow-hidden text-[11px] font-medium bg-[#fafaf9]">
                    <div className="grid grid-cols-4 gap-2 bg-[#f2f3f3] px-3 py-2 text-[#1f2223] font-bold border-b border-[#e5e6e6]">
                      <span>Document ID</span>
                      <span>File Name</span>
                      <span>Rubric Type</span>
                      <span>Grading Status</span>
                    </div>
                    <div className="divide-y divide-solid divide-[#e5e6e6] bg-white">
                      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[#1f2223] items-center">
                        <span className="font-mono">#028-Tanugiri</span>
                        <span>Tanu_Giri.pdf</span>
                        <span>Midterm Math</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#e3ff8f] border border-solid border-[#cbeb59] text-[9px] font-bold text-center w-max">GRADED</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[#1f2223] items-center">
                        <span className="font-mono">#027-Mnglam</span>
                        <span>Mnglam.pdf</span>
                        <span>Rubric Bio v2</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#e3ff8f] border border-solid border-[#cbeb59] text-[9px] font-bold text-center w-max">GRADED</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[#1f2223] items-center">
                        <span className="font-mono">#026-Atulita</span>
                        <span>Atulita.pdf</span>
                        <span>Standard Physics</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#f2f3f3] border border-solid border-[#e5e6e6] text-[9px] font-bold text-center w-max">IN QUEUE</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#888780]">Showing 3 of 849 active records</span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-solid border-[#e5e6e6] rounded-lg bg-white hover:bg-[#fafaf9] transition-colors cursor-pointer text-[#1f2223]">
                      Access Full DB <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "grader" && (
                <div className="flex flex-col gap-4 h-full justify-between">
                  <div>
                    <h3 className="text-[18px] font-extrabold text-[#1f2223] tracking-tight mb-1">
                      Ozymor AI Assistant
                    </h3>
                    <p className="text-[12px] text-[#5f5e5a] font-medium">
                      Real-time interactive Copilot chat for automated query execution and reporting.
                    </p>
                  </div>

                  {/* Chat flow */}
                  <div className="flex-1 border border-solid border-[#e5e6e6] rounded-xl p-3 bg-[#fafaf9] flex flex-col gap-3 overflow-y-auto text-[11.5px] max-h-[220px]">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#1f2223] text-white flex items-center justify-center font-bold text-[9px]">U</div>
                      <div className="flex-1 bg-white border border-solid border-[#e5e6e6] rounded-xl p-2.5 text-[#1f2223] font-semibold">
                        Query the status of Tanu Giri's grading report and export the evaluation.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#e3ff8f] text-[#1f2223] border border-solid border-[#cbeb59] flex items-center justify-center font-bold text-[9px]">🤖</div>
                      <div className="flex-1 bg-white border border-solid border-[#e5e6e6] rounded-xl p-2.5 text-[#1f2223] font-semibold flex flex-col gap-2">
                        <span>Report found in multimodal database: <strong>Tanu_Giri.pdf</strong> has been successfully graded with <strong>98/100 marks</strong>.</span>
                        <div className="flex gap-1.5 mt-1">
                          <button className="px-2 py-1 bg-[#1f2223] hover:bg-[#2e3133] text-white rounded-md text-[9px] font-bold cursor-pointer">
                            Download PDF
                          </button>
                          <button className="px-2 py-1 border border-solid border-[#e5e6e6] hover:bg-[#fafaf9] rounded-md text-[9px] font-bold cursor-pointer text-[#1f2223]">
                            Open Trace log
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search input mock */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask Ozymor Assistant to automate a workflow..."
                      className="w-full pl-3 pr-20 py-2.5 border border-solid border-[#e5e6e6] rounded-xl text-[12px] bg-white text-[#1f2223] placeholder-[#888780] font-semibold focus:outline-none focus:border-[#1f2223]"
                      disabled
                    />
                    <button className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#e3ff8f] text-[#1f2223] border border-solid border-[#cbeb59] rounded-lg text-[9px] font-bold pointer-events-none">
                      Execute
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};
