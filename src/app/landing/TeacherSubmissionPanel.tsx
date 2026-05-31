import React, { useRef, useState, useEffect } from "react";
import "./submission-panels.css";

const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#1f2223" />
        <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="3" fill="#1f2223" />
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

export default function TeacherSubmissionPanel() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    const submissions = [
        { id: 1, student: "Alex Johnson", subject: "Calculus", score: "92/100", status: "Graded", date: "2 days ago" },
        { id: 2, student: "Sarah Smith", subject: "Physics", score: "87/100", status: "Graded", date: "1 day ago" },
        { id: 3, student: "Emma Davis", subject: "Chemistry", score: "—", status: "Pending Review", date: "2 hours ago" },
        { id: 4, student: "James Wilson", subject: "Biology", score: "95/100", status: "Graded", date: "3 days ago" },
    ];

    return (
        <div
            ref={ref}
            className={`sp-panel sp-teacher-panel ${visible ? "sp-panel--visible" : ""}`}
        >
            {/* Header with Logo */}
            <div className="sp-header">
                <div className="sp-logo-section">
                    <LogoIcon />
                    <div>
                        <h3 className="sp-brand">OzymorLab</h3>
                        <p className="sp-brand-sub">Teacher Evaluation Hub</p>
                    </div>
                </div>
                <div className="sp-status-badge sp-status--active">Active</div>
            </div>

            {/* Statistics */}
            <div className="sp-stats">
                <div className="sp-stat-item">
                    <span className="sp-stat-label">Submissions</span>
                    <span className="sp-stat-value">24</span>
                </div>
                <div className="sp-stat-divider"></div>
                <div className="sp-stat-item">
                    <span className="sp-stat-label">Graded</span>
                    <span className="sp-stat-value">18</span>
                </div>
                <div className="sp-stat-divider"></div>
                <div className="sp-stat-item">
                    <span className="sp-stat-label">Avg Score</span>
                    <span className="sp-stat-value">88.5%</span>
                </div>
            </div>

            {/* Submissions List */}
            <div className="sp-submissions-container">
                <h4 className="sp-section-title">Recent Submissions</h4>
                <div className="sp-submissions-list">
                    {submissions.map((submission, idx) => (
                        <div key={submission.id} className="sp-submission-item" style={{ "--delay": `${idx * 0.1}s` } as any}>
                            <div className="sp-submission-info">
                                <div className="sp-submission-main">
                                    <p className="sp-submission-student">{submission.student}</p>
                                    <p className="sp-submission-subject">{submission.subject}</p>
                                </div>
                                <div className="sp-submission-meta">
                                    <span className="sp-submission-date">{submission.date}</span>
                                </div>
                            </div>
                            <div className="sp-submission-status">
                                {submission.status === "Graded" ? (
                                    <div className="sp-status-badge sp-status--graded">
                                        <CheckIcon /> {submission.score}
                                    </div>
                                ) : (
                                    <div className="sp-status-badge sp-status--pending">{submission.status}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <div className="sp-footer">
                <button className="sp-btn sp-btn--primary">
                    Review Submissions
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
