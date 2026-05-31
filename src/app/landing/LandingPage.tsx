"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./landing.css";
import TeacherSubmissionPanel from "./TeacherSubmissionPanel";
import StudentSubmissionPanel from "./StudentSubmissionPanel";
import SchoolAdminPage from "./SchoolAdminPage";

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
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
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
  { name: "Rajesh Sharma", role: "Founder & Director", initials: "RS", color: "#4f46e5" },
  { name: "Priya Patel", role: "Co-founder & Provost", initials: "PP", color: "#0891b2" },
  { name: "Asif Khan", role: "Head of Evaluation Systems", initials: "AK", color: "#059669" },
  { name: "Meera Desai", role: "Head of Multimodal AI", initials: "MD", color: "#d97706" },
  { name: "Vikram Singh", role: "Cursive OCR Architect", initials: "VS", color: "#dc2626" },
  { name: "Sarah Varghese", role: "UI/UX Research Lead", initials: "SV", color: "#7c3aed" },
  { name: "Adnan Naqvi", role: "Learning Analytics Lead", initials: "AN", color: "#0d9488" },
];

const featureCards = [
  { title: "Rubric Ingestion", desc: "See all the steps you need to configure rubrics, evaluate papers and publish grades." },
  { title: "AI Rubric Customization", desc: "Choose from pre-built evaluation templates, or configure custom grading criteria." },
  { title: "Generate Evaluation Logs", desc: "Drive focus and progress with real-time explainable traces." },
];

const trustedSchools = [
  "D P S",
  "V M School",
  "N P S",
  "T D School",
  "S School",
  "X Academy",
  "DAV School",
  "K V",
  "R I School"
];

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

const faqData = {
  student: [
    { q: "Can OzymorLab evaluate complete answer sheets?", a: "Yes. OzymorLab can evaluate full answer sheets, including multiple questions across different subjects, not just individual answers." },
    { q: "Does OzymorLab support CBSE answer sheets?", a: "Yes. OzymorLab is designed to evaluate answers according to board-style marking schemes and can provide detailed feedback aligned with CBSE-style expectations." },
    { q: "Can OzymorLab check Mathematics step-by-step?", a: "Yes. OzymorLab analyzes intermediate steps, identifies where mistakes occur, and can award feedback on the solution process instead of only checking the final answer." },
    { q: "Can it evaluate Physics derivations?", a: "Yes. OzymorLab evaluates derivations, formulas, substitutions, and logical progression used to arrive at the final answer." },
    { q: "Can it check Chemistry equations and reactions?", a: "Yes. OzymorLab can validate chemical equations, reaction balancing, formulas, and explanatory answers." },
    { q: "Does it support Biology diagrams?", a: "Yes. OzymorLab can analyze labelled diagrams and provide feedback on completeness and correctness." },
    { q: "Can OzymorLab evaluate Hindi answers?", a: "Yes. OzymorLab supports Hindi answer evaluation and provides feedback on content, structure, and expression." },
    { q: "Does it support Sanskrit?", a: "OzymorLab supports Sanskrit answer analysis and continues to improve script understanding and evaluation quality." },
    { q: "Will my marks be exactly the same as my school teacher's?", a: "Not always. Different teachers may award marks differently. OzymorLab aims to provide consistent and explainable evaluation while highlighting areas for improvement." },
    { q: "Can I improve my answer and submit again?", a: "Yes. Students can revise answers and track improvement over multiple submissions." }
  ],
  parent: [
    { q: "How accurate is OzymorLab?", a: "OzymorLab uses AI-powered evaluation models trained to analyze answer quality, reasoning, structure, and completeness." },
    { q: "Is my child's data safe?", a: "Yes. Student submissions are securely stored and processed using industry-standard security practices." },
    { q: "Does OzymorLab replace teachers?", a: "No. OzymorLab is designed to assist learning and assessment, not replace educators." },
    { q: "Can OzymorLab help improve board exam scores?", a: "OzymorLab helps students identify mistakes, improve answer-writing techniques, and practice exam-oriented responses." }
  ],
  teacher: [
    { q: "Can OzymorLab grade an entire class at once?", a: "Yes. Teachers can upload multiple answer sheets and receive structured evaluations and analytics." },
    { q: "Does OzymorLab support CBSE marking schemes?", a: "Yes. Teachers can configure marking rubrics and evaluation criteria aligned with board requirements." },
    { q: "Can teachers customize rubrics?", a: "Yes. Schools and teachers can define custom rubrics, marking patterns, and evaluation standards." },
    { q: "Does OzymorLab provide partial marking?", a: "Yes. The platform is designed to recognize intermediate reasoning and provide partial-credit evaluation where applicable." },
    { q: "Can OzymorLab detect weak concepts across a class?", a: "Yes. Teachers receive topic-wise performance analytics and concept-level insights." },
    { q: "Can it generate feedback automatically?", a: "Yes. Personalized feedback can be generated for each student." },
    { q: "Can OzymorLab evaluate handwritten answer sheets?", a: "Yes. Handwritten answer sheets can be uploaded as images or PDFs for evaluation." }
  ],
  school: [
    { q: "Can OzymorLab be used across multiple classes?", a: "Yes. Schools can manage multiple grades, sections, teachers, and subjects from one platform." }
  ]
};

