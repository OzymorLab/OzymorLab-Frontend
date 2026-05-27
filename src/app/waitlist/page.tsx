"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import "../landing/landing.css";

/* ── Icons ── */
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1f2223" />
    <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="3" fill="#1f2223" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: "0 auto 24px" }}>
    <circle cx="32" cy="32" r="30" fill="rgba(224, 255, 130, 0.1)" stroke="#e0ff82" strokeWidth="2" />
    <path d="M22 32L29 39L43 23" stroke="#e0ff82" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Feature", href: "/feature" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

export default function WaitlistPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoHref, setLogoHref] = useState("/");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ozymorlab_token") : null;
    if (token) {
      setLogoHref("/dashboard");
    } else {
      setLogoHref("/");
    }
  }, []);

  // Form states
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState("Educator");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg("");

    try {
      // Persist waitlist registration strictly in Supabase waitlist table
      const { error } = await supabase
        .from("waitlist")
        .insert([
          {
            name: fullName,
            school_name: schoolName,
            email: email,
            phone: mobileNumber,
            role: role,
          }
        ]);

      if (error) {
        throw new Error(error.message);
      }

      setSubmitted(true);
    } catch (dbError: any) {
      console.error("Supabase Insertion Error:", dbError);
      setFeedbackMsg(
        dbError.message || "Failed to store registration in Supabase database. Please ensure the waitlist table exists."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      {/* CSS overrides for premium inputs */}
      <style dangerouslySetInnerHTML={{ __html: `
        .waitlist-card {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .waitlist-card:hover {
          border-color: #000000;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
        }
        .waitlist-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #000000;
          color: #000000;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: all 0.25s ease;
        }
        .waitlist-input:hover {
          background: #fafafa;
          border-color: #000000;
        }
        .waitlist-input:focus {
          background: #ffffff;
          border-color: #000000;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
        }
        .waitlist-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
          color: #000000;
        }
        .waitlist-select option {
          color: #000000;
          background: #ffffff;
        }
      ` }} />

      {/* ─── NAV ─── */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav__inner">
          <Link href={logoHref} className="lp-nav__logo"><LogoIcon /><span>OzymorLab</span></Link>
          <div className="lp-nav__links">
            {navLinks.map(l => <Link key={l.label} href={l.href} className="lp-nav__link">{l.label}</Link>)}
          </div>
          <div className="lp-nav__actions">
            <Link href="/waitlist" className="lp-btn lp-btn--outline">Start Free Pilot</Link>
            <Link href="/waitlist" className="lp-btn lp-btn--primary" style={{ color: "#ffffff" }}>Request Demo</Link>
          </div>
          <button className="lp-nav__burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            {navLinks.map(l => <Link key={l.label} href={l.href} className="lp-mobile-menu__link" onClick={() => setMenuOpen(false)}>{l.label}</Link>)}
            <div className="lp-mobile-menu__actions">
              <Link href="/waitlist" className="lp-btn lp-btn--outline lp-btn--full">Start Free Pilot</Link>
              <Link href="/waitlist" className="lp-btn lp-btn--primary lp-btn--full" style={{ color: "#ffffff" }}>Request Demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO & FORM CONTAINER ═══ */}
      <section style={{ padding: "160px 24px 100px", position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        
        {/* Glowup radial background elements */}
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 400, background: "radial-gradient(circle, rgba(224, 255, 130, 0.05) 0%, rgba(83, 74, 183, 0.02) 60%, transparent 100%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 640, width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="lp-blog-card__category" style={{ fontSize: 13, letterSpacing: "1.5px", textTransform: "uppercase", background: "rgba(224, 255, 130, 0.1)", color: "#e0ff82", padding: "6px 14px", borderRadius: 100, fontWeight: 600 }}>Institutional Access</span>
            <h1 className="lp-section-title" style={{ fontSize: "clamp(28px, 5vw, 42px)", marginTop: 20, marginBottom: 16, lineHeight: 1.2 }}>Join the OzymorLab Waitlist</h1>
            <p style={{ fontSize: 16, color: "var(--lp-fg-alt)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>Partner with OzymorLab to implement rubric-grounded AI evaluation, normalized handwriting OCR, and transparent moderation workflows in your institution.</p>
          </div>

          <div className="waitlist-card">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircleIcon />
                <h2 style={{ fontSize: 24, fontWeight: 600, color: "#000000", marginBottom: 12 }}>You&apos;re on the List!</h2>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.6, marginBottom: 28 }}>Thank you for requesting access. A regional coordinator will reach out to you at <strong>{email}</strong> shortly to discuss a customized free pilot program for your institution.</p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Link href="/" className="lp-btn lp-btn--primary" style={{ padding: "10px 24px", borderRadius: 8, display: "inline-flex", color: "#ffffff", background: "#000000", border: "1px solid #000000" }}>
                    Return to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000000", marginBottom: 8 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      className="waitlist-input"
                      placeholder="Dr. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000000", marginBottom: 8 }}>Institutional Role</label>
                    <select
                      className="waitlist-input waitlist-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Dean / Principal">Dean / Principal</option>
                      <option value="Department Head">Department Head</option>
                      <option value="Educator / Teacher">Educator / Teacher</option>
                      <option value="IT Director / Admin">IT Director / Admin</option>
                      <option value="Other">Other Role</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000000", marginBottom: 8 }}>School / Institution Name</label>
                  <input
                    type="text"
                    required
                    className="waitlist-input"
                    placeholder="St. Augustine University"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000000", marginBottom: 8 }}>Institutional Email</label>
                    <input
                      type="email"
                      required
                      className="waitlist-input"
                      placeholder="s.jenkins@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000000", marginBottom: 8 }}>Mobile / Contact Number</label>
                    <input
                      type="tel"
                      required
                      className="waitlist-input"
                      placeholder="+91 98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>

                {feedbackMsg && (
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13, marginBottom: 20 }}>
                    {feedbackMsg}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="lp-btn lp-btn--primary"
                    style={{ padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#ffffff", background: "#000000", border: "1px solid #000000", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "not-allowed" : "pointer" }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" />
                          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      "Submit Registration & Request Pilot"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__top">
            <div className="lp-footer__brand">
              <Link href={logoHref} className="lp-footer__logo" style={{ textDecoration: "none" }}><LogoIcon /><span>OzymorLab</span></Link>
              <p className="lp-footer__tagline">Join the 40,000+ businesses using OzymorLab, today</p>
              <div className="lp-footer__form">
                <input className="lp-footer__input" placeholder="Get updated" type="email" />
                <button className="lp-btn lp-btn--primary" type="button" style={{ color: "#ffffff" }}>Subscribe</button>
              </div>
            </div>
            <div className="lp-footer__columns">
              <div className="lp-footer__col"><h4>Product</h4><Link href="/">Homepage</Link><Link href="/feature">Feature</Link><Link href="/pricing">Pricing</Link><a href="#">Newsletter</a></div>
              <div className="lp-footer__col"><h4>Company</h4><Link href="/about">About</Link><a href="#">Careers <span className="lp-footer__hiring">We&apos;re hiring!</span></a><Link href="/contact">Contact us</Link><a href="#">Privacy</a></div>
              <div className="lp-footer__col"><h4>Resources</h4><Link href="/login">Log in</Link><a href="#">Start here</a><a href="#">Tutorials</a><Link href="/blog">Blog</Link></div>
            </div>
          </div>
          <div className="lp-footer__bottom">
            <p>&copy; {new Date().getFullYear()} OzymorLab. All rights reserved.</p>
            <div className="lp-footer__socials">
              <a href="https://www.linkedin.com/company/118164239" target="_blank" rel="noopener noreferrer" className="lp-footer__social" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="lp-footer__social" aria-label="X">
                <XIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="lp-footer__social" aria-label="Facebook">
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
