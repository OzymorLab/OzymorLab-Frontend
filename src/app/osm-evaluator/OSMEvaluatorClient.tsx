'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../landing/landing.css';

/* ── Icons ── */
const LogoIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#1f2223" />
        <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="3" fill="#1f2223" />
    </svg>
);
const ArrowRight = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
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

const navLinks = [
    { label: "About", href: "/about" },
    { label: "Feature", href: "/feature" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
];

export default function OSMEvaluatorClient() {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
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

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const faqItems = [
        {
            id: 'what-is-osm',
            title: 'What is OSM (On-Screen Marking)?',
            content: `On-Screen Marking (OSM) is a digital examination system where examiners evaluate answer sheets on computer screens instead of paper. Introduced by CBSE and other Indian boards, OSM uses specialized software to display student answers digitally. Examiners assign marks electronically while following the official marking scheme, making the process faster and more standardized than traditional paper-based marking.`
        },
        {
            id: 'osm-vs-traditional',
            title: 'OSM vs Traditional Marking: Key Differences',
            content: `<strong>Traditional Marking (Paper-based):</strong><br />
      • Physical answer sheets manually transported between schools<br />
      • Handwritten marks on papers, prone to illegibility<br />
      • Manual compilation of scores (time-consuming & error-prone)<br />
      • Inconsistent marking across different evaluators<br />
      • Difficult to track and audit marking progress<br />
      • Higher storage and document management costs<br />
      • Long result declaration delays (30-45 days)<br /><br />
      
      <strong>OSM (Digital On-Screen Marking):</strong><br />
      • Answer sheets digitized and uploaded to secure servers<br />
      • Marks entered digitally with automatic validation<br />
      • Instant data synchronization and compilation<br />
      • Standardized rubric enforced for consistency<br />
      • Complete audit trail and real-time progress tracking<br />
      • Reduced paper waste and storage needs<br />
      • Faster result processing (7-14 days)<br />
      • Built-in quality control and moderation`
        },
        {
            id: 'osm-process',
            title: 'How Does OSM Marking Work?',
            content: `1. <strong>Digitization:</strong> Answer sheets are scanned using high-resolution cameras<br />
      2. <strong>Upload:</strong> Digital images uploaded to secure OSM servers<br />
      3. <strong>Examiner Login:</strong> Authorized examiners access the platform with credentials<br />
      4. <strong>Answer Display:</strong> Answer sheets displayed on screen with marking tools<br />
      5. <strong>Mark Entry:</strong> Examiners assign marks per criterion following the official scheme<br />
      6. <strong>Validation:</strong> System validates marks against maximum marks<br />
      7. <strong>Save & Next:</strong> Marks saved automatically, examiner moves to next answer sheet<br />
      8. <strong>Quality Check:</strong> Moderation/verification by senior examiners<br />
      9. <strong>Report Generation:</strong> Automated compilation of results`
        },
        {
            id: 'cbse-osm',
            title: 'Is OSM Used by CBSE?',
            content: `Yes, CBSE has fully implemented On-Screen Marking for all board exams (Class 10 and 12). Starting from 2013, CBSE adopted OSM to ensure:<br />
      • Consistent evaluation standards across all centers<br />
      • Faster result announcement<br />
      • Reduced human error in mark compilation<br />
      • Better tracking of examiner performance<br />
      • Secure storage of answer sheets and marks<br /><br />
      
      Today, CBSE conducts OSM for Class 10 Board Exams, Class 12 Board Exams, and other CBSE-conducted examinations. Other Indian boards like ICSE, state boards, and competitive exam conductors have also adopted similar systems.`
        },
        {
            id: 'osm-advantages',
            title: 'What Are the Main Advantages of OSM?',
            content: `1. <strong>Speed:</strong> Results declared 2-3 weeks faster than traditional marking<br />
      2. <strong>Accuracy:</strong> Digital validation prevents mathematical errors in compilation<br />
      3. <strong>Consistency:</strong> Standardized rubrics ensure uniform evaluation<br />
      4. <strong>Transparency:</strong> Complete audit trail of every mark awarded<br />
      5. <strong>Security:</strong> Encrypted data storage and secure access controls<br />
      6. <strong>Environment-friendly:</strong> Reduced paper usage and transportation<br />
      7. <strong>Cost-efficient:</strong> Lower administrative overhead<br />
      8. <strong>Quality Assurance:</strong> Built-in moderation and verification checks<br />
      9. <strong>Accessibility:</strong> Examiners can mark from authorized centers<br />
      10. <strong>Real-time Monitoring:</strong> Officials can track marking progress in real-time`
        },
        {
            id: 'osm-marking-reliability',
            title: 'How Reliable is OSM Marking?',
            content: `OSM marking is highly reliable due to:<br />
      • <strong>Standardized Rubrics:</strong> All examiners follow identical marking schemes<br />
      • <strong>Quality Moderation:</strong> 10-15% of answer sheets are reviewed by senior examiners<br />
      • <strong>Digital Validation:</strong> System prevents marks exceeding the maximum<br />
      • <strong>Examiner Training:</strong> All examiners undergo extensive training<br />
      • <strong>Random Verification:</strong> Spot checks ensure consistency<br />
      • <strong>Data Backup:</strong> Multiple server backups prevent data loss<br />
      • <strong>Audit Logs:</strong> Complete record of all marking changes<br /><br />
      
      Studies show OSM has a consistency rate of 95%+ with minimal discrepancies between first and second marking.`
        },
        {
            id: 'osm-vs-ai',
            title: 'How Does AI Answer Sheet Evaluation Compare to OSM?',
            content: `<strong>OSM (Human Examiners):</strong><br />
      • Qualitative assessment with human judgment<br />
      • Follows official board marking schemes<br />
      • Takes 45 minutes - 2 hours per answer sheet<br />
      • Subject to examiner fatigue and bias<br />
      • Suitable for large-scale official exams<br /><br />
      
      <strong>AI Answer Sheet Evaluation (OzymorLab):</strong><br />
      • Instant evaluation (seconds per answer)<br />
      • Consistent application of rubrics 24/7<br />
      • Can evaluate in 22 Indian languages<br />
      • Evidence-backed marks with explanations<br />
      • Suitable for practice, assessment, and training<br />
      • Can work alongside OSM for quality assurance<br />
      • Detects handwriting, diagrams, and equations<br />
      • Provides actionable feedback for improvement<br /><br />
      
      <strong>Combined Approach:</strong> AI evaluation for practice exams and quick feedback, while OSM remains the official marking method for board exams. OzymorLab helps students prepare by providing exam-like evaluations before the actual OSM conducted by boards.`
        },
        {
            id: 'ai-osm-evaluator',
            title: 'What is an AI OSM Evaluator?',
            content: `An AI OSM Evaluator is a software tool that automatically evaluates answer sheets using artificial intelligence, designed to simulate the OSM marking process. Key features include:<br /><br />
      • <strong>Digital Answer Processing:</strong> Accepts text, handwriting, diagrams, and equations<br />
      • <strong>Rubric-based Evaluation:</strong> Follows CBSE/ICSE/State Board marking schemes<br />
      • <strong>Criterion Scoring:</strong> Awards marks per criterion (content, presentation, etc.)<br />
      • <strong>Evidence Extraction:</strong> Quotes relevant parts of answers as justification<br />
      • <strong>Multilingual Support:</strong> Evaluates answers in 22 Indian languages<br />
      • <strong>Instant Results:</strong> Provides marks and feedback immediately<br />
      • <strong>Learning Adaptation:</strong> Learns teacher/examiner style for better accuracy<br /><br />
      
      OzymorLab's AI OSM Evaluator helps students practice before taking actual OSM board exams, providing exam-realistic feedback in minutes rather than weeks.`
        },
        {
            id: 'practice-vs-official',
            title: 'Can I Practice OSM with AI Before the Real Exam?',
            content: `Yes! AI answer sheet evaluators like OzymorLab allow you to:<br /><br />
      1. <strong>Practice Answering:</strong> Write answers in exam format<br />
      2. <strong>Instant Evaluation:</strong> Get marks and feedback immediately<br />
      3. <strong>Understand Marking Scheme:</strong> See exactly how marks are awarded<br />
      4. <strong>Improve Weak Areas:</strong> Identify criteria where you lose marks<br />
      5. <strong>Build Confidence:</strong> Practice repeatedly before the real OSM exam<br />
      6. <strong>Track Progress:</strong> Monitor improvement across practice attempts<br />
      7. <strong>Learn Time Management:</strong> Complete full papers under exam conditions<br /><br />
      
      This practice is especially valuable because:<br />
      • You understand the expected answer format<br />
      • You know what examiners look for in each criterion<br />
      • You gain confidence with actual marking criteria<br />
      • You can practice unlimited without waiting for results<br />
      • The feedback helps you refine answers before board exams`
        },
        {
            id: 'osm-accuracy-ai',
            title: 'How Accurate is AI Evaluation Compared to OSM?',
            content: `Our analysis shows:<br /><br />
      • <strong>AI Accuracy:</strong> 83% within 1 mark of human examiner scores<br />
      • <strong>Consistency:</strong> AI maintains 99% consistency across evaluations<br />
      • <strong>Speed Advantage:</strong> AI evaluates in seconds vs. 1-2 hours for human<br />
      • <strong>Scalability:</strong> Can evaluate thousands of papers simultaneously<br /><br />
      
      <strong>Why Not 100%?</strong><br />
      • Human judgment involves subjective interpretation<br />
      • Different examiners may award marks differently (expected range: ±2 marks)<br />
      • AI learns to match the dominant examiner pattern<br /><br />
      
      <strong>Best Practice:</strong> Use AI for practice and learning, official OSM for board exams. The skills you develop with AI evaluation transfer directly to improved performance in actual OSM exams.`
        },
        {
            id: 'osm-boards',
            title: 'Which Indian Boards Use OSM?',
            content: `<strong>Full OSM Implementation:</strong><br />
      • CBSE - Class 10 & 12 Board Exams (since 2013)<br />
      • NIOS - Open School Exams<br />
      • ICSE - Indian Certificate of Secondary Education (selected regions)<br /><br />
      
      <strong>Partial/Planned Implementation:</strong><br />
      • Maharashtra State Board<br />
      • UP Board<br />
      • MP Board<br />
      • Karnataka State Board<br />
      • Tamil Nadu Board<br />
      • Other state boards progressively adopting<br /><br />
      
      <strong>Competitive Exams Using Similar Systems:</strong><br />
      • JEE (selected centers)<br />
      • NEET (some centers)<br />
      • Various state-level exams<br /><br />
      
      Most major Indian boards have either implemented or are in the process of implementing OSM to ensure standardized, transparent, and faster evaluation.`
        },
        {
            id: 'prepare-for-osm',
            title: 'How to Prepare for OSM Exams?',
            content: `<strong>Practice Strategy:</strong><br />
      1. Use AI evaluators like OzymorLab to practice answering<br />
      2. Learn the official marking scheme for your board<br />
      3. Practice writing concise, criterion-focused answers<br />
      4. Get feedback on weak areas from AI evaluations<br />
      5. Revise and reattempt weak topics<br />
      6. Track progress over multiple practice sessions<br /><br />
      
      <strong>Answer Format Tips for OSM:</strong><br />
      • Write clearly (text will be scanned and displayed)<br />
      • Use bullet points for organization<br />
      • Label diagrams properly<br />
      • Show all steps in mathematical solutions<br />
      • Use evidence/examples to support arguments<br />
      • Structure answers per marking criteria<br /><br />
      
      <strong>Timing Tips:</strong><br />
      • Practice under timed conditions<br />
      • Aim to complete the paper in allocated time<br />
      • Leave time for review before submission<br />
      • Use AI practice to simulate exam pressure<br /><br />
      
      <strong>Multilingual Advantage:</strong><br />
      • If you write in regional language, practice evaluations in that language<br />
      • OzymorLab supports 22 Indian languages for authentic practice`
        }
    ];

    return (
        <div className="lp-root">
            {/* Nav Bar */}
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

            {/* Hero Header */}
            <section className="lp-hero" style={{ padding: "160px 24px 60px" }}>
                <div className="lp-hero__dots" />
                <div className="lp-hero__content">
                    <div className="lp-hero__badge lp-anim-fade" style={{ animationDelay: "0.2s" }}>
                        <span className="lp-hero__badge-tag">OSM Guide</span>
                        <span>Official On-Screen Marking Standards</span>
                    </div>
                    <h1 className="lp-hero__title lp-anim-fade" style={{ animationDelay: "0.3s", fontSize: "clamp(32px, 5vw, 56px)", maxWidth: "800px" }}>
                        OSM & AI Answer <span className="lp-highlight lp-highlight--underline">Sheet Evaluation</span>
                    </h1>
                    <p className="lp-hero__subtitle lp-anim-fade" style={{ animationDelay: "0.4s", maxWidth: "600px" }}>
                        Learn about CBSE On-Screen Marking (OSM) digital exam checkers, and practice with AI answer sheet evaluators to get board-ready.
                    </p>
                </div>
            </section>

            {/* Intro Section */}
            <section style={{ padding: "0 24px 60px", background: "var(--lp-bg)", transition: "background 0.3s ease" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div className="lp-detail-card" style={{ background: "linear-gradient(135deg, var(--lp-surface) 0%, rgba(224, 255, 130, 0.04) 100%)", border: "1px solid var(--lp-border)" }}>
                        <div className="lp-detail-card__badge" style={{ background: "var(--lp-accent)", color: "var(--lp-fg)", fontWeight: "600" }}>What You'll Learn</div>
                        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="lp-faq-learn-list">
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--lp-fg)" }}>✓ What OSM is and how it works</li>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--lp-fg)" }}>✓ OSM vs traditional paper marking</li>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--lp-fg)" }}>✓ AI answer sheet evaluation compared to OSM</li>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--lp-fg)" }}>✓ How to use AI practice to prepare</li>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--lp-fg)", gridColumn: "span 2" }}>✓ Accuracy and complete reliability of digital methods</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* FAQ Accordion Section */}
            <section className="lp-faqs" style={{ padding: "0 24px 80px", borderTop: "none" }}>
                <div className="lp-faqs__accordion">
                    {faqItems.map((item) => {
                        const isExpanded = expandedSection === item.id;
                        return (
                            <div key={item.id} className="lp-faqs__item">
                                <button
                                    onClick={() => toggleSection(item.id)}
                                    className="lp-faqs__item-header"
                                    aria-expanded={isExpanded}
                                >
                                    <span>{item.title}</span>
                                    <span className={`lp-faqs__item-icon ${isExpanded ? 'lp-faqs__item-icon--expanded' : ''}`}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={`lp-faqs__item-body ${isExpanded ? 'lp-faqs__item-body--expanded' : ''}`}>
                                    <p
                                        style={{ color: "var(--lp-muted)", fontSize: "14px", lineHeight: "1.6" }}
                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Key Statistics Grid */}
                <div style={{ maxWidth: "800px", margin: "64px auto 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="lp-faq-stats-grid">
                    <div className="lp-elevating__card" style={{ textAlign: "center", padding: "24px" }}>
                        <div style={{ fontSize: "36px", fontWeight: "700", color: "var(--lp-fg)", marginBottom: "4px" }}>95%+</div>
                        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lp-muted)" }}>OSM Consistency</div>
                    </div>
                    <div className="lp-elevating__card" style={{ textAlign: "center", padding: "24px" }}>
                        <div style={{ fontSize: "36px", fontWeight: "700", color: "var(--lp-fg)", marginBottom: "4px" }}>83%</div>
                        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lp-muted)" }}>AI Evaluator Accuracy</div>
                    </div>
                    <div className="lp-elevating__card" style={{ textAlign: "center", padding: "24px" }}>
                        <div style={{ fontSize: "36px", fontWeight: "700", color: "var(--lp-fg)", marginBottom: "4px" }}>22</div>
                        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lp-muted)" }}>Indian Languages</div>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="lp-faqs__cta-banner">
                    <div className="lp-faqs__cta-banner-content">
                        <h3>Ready to Practice with AI OSM Evaluation?</h3>
                        <p>Start practicing your answers with OzymorLab's AI evaluator and get ready for your board exams. Get instant feedback and improve.</p>
                    </div>
                    <Link href="/waitlist" className="lp-btn lp-btn--accent lp-btn--lg lp-btn--icon text-white" style={{ display: "inline-flex", alignItems: "center" }}>
                        Get 50 Free Credits Now <ArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer" style={{ borderTop: "1px solid var(--lp-border)" }}>
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
                        <p>&copy; {new Date().getFullYear()} OzymorLab. All rights reserved. Indian Board OSM Guidelines compliance enabled.</p>
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
