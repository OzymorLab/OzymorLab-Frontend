"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../landing/landing.css";

/* ── Icons ── */
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1f2223" />
    <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="3" fill="#1f2223" />
  </svg>
);
const ArrowRight = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
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

const blogPosts = [
  {
    slug: "the-pedagogy-of-rubric-grounded-grading-why-subjective-evaluations-demand-explainable-ai",
    title: "The Pedagogy of Rubric-Grounded Grading: Why Subjective Evaluations Demand Explainable AI",
    desc: "Discover why raw LLM outputs fail to grade subjective student scripts fairly, and how grounding AI scores in precise rubrics restores grading integrity in modern education.",
    date: "May 24, 2026",
    readTime: "12 min read",
    category: "Pedagogy",
    color: "#e0ff82",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop",
  },
  {
    slug: "overcoming-handwriting-variability-in-digital-evaluations-multimodal-ocr-advances",
    title: "Overcoming Handwriting Variability in Digital Evaluations: Multimodal OCR Advances",
    desc: "How next-generation vision models normalize handwritten cursive answers, algebraic formulations, and complex derivations for fair, automated moderation.",
    date: "May 18, 2026",
    readTime: "9 min read",
    category: "Engineering",
    color: "#e0f2fe",
    imageUrl: "https://images.unsplash.com/photo-1453733190148-c44698c26578?q=80&w=600&auto=format&fit=crop",
  },
  {
    slug: "bridging-the-trust-gap-how-explainable-evaluation-traces-empower-teachers",
    title: "Bridging the Trust Gap: How Explainable Evaluation Traces Empower Teachers",
    desc: "AI in grading should support teachers, not replace them. Here is how deep audit trails and transparent reasoning logs allow educators to maintain absolute control.",
    date: "May 12, 2026",
    readTime: "10 min read",
    category: "Product Strategy",
    color: "#fee2e2",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
  }
];

export default function BlogPage() {
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

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const featuredPost = blogPosts.find(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);

  return (
    <div className="lp-root">
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

      {/* ═══ BLOG HERO ═══ */}
      <section className="lp-hero" style={{ paddingBottom: 40 }}>
        <div className="lp-hero__dots" />
        <div className="lp-hero__content">
          <div className="lp-hero__badge">
            <span className="lp-hero__badge-tag">Blog</span>
            <span>Latest news and engineering updates from OzymorLab</span>
          </div>
          <h1 className="lp-hero__title" style={{ fontSize: "clamp(36px, 5vw, 56px)", maxWidth: 800 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <LogoIcon />
              <span>Updates on <span className="lp-highlight lp-highlight--underline">grading integrity</span> and AI evaluation.</span>
            </span>
          </h1>
        </div>
      </section>

      {/* ═══ FEATURED POST ═══ */}
      {featuredPost && (
        <section style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-blog-featured-card">
            <div className="lp-blog-featured-card__media" style={{ backgroundImage: `url(${featuredPost.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
              <div className="lp-blog-featured-card__logo-wrapper" style={{ position: "absolute", bottom: 20, left: 20 }}>
                <LogoIcon />
                <span>OzymorLab News</span>
              </div>
            </div>
            <div className="lp-blog-featured-card__info">
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <span className="lp-blog-card__category">{featuredPost.category}</span>
                <span className="lp-blog-card__dot" />
                <span className="lp-blog-card__date">{featuredPost.date}</span>
              </div>
              <h2 className="lp-blog-featured-card__title">{featuredPost.title}</h2>
              <p className="lp-blog-featured-card__desc">{featuredPost.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 24 }}>
                <span className="lp-blog-card__read-time">{featuredPost.readTime}</span>
                <Link href={`/blog/${featuredPost.slug}`} className="lp-btn lp-btn--primary lp-btn--icon">Read Article <ArrowRight /></Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ BLOG GRID ═══ */}
      <section style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="lp-section-title" style={{ marginBottom: 40 }}>All Articles</h2>
        <div className="lp-blog-grid">
          {regularPosts.map((post, i) => (
            <article key={i} className="lp-blog-card">
              <div className="lp-blog-card__media" style={{ backgroundImage: `url(${post.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                <div className="lp-blog-card__logo-wrapper" style={{ position: "absolute", bottom: 12, right: 12 }}>
                  <LogoIcon />
                </div>
              </div>
              <div className="lp-blog-card__content">
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <span className="lp-blog-card__category">{post.category}</span>
                  <span className="lp-blog-card__dot" />
                  <span className="lp-blog-card__date">{post.date}</span>
                </div>
                <h3 className="lp-blog-card__title">{post.title}</h3>
                <p className="lp-blog-card__desc">{post.desc}</p>
                <div className="lp-blog-card__footer">
                  <span className="lp-blog-card__read-time">{post.readTime}</span>
                  <Link href={`/blog/${post.slug}`} className="lp-blog-card__link">Read Article <ArrowRight /></Link>
                </div>
              </div>
            </article>
          ))}
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
                <button className="lp-btn lp-btn--primary" type="button">Subscribe</button>
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
