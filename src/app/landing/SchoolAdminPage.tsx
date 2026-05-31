import React, { useRef, useState, useEffect } from "react";
import "./submission-panels.css";

const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#1f2223" />
        <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="3" fill="#1f2223" />
    </svg>
);

const TrendUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const BarChartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H17" />
        <path d="M3 12h3v8" />
    </svg>
);

export default function SchoolAdminPage() {
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

    const metrics = [
        { label: "Total Students", value: "2,847", change: "+12%", icon: <UsersIcon /> },
        { label: "Avg Grade", value: "87.3%", change: "+2.1%", icon: <BarChartIcon /> },
        { label: "Submissions", value: "12,456", change: "+340", icon: <TrendUpIcon /> },
        { label: "Pass Rate", value: "94.2%", change: "+1.8%", icon: <TrendUpIcon /> },
    ];

    const departments = [
        { name: "Mathematics", teachers: 12, students: 456, submissions: 2800, avgScore: 88 },
        { name: "Science", teachers: 15, students: 524, submissions: 3100, avgScore: 85 },
        { name: "English", teachers: 10, students: 398, submissions: 2200, avgScore: 87 },
        { name: "History", teachers: 8, students: 287, submissions: 1400, avgScore: 86 },
    ];

    return (
        <div
            ref={ref}
            className={`sp-panel sp-admin-panel ${visible ? "sp-panel--visible" : ""}`}
        >
            {/* Header with Logo */}
            <div className="sp-header">
                <div className="sp-logo-section">
                    <LogoIcon />
                    <div>
                        <h3 className="sp-brand">OzymorLab</h3>
                        <p className="sp-brand-sub">School Administration</p>
                    </div>
                </div>
                <div className="sp-status-badge sp-status--admin">Admin</div>
            </div>

            {/* Key Metrics Grid */}
            <div className="sp-metrics-grid">
                {metrics.map((metric, idx) => (
                    <div key={idx} className="sp-metric-card" style={{ "--delay": `${idx * 0.08}s` } as any}>
                        <div className="sp-metric-icon">{metric.icon}</div>
                        <div className="sp-metric-content">
                            <p className="sp-metric-label">{metric.label}</p>
                            <p className="sp-metric-value">{metric.value}</p>
                            <span className="sp-metric-change">{metric.change} this month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Department Overview */}
            <div className="sp-departments-container">
                <div className="sp-section-header">
                    <h4 className="sp-section-title">Department Performance</h4>
                    <button className="sp-btn-text">View All</button>
                </div>

                <div className="sp-departments-list">
                    {departments.map((dept, idx) => (
                        <div key={idx} className="sp-dept-item" style={{ "--delay": `${idx * 0.1}s` } as any}>
                            <div className="sp-dept-header">
                                <div className="sp-dept-name">
                                    <h5>{dept.name}</h5>
                                    <span className="sp-dept-meta">{dept.teachers} teachers · {dept.students} students</span>
                                </div>
                                <div className="sp-dept-score">
                                    <span className="sp-dept-score-label">Avg Score</span>
                                    <span className="sp-dept-score-value">{dept.avgScore}%</span>
                                </div>
                            </div>
                            <div className="sp-dept-stats">
                                <div className="sp-dept-stat">
                                    <span className="sp-stat-label">Submissions</span>
                                    <span className="sp-stat-bar">
                                        <span className="sp-stat-progress" style={{ width: `${(dept.submissions / 3500) * 100}%` }}></span>
                                    </span>
                                    <span className="sp-stat-value">{dept.submissions}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Admin Actions */}
            <div className="sp-footer sp-admin-footer">
                <button className="sp-btn sp-btn--outline">Download Report</button>
                <button className="sp-btn sp-btn--primary">Manage Settings</button>
            </div>
        </div>
    );
}
