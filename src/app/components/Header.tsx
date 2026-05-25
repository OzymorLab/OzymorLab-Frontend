"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./Button";
import { Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-solid ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-[#e5e6e6] py-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo and Name */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="OzymorLab Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-[18px] tracking-tight text-[#1f2223] font-sans">
            OzymorLab
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-[13px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-[13px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-[13px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" href="/login">
            Sign In
          </Button>
          <Button variant="neon" href="/login?tab=signup">
            Create Account
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-[#1f2223] hover:bg-[#f2f3f3] rounded-lg transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-solid border-[#e5e6e6] p-6 shadow-xl flex flex-col gap-5 animate-slide-down">
          <nav className="flex flex-col gap-4">
            <Link
              href="#features"
              className="text-[14px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-[14px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-[14px] font-semibold text-[#5f5e5a] hover:text-[#1f2223] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
          <div className="h-[1px] bg-[#e5e6e6]" />
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              href="/login"
              className="w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Button>
            <Button
              variant="neon"
              href="/login?tab=signup"
              className="w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Account
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
