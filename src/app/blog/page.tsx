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

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Feature", href: "/feature" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const blogPosts = [
  {
    slug: "announcing-our-2-3m-seed-round-transforming-ozymorlab-work-management",
    title: "Announcing our $2.3M Seed Round to Transform Academic Assessment",
    desc: "We are excited to announce our seed round from Y Combinator and leading institutional investors to accelerate our AI-based rubric grounding platform.",
    date: "May 24, 2026",
    readTime: "4 min read",
    category: "Company",
    color: "#e0ff82",
    featured: true,
  },
  {
    slug: "how-rubric-grounding-secures-grading-integrity",
    title: "How Rubric Grounding Secures Grading Integrity in Districts",
    desc: "Discover how OzymorLab matches explainable AI traces to Canvas and Blackboard rubrics to eliminate grading bias at scale.",
    date: "May 18, 2026",
    readTime: "6 min read",
    category: "Technology",
    color: "#e0f2fe",
  },
  {
    slug: "transcribing-cursive-math-derivations-ocr-breakthrough",
    title: "Transcribing Cursive Math Derivations: A Multimodal OCR Breakthrough",
    desc: "Introducing our new cursive normalizer that decodes handwritten student exam papers with explainable grading traces.",
    date: "May 12, 2026",
    readTime: "8 min read",
    category: "Engineering",
    color: "#fee2e2",
  },
  {
    slug: "ferpa-compliance-in-ai-driven-evaluation",
    title: "Navigating FERPA Compliance in AI-Driven Evaluation Workflows",
    desc: "A comprehensive guide on how OzymorLab secures student records and maintains strict compliance with Canvas/Blackboard data guidelines.",
    date: "April 28, 2026",
    readTime: "5 min read",
    category: "Compliance",
    color: "#fef3c7",
  }
];

export default function BlogPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          <Link href="/" className="lp-nav__logo"><LogoIcon /><span>OzymorLab</span></Link>
          <div className="lp-nav__links">
            {navLinks.map(l => <Link key={l.label} href={l.href} className="lp-nav__link">{l.label}</Link>)}
          </div>
          <div className="lp-nav__actions">
            <Link href="/login" className="lp-btn lp-btn--outline">Start Free Pilot</Link>
            <Link href="/login" className="lp-btn lp-btn--primary">Request Demo</Link>
          </div>
          <button className="lp-nav__burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            {navLinks.map(l => <Link key={l.label} href={l.href} className="lp-mobile-menu__link" onClick={() => setMenuOpen(false)}>{l.label}</Link>)}
            <div className="lp-mobile-menu__actions">
              <Link href="/login" className="lp-btn lp-btn--outline lp-btn--full">Start Free Pilot</Link>
              <Link href="/login" className="lp-btn lp-btn--primary lp-btn--full">Request Demo</Link>
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
            Updates on <span className="lp-highlight lp-highlight--underline">grading integrity</span> and AI evaluation.
          </h1>
        </div>
      </section>

      {/* ═══ FEATURED POST ═══ */}
      {featuredPost && (
        <section style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-blog-featured-card">
            <div className="lp-blog-featured-card__media" style={{ background: featuredPost.color }}>
              <div className="lp-blog-featured-card__logo-wrapper">
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
              <div className="lp-blog-card__media" style={{ background: post.color }}>
                <div className="lp-blog-card__logo-wrapper">
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
              <div className="lp-footer__logo"><LogoIcon /><span>OzymorLab</span></div>
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
              {["X","Li","Gh"].map(s => <a key={s} href="#" className="lp-footer__social" data-label={s} />)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
