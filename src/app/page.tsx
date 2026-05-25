"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[var(--surface-page)] text-[var(--text-primary)] transition-colors duration-300 font-sans p-6 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[var(--brand-600)] opacity-[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[var(--brand-600)] opacity-[0.03] blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="w-full max-w-5xl flex items-center justify-between py-6 z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[var(--gray-900)] dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-semibold text-[14px] shadow-sm transition-transform duration-300 group-hover:scale-105">
            Ex
          </div>
          <span className="font-semibold text-[16px] tracking-tight text-[var(--text-primary)]">
            Edexia AIOS
          </span>
        </Link>
      </header>

      {/* Hero / Main Card */}
      <main className="w-full max-w-md flex flex-col items-center justify-center my-auto z-10">
        <div className="w-full p-8 md:p-10 rounded-2xl bg-[var(--surface-primary)] border border-solid border-[var(--border-subtle)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 hover:border-[var(--border-default)]">
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-50)] text-[var(--brand-600)] text-[11px] font-semibold tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-600)] animate-pulse"></span>
            Multimodal Assessment
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)] leading-tight mb-3">
            Welcome to Edexia
          </h1>
          
          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xs">
            Rubric-grounded, explainable, component-wise evaluation infrastructure for academic assessments.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-800)] text-white text-[13.5px] font-semibold transition-all duration-200 shadow-md shadow-[rgba(83,74,183,0.15)] hover:shadow-[rgba(83,74,183,0.25)] hover:translate-y-[-1px] active:translate-y-0 cursor-pointer"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>

            <Link 
              href="/login?tab=signup" 
              className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-solid border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-primary)] text-[13.5px] font-semibold transition-all duration-200 hover:translate-y-[-1px] active:translate-y-0 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 z-10">
        <p className="text-[11.5px] text-[var(--text-tertiary)] font-mono">
          Edexia AIOS &bull; &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
