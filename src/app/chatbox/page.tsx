"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sun, 
  Moon, 
  ArrowLeft, 
  CheckCircle,
  FileText,
  Sparkles,
  Info
} from "lucide-react";
import EssayChatbox from "../components/EssayChatbox";

export default function ChatboxDemoPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [submission, setSubmission] = useState<{
    essay?: string;
    prompt?: string;
    type: "type" | "phone" | "laptop";
    files?: { name: string; size: number }[];
    timestamp: string;
  } | null>(null);

  // Sync theme from documentElement on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                  document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    
    // Apply classes to root element
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  const handleChatboxSubmit = (data: {
    essay: string;
    prompt: string;
    type: "type" | "phone" | "laptop";
    files?: File[];
  }) => {
    setSubmission({
      essay: data.essay,
      prompt: data.prompt,
      type: data.type,
      files: data.files?.map(f => ({ name: f.name, size: f.size })),
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* GLOW DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[var(--brand-600)]/5 dark:bg-[var(--brand-600)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[var(--color-info-border)]/5 dark:bg-[var(--color-info-border)]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="relative flex items-center justify-between px-6 py-4 border-b border-solid border-[var(--border-subtle)] bg-[var(--surface-primary)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-solid border-[var(--border-subtle)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Back to Landing Page"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[var(--brand-600)] uppercase">
              Component Lab
            </span>
            <h1 className="text-[16px] font-bold leading-tight">
              Essay Feedback Chatbox
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Active Theme Badge */}
          <span className="hidden sm:inline-block text-[11px] px-2.5 py-1 rounded-full font-medium bg-[var(--surface-tertiary)] text-[var(--text-secondary)] border border-solid border-[var(--border-subtle)]">
            Active Theme: <span className="capitalize text-[var(--text-primary)] font-semibold">{theme}</span>
          </span>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-solid border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-primary)] transition-all cursor-pointer shadow-3xs"
            title={`Toggle to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative max-w-5xl mx-auto px-6 py-10 z-10 flex flex-col gap-8">
        
        {/* DEMO HEADLINE */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-50)] text-[var(--brand-600)] text-[12px] font-medium mx-auto border border-solid border-[var(--brand-100)]">
            <Sparkles size={13} />
            <span>Interactive Demo View</span>
          </div>
          <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
            Type, Scan, and Submit
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Test the component below in both Light and Dark themes. Tap "Try a sample essay" to see it in action, or upload mock files in the scanner tabs.
          </p>
        </div>

        {/* CHATBOX RENDER */}
        <div className="w-full py-4 animate-fade-in">
          <EssayChatbox onSubmit={handleChatboxSubmit} />
        </div>

        {/* OUTPUT LOGS GRID */}
        {submission && (
          <div className="w-full max-w-4xl mx-auto rounded-2xl border border-solid border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm flex flex-col gap-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-solid border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-[var(--color-success-border)]" />
                <h3 className="text-[14px] font-bold text-[var(--text-primary)]">
                  Submission Payload Captured
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded-md">
                {submission.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  Input Mode
                </span>
                <p className="mt-1 font-semibold text-[var(--brand-600)] capitalize">
                  {submission.type} {submission.type === "type" ? "✏️" : "📁"}
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  Essay Question / Prompt
                </span>
                <p className="mt-1 font-medium text-[var(--text-primary)] italic">
                  "{submission.prompt || "No prompt provided"}"
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  Target Details
                </span>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {submission.type === "type" ? (
                    <span>
                      Words: <strong className="text-[var(--text-primary)]">{submission.essay?.trim().split(/\s+/).length}</strong>, Characters: {submission.essay?.length}
                    </span>
                  ) : (
                    <span>
                      Attached files: <strong className="text-[var(--text-primary)]">{submission.files?.length}</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {submission.type === "type" ? (
              <div className="mt-2 bg-[var(--surface-secondary)] p-4 rounded-xl border border-solid border-[var(--border-subtle)] max-h-[150px] overflow-y-auto">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-1 block">
                  Essay Text
                </span>
                <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                  {submission.essay}
                </p>
              </div>
            ) : (
              <div className="mt-2 bg-[var(--surface-secondary)] p-4 rounded-xl border border-solid border-[var(--border-subtle)] flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-1 block">
                  Attached Files List
                </span>
                {submission.files?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12.5px] text-[var(--text-secondary)] font-medium">
                    <FileText size={14} className="text-[var(--brand-600)]" />
                    <span>{f.name}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      ({(f.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SPECIFICATIONS & THEME GUIDE */}
        <section className="w-full max-w-4xl mx-auto rounded-2xl border border-solid border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-solid border-[var(--border-subtle)]">
            <Info size={16} className="text-[var(--brand-600)]" />
            <h3 className="text-[14px] font-bold text-[var(--text-primary)]">
              Component Engineering Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[var(--text-primary)]">
                Dual-Theme Integration Design
              </h4>
              <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                The component references semantic CSS tokens defined in `globals.css` natively. When toggling dark mode, the container seamlessly transitions without code changes:
              </p>
              <div className="flex flex-col gap-1.5 font-mono text-[11px] bg-[var(--surface-secondary)] p-3.5 rounded-xl border border-solid border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <div className="flex justify-between border-b border-solid border-[var(--border-subtle)]/50 pb-1">
                  <span>UI Element</span>
                  <span className="font-semibold">Light Mode / Dark Mode</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Background</span>
                  <span className="text-[var(--text-primary)]">bg-[var(--surface-primary)]</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Text Color</span>
                  <span className="text-[var(--text-primary)]">text-[var(--text-primary)]</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Tab Borders</span>
                  <span className="text-[var(--text-primary)]">border-[var(--border-subtle)]</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Primary CTA</span>
                  <span className="text-[var(--text-primary)]">bg-[var(--brand-600)]</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[var(--text-primary)]">
                Feature &amp; Interaction Highlights
              </h4>
              <ul className="list-disc list-inside flex flex-col gap-2 text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Dynamic Word Counter:</strong> Scans string inputs using high-fidelity regex splitting for precise word counts in real time.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">State-Driven CTR Actions:</strong> The "Get expert feedback" CTA stays disabled if no input is present, with smooth opacity and cursor changes.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Interactive Drag-and-Drop:</strong> Highlights uploader sections dynamically when files hover over uploader views.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Responsive Pillars:</strong> Auto-stacks navigation arrays seamlessly on smaller mobile layouts.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-8 text-center text-[12px] text-[var(--text-tertiary)] border-t border-solid border-[var(--border-subtle)] bg-[var(--surface-primary)]">
        <p>Essay Feedback Chatbox · Built with React 19, TypeScript &amp; Tailwind CSS v4</p>
        <p className="mt-1 font-mono opacity-50">Edexia AIOS Design System</p>
      </footer>
    </div>
  );
}
