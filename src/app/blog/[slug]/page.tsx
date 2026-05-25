"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../../landing/landing.css";

const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1f2223" />
    <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="3" fill="#1f2223" />
  </svg>
);
const ArrowLeft = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3M7 12L3 8l4-4" /></svg>;
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
    content: `Traditional grading systems are facing a crisis of scalability and consistency. As student enrollment increases across districts, educators find themselves overwhelmed by the sheer volume of subjective assessments. This administrative burden leads to grading fatigue and inadvertent grading discrepancies. While artificial intelligence offers a tempting solution to accelerate this bottleneck, raw large language models (LLMs) frequently fail when applied directly to subjective answer sheets. The reason is simple: LLMs lack grounding. Without precise structural boundaries, their scores fluctuate wildly based on prompts, resulting in hallucinations and grading bias.

### The Limits of Raw LLM Scoring
When an AI is prompted with a simple instruction like "grade this essay on a scale of 1 to 10," it relies on heuristic probabilities rather than structured pedagogical guidelines. This lack of constraint causes several critical failure modes:
1. **Hallucination of Merit**: The AI may award points for eloquent writing that completely misses the target core concepts. This penalizes students who write concise, highly accurate responses.
2. **Inconsistent Baselines**: An answer sheet graded in one context might receive a different score when processed in another context due to the model's token sensitivity. This is unacceptable for high-stakes examinations.
3. **Absence of Justification**: Teachers and students are left with a raw number and no actionable feedback, making it impossible to perform audit trails or handle grade appeals.

### What is Rubric Grounding?
Rubric Grounding is OzymorLab's core architectural solution to these limitations. Rather than letting the model estimate scores in a vacuum, Rubric Grounding structures the evaluation process into a series of verifiable, deterministic steps:
* **Deconstruction**: The institutional rubric is decomposed into atomic grading guidelines.
* **Extraction**: The student’s answer script is parsed to locate specific evidentiary sentences or derivations.
* **Mapping**: The model is forced to explicitly map each claimed score to a corresponding text segment and rubric criterion.
* **Justification**: A detailed, human-readable trace is generated, explaining exactly why points were awarded or deducted.

By enforcing these constraints, OzymorLab turns AI from a black-box scoring machine into a transparent, explainable assistant that teachers can trust. This level of rigor is essential for restoring grading integrity across educational districts.

### Designing the Future of High-Stakes Assessments
Ultimately, the future of education depends on maintaining high-fidelity grading standards. When high-stakes state board exams or university finals adopt Rubric Grounding, they guarantee that every student is evaluated purely on merit and the specific criteria outlined by the board. This reduces student disputes, eliminates systemic bias, and unlocks a brand new standard for educational scaling.`,
    date: "May 24, 2026",
    readTime: "12 min read",
    category: "Pedagogy",
    color: "#e0ff82",
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop",
  },
  {
    slug: "overcoming-handwriting-variability-in-digital-evaluations-multimodal-ocr-advances",
    title: "Overcoming Handwriting Variability in Digital Evaluations: Multimodal OCR Advances",
    content: `Scanning handwritten student scripts and automatically evaluating them is one of the most formidable challenges in machine learning and computer vision today. Unlike typed text, handwritten student answer sheets exhibit extreme variations in cursive patterns, pen stroke widths, ink bleed, and layout structures. Furthermore, STEM examinations require the transcription and verification of complex algebraic equations, matrix calculations, and calculus derivations.

### The Anatomy of Handwriting Variability
Standard OCR tools are designed for printed documents or clean, block-letter inputs. They fail rapidly when faced with cursive student handwriting. The key technical hurdles include:
1. **Stroke Intersecting**: Cursive loops often merge together, confusing traditional segmentation algorithms.
2. **Ink Bleed & Paper Quality**: Mobile scans or basic institutional scanning hardware introduce significant noise, shadows, and low-contrast borders.
3. **Non-Linear Text Flow**: Students frequently write derivations in columns, add corrections in margins, or draw diagrams with overlapping labels.

### Multimodal Vision & Cursive Normalization
To address these issues, OzymorLab leverages next-generation multimodal vision transformers (ViTs) coupled with custom normalizer networks:
* **Grid-Based Feature Extraction**: We segment the scanned page into dynamic grids to preserve spatial context.
* **Cursive Normalizer**: A specialized deep network straightens skewed handwritten lines and normalizes cursive script variations.
* **Symbolic Math Parser**: A mathematical grammar model decodes cursive derivations into standard LaTeX formatting, preserving symbolic relationships.

Through this advanced OCR pipeline, handwritten mathematical steps are accurately transcribed and mapped against standard rubrics. This represents a significant breakthrough, enabling fair and automated grading of STEM student answer sheets at scale.

### Future Perspectives on Handwriting Synthesis
As research progresses, the goal is to make these systems adaptive. By training models on hundreds of thousands of diverse handwritten scripts representing various regional handwriting styles, OzymorLab's OCR engine ensures that no student is disadvantaged due to their writing style, restoring confidence in digital script evaluations.`,
    date: "May 18, 2026",
    readTime: "9 min read",
    category: "Engineering",
    color: "#e0f2fe",
    imageUrl: "https://images.unsplash.com/photo-1453733190148-c44698c26578?q=80&w=600&auto=format&fit=crop",
  },
  {
    slug: "bridging-the-trust-gap-how-explainable-evaluation-traces-empower-teachers",
    title: "Bridging the Trust Gap: How Explainable Evaluation Traces Empower Teachers",
    content: `The introduction of artificial intelligence in educational administration is often met with understandable skepticism by teachers. Many fear that automation will replace human judgment, standardize student feedback, or obscure the subjective nuances that only an experienced educator can identify. At OzymorLab, we believe that AI should not replace teachers—it should empower them. Bridging this trust gap requires shifting the paradigm from fully automated grading to transparent, collaborative moderation.

### The Problem with Black-Box Automation
When administrative software automatically updates student grades without presenting the underlying logic, it alienates educators. If a student challenges a score, the teacher must be able to justify it. If the system is a black-box, the teacher has no choice but to override it entirely or defend a calculation they do not understand.

### The Mechanics of Explainable Traces
OzymorLab resolves this disconnect by putting explainability at the absolute forefront of our product architecture:
* **Transparent Justification**: Every score suggestion is accompanied by a detailed justification listing exactly what evidence was found and how it relates to the rubric.
* **Interactive Moderation**: Educators can click on any score sheet to view the highlighted segments in the student's scanned paper.
* **One-Click Corrections**: If an educator disagrees with an AI suggestion, they can adjust the score directly, prompting the system to recalibrate the final grade instantly.

By designing the system around the teacher as the primary moderator, OzymorLab ensures absolute alignment with institutional standards while saving hours of manual workload. This collaborative approach builds sustainable, long-term trust in academic AI.

### Empowering Educators as Directors of AI
We see a future where teachers do not spend hours grading basic repetitive steps. Instead, they act as high-level directors of the evaluation pipeline, spending their valuable time design-thinking the curriculum, guiding individual students, and moderating subjective corner cases. OzymorLab makes this future a reality today.`,
    date: "May 12, 2026",
    readTime: "10 min read",
    category: "Product Strategy",
    color: "#fee2e2",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
  }
];

