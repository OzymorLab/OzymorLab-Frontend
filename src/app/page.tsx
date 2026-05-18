"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [scrollPct, setScrollPct] = useState(0);
  const [animateMockup, setAnimateMockup] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPct((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mockupRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateMockup(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(mockupRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-body">
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }}></div>

      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">
          <div className="logo-mark">E</div>
          Edexia AIOS
        </Link>
        <ul className="nav-links">
          <li><a href="#problem">Problem</a></li>
          <li><a href="#market">Market</a></li>
          <li><a href="#architecture">Architecture</a></li>
          <li><a href="#deis">DEIS</a></li>
          <li><a href="#pitch">Pitch</a></li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/login" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>Sign In</Link>
          <Link href="/login?tab=signup" className="nav-cta">Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-lines"></div>
        <div className="hero-blob"></div>
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            BUILT FOR EDEXIA — INDIA EXPANSION PROPOSAL
          </div>
          <h1 className="hero-title">
            AI Evaluation<br />
            <span className="serif-line">Infrastructure</span>
            <span className="small-line">for 300 Million Indian Board Exam Students</span>
          </h1>
          <p className="hero-desc">
            A <strong>multimodal assessment system</strong> extending Edexia's rubric-grounded philosophy into CBSE, ICSE, and state board examinations — with diagram evaluation, component-wise parallel scoring, and India-first adaptations.
          </p>
          <div className="hero-actions">
            <Link href="/login?tab=signup" className="btn-primary">Get Started <ArrowRight size={16} /></Link>
            <a href="#architecture" className="btn-secondary">Explore Architecture ↓</a>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">300M+</div>
              <div className="stat-label">students / year</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">A$760M</div>
              <div className="stat-label">evaluation cost</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1.3M+</div>
              <div className="stat-label">CBSE rechecks '23</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">AI diagram graders</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem">
        <div className="container">
          <div className="section-tag">The Problem</div>
          <h2 className="section-title">Evaluation at scale<br />is fundamentally broken</h2>
          <p className="section-sub">India runs the world's largest board examination system. The infrastructure hasn't meaningfully changed in 30 years.</p>
          <div className="problem-grid fade-up">
            <div className="problem-card">
              <div className="problem-bar"></div>
              <div className="problem-num">01 / HUMAN LIMITS</div>
              <h3>Evaluator fatigue &amp; inconsistency</h3>
              <p>Examiners grade 30–50 answer sheets per day across 3–4 continuous weeks. Inter-rater variability is systemic, not exceptional — resulting in hundreds of thousands of disputed marks annually.</p>
            </div>
            <div className="problem-card">
              <div className="problem-bar"></div>
              <div className="problem-num">02 / DELAY</div>
              <h3>60–90 day result cycles</h3>
              <p>From examination date to result declaration, the average Indian board takes 2–3 months. Students lose admission windows, scholarship deadlines, and months of planning certainty.</p>
            </div>
            <div className="problem-card">
              <div className="problem-bar"></div>
              <div className="problem-num">03 / MULTIMODAL BLIND SPOT</div>
              <h3>AI graders fail on diagrams</h3>
              <p>Biology, Physics, Geography answer sheets are 40–60% diagram-based. Every existing AI grading system evaluates text only — making them useless for Indian board rubrics.</p>
            </div>
            <div className="problem-card">
              <div className="problem-bar"></div>
              <div className="problem-num">04 / AUDITABILITY</div>
              <h3>Zero evidence trail for marks</h3>
              <p>When a student files for revaluation, examiners rarely produce evidence for their scoring. There's no explainability layer — making moderation slow, subjective, and legally fragile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MARKET — EXPANDED */}
      <section id="market" className="market-section">
        <div className="container">
          <div className="section-tag">Indian Market</div>
          <h2 className="section-title">The largest untapped<br />opportunity in EdTech</h2>
          <p className="section-sub">India's board examination ecosystem represents a A$11.6B market segment with near-zero AI penetration — and structural tailwinds making this the right moment to enter.</p>

          {/* Top-line numbers */}
          <div className="market-hero-numbers fade-up">
            <div className="market-big-card c-blue">
              <div className="market-big-num">300M+</div>
              <div className="market-big-label">Students write board exams annually across all Indian boards</div>
              <div className="market-big-sub">CBSE · ICSE · 28 State Boards</div>
            </div>
            <div className="market-big-card c-red">
              <div className="market-big-num">A$760M</div>
              <div className="market-big-label">Annual evaluation spend — examiner fees, logistics, printing, admin</div>
              <div className="market-big-sub">Manual. Zero AI automation.</div>
            </div>
            <div className="market-big-card c-yellow">
              <div className="market-big-num">80–120M</div>
              <div className="market-big-label">Answer sheets evaluated per cycle, each 20–40 pages of handwriting</div>
              <div className="market-big-sub">Target: process in &lt;15 days</div>
            </div>
            <div className="market-big-card c-green">
              <div className="market-big-num">A$11.6B</div>
              <div className="market-big-label">India EdTech market — no dominant AI evaluation player for offline boards</div>
              <div className="market-big-sub">First-mover white space</div>
            </div>
          </div>

          {/* TAM SAM SOM */}
          <div className="tam-sam-som fade-up">
            <h3>Market sizing — TAM / SAM / SOM</h3>
            <div className="tsm-grid">
              <div className="tsm-cell tam">
                <span className="tsm-label">TAM</span>
                <div className="tsm-num">A$11.6B</div>
                <div className="tsm-desc">Total addressable market — all Indian board examination infrastructure: evaluation, logistics, reprints, moderation, re-checking, and continuous assessment systems.</div>
              </div>
              <div className="tsm-cell sam">
                <span className="tsm-label">SAM</span>
                <div className="tsm-num">A$2.8B</div>
                <div className="tsm-desc">Serviceable addressable market — AI-automatable evaluation workflows across CBSE, ICSE, and 6 major state boards (UP, Maharashtra, Tamil Nadu, Karnataka, Rajasthan, WB).</div>
              </div>
              <div className="tsm-cell som">
                <span className="tsm-label">SOM</span>
                <div className="tsm-num">A$278M</div>
                <div className="tsm-desc">Serviceable obtainable market — Year 1–3 target: CBSE secondary tier + 2 state board pilots, priced as B2G SaaS at A$0.07–0.15 per answer sheet processed.</div>
              </div>
            </div>
          </div>

          {/* Breakdown columns */}
          <div className="market-breakdown fade-up">
            <div className="market-breakdown-col">
              <h3>Volume &amp; cost breakdown</h3>
              <div className="breakdown-row"><span className="breakdown-label">Total board exam students</span><span className="breakdown-val accent">300 million+</span></div>
              <div className="breakdown-row"><span className="breakdown-label">CBSE students alone</span><span className="breakdown-val">~35 million</span></div>
              <div className="breakdown-row"><span className="breakdown-label">Answer sheets per cycle</span><span className="breakdown-val">80–120 million</span></div>
              <div className="breakdown-row"><span className="breakdown-label">Pages per answer sheet</span><span className="breakdown-val">20–40 pages</span></div>
              <div className="breakdown-row"><span className="breakdown-label">Avg. evaluator pay per sheet</span><span className="breakdown-val">A$0.22–0.33</span></div>
              <div className="breakdown-row"><span className="breakdown-label">Total evaluation cost / year</span><span className="breakdown-val red">A$760M</span></div>
              <div className="breakdown-row"><span className="breakdown-label">CBSE rechecks filed (2023)</span><span className="breakdown-val red">1.3 million+</span></div>
              <div className="breakdown-row"><span className="breakdown-label">Revaluation revenue / year</span><span className="breakdown-val green">A$90–145M</span></div>
            </div>
            <div className="market-breakdown-col">
              <h3>Competitive landscape</h3>
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="comp-bar-row">
                  <span className="comp-label">Text-only AI graders (global)</span>
                  <div className="comp-bar-wrap"><div className="comp-bar-fill" style={{ width: "60%", background: "var(--border2)" }}></div></div>
                  <span className="comp-val">Partial fit</span>
                </div>
                <div className="comp-bar-row">
                  <span className="comp-label">Diagram evaluation capability</span>
                  <div className="comp-bar-wrap"><div className="comp-bar-fill" style={{ width: "2%", background: "var(--accent2)" }}></div></div>
                  <span className="comp-val" style={{ color: "var(--accent2)" }}>Near zero</span>
                </div>
                <div className="comp-bar-row">
                  <span className="comp-label">Multilingual / mixed-script</span>
                  <div className="comp-bar-wrap"><div className="comp-bar-fill" style={{ width: "8%", background: "var(--accent2)" }}></div></div>
                  <span className="comp-val" style={{ color: "var(--accent2)" }}>Minimal</span>
                </div>
                <div className="comp-bar-row">
                  <span className="comp-label">India board rubric support</span>
                  <div className="comp-bar-wrap"><div className="comp-bar-fill" style={{ width: "0%", background: "var(--accent2)" }}></div></div>
                  <span className="comp-val" style={{ color: "var(--accent2)" }}>None</span>
                </div>
                <div className="comp-bar-row">
                  <span className="comp-label">Edexia AIOS (proposed)</span>
                  <div className="comp-bar-wrap"><div className="comp-bar-fill" style={{ width: "92%", background: "var(--green)" }}></div></div>
                  <span className="comp-val" style={{ color: "var(--green)" }}>Full stack</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.7" }}>No existing AI grading product — globally or in India — evaluates labeled diagrams in handwritten answer sheets. This is the structural white space. The first to solve it at board scale owns the market.</p>
            </div>
          </div>

          {/* Policy tailwinds */}
          <div className="section-tag" style={{ marginBottom: "1rem" }}>Policy &amp; structural tailwinds</div>
          <div className="tailwinds-grid fade-up">
            <div className="tailwind-card">
              <div className="tailwind-number">TAILWIND 01</div>
              <h4>NEP 2020 — Competency-based assessment</h4>
              <p>The National Education Policy mandates a shift to competency-based, continuous assessment — exactly what component-wise AI evaluation enables. The government is actively funding EdTech evaluation infrastructure under NEP implementation budgets.</p>
              <span className="tailwind-accent" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>A$1.1B allocated — NEP EdTech</span>
            </div>
            <div className="tailwind-card">
              <div className="tailwind-number">TAILWIND 02</div>
              <h4>Revaluation crisis — demand for auditability</h4>
              <p>1.3 million+ CBSE recheck applications in 2023 represent a A$90–145M annual fee stream — and mounting legal pressure for explainable scoring. Boards are actively looking for audit-ready evaluation systems.</p>
              <span className="tailwind-accent" style={{ background: "var(--accent2-light)", color: "var(--accent2)" }}>RTI + court challenges rising</span>
            </div>
            <div className="tailwind-card">
              <div className="tailwind-number">TAILWIND 03</div>
              <h4>Digital India — infrastructure ready</h4>
              <p>Answer sheet digitization infrastructure is already in place across CBSE and most state boards. The bottleneck isn't scanning — it's intelligent processing. Edexia AIOS drops directly into existing digitized workflows.</p>
              <span className="tailwind-accent" style={{ background: "var(--green-light)", color: "var(--green)" }}>Infrastructure: already deployed</span>
            </div>
            <div className="tailwind-card">
              <div className="tailwind-number">TAILWIND 04</div>
              <h4>28 state boards — massively fragmented</h4>
              <p>Each state board operates independent evaluation pipelines. A single national standard doesn't exist — meaning each board is a separate B2G sales opportunity. A rubric-adaptable system becomes the interoperability layer.</p>
              <span className="tailwind-accent" style={{ background: "var(--accent3-light)", color: "var(--accent3)" }}>28 independent sales opportunities</span>
            </div>
            <div className="tailwind-card">
              <div className="tailwind-number">TAILWIND 05</div>
              <h4>AI literacy — examiner shortage</h4>
              <p>India faces a structural shortage of qualified evaluators in rural and semi-urban examination centers, particularly for STEM subjects. AI-augmented evaluation directly solves the examiner supply problem without replacing the oversight layer.</p>
              <span className="tailwind-accent" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>Supply gap: 40%+ STEM centers</span>
            </div>
            <div className="tailwind-card">
              <div className="tailwind-number">TAILWIND 06</div>
              <h4>JEE / NEET downstream — coaching market</h4>
              <p>Board evaluation data, when AI-structured, becomes a training signal for competitive exam prep. Edexia's component-wise scoring generates the most detailed diagnostic data available on student conceptual gaps — a premium product for EdTech firms.</p>
              <span className="tailwind-accent" style={{ background: "var(--green-light)", color: "var(--green)" }}>A$5.1B coaching market unlock</span>
            </div>
          </div>

          {/* Revenue models */}
          <div className="section-tag" style={{ marginBottom: "1rem" }}>Revenue model paths</div>
          <div className="revenue-grid fade-up">
            <div className="revenue-card">
              <span className="revenue-tag" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>B2G SaaS</span>
              <h4>Per-sheet processing — boards</h4>
              <p>Charge state and central boards on a per-answer-sheet basis. At A$0.11/sheet across 100 million sheets, the annual base contract is A$11M per board cycle — at margins impossible in manual systems.</p>
              <div className="revenue-potential" style={{ color: "var(--accent)" }}>A$11–33M / cycle</div>
            </div>
            <div className="revenue-card">
              <span className="revenue-tag" style={{ background: "var(--accent2-light)", color: "var(--accent2)" }}>B2B SaaS</span>
              <h4>Diagnostic API — EdTech platforms</h4>
              <p>License the component-wise scoring API to coaching platforms (BYJU's, Unacademy, Allen) as a diagnostic layer. Every mock test becomes a structured evaluation report with DEIS-level diagram feedback.</p>
              <div className="revenue-potential" style={{ color: "var(--accent2)" }}>A$2–7M ARR</div>
            </div>
            <div className="revenue-card">
              <span className="revenue-tag" style={{ background: "var(--green-light)", color: "var(--green)" }}>B2G — moderation</span>
              <h4>Revaluation audit platform</h4>
              <p>Boards spend heavily on moderation and revaluation administration. An AI-backed revaluation system with full evidence trails reduces dispute resolution cost by 60–80% and is a direct cost-savings sell to education departments.</p>
              <div className="revenue-potential" style={{ color: "var(--green)" }}>A$1.5–4.5M / board</div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-tag">System Architecture</div>
          <h2 className="section-title">One answer.<br />Four independent pipelines.</h2>
          <p className="section-sub">Traditional AI graders treat an answer as a single block. Real board answers are multimodal — evaluated component by component, exactly like a trained examiner would.</p>

          <div className="arch-flow fade-up">
            <div className="flow-step">
              <div className="step-num">01</div>
              <div className="step-content">
                <h4>Question Segmentation Engine</h4>
                <p>Parses uploaded answer sheets, identifies question boundaries, and segments each response for independent processing. Handles multi-page, handwritten, and mixed-format sheets.</p>
                <div className="step-tags">
                  <span className="step-tag blue">OCR + segmentation</span>
                  <span className="step-tag blue">Multi-page handling</span>
                  <span className="step-tag blue">Mixed script support</span>
                </div>
              </div>
            </div>
            <div className="flow-step">
              <div className="step-num">02</div>
              <div className="step-content">
                <h4>Rubric-Aware Decomposition</h4>
                <p>Before evaluation begins, the system classifies question intent and determines which components are expected — dynamically routing to the correct pipeline combination. A "draw circuit" question triggers only the diagram pipeline. "Explain with labeled diagram" triggers all four.</p>
                <div className="step-tags">
                  <span className="step-tag green">Intent classification</span>
                  <span className="step-tag green">Dynamic routing</span>
                  <span className="step-tag green">Mark distribution</span>
                </div>
              </div>
            </div>
            <div className="flow-step">
              <div className="step-num">03</div>
              <div className="step-content">
                <h4>Parallel Multimodal Evaluation</h4>
                <p>Four independent pipelines run simultaneously: text for explanation and reasoning, diagram for structural correctness, label for spatial accuracy, and structured reasoning for stepwise derivation flow. Each produces a component score with evidence.</p>
                <div className="step-tags">
                  <span className="step-tag blue">Text pipeline</span>
                  <span className="step-tag red">Diagram pipeline (DEIS)</span>
                  <span className="step-tag yellow">Label pipeline</span>
                  <span className="step-tag green">Reasoning pipeline</span>
                </div>
              </div>
            </div>
            <div className="flow-step">
              <div className="step-num">04</div>
              <div className="step-content">
                <h4>Score Fusion + Confidence Validation</h4>
                <p>Component scores are fused into a final grade with confidence metadata. Low-confidence evaluations automatically flag for human review — teachers remain final moderators. Every mark has attached evidence for full auditability.</p>
                <div className="step-tags">
                  <span className="step-tag blue">Evidence-linked scores</span>
                  <span className="step-tag red">Human-in-the-loop flagging</span>
                  <span className="step-tag yellow">Moderation logs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pipelines-grid fade-up">
            <div className="pipeline-card" style={{ borderTop: "2px solid var(--accent)" }}>
              <div className="pipeline-icon" style={{ background: "var(--accent-light)" }}>📝</div>
              <h4>Text Evaluation</h4>
              <ul>
                <li>Semantic understanding</li>
                <li>Concept correctness</li>
                <li>Theoretical reasoning</li>
                <li>Keyword mapping</li>
              </ul>
            </div>
            <div className="pipeline-card" style={{ borderTop: "2px solid var(--accent2)" }}>
              <div className="pipeline-icon" style={{ background: "var(--accent2-light)" }}>🔬</div>
              <h4>Diagram Evaluation (DEIS)</h4>
              <ul>
                <li>Structural correctness</li>
                <li>Relevance validation</li>
                <li>Completeness check</li>
                <li>Arrow/flow detection</li>
              </ul>
            </div>
            <div className="pipeline-card" style={{ borderTop: "2px solid var(--accent3)" }}>
              <div className="pipeline-icon" style={{ background: "var(--accent3-light)" }}>🏷️</div>
              <h4>Label Evaluation</h4>
              <ul>
                <li>Handwritten label OCR</li>
                <li>Spatial mapping</li>
                <li>Terminology accuracy</li>
                <li>Placement validation</li>
              </ul>
            </div>
            <div className="pipeline-card" style={{ borderTop: "2px solid var(--green)" }}>
              <div className="pipeline-icon" style={{ background: "var(--green-light)" }}>🧮</div>
              <h4>Structured Reasoning</h4>
              <ul>
                <li>Stepwise logic</li>
                <li>Derivation flow</li>
                <li>Formula correctness</li>
                <li>Presentation marks</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "4rem 3rem" }}>
        <div className="container">
          <div className="section-tag">Why This Approach</div>
          <h2 className="section-title" style={{ marginBottom: "2.5rem" }}>Edexia AIOS vs traditional<br />AI grading systems</h2>
          <div className="comparison-wrap fade-up">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Traditional AI Graders</th>
                  <th>Edexia AIOS (India)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Diagram evaluation</td><td><span className="badge-no">✗ Not supported</span></td><td><span className="badge-yes">✓ Full DEIS pipeline</span></td></tr>
                <tr><td>Handwritten label parsing</td><td><span className="badge-no">✗ Text-only OCR</span></td><td><span className="badge-yes">✓ Spatial label mapping</span></td></tr>
                <tr><td>Component-wise scoring</td><td><span className="badge-no">✗ Single score block</span></td><td><span className="badge-yes">✓ Per-component evidence</span></td></tr>
                <tr><td>Multilingual support</td><td><span className="badge-no">✗ English-primary</span></td><td><span className="badge-yes">✓ Mixed-language, 22 scripts</span></td></tr>
                <tr><td>Poor scan quality handling</td><td><span className="badge-no">✗ Clean input required</span></td><td><span className="badge-yes">✓ Low-quality scan pipeline</span></td></tr>
                <tr><td>Human-in-the-loop moderation</td><td><span className="badge-no">✗ Fully automated</span></td><td><span className="badge-yes">✓ Confidence-gated review</span></td></tr>
                <tr><td>Partial marking by rubric</td><td><span className="badge-no">✗ Binary or semantic sim</span></td><td><span className="badge-yes">✓ Incremental rubric marks</span></td></tr>
                <tr><td>Legal auditability</td><td><span className="badge-no">✗ Black box</span></td><td><span className="badge-yes">✓ Full evidence trail</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DEIS */}
      <section id="deis" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-tag">DEIS</div>
          <h2 className="section-title">Diagram Evaluation<br />Intelligence System</h2>
          <p className="section-sub">The only dedicated AI pipeline for evaluating labeled diagrams in handwritten board answer sheets. The white space no current AI grader addresses.</p>

          <div className="deis-layout fade-up">
            <div>
              <div className="deis-step">
                <div className="deis-circle">01</div>
                <div className="deis-text"><h4>Diagram detection</h4><p>Identifies diagram regions within answer sheets, separating visual content from text blocks for dedicated processing.</p></div>
              </div>
              <div className="deis-step">
                <div className="deis-circle">02</div>
                <div className="deis-text"><h4>Relevance validation</h4><p>Checks whether the drawn diagram is relevant to the question — a student can draw a correct diagram for the wrong concept.</p></div>
              </div>
              <div className="deis-step">
                <div className="deis-circle">03</div>
                <div className="deis-text"><h4>Structural correctness</h4><p>Evaluates whether the diagram's structure, proportions, arrows, and flow match the expected answer for that question type.</p></div>
              </div>
              <div className="deis-step">
                <div className="deis-circle">04</div>
                <div className="deis-text"><h4>Label detection &amp; spatial mapping</h4><p>Extracts handwritten labels, identifies their spatial positions, and maps them to the correct diagram regions using OCR + spatial analysis.</p></div>
              </div>
              <div className="deis-step">
                <div className="deis-circle">05</div>
                <div className="deis-text"><h4>Missing component identification</h4><p>Cross-references detected components against the expected answer rubric, identifying what is missing and assigning partial marks accordingly.</p></div>
              </div>
              <div className="deis-step">
                <div className="deis-circle">06</div>
                <div className="deis-text"><h4>Explainable scoring output</h4><p>Every mark awarded has an attached evidence region — which label was found, where, and why it earned marks. Full audit trail for moderators.</p></div>
              </div>
            </div>

            <div className="deis-visual" ref={mockupRef}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>LIVE SCORING MOCKUP — Q.4(b)</div>
              <div className="answer-mockup">
                <div className="mockup-header">
                  <div className="mockup-dot" style={{ background: "#FF5F57" }}></div>
                  <div className="mockup-dot" style={{ background: "#FEBC2E" }}></div>
                  <div className="mockup-dot" style={{ background: "#28C840" }}></div>
                  <span style={{ color: "var(--muted)", fontSize: "11px", marginLeft: "8px", fontFamily: "var(--font-mono)" }}>Edexia AIOS — Component Score View</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "1rem", fontFamily: "var(--font-mono)" }}>Q: Explain working of the human heart with a neat labeled diagram.</div>

                <div className="score-row">
                  <span className="score-label">Theory explanation</span>
                  <div className="score-bar-wrap">
                    <div className="score-bar"><div className="score-fill" style={{ width: animateMockup ? "85%" : "0%", background: "var(--accent)" }}></div></div>
                    <span className="score-val" style={{ color: "var(--accent)" }}>3.4 / 4</span>
                  </div>
                </div>
                <div className="score-row">
                  <span className="score-label">Biological accuracy</span>
                  <div className="score-bar-wrap">
                    <div className="score-bar"><div className="score-fill" style={{ width: animateMockup ? "100%" : "0%", background: "var(--accent)" }}></div></div>
                    <span className="score-val" style={{ color: "var(--accent)" }}>2 / 2</span>
                  </div>
                </div>
                <div className="score-row">
                  <span className="score-label">Diagram structure</span>
                  <div className="score-bar-wrap">
                    <div className="score-bar"><div className="score-fill" style={{ width: animateMockup ? "78%" : "0%", background: "var(--accent3)" }}></div></div>
                    <span className="score-val" style={{ color: "var(--accent3)" }}>2.3 / 3</span>
                  </div>
                </div>
                <div className="score-row">
                  <span className="score-label">Labels accuracy</span>
                  <div className="score-bar-wrap">
                    <div className="score-bar"><div className="score-fill" style={{ width: animateMockup ? "50%" : "0%", background: "var(--accent2)" }}></div></div>
                    <span className="score-val" style={{ color: "var(--accent2)" }}>0.5 / 1</span>
                  </div>
                </div>

                <div className="total-row">
                  <span className="total-label">Final Score</span>
                  <span className="total-val">8.2 / 10</span>
                </div>

                <div className="confidence-chip">
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }}></span>
                  Confidence: 91% — No human review required
                </div>

                <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>EVIDENCE — Labels pipeline</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.9" }}>
                    <span style={{ color: "var(--green)" }}>✓</span> "Right atrium" — detected, correctly placed<br />
                    <span style={{ color: "var(--green)" }}>✓</span> "Left ventricle" — detected, correctly placed<br />
                    <span style={{ color: "var(--accent2)" }}>✗</span> "Aorta" — missing from diagram<br />
                    <span style={{ color: "var(--accent2)" }}>✗</span> "Pulmonary vein" — missing from diagram
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDIA ADAPTATIONS */}
      <section style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-tag">India-First Design</div>
          <h2 className="section-title">Built for the realities<br />of Indian answer sheets</h2>
          <p className="section-sub">Not adapted from a Western grading system. Designed ground-up for what Indian board answer sheets actually look like.</p>
          <div className="india-grid fade-up">
            <div className="india-card">
              <span className="india-icon">🌐</span>
              <h4>Multilingual &amp; mixed-language</h4>
              <p>Many students write in mixed Hindi-English or regional language + English. The system handles mixed-script responses natively without failing on language boundaries.</p>
            </div>
            <div className="india-card">
              <span className="india-icon">📄</span>
              <h4>Low-quality scan handling</h4>
              <p>Most Indian centers scan at 150–200 DPI on consumer scanners. The pipeline pre-processes low-quality, skewed, and partially torn sheets before evaluation.</p>
            </div>
            <div className="india-card">
              <span className="india-icon">✍️</span>
              <h4>Handwriting variability</h4>
              <p>Indian board answers show extreme handwriting variability — from neat cursive to rough block letters under exam pressure. The OCR stack is trained for this distribution.</p>
            </div>
            <div className="india-card">
              <span className="india-icon">📐</span>
              <h4>STEM-heavy evaluation</h4>
              <p>CBSE Class 10 &amp; 12 Science, Mathematics, and Engineering Drawing demand formula recognition, step-marking, and diagram evaluation simultaneously — all in one pipeline run.</p>
            </div>
            <div className="india-card">
              <span className="india-icon">🏛️</span>
              <h4>State board rubric support</h4>
              <p>Each of 28 state boards uses slightly different marking schemes. The decomposition engine adapts to board-specific rubric formats, not a universal template.</p>
            </div>
            <div className="india-card">
              <span className="india-icon">⚖️</span>
              <h4>Legal auditability</h4>
              <p>RTI applications and court challenges on evaluation are rising. Every scored mark has an evidence chain — making the system legally defensible in a way no manual system is.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PITCH */}
      <section id="pitch" className="pitch-section">
        <div className="container">
          <div className="section-tag">The Pitch</div>
          <div className="pitch-layout">
            <div className="pitch-left">
              <h2 className="section-title">Built this<br />before being hired.</h2>
              <p>This entire system — the architecture, the DEIS pipeline, the India market analysis, the rubric decomposition engine — was designed as a demonstration of what I'd contribute to Edexia's core team.</p>
              <p>Not a cover letter. <strong>A working proposal.</strong></p>
              <p>Chandan — CSE student, Sitare University, Lucknow. AI & ML engineering background. Open to relocation.</p>
              <div className="pitch-skills">
                <span className="skill-chip">Claude API</span>
                <span className="skill-chip">FastAPI</span>
                <span className="skill-chip">React 18</span>
                <span className="skill-chip">PostgreSQL</span>
                <span className="skill-chip">Multimodal AI</span>
                <span className="skill-chip">RAG pipelines</span>
                <span className="skill-chip">ML Engineering</span>
                <span className="skill-chip">Open source</span>
              </div>
            </div>
            <div className="pitch-right-cards">
              <div className="what-built-card">
                <h4>What I built</h4>
                <ul>
                  <li>Diagram Evaluation Intelligence System (DEIS) — first dedicated pipeline for labeled diagram grading in handwritten board answers</li>
                  <li>Component-wise parallel evaluation — text, diagram, label, and reasoning pipelines fusing into a final score</li>
                  <li>Rubric-aware question decomposition — dynamic routing based on question intent</li>
                  <li>India-specific adaptations — multilingual OCR, poor scan handling, handwritten labels, state-board rubric formats</li>
                  <li>Full market analysis — TAM/SAM/SOM, revenue models, competitive landscape, policy tailwinds</li>
                </ul>
              </div>
              <div className="apply-card">
                <div className="apply-card-text">
                  <h4>Open role at Edexia</h4>
                  <p>AI Engineering · India expansion · Full-time</p>
                </div>
                <a href="mailto:chandangi2005@gmail.com" className="apply-btn">Email to Me →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Edexia AIOS</div>
        <p>AI Evaluation Infrastructure for Indian Board Examinations</p>
        <p style={{ marginTop: "6px", fontSize: "12px", opacity: 0.4, fontFamily: "var(--font-mono)" }}>Proposal by Chandan · Sitare University · 2024</p>
      </footer>
    </div>
  );
}
