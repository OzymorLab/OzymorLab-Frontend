"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-white border-t border-solid border-[#e5e6e6] pt-16 pb-12 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Main Footer Links & Branding */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group w-max">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="OzymorLab Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-[16px] tracking-tight text-[#1f2223]">
                OzymorLab
              </span>
            </Link>
            <p className="text-[12px] text-[#5f5e5a] font-semibold leading-relaxed max-w-[220px]">
              Connecting scientific workflows, multimodal records, and intelligent rubrics into a unified discovery operating system.
            </p>
          </div>

          {/* Links Column 1: Platform */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-[11px] font-bold text-[#888780] uppercase tracking-widest">Platform</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="#features" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Sign In Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-[11px] font-bold text-[#888780] uppercase tracking-widest">Resources</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/docs" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Developer Docs
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  API Credentials
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  System Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Trust & Info */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-[11px] font-bold text-[#888780] uppercase tracking-widest">Security & Trust</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/privacy" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Privacy Protocols
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-[12.5px] font-bold text-[#5f5e5a] hover:text-[#1f2223] transition-colors">
                  Compliance Sandbox
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator Divider */}
        <div className="h-[1px] bg-[#f2f3f3]" />

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[11.5px] text-[#888780] font-mono">
            OzymorLab &bull; &copy; {new Date().getFullYear()} &bull; All Rights Reserved.
          </p>

          {/* Socials & Status */}
          <div className="flex items-center gap-4">
            <Link href="https://github.com" target="_blank" className="text-[#888780] hover:text-[#1f2223] transition-colors" aria-label="GitHub">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
            </Link>
            <Link href="https://twitter.com" target="_blank" className="text-[#888780] hover:text-[#1f2223] transition-colors" aria-label="Twitter">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="text-[#888780] hover:text-[#1f2223] transition-colors" aria-label="LinkedIn">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </Link>
            <div className="h-4 w-[1px] bg-[#e5e6e6]" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f2f3f3] border border-solid border-[#e5e6e6] rounded-lg">
              <Terminal size={11} className="text-[#5f5e5a]" />
              <span className="text-[9.5px] font-bold text-[#5f5e5a] uppercase font-mono">
                Sys.ok
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
