import React, { useRef, useState, useEffect } from "react";
import "./submission-panels.css";

const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#1f2223" />
        <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="3" fill="#1f2223" />
    </svg>
);

const UploadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default function StudentSubmissionPanel() {
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
        {
            id: 1,
            assignment: "Linear Algebra Problem Set",
            type: "Assignment",
            score: "92/100",
            feedback: "Great work on eigenvectors!",
            submittedDate: "Oct 15, 2024",
        },
        {
            id: 2,
            assignment: "Differential Equations Quiz",
            type: "Quiz",
            score: "87/100",
            feedback: "Review integration techniques",
            submittedDate: "Oct 18, 2024",
        },
        {
            id: 3,
            assignment: "Calculus Exam - Chapter 5",
            type: "Exam",
            score: "95/100",
            feedback: "Outstanding performance!",
            submittedDate: "Oct 22, 2024",
        },
        {
            id: 4,
            assignment: "Matrix Operations Worksheet",
            type: "Worksheet",
            score: "88/100",
            feedback: "Well done, keep practicing",
            submittedDate: "Today",
        },
    ];

    return (
        <div
            ref={ref}
            className={`sp-panel sp-student-panel ${visible ? "sp-panel--visible" : ""}`}
        >
            {/* Header with Logo */}
            <div className="sp-header">
                <div className="sp-logo-section">
                    <LogoIcon />
                    <div>
                        <h3 className="sp-brand">OzymorLab</h3>
                        <p className="sp-brand-sub">Student Dashboard</p>
                    </div>
                </div>
                <div className="sp-status-badge sp-status--success">Excellent</div>
            </div>

            {/* Progress Overview */}
            <div className="sp-progress-section">
                <div className="sp-progress-item">
                    <div className="sp-progress-header">
                        <span className="sp-progress-label">Overall Score</span>
                        <span className="sp-progress-percentage">90.5%</span>
                    </div>
                    <div className="sp-progress-bar">
                        <div className="sp-progress-fill" style={{ width: "90.5%" }}></div>
                    </div>
                </div>
            </div>

            {/* Quick Upload */}
            <div className="sp-upload-box">
                <UploadIcon />
                <p className="sp-upload-text">Drag and drop or click to upload new assignment</p>
                <span className="sp-upload-hint">PDF, Images, or Documents up to 50MB</span>
            </div>

            {/* Submissions List */}
            <div className="sp-submissions-container">
                <h4 className="sp-section-title">Your Submissions</h4>
                <div className="sp-submissions-list">
                    {submissions.map((submission, idx) => (
                        <div key={submission.id} className="sp-submission-item sp-student-item" style={{ "--delay": `${idx * 0.1}s` } as any}>
                            <div className="sp-submission-info">
                                <div className="sp-submission-badge">{submission.type}</div>
                                <div className="sp-submission-main">
                                    <p className="sp-submission-title">{submission.assignment}</p>
                                    <p className="sp-submission-feedback">{submission.feedback}</p>
                                    <span className="sp-submission-date">{submission.submittedDate}</span>
                                </div>
                            </div>
                            <div className="sp-submission-score">
                                <CheckCircleIcon />
                                <span className="sp-score-text">{submission.score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <div className="sp-footer">
                <button className="sp-btn sp-btn--accent">
                    Upload New Assignment
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
