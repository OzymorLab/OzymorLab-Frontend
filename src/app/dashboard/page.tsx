"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Activity, ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface Submission {
  id: string;
  task_id?: string;
  student_id: string | null;
  file_name: string;
  status: string;
  created_at: string;
  raw_text?: string | null;
  parsed_content?: { steps: Array<{ step_num: number; text: string; equations: string[]; step_type: string }>; detected_language: string; has_diagrams: boolean; parse_confidence: number } | null;
}

interface GradeDetail {
  grade: number; max_grade: number; confidence: number;
  step_grades: Array<{ step_num: number; marks_awarded: number; max_marks: number; justification: string; error_type: string | null; sympy_valid: boolean | null }>;
  latency_ms: number; model_used: string;
}

interface DayCount { day: string; count: number; }

/* ── Deterministic name generator from UUID ── */
const FIRST_NAMES = [
  "Aarav", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya",
  "Lakshmi", "Mihail", "Neha", "Pranav", "Rhea", "Rohan",
  "Sanya", "Tanvi", "Vivaan", "Yash", "Zara", "Aman",
  "Divya", "Kiran", "Meera", "Nikhil", "Pooja", "Rahul",
  "Shriya", "Siddharth", "Tarini", "Umesh", "Vandana", "Wren",
];
const LAST_NAMES = [
  "Agarwal", "Bose", "Chandra", "Desai", "Gupta", "Iyer",
  "Joshi", "Kumar", "Mehta", "Nair", "Patel", "Rao",
  "Sharma", "Singh", "Tiwari", "Verma", "Yadav", "Bansal",
  "Chopra", "Dubey", "Goswami", "Khanna", "Malhotra", "Pillai",
  "Reddy", "Saxena", "Thakur", "Upadhyay", "Venkatesan", "Walia",
];

function generateName(id: string): { name: string; initials: string } {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const first = FIRST_NAMES[hash % FIRST_NAMES.length];
  const last = LAST_NAMES[(hash >> 2) % LAST_NAMES.length];
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
  };
}

/* helpers */
function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildThroughput(subs: Submission[]): DayCount[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toDateString();
    return { day: days[d.getDay()], count: subs.filter(s => new Date(s.created_at).toDateString() === dateStr).length };
  });
}