const testimonials = [
  { name: "Dr. Divya Ramachandran", role: "Vice Chancellor @Crown Board", quote: "OzymorLab transformed our grading pipeline — explainable traces changed everything." },
  { name: "Prof. Danish Habib", role: "Dean of Evaluation @Crown Board", quote: "The rubric grounding feature ensures consistent, bias-free evaluation at scale." },
  { name: "Dr. Cyril Quadros", role: "LMS Integration Lead @Crown Board", quote: "Seamless Canvas & Blackboard integration saved us months of manual work." },
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
  const [logoHref, setLogoHref] = useState("/");
  const pathname = usePathname();

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

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal(), r6 = useReveal(), r7 = useReveal(), r8 = useReveal(), r9 = useReveal(), r10 = useReveal(), r11 = useReveal(), rFaq = useReveal();

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const lastScrollTime = useRef(0);

  const [faqTab, setFaqTab] = useState<'student' | 'parent' | 'teacher' | 'school'>('student');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const scrollProgress = activeCardIndex === 0 ? 0 : activeCardIndex === 1 ? 0.5 : 1.0;

  useEffect(() => {
    let rId: number;
    let currentProgress = smoothProgress;

    const updateSmoothProgress = () => {
      currentProgress += (scrollProgress - currentProgress) * 0.05; // Cinematic smooth slow LERP
      setSmoothProgress(currentProgress);
      rId = requestAnimationFrame(updateSmoothProgress);
    };

    rId = requestAnimationFrame(updateSmoothProgress);
    return () => cancelAnimationFrame(rId);
  }, [scrollProgress]);

  // Capture wheel events on the container to step index by index discretely
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      const delta = e.deltaY;

      // Lock scroll while inside transition range
      if ((delta > 0 && activeCardIndex < 2) || (delta < 0 && activeCardIndex > 0)) {
        e.preventDefault();
      }

      // Check cooldown to avoid skipping steps on rapid scrolling
      if (now - lastScrollTime.current < 800) {
        return;
      }

      if (delta > 20 && activeCardIndex < 2) {
        setActiveCardIndex(prev => prev + 1);
        lastScrollTime.current = now;
      } else if (delta < -20 && activeCardIndex > 0) {
        setActiveCardIndex(prev => prev - 1);
        lastScrollTime.current = now;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [activeCardIndex]);

  // Capture mobile touch swipe to step index by index discretely
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY; // Positive = swipe up / scroll down
      
      if (Math.abs(deltaY) > 40) {
        // Lock scroll while inside transition range
        if ((deltaY > 0 && activeCardIndex < 2) || (deltaY < 0 && activeCardIndex > 0)) {
          e.preventDefault();
        }

        // Check cooldown
        if (now - lastScrollTime.current < 800) {
          return;
        }

        if (deltaY > 40 && activeCardIndex < 2) {
          setActiveCardIndex(prev => prev + 1);
          lastScrollTime.current = now;
          touchStartY = touchCurrentY;
        } else if (deltaY < -40 && activeCardIndex > 0) {
          setActiveCardIndex(prev => prev - 1);
          lastScrollTime.current = now;
          touchStartY = touchCurrentY;
        }
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeCardIndex]);

  const activeIndex = activeCardIndex;

  const handleSidebarClick = (idx: number) => {
    setActiveCardIndex(idx);
  };

  const getCardStyles = (index: number) => {
    if (index === 0) {
      const scale = 1 - smoothProgress * 0.08;
      const translateY = -35 * smoothProgress;
      const opacity = 1 - smoothProgress * 0.35;
      return {
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        opacity,
        zIndex: 1,
        pointerEvents: activeIndex === 0 ? ("auto" as const) : ("none" as const),
      };
    } else if (index === 1) {
      const p1 = Math.min(Math.max((smoothProgress - 0.1) / 0.4, 0), 1);
      const p1_dim = Math.min(Math.max((smoothProgress - 0.5) / 0.4, 0), 1);

      const translateY = (1 - p1) * 600 - p1_dim * 15;
      const scale = 0.95 + p1 * 0.05 - p1_dim * 0.05;
      
      return {
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        opacity: p1 === 0 ? 0 : 1,
        zIndex: 2,
        pointerEvents: activeIndex === 1 ? ("auto" as const) : ("none" as const),
      };
    } else {
      const p2 = Math.min(Math.max((smoothProgress - 0.5) / 0.4, 0), 1);
      
      const translateY = (1 - p2) * 600;
      const scale = 0.95 + p2 * 0.05;
      
      return {
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        opacity: p2 === 0 ? 0 : 1,
        zIndex: 3,
        pointerEvents: activeIndex === 2 ? ("auto" as const) : ("none" as const),
      };
    }
  };

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
            <Link href="/waitlist" className="lp-btn lp-btn--outline transition-all duration-300 hover:-translate-y-1">Join Waitlist</Link>
            <Link href="/waitlist" className="lp-btn lp-btn--primary text-white transition-all duration-300 hover:-translate-y-1">Request Demo</Link>
          </div>
          <button className="lp-nav__burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            {navLinks.map(l => <Link key={l.label} href={l.href} className="lp-mobile-menu__link" onClick={() => setMenuOpen(false)}>{l.label}</Link>)}
            <div className="lp-mobile-menu__actions">
              <Link
                href="/waitlist"
                className="lp-btn lp-btn--outline lp-btn--full transition-all duration-300 hover:-translate-y-1"
              >
                Join Waitlist
              </Link>
              <Link href="/waitlist" className="lp-btn lp-btn--primary lp-btn--full text-white transition-all duration-300 hover:-translate-y-1">Request Demo</Link>
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
            <span>Announcing Rubric-Grounding Engine for India</span>
          </div>
          <h1 className="lp-hero__title lp-anim-fade" style={{ animationDelay: "0.3s" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <LogoIcon />
              <span><span className="lp-highlight lp-highlight--underline">Say</span> hello to your academic assessment portal</span>
            </span>
          </h1>
          <p className="lp-hero__subtitle lp-anim-fade" style={{ animationDelay: "0.4s" }}>
            An academic assessment portal that works the way you do.
          </p>
          <div className="lp-hero__ctas lp-anim-fade" style={{ animationDelay: "0.5s" }}>
            <Link href="/pricing" className="lp-btn lp-btn--outline lp-btn--lg">Start Free Pilot</Link>
            <Link href="/contact" className="lp-btn lp-btn--primary lp-btn--lg text-white" style={{ color: "#ffffff" }}>Request Demo</Link>
          </div>
          {/* Stacking Cards Scroll Container */}
          <div ref={containerRef} className="sp-scroll-track" style={{ position: "relative", width: "100%", marginTop: "60px", zIndex: 5 }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 className="lp-section-title">
                Built for every <span className="lp-highlight lp-highlight--underline">role in your school</span>
              </h2>
              <p className="lp-section-subtitle" style={{ textAlign: "center", margin: "16px auto 0", maxWidth: "600px" }}>
                From students tracking progress to teachers managing submissions, to administrators overseeing school performance.
              </p>
            </div>

            <div className="lp-hero__ui" style={{ marginScale: 1, width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
              <div className="lp-hero-ui">
                <div className="lp-hero-ui__sidebar">
                  <div className="lp-hero-ui__sidebar-logo"><LogoIcon /></div>
                  {[0, 1, 2].map(idx => (
                    <button 
                      key={idx} 
                      onClick={() => handleSidebarClick(idx)}
                      style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "600", transition: "all 0.3s ease" }}
                      className={`lp-hero-ui__sidebar-item ${activeIndex === idx ? "lp-hero-ui__sidebar-item--active" : ""}`}
                      title={idx === 0 ? "Student View" : idx === 1 ? "Teacher View" : "Admin View"}
                    >
                      {idx === 0 ? "S" : idx === 1 ? "T" : "A"}
                    </button>
                  ))}
                </div>
                
                <div className="lp-hero-ui__main" style={{ position: "relative", overflow: "hidden", height: "660px" }}>
                  <div className="sp-stack-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
                    
                    <div className="sp-stack-card" style={{
                      position: "absolute",
                      top: "24px",
                      left: "24px",
                      right: "24px",
                      transition: "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.1s ease",
                      ...getCardStyles(0)
                    }}>
                      <StudentSubmissionPanel />
                    </div>

                    <div className="sp-stack-card" style={{
                      position: "absolute",
                      top: "24px",
                      left: "24px",
                      right: "24px",
                      transition: "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.1s ease",
                      ...getCardStyles(1)
                    }}>
                      <TeacherSubmissionPanel />
                    </div>

                    <div className="sp-stack-card" style={{
                      position: "absolute",
                      top: "24px",
                      left: "24px",
                      right: "24px",
                      transition: "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.1s ease",
                      ...getCardStyles(2)
                    }}>
                      <SchoolAdminPage />
                    </div>

                  </div>
                </div>
              </div>
            </div>
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
            <Link href="/contact" className="lp-btn lp-btn--primary lp-btn--icon text-white" style={{ color: "#ffffff" }}>Request Demo <ArrowRight /></Link>
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
                <Link href="/waitlist" className={`lp-btn ${p.featured ? "lp-btn--accent" : "lp-btn--outline"} lp-btn--full`}>{p.cta}</Link>
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
                  <div className="lp-testimonial-card__avatar">{t.name.split(" ").map(n => n[0]).join("")}</div>
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

      {/* ═══ SECTION 7.5: ACCORDION TABS FAQS ═══ */}
      <section className="lp-faqs" id="faq" ref={rFaq.ref}>
        <div className={rFaq.className}>
          <div className="lp-faqs__header" style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="lp-section-title">
              Got <span className="lp-highlight lp-highlight--box">questions</span>? We have answers.
            </h2>
            <p className="lp-section-subtitle" style={{ margin: "16px auto 0", maxWidth: "600px" }}>
              Explore frequently asked questions tailored for students, parents, teachers, and schools.
            </p>
          </div>

          <div className="lp-faqs__tabs">
            {(['student', 'parent', 'teacher', 'school'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setFaqTab(tab);
                  setExpandedFaqIndex(null);
                }}
                className={`lp-faqs__tab-btn ${faqTab === tab ? 'lp-faqs__tab-btn--active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} FAQs
              </button>
            ))}
          </div>

          <div className="lp-faqs__accordion">
            {faqData[faqTab].map((faq, index) => {
              const isExpanded = expandedFaqIndex === index;
              return (
                <div key={index} className="lp-faqs__item">
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                    className="lp-faqs__item-header"
                    aria-expanded={isExpanded}
                  >
                    <span>{faq.q}</span>
                    <span className={`lp-faqs__item-icon ${isExpanded ? 'lp-faqs__item-icon--expanded' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  <div className={`lp-faqs__item-body ${isExpanded ? 'lp-faqs__item-body--expanded' : ''}`}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lp-faqs__cta-banner">
            <div className="lp-faqs__cta-banner-content">
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Practice with our AI OSM Evaluator</h3>
              <p style={{ margin: "8px 0 0 0" }}>Prepare for board exams and practice digitised answer sheet evaluation exactly how Indian board examiners do it.</p>
            </div>
            <Link href="/osm-evaluator" className="lp-btn lp-btn--accent lp-btn--lg lp-btn--icon text-white" style={{ display: "inline-flex", alignItems: "center" }}>
              Try OSM Evaluator <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7b: LINKS / ONBOARD BANNER ═══ */}
      <section className="lp-links-banner" ref={r9.ref}>
        <div className={r9.className}>
          <div className="lp-links-banner__content">
            <p className="lp-links-banner__text">Audit even the most complex mathematical calculus or cursive answers.</p>
            <div className="lp-links-banner__mini-cards">
              <div className="lp-mini-card"><div className="lp-mini-card__avatar" style={{ background: "#4f46e5" }}>E</div><div><strong>Ekjot</strong><span>Onboard</span></div></div>
              <div className="lp-mini-card"><div className="lp-mini-card__avatar" style={{ background: "#0891b2" }}>J</div><div><strong>Javed</strong><span>Pilot Starts Tomorrow</span></div></div>
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
              <Link href="/waitlist" className="lp-btn lp-btn--accent lp-btn--lg">Grade with OzymorLab <ArrowRight /></Link>
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
        </div>
      </footer>
    </div>
  );
}
