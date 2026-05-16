"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield, Brain, Eye, BarChart3, Users, Zap,
  ChevronRight, ArrowRight, FileText, GitBranch, Layers,
  CheckCircle2, Star, Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`landing-page ${mounted ? "is-visible" : ""}`}>
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="logo-mark">Ex</div>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#pipelines">Architecture</a>
            <a href="#stats">Impact</a>
          </div>
          <div className="landing-nav-actions">
            <Link href="/login" className="btn">Sign In</Link>
            <Link href="/login?tab=signup" className="btn btn-brand">Get Started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          AI-Powered Multimodal Evaluation
        </div>
        <h1 className="hero-title">
          The Future of<br />
          <span className="hero-gradient">Board Examination</span><br />
          Assessment
        </h1>
        <p className="hero-subtitle">
          Rubric-grounded, explainable, component-wise evaluation infrastructure
          for CBSE, ICSE, State Boards, and Competitive Examinations.
          Built for millions of answer sheets.
        </p>
        <div className="hero-actions">
          <Link href="/login?tab=signup" className="btn btn-brand btn-lg">
            Start Evaluating <ArrowRight size={16} />
          </Link>
          <Link href="#features" className="btn btn-lg">
            See How It Works <ChevronRight size={16} />
          </Link>
        </div>

        {/* Animated pipeline visualization */}
        <div className="hero-pipeline">
          <div className="pipeline-node pipeline-node-1">
            <FileText size={20} />
            <span>Answer Sheet</span>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-node pipeline-node-2">
            <Layers size={20} />
            <span>Decompose</span>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-branch">
            <div className="branch-item branch-text">Text</div>
            <div className="branch-item branch-diagram">Diagram</div>
            <div className="branch-item branch-labels">Labels</div>
            <div className="branch-item branch-reasoning">Reasoning</div>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-node pipeline-node-4">
            <BarChart3 size={20} />
            <span>Final Grade</span>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <div className="section-badge">Core Capabilities</div>
          <h2 className="section-title">Why Edexia?</h2>
          <p className="section-subtitle">
            Each answer is decomposed into independent evaluation components and
            evaluated in parallel — exactly like a trained human examiner.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Brain size={24} /></div>
            <h3>Question Decomposition</h3>
            <p>LLM-powered engine breaks each question into text, diagram, labels, and reasoning components before evaluation begins.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Eye size={24} /></div>
            <h3>Diagram Intelligence (DEIS)</h3>
            <p>Detects, validates, and scores diagrams using structural graph isomorphism. Labels are matched with fuzzy OCR tolerance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={24} /></div>
            <h3>Confidence Gating</h3>
            <p>Low-confidence results are automatically flagged for mandatory human review. Teachers remain the final decision-makers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><GitBranch size={24} /></div>
            <h3>Parallel Pipelines</h3>
            <p>Text, diagram, label, and reasoning pipelines run independently. Scores are fused using mathematical distribution convolution.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={24} /></div>
            <h3>Bring Your Own Key</h3>
            <p>Teachers can use their own Gemini API key for grading. Full control over AI usage and billing.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Users size={24} /></div>
            <h3>Human-in-the-Loop</h3>
            <p>Built as evaluator-assistance infrastructure, not replacement. Moderation dashboards for review, approve, and override.</p>
          </div>
        </div>
      </section>

      {/* ── Pipeline Architecture ── */}
      <section className="landing-section landing-section-alt" id="pipelines">
        <div className="section-header">
          <div className="section-badge">Architecture</div>
          <h2 className="section-title">Component-Wise Evaluation</h2>
          <p className="section-subtitle">
            Real board examination answers are multimodal. A single answer may contain
            text, diagrams, formulas, labels, and reasoning steps. We evaluate each independently.
          </p>
        </div>

        <div className="pipeline-cards">
          <div className="pipeline-card">
            <div className="pipeline-card-icon text-pipeline">T</div>
            <h4>Text Pipeline</h4>
            <p>Explanations, definitions, theoretical reasoning, concept correctness</p>
            <div className="pipeline-card-tech">SymPy + LLM Grading</div>
          </div>
          <div className="pipeline-card">
            <div className="pipeline-card-icon diagram-pipeline">D</div>
            <h4>Diagram Pipeline</h4>
            <p>Structural correctness, relevance, completeness via DEIS cluster</p>
            <div className="pipeline-card-tech">YOLOv8 + Graph Isomorphism</div>
          </div>
          <div className="pipeline-card">
            <div className="pipeline-card-icon label-pipeline">L</div>
            <h4>Label Pipeline</h4>
            <p>Handwritten label validation with fuzzy OCR matching against rubric terminology</p>
            <div className="pipeline-card-tech">thefuzz + Token Sort Ratio</div>
          </div>
          <div className="pipeline-card">
            <div className="pipeline-card-icon reasoning-pipeline">R</div>
            <h4>Reasoning Pipeline</h4>
            <p>Stepwise logic, derivation flow, procedural correctness, presentation quality</p>
            <div className="pipeline-card-tech">SymPy Validation + LLM Flow Analysis</div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-section" id="stats">
        <div className="section-header">
          <div className="section-badge">Impact</div>
          <h2 className="section-title">Designed for Scale</h2>
        </div>

        <div className="stats-banner">
          <div className="stat-block">
            <div className="stat-number">4</div>
            <div className="stat-desc">Parallel Pipelines</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">22</div>
            <div className="stat-desc">Secured API Endpoints</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">0.6</div>
            <div className="stat-desc">Confidence Threshold</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">∞</div>
            <div className="stat-desc">Answer Sheets Supported</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Ready to Transform Evaluation?</h2>
        <p>Join the next generation of AI-assisted board examination assessment.</p>
        <Link href="/login?tab=signup" className="btn btn-brand btn-lg">
          Create Your Account <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo">
            <div className="logo-mark">Ex</div>
            <span className="logo-name">Edexia AIOS</span>
          </div>
          <p className="footer-copy">
            AI-Powered Multimodal Evaluation Infrastructure for Board Examination Systems.
            Built with Gemini, FastAPI, and Next.js.
          </p>
        </div>
      </footer>
    </div>
  );
}