/* ── Bar chart ── */
function BarChart({ data }: { data: DayCount[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const yTicks = [max, Math.round(max / 2), 0];

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "stretch", width: "100%", height: 110 }}>
      {/* Y-Axis */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "86px", paddingRight: 4, fontSize: 10, color: "var(--text-secondary)", minWidth: 16, textAlign: "right" }}>
        {yTicks.map((tick, i) => (
          <span key={i}>{tick}</span>
        ))}
      </div>

      {/* Bars area container */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 8, position: "relative", height: "100%" }}>
        
        {/* Horizontal background gridlines */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
          <div style={{ borderBottom: "1px dashed var(--border-subtle)", width: "100%", height: 0 }} />
          <div style={{ borderBottom: "1px dashed var(--border-subtle)", width: "100%", height: 0 }} />
          <div style={{ borderBottom: "1px dashed var(--border-subtle)", width: "100%", height: 0 }} />
        </div>

        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
            <div 
              style={{ 
                width: "100%", 
                height: `${Math.max((d.count / max) * 66, 4)}px`, 
                background: "var(--brand-600)", 
                borderRadius: "4px 4px 0 0", 
                transition: "height 0.4s ease" 
              }} 
            />
            <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Score bar ── */
function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 130 }}>
      <div style={{ flex: 1, height: 4, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--text-primary)", borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", minWidth: 22, textAlign: "right" }}>{score}</span>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    GRADED: { label: "Graded", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    FAILED: { label: "Failed", bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
    GRADING: { label: "Grading", bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    IDENTITY_EXTRACTED: { label: "Verified", bg: "#ecfeff", color: "#0e7490", border: "#a5f3fc" },
    PARSED: { label: "Parsed", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    PARSING: { label: "Parsing", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    PENDING: { label: "Queued", bg: "var(--surface-secondary)", color: "var(--text-secondary)", border: "var(--border-subtle)" },
  };
  const s = map[status] || { label: status, bg: "var(--surface-secondary)", color: "var(--text-secondary)", border: "var(--border-subtle)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [subDetail, setSubDetail] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "student_answer">("evaluation");
  const [gradeMap, setGradeMap] = useState<Record<string, GradeDetail>>({});
  const [submissionsLimit, setSubmissionsLimit] = useState(5);
  const [liveEventsLimit, setLiveEventsLimit] = useState(5);
  const [classroomInvites, setClassroomInvites] = useState<any[]>([]);

  const fetchClassroomInvites = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom`);
      const json = await res.json();
      if (json.data) {
        const pending = json.data.filter((c: any) => c.status === "PENDING");
        setClassroomInvites(pending);
      }
    } catch (e) {
      console.error("Failed to fetch classroom invites on home dashboard", e);
    }
  };

  const handleAcceptClassroom = async (classId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${classId}/students/accept`, { method: "POST" });
      if (res.ok) {
        alert("Classroom invitation accepted!");
        fetchClassroomInvites();
      }
    } catch (e) {
      console.error("Failed to accept classroom enrollment", e);
    }
  };

  const handleRejectClassroom = async (classId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${classId}/students/reject`, { method: "POST" });
      if (res.ok) {
        alert("Classroom invitation declined.");
        fetchClassroomInvites();
      }
    } catch (e) {
      console.error("Failed to decline classroom enrollment", e);
    }
  };

  const fetchSubmissions = async (customLimit?: number) => {
    try {
      const currentLimit = customLimit ?? submissionsLimit;
      const res = await fetchWithAuth(`${API_BASE}/submissions?limit=${currentLimit}`);
      const json = await res.json();
      if (!json.data) return;
      setSubmissions(json.data);
      const graded = (json.data as Submission[]).filter(s => s.status === "GRADED").slice(0, 12);
      graded.forEach(async (s) => {
        if (gradeMap[s.id]) return;
        try {
          const gr = await fetchWithAuth(`${API_BASE}/submissions/${s.id}/grade`);
          const gj = await gr.json();
          if (gj.data) setGradeMap(prev => ({ ...prev, [s.id]: gj.data }));
        } catch { /* ignore */ }
      });
    } catch (e) { console.error("Failed to fetch submissions", e); }
  };

  useEffect(() => {
    if (user && user.role === "student") {
      fetchClassroomInvites();
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions(submissionsLimit);
    const iv = setInterval(() => fetchSubmissions(submissionsLimit), 5000);
    return () => clearInterval(iv);
  }, [submissionsLimit]);

  useEffect(() => {
    if (!selectedSub) { setSubDetail(null); setGradeDetail(null); setActiveTab("evaluation"); return; }
    fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}`).then(r => r.json()).then(j => { if (j.data) setSubDetail(j.data); });
    if (selectedSub.status === "GRADED") {
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`).then(r => r.json()).then(j => { if (j.data) setGradeDetail(j.data); });
    } else { setGradeDetail(null); }
  }, [selectedSub]);

  // Role-based computations
  const mySubmissions = submissions.filter(s => s.student_id && generateName(s.student_id).name.toLowerCase() === user?.full_name.toLowerCase());
  const myGraded = mySubmissions.filter(s => s.status === "GRADED");
  const myPending = mySubmissions.filter(s => !["GRADED", "FAILED"].includes(s.status));
  
  let myAvgScore = "—";
  if (myGraded.length > 0) {
    const scores = myGraded.map(s => {
      const g = gradeMap[s.id];
      return g ? g.grade : null;
    }).filter((s): s is number => s !== null);
    if (scores.length > 0) {
      myAvgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + " pts";
    }
  }

  const processedCount = user?.role === "student" ? myGraded.length : submissions.filter(s => s.status === "GRADED").length;
  const queueCount = user?.role === "student" ? myPending.length : submissions.filter(s => !["GRADED", "FAILED"].includes(s.status)).length;
  const latencies = Object.values(gradeMap).map(g => g.latency_ms).filter(Boolean);
  const avgLatency = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length / 1000).toFixed(1) + "s" : "—";
  const throughputData = buildThroughput(user?.role === "student" ? mySubmissions : submissions);
  const displayedSubmissions = user?.role === "student" ? mySubmissions.slice(0, submissionsLimit) : submissions.slice(0, submissionsLimit);

  /* live activity */
  const allLiveEvents = (user?.role === "student" ? mySubmissions : submissions).flatMap(s => {
    const g = gradeMap[s.id];
    const sid = (s.student_id || s.id).slice(-8).toUpperCase();
    const ago = timeAgo(s.created_at);
    if (s.status === "GRADED" && g) return [`${user?.role === "student" ? "Your paper" : sid} graded — ${g.grade}/${g.max_grade}${g.confidence < 0.7 ? ", low OCR confidence" : ", no drift"} · ${ago}`];
    if (s.status === "FAILED") return [`${user?.role === "student" ? "Your paper" : sid} flagged — OCR error · ${ago}`];
    if (s.status === "GRADING") return [`${user?.role === "student" ? "Your paper" : sid} grading in progress · ${ago}`];
    return [];
  });

  const displayedLiveEvents = allLiveEvents.slice(0, liveEventsLimit);

  const todayCount = (user?.role === "student" ? mySubmissions : submissions).filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "'Onest', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ padding: "12px 0 8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: "#16a34a", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Live Grading Active</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>
            {user?.role === "student" ? `Welcome, ${user.full_name}` : "Welcome to Ozymor Lab"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            {user?.role === "student" 
              ? "Track your exam submissions, step-by-step grading traces, and AI-driven insights."
              : "Empowering education through state-of-the-art AI-driven answer evaluation."}
          </p>
        </div>
        {user?.role === "student" ? (
          <Link href="/dashboard/submissions" className="btn-lp-accent" style={{ fontSize: 12.5, padding: "10px 20px" }}>
            <FileText size={14} />
            View My Submissions
            <ArrowRight size={13} />
          </Link>
        ) : (
          <Link href="/dashboard/exams" className="btn-lp-accent" style={{ fontSize: 12.5, padding: "10px 20px" }}>
            <GraduationCap size={14} />
            Upload Answer Sheets
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Classroom Invitations notifications for Students */}
      {user?.role === "student" && classroomInvites.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {classroomInvites.map((invite) => (
            <div
              key={invite.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "rgba(224, 255, 130, 0.08)",
                border: "1px solid rgba(224, 255, 130, 0.3)",
                borderRadius: 12,
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "rgba(224, 255, 130, 0.15)", color: "#e0ff82" }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#e0ff82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Classroom invitation</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "2px 0 0" }}>
                    You have been invited to join the classroom <strong style={{ color: "#e0ff82" }}>{invite.subject}</strong> (Class: {invite.className}, Session: {invite.session}) by {invite.creator}.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleRejectClassroom(invite.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAcceptClassroom(invite.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: "#e0ff82",
                    color: "#1f2223",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Accept &amp; Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { 
            label: user?.role === "student" ? "MY SUBMISSIONS" : "TOTAL PROCESSED", 
            value: user?.role === "student" ? mySubmissions.length : processedCount, 
            sub: "Live", 
            subColor: "#15803d", 
            subBg: "#f0fdf4" 
          },
          { 
            label: user?.role === "student" ? "MY AVERAGE SCORE" : "IN GRADING QUEUE", 
            value: user?.role === "student" ? myAvgScore : queueCount, 
            sub: user?.role === "student" ? "Academic" : (queueCount > 0 ? "Active" : "Idle"), 
            subColor: user?.role === "student" ? "#1d4ed8" : (queueCount > 0 ? "#b45309" : "var(--text-secondary)"), 
            subBg: user?.role === "student" ? "#eff6ff" : (queueCount > 0 ? "#fffbeb" : "var(--surface-secondary)") 
          },
          { 
            label: user?.role === "student" ? "PENDING EVALUATION" : "AVG. LATENCY", 
            value: user?.role === "student" ? myPending.length : avgLatency, 
            sub: user?.role === "student" ? "Queue" : "Fast", 
            subColor: user?.role === "student" ? "#b45309" : "#1d4ed8", 
            subBg: user?.role === "student" ? "#fffbeb" : "#eff6ff" 
          },
        ].map((s, i) => (
          <div key={i} className="card-lp" style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 12 }}>{s.value}</div>
            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: s.subBg, color: s.subColor }}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Submissions table ── */}
      <div className="card-lp" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={14} style={{ color: "var(--text-secondary)" }} />
            Recent Submissions
          </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{todayCount} today · {user?.role === "student" ? mySubmissions.length : submissions.length} total</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
                {["STUDENT NAME", "FILENAME", "SCORE", "STATUS", "UPLOADED"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedSubmissions.map((sub) => {
                const g = gradeMap[sub.id];
                return (
                  <tr
                    key={sub.id}
                    onClick={() => sub.status === "GRADED" ? router.push(`/analysis?task_id=${sub.task_id || ""}&submission_id=${sub.id}`) : setSelectedSub(sub)}
                    style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      {sub.student_id ? generateName(sub.student_id).name : <span style={{ color: "var(--text-tertiary)", fontStyle: "italic", fontWeight: 400 }}>Extracting…</span>}
                    </td>
                    <td style={{ padding: "12px 20px", maxWidth: 220 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.file_name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 2 }}>{new Date(sub.created_at).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      {g ? <ScoreBar score={g.grade} max={g.max_grade} /> : <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 20px" }}><StatusBadge status={sub.status} /></td>
                    <td style={{ padding: "12px 20px", fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{timeAgo(sub.created_at)}</td>
                  </tr>
                );
              })}
              {(user?.role === "student" ? mySubmissions.length : submissions.length) === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <FileText size={32} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>No submissions yet.</span>
                      <Link href={user?.role === "student" ? "/dashboard/submissions" : "/dashboard/exams"} className="btn-lp-outline" style={{ fontSize: 12, padding: "6px 14px" }}>
                        {user?.role === "student" ? "View My Submissions →" : "Go to Exam Setup →"}
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        { ((user?.role === "student" ? mySubmissions.length : submissions.length) === submissionsLimit || submissionsLimit > 5) && (
          <div style={{ padding: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "center", gap: 16 }}>
            {(user?.role === "student" ? mySubmissions.length : submissions.length) === submissionsLimit && (
              <button
                onClick={() => setSubmissionsLimit(prev => prev + 5)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "inherit"
                }}
              >
                See more (+5)
                <ArrowRight size={12} style={{ transform: "rotate(90deg)" }} />
              </button>
            )}
            {submissionsLimit > 5 && (
              <button
                onClick={() => setSubmissionsLimit(5)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#E24B4A",
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "inherit"
                }}
              >
                See less
                <ArrowRight size={12} style={{ transform: "rotate(-90deg)" }} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom row: chart + live activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Throughput chart */}
        <div className="card-lp" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", minHeight: "180px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Throughput — Last 7 Days</span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Avg {throughputData.length ? (throughputData.reduce((a, b) => a + b.count, 0) / 7).toFixed(1) : 0}/day</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", marginTop: "auto", width: "100%" }}>
            <BarChart data={throughputData} />
          </div>
        </div>

        {/* Live activity */}
        <div className="card-lp" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Live Activity</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: "#15803d" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Streaming
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {displayedLiveEvents.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
                <Activity size={14} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No recent activity</span>
              </div>
            ) : displayedLiveEvents.map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < displayedLiveEvents.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ev.includes("flagged") || ev.includes("error") ? "#ef4444" : "var(--text-primary)", marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5 }}>{ev}</span>
              </div>
            ))}
          </div>
          { (allLiveEvents.length > liveEventsLimit || liveEventsLimit > 5) && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 12, display: "flex", justifyContent: "center", gap: 16 }}>
              {allLiveEvents.length > liveEventsLimit && (
                <button
                  onClick={() => setLiveEventsLimit(prev => prev + 5)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit"
                  }}
                >
                  See more (+5)
                  <ArrowRight size={11} style={{ transform: "rotate(90deg)" }} />
                </button>
              )}
              {liveEventsLimit > 5 && (
                <button
                  onClick={() => setLiveEventsLimit(5)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#E24B4A",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit"
                  }}
                >
                  See less
                  <ArrowRight size={11} style={{ transform: "rotate(-90deg)" }} />
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Detail slide panel ── */}
      {selectedSub && (
        <div className="slide-overlay" onClick={() => setSelectedSub(null)}>
          <div className="slide-panel animate-slide-r" onClick={e => e.stopPropagation()}>
            <div className="slide-header">
              <div className="slide-title">Evaluation Details</div>
              <button className="slide-close" onClick={() => setSelectedSub(null)}>×</button>
            </div>
            <div className="slide-body">
              <div className="flex items-center gap-3 mb-6">
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1f2223", color: "#e0ff82", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                  {(selectedSub.student_id || "??").slice(-2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "rgb(31,34,35)" }}>{selectedSub.student_id || "Unknown Student"}</div>
                  <div style={{ fontSize: 11, color: "rgb(90,109,119)", fontFamily: "monospace" }}>{selectedSub.id.slice(0, 20)}…</div>
                </div>
              </div>

              <div style={{ display: "flex", borderBottom: "1px solid rgb(229,230,230)", marginBottom: 20 }}>
                {(["evaluation", "student_answer"] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "rgb(31,34,35)" : "rgb(90,109,119)", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid rgb(31,34,35)" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s" }}>
                    {tab === "evaluation" ? "Evaluation Traces" : "Student Answer"}
                  </button>
                ))}
              </div>

              {activeTab === "evaluation" ? (
                selectedSub.status !== "GRADED" ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "rgb(90,109,119)" }}>
                    <Activity size={28} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <div style={{ fontSize: 13 }}>Evaluation in progress…</div>
                  </div>
                ) : !gradeDetail ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "rgb(90,109,119)", fontSize: 13 }}>Loading grade data…</div>
                ) : (
                  <>
                    <div className="score-display"><div className="score-num">{gradeDetail.grade}</div><div className="score-max">/ {gradeDetail.max_grade}</div></div>
                    <div className="divider" />
                    <div className="slide-section">
                      <div className="slide-section-label">STEP TRACES</div>
                      <div className="step-list">
                        {gradeDetail.step_grades.map((step, idx) => (
                          <div key={idx} className="step-card">
                            <div className="step-card-top"><div className="step-name">Step {step.step_num}</div><div className="step-marks">{step.marks_awarded} / {step.max_marks}</div></div>
                            <div className="step-justification">{step.justification}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="slide-section">
                      <div className="slide-section-label">METADATA</div>
                      <div className="meta-row"><span className="meta-key">Latency</span><span className="meta-val">{gradeDetail.latency_ms}ms</span></div>
                      <div className="meta-row"><span className="meta-key">Confidence</span><span className="meta-val">{(gradeDetail.confidence * 100).toFixed(1)}%</span></div>
                      <div className="meta-row"><span className="meta-key">Model</span><span className="meta-val">{gradeDetail.model_used}</span></div>
                    </div>
                  </>
                )
              ) : (
                !subDetail ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "rgb(90,109,119)", fontSize: 13 }}>Loading student answer…</div>
                ) : subDetail.parsed_content?.steps?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 480, overflowY: "auto" }}>
                    {subDetail.parsed_content.steps.map((step, idx) => (
                      <div key={idx} style={{ background: "rgb(247,248,248)", border: "1px solid rgb(229,230,230)", borderRadius: 10, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(31,34,35)", textTransform: "uppercase" as const }}>Step {step.step_num}</span>
                          <span style={{ fontSize: 10, background: "rgb(229,230,230)", color: "rgb(90,109,119)", padding: "2px 8px", borderRadius: 100 }}>{step.step_type}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgb(31,34,35)", lineHeight: 1.6 }}>{step.text}</p>
                      </div>
                    ))}
                  </div>
                ) : subDetail.raw_text ? (
                  <pre style={{ fontSize: 12, color: "rgb(90,109,119)", background: "rgb(247,248,248)", border: "1px solid rgb(229,230,230)", borderRadius: 10, padding: 16, whiteSpace: "pre-wrap", maxHeight: 480, overflowY: "auto" }}>{subDetail.raw_text}</pre>
                ) : (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "rgb(90,109,119)", fontSize: 13 }}>No student answer text parsed yet.</div>
                )
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
