"use client";

import React from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Features } from "./components/Features";
import { Pricing } from "./components/Pricing";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1f2223] font-sans antialiased selection:bg-[#e3ff8f] selection:text-[#1f2223] scroll-smooth">
      {/* Sticky Premium Navbar */}
      <Header />

      {/* Main Sections */}
      <main>
        {/* Hero Section & Dashboard Mockup */}
        <Hero />

        {/* Seamless Infinite Marquee Banner */}
        <Marquee />

        {/* Premium Grid Features Section */}
        <Features />

        {/* Tiered Comparison Pricing Plans */}
        <Pricing />

        {/* High-Impact CTA Banner */}
        <CTA />
      </main>

      {/* Structured Multi-Column Footer */}
      <Footer />
    </div>
  );
}