export default function ArticlePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const post = blogPosts.find(p => p.slug === params.slug) || blogPosts[0];

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

      {/* ═══ ARTICLE DETAIL ═══ */}
      <article style={{ padding: "140px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/blog" className="lp-btn lp-btn--outline" style={{ padding: "6px 12px", borderRadius: 8, display: "inline-flex", gap: 6, fontSize: 13 }}>
            <ArrowLeft /> Back to Blog
          </Link>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <span className="lp-blog-card__category">{post.category}</span>
          <span className="lp-blog-card__dot" />
          <span className="lp-blog-card__date">{post.date}</span>
          <span className="lp-blog-card__dot" />
          <span className="lp-blog-card__read-time">{post.readTime}</span>
        </div>
        <h1 className="lp-section-title" style={{ fontSize: "clamp(28px, 5vw, 42px)", marginBottom: 24, lineHeight: 1.2 }}>{post.title}</h1>
        
        {/* Banner banner decoration */}
        <div style={{ backgroundImage: `url(${post.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", height: 350, borderRadius: 16, marginBottom: 40, position: "relative" }}>
          <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(255,255,255,0.9)", padding: 8, borderRadius: 8, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogoIcon />
          </div>
        </div>

        {/* Content Body */}
        <div className="lp-article-body" style={{ fontSize: 16, lineHeight: 1.8, color: "var(--lp-fg-alt)" }}>
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("### ")) {
              return <h3 key={i} style={{ fontSize: 20, fontWeight: 600, color: "var(--lp-fg)", marginTop: 32, marginBottom: 16 }}>{para.replace("### ", "")}</h3>;
            }
            if (para.startsWith("* ")) {
              return (
                <ul key={i} style={{ margin: "16px 0", paddingLeft: 20 }}>
                  {para.split("\n").map((li, j) => (
                    <li key={j} style={{ marginBottom: 8 }}>{li.replace("* ", "")}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i} style={{ marginBottom: 20 }}>{para}</p>;
          })}
        </div>
      </article>

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
