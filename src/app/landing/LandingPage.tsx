"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./landing.css";

/* ── Icons ── */
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1f2223" />
    <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="3" fill="#1f2223" />
  </svg>
);
const ArrowRight = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l3 3 5-5" /></svg>;
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, className: visible ? "lp-reveal lp-reveal--visible" : "lp-reveal" };
}

/* ── Data ── */
const navLinks = [
  { label: "About", href: "/about" },
  { label: "Feature", href: "/feature" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const teamMembers = [
  { name: "David Wilson", role: "Founder & Director", initials: "DW", color: "#4f46e5" },
  { name: "Jessica Hayes", role: "Co-founder & Provost", initials: "JH", color: "#0891b2" },
  { name: "Constanza Perez", role: "Head of Evaluation Systems", initials: "CP", color: "#059669" },
  { name: "Meera Desai", role: "Head of Multimodal AI", initials: "MD", color: "#d97706" },
  { name: "Benjamin Weber", role: "Cursive OCR Architect", initials: "BW", color: "#dc2626" },
  { name: "Jacob Jones", role: "UI/UX Research Lead", initials: "JJ", color: "#7c3aed" },
  { name: "Maria Rodrigues", role: "Learning Analytics Lead", initials: "MR", color: "#0d9488" },
];

const featureCards = [
  { title: "Rubric Ingestion", desc: "See all the steps you need to configure rubrics, evaluate papers and publish grades." },
  { title: "AI Rubric Customization", desc: "Choose from pre-built evaluation templates, or configure custom grading criteria." },
  { title: "Generate Evaluation Logs", desc: "Drive focus and progress with real-time explainable traces." },
];

const trustedLogos = ["bluebird", "Galaxy", "berry", "Chameleon", "SHIP4450"];

const empowerCards = [
  { title: "Rubric Grounding", desc: "Align AI score calculations with precise school rubric constraints." },
  { title: "Exam Script Ingestion", desc: "Add, remove, or adjust team members\u2019 roles and perks." },
  { title: "Explainable Moderation", desc: "Audit individual score sheets and trace grading criteria details." },
  { title: "LMS Integration", desc: "Seamlessly publish final computed metrics to Canvas or Blackboard." },
];

const elevatingCards = [
  { title: "Curated Grading Criteria", desc: "Standardize scoring across examiners with rigorous rubric controls." },
  { title: "Handwriting OCR Support", desc: "Transcribe cursive handwriting and algebra with deep structural parsing." },
  { title: "Real-time Score Analytics", desc: "Monitor score distributions, passing thresholds, and grading metrics." },
  { title: "Verification & Audit", desc: "Track component-wise feedback log to secure complete FERPA compliance." },
];

const featureDetailRoles = [
  { role: "Senior Examiner", items: ["Rubric Orientation", "Evaluation Pipeline Setup"] },
  { role: "Lead Senior Examiner", items: ["LMS Ingestion Walkthrough", "Moderator Calibration Session"] },
  { role: "Academic Controller", items: ["Grading Integrity Program", "Multimodal AI Optimization"] },
];

const testimonials = [
  { name: "Dr. Danielle Rodrigues", role: "Vice Chancellor @Crown Board", quote: "OzymorLab transformed our grading pipeline — explainable traces changed everything." },
  { name: "Prof. Dennis Howell", role: "Dean of Evaluation @Crown Board", quote: "The rubric grounding feature ensures consistent, bias-free evaluation at scale." },
  { name: "Dr. Camilla Queiroz", role: "LMS Integration Lead @Crown Board", quote: "Seamless Canvas & Blackboard integration saved us months of manual work." },
];

const pricingPlans = [
  { tier: "Startups", desc: "Learn about OzymorLab system and support.", cta: "Start Pilot" },
  { tier: "Mid-size", desc: "See our institutional pilot pricing and request district quotes.", cta: "Start Pilot", featured: true },
  { tier: "Enterprise", desc: "OzymorLab is the leader in explaining student grades.", cta: "Contact Sales" },
];

const integrationChips = ["Handwriting Normalization", "Multimodal OCR Parse", "AI Rubric Customization", "Onsite", "Real-time updates"];

/* ══════════════════════════════════════════ */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Scroll to section based on route
  useEffect(() => {
    const map: Record<string, string> = { "/pricing": "pricing", "/feature": "features", "/contact": "contact", "/about": "about" };
    const id = map[pathname];
    if (id) {
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    } else if (pathname === "/" || pathname === "/blog") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  const r1=useReveal(),r2=useReveal(),r3=useReveal(),r4=useReveal(),r5=useReveal(),r6=useReveal(),r7=useReveal(),r8=useReveal(),r9=useReveal(),r10=useReveal(),r11=useReveal();

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

      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="lp-hero">
        <div className="lp-hero__dots" />
        <div className="lp-hero__content">
          <div className="lp-hero__badge lp-anim-fade" style={{ animationDelay: "0.2s" }}>
            <span className="lp-hero__badge-tag">New</span>
            <span>Announcing our YC Winter &apos;22 Rubric-Grounding Engine</span>
          </div>
          <h1 className="lp-hero__title lp-anim-fade" style={{ animationDelay: "0.3s" }}>
            <span className="lp-highlight lp-highlight--underline">Say</span> hello to your academic assessment portal
          </h1>
          <p className="lp-hero__subtitle lp-anim-fade" style={{ animationDelay: "0.4s" }}>
            An academic assessment portal that works the way you do.
          </p>
          <div className="lp-hero__ctas lp-anim-fade" style={{ animationDelay: "0.5s" }}>
            <Link href="/pricing" className="lp-btn lp-btn--outline lp-btn--lg">Start Free Pilot</Link>
            <Link href="/contact" className="lp-btn lp-btn--primary lp-btn--lg">Request Demo</Link>
          </div>
          {/* Hero UI Mock */}
          <div className="lp-hero__ui lp-anim-fade" style={{ animationDelay: "0.6s" }}>
            <div className="lp-hero-ui">
              <div className="lp-hero-ui__sidebar">
                <div className="lp-hero-ui__sidebar-logo"><LogoIcon /></div>
                {[0,1,2,3,4].map(i => <div key={i} className={`lp-hero-ui__sidebar-item ${i===1?"lp-hero-ui__sidebar-item--active":""}`} />)}
              </div>
              <div className="lp-hero-ui__main">
                <div className="lp-hero-ui__topbar">
                  <span className="lp-hero-ui__greeting">Good morning, Dean!</span>
                </div>
                <div className="lp-hero-ui__content">
                  <div className="lp-hero-ui__status-card">
                    <span className="lp-hero-ui__status-label">Status</span>
                    <span className="lp-hero-ui__status-badge">Pending</span>
                  </div>
                  <div className="lp-hero-ui__team-list">
                    {teamMembers.slice(0, 5).map((m, i) => (
                      <div key={i} className="lp-hero-ui__team-row">
                        <div className="lp-hero-ui__avatar" style={{ background: m.color }}>{m.initials}</div>
                        <div className="lp-hero-ui__team-info">
                          <span className="lp-hero-ui__team-name">{m.name}</span>
                          <span className="lp-hero-ui__team-role">{m.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="lp-trust" id="about" ref={r1.ref}>
        <div className={r1.className}>
          <p className="lp-trust__label">1,200+ leading academic boards trust OzymorLab</p>
          <div className="lp-trust__logos">
            {trustedLogos.map(n => <div key={n} className="lp-trust__logo">{n}</div>)}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: FEATURES SMALL ═══ */}
      <section className="lp-features-small" id="features" ref={r2.ref}>
        <div className={r2.className}>
          <div className="lp-features-small__header">
            <h2 className="lp-section-title">
              Everything you need, all in <span className="lp-highlight lp-highlight--box">one place</span>
            </h2>
            <Link href="/contact" className="lp-btn lp-btn--primary lp-btn--icon">Request Demo <ArrowRight /></Link>
          </div>
          <div className="lp-features-small__grid">
            {featureCards.map((f, i) => (
              <div key={i} className="lp-feature-sm-card">
                <h3 className="lp-feature-sm-card__title">{f.title}</h3>
                <p className="lp-feature-sm-card__desc">{f.desc}</p>
                <a href="#" className="lp-feature-sm-card__link">Learn more <ArrowRight /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: FEATURES BIG (Empowering) ═══ */}
      <section className="lp-empower" ref={r3.ref}>
        <div className={r3.className}>
          <div className="lp-empower__header">
            <h2 className="lp-section-title">Empowering your evaluation pipeline</h2>
          </div>
          <div className="lp-empower__grid">
            {empowerCards.map((c, i) => (
              <div key={i} className="lp-empower__card">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3b: ELEVATING STANDARDS ═══ */}
      <section className="lp-elevating" ref={r4.ref}>
        <div className={r4.className}>
          <div className="lp-elevating__header">
            <h2 className="lp-section-title">Elevating standards</h2>
          </div>
          <div className="lp-elevating__grid">
            {elevatingCards.map((c, i) => (
              <div key={i} className="lp-elevating__card">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: INTEGRATIONS ═══ */}
      <section className="lp-integrations" ref={r5.ref}>
        <div className={r5.className}>
          <h2 className="lp-section-title" style={{ textAlign: "center" }}>
            Less paperwork, more <span className="lp-highlight lp-highlight--underline">people work</span>
          </h2>
          <p className="lp-section-subtitle" style={{ textAlign: "center", margin: "0 auto" }}>
            We integrate seamlessly with the academic tools you already use. Work smarter with OzymorLab.
          </p>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/feature" className="lp-btn lp-btn--outline lp-btn--icon">See LMS integrations <ArrowRight /></Link>
          </div>
          <div className="lp-integrations__chips">
            {integrationChips.map(n => <div key={n} className="lp-integration-chip">{n}</div>)}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: FEATURES DETAIL ═══ */}
      <section className="lp-features-detail" ref={r6.ref}>
        <div className={r6.className}>
          <h2 className="lp-section-title" style={{ textAlign: "center" }}>
            Make <span className="lp-highlight lp-highlight--box">every grade</span> count
          </h2>
          <p className="lp-section-subtitle" style={{ textAlign: "center", margin: "0 auto 48px" }}>
            Focus on education — let OzymorLab handle high-volume grading details while you deliver explainable scores.
          </p>
          {/* Cursive Recognition Card */}
          <div className="lp-detail-cards">
            <div className="lp-detail-card">
              <div className="lp-detail-card__badge">Scanned Script Decoded</div>
              <h3>Cursive Recognition</h3>
              <p className="lp-detail-card__ai">AI — Analyse experience in &#123;Area&#125;</p>
              <div className="lp-detail-card__result">
                <span className="lp-detail-card__score">Question 3: Cursive math derivation is correct</span>
                <span className="lp-detail-card__points">Score: 5/5 Points</span>
              </div>
            </div>
            <div className="lp-detail-card">
              <div className="lp-detail-card__badge">Rubric Match</div>
              <h3>Explainable Trace</h3>
              <p>Student strictly followed the algebra method</p>
              <div className="lp-detail-card__grounded">
                Grounded in <strong>Marking Scheme</strong>
              </div>
            </div>
          </div>
          {/* Role-based onboarding checklist */}
          <div className="lp-onboarding">
            {featureDetailRoles.map((r, i) => (
              <div key={i} className="lp-onboarding__role">
                <h4>{r.role}</h4>
                <ul>
                  {r.items.map((item, j) => (
                    <li key={j}><CheckIcon /> {item} {j === r.items.length - 1 && i > 0 && <span className="lp-tag-optional">Optional</span>}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: PRICING / LINKS ═══ */}
      <section className="lp-pricing" id="pricing" ref={r7.ref}>
        <div className={r7.className}>
          <h2 className="lp-section-title" style={{ textAlign: "center" }}>Pilot plans for <span className="lp-highlight lp-highlight--box">Anytime</span></h2>
          <p className="lp-section-subtitle" style={{ textAlign: "center", margin: "0 auto" }}>We secure grading integrity.</p>
          <div className="lp-pricing__grid">
            {pricingPlans.map((p, i) => (
              <div key={i} className={`lp-pricing-card ${p.featured ? "lp-pricing-card--featured" : ""}`}>
                <h3 className="lp-pricing-card__tier">{p.tier}</h3>
                <p className="lp-pricing-card__desc">{p.desc}</p>
                <Link href="/login" className={`lp-btn ${p.featured ? "lp-btn--accent" : "lp-btn--outline"} lp-btn--full`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7: TESTIMONIALS ═══ */}
      <section className="lp-testimonials" ref={r8.ref}>
        <div className={r8.className}>
          <div className="lp-testimonials__grid">
            {testimonials.map((t, i) => (
              <div key={i} className="lp-testimonial-card">
                <p className="lp-testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="lp-testimonial-card__author">
                  <div className="lp-testimonial-card__avatar">{t.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div className="lp-testimonial-card__name">{t.name}</div>
                    <div className="lp-testimonial-card__role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7b: LINKS / ONBOARD BANNER ═══ */}
      <section className="lp-links-banner" ref={r9.ref}>
        <div className={r9.className}>
          <div className="lp-links-banner__content">
            <p className="lp-links-banner__text">Audit even the most complex mathematical calculus or cursive answers.</p>
            <div className="lp-links-banner__mini-cards">
              <div className="lp-mini-card"><div className="lp-mini-card__avatar" style={{background:"#4f46e5"}}>E</div><div><strong>Emma</strong><span>Onboard</span></div></div>
              <div className="lp-mini-card"><div className="lp-mini-card__avatar" style={{background:"#0891b2"}}>J</div><div><strong>Jonathan</strong><span>Pilot Starts Tomorrow</span></div></div>
            </div>
            <div className="lp-links-banner__badges">
              <div className="lp-data-badge">Data that scale securely</div>
              <p>Get real-time, explainable logs that scale securely. Visualize, moderate, and publish grades faster than ever.</p>
            </div>
            <div className="lp-links-banner__lms">
              <div className="lp-lms-badge">Pick an LMS</div>
              <p>Tailored for Canvas & Blackboard</p>
              <span>We tailor every aspect of our system to support FERPA & SOC-2 compliance.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: BOTTOM CTA / BANNER ═══ */}
      <section className="lp-bottom-cta" id="contact" ref={r10.ref}>
        <div className={r10.className}>
          <div className="lp-bottom-cta__inner">
            <h2>Start Your Institutional Pilot Today.</h2>
            <p>Get real-time, explainable logs that scale securely. Visualize, moderate, and publish grades faster than ever.</p>
            <div className="lp-bottom-cta__row">
              <Link href="/login" className="lp-btn lp-btn--accent lp-btn--lg">Grade with OzymorLab <ArrowRight /></Link>
            </div>
            <div className="lp-bottom-cta__badges">
              {["FERPA Ready", "SOC-2 Compliant", "Tailored for Canvas & Blackboard"].map(b =>
                <span key={b} className="lp-bottom-cta__badge"><CheckIcon /> {b}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer" ref={r11.ref}>
        <div className={r11.className}>
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
        </div>
      </footer>
    </div>
  );
}
