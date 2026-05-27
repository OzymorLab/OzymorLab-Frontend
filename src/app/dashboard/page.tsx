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
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, width: "100%" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div style={{ width: "100%", height: `${Math.max((d.count / max) * 68, 4)}px`, background: "#1f2223", borderRadius: "4px 4px 0 0", transition: "height 0.4s ease" }} />
          <span style={{ fontSize: 10, color: "rgb(90,109,119)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Score bar ── */
function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 130 }}>
      <div style={{ flex: 1, height: 4, background: "rgb(229,230,230)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#1f2223", borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "rgb(31,34,35)", minWidth: 22, textAlign: "right" }}>{score}</span>
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
    PENDING: { label: "Queued", bg: "rgb(247,248,248)", color: "rgb(90,109,119)", border: "rgb(229,230,230)" },
  };
  const s = map[status] || { label: status, bg: "rgb(247,248,248)", color: "rgb(90,109,119)", border: "rgb(229,230,230)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [subDetail, setSubDetail] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "student_answer">("evaluation");
  const [gradeMap, setGradeMap] = useState<Record<string, GradeDetail>>({});

  const fetchSubmissions = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/submissions`);
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
    fetchSubmissions();
    const iv = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!selectedSub) { setSubDetail(null); setGradeDetail(null); setActiveTab("evaluation"); return; }
    fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}`).then(r => r.json()).then(j => { if (j.data) setSubDetail(j.data); });
    if (selectedSub.status === "GRADED") {
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`).then(r => r.json()).then(j => { if (j.data) setGradeDetail(j.data); });
    } else { setGradeDetail(null); }
  }, [selectedSub]);

  const processedCount = submissions.filter(s => s.status === "GRADED").length;
  const queueCount = submissions.filter(s => !["GRADED", "FAILED"].includes(s.status)).length;
  const latencies = Object.values(gradeMap).map(g => g.latency_ms).filter(Boolean);
  const avgLatency = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length / 1000).toFixed(1) + "s" : "—";
  const throughputData = buildThroughput(submissions);

  /* live activity */
  const liveEvents = submissions.slice(0, 10).flatMap(s => {
    const g = gradeMap[s.id];
    const sid = (s.student_id || s.id).slice(-8).toUpperCase();
    const ago = timeAgo(s.created_at);
    if (s.status === "GRADED" && g) return [`${sid} graded — ${g.grade}/${g.max_grade}${g.confidence < 0.7 ? ", low OCR confidence" : ", no drift"} · ${ago}`];
    if (s.status === "FAILED") return [`${sid} flagged — OCR error · ${ago}`];
    if (s.status === "GRADING") return [`${sid} grading in progress · ${ago}`];
    return [];
  });

  const todayCount = submissions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "'Onest', system-ui, sans-serif" }}>

      {/* ── Dark header ── */}
      <div style={{ background: "#1f2223", borderRadius: 12, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e0ff82", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#e0ff82", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Live Grading Active</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>Grading HUD</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Async multi-modal OCR · SymPy validation</p>
        </div>
        <Link href="/dashboard/exams" className="btn-lp-accent" style={{ fontSize: 12.5, padding: "8px 18px" }}>
          <GraduationCap size={13} />
          Upload Answer Sheets
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "TOTAL PROCESSED", value: processedCount, sub: "Live", subColor: "#15803d", subBg: "#f0fdf4" },
          { label: "IN GRADING QUEUE", value: queueCount, sub: queueCount > 0 ? "Active" : "Idle", subColor: queueCount > 0 ? "#b45309" : "rgb(90,109,119)", subBg: queueCount > 0 ? "#fffbeb" : "rgb(247,248,248)" },
          { label: "AVG. LATENCY", value: avgLatency, sub: "Fast", subColor: "#1d4ed8", subBg: "#eff6ff" },
        ].map((s, i) => (
          <div key={i} className="card-lp" style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgb(90,109,119)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "rgb(31,34,35)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 12 }}>{s.value}</div>
            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: s.subBg, color: s.subColor }}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Submissions table ── */}
      <div className="card-lp" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgb(229,230,230)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "rgb(31,34,35)", display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={14} style={{ color: "rgb(90,109,119)" }} />
            Recent Submissions
          </span>
          <span style={{ fontSize: 11, color: "rgb(90,109,119)" }}>{todayCount} today · {submissions.length} total</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgb(247,248,248)", borderBottom: "1px solid rgb(229,230,230)" }}>
                {["STUDENT ID", "FILENAME", "SCORE", "STATUS", "UPLOADED"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "rgb(90,109,119)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const g = gradeMap[sub.id];
                return (
                  <tr
                    key={sub.id}
                    onClick={() => sub.status === "GRADED" ? router.push(`/analysis?task_id=${sub.task_id || ""}&submission_id=${sub.id}`) : setSelectedSub(sub)}
                    style={{ borderBottom: "1px solid rgb(247,248,248)", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgb(247,248,248)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 600, color: "rgb(31,34,35)", fontFamily: "monospace" }}>
                      {sub.student_id || <span style={{ color: "rgb(179,189,189)", fontStyle: "italic", fontWeight: 400 }}>Extracting…</span>}
                    </td>
                    <td style={{ padding: "12px 20px", maxWidth: 220 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "rgb(31,34,35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.file_name}</div>
                      <div style={{ fontSize: 10.5, color: "rgb(90,109,119)", marginTop: 2 }}>{new Date(sub.created_at).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      {g ? <ScoreBar score={g.grade} max={g.max_grade} /> : <span style={{ fontSize: 11, color: "rgb(179,189,189)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 20px" }}><StatusBadge status={sub.status} /></td>
                    <td style={{ padding: "12px 20px", fontSize: 11, color: "rgb(90,109,119)", whiteSpace: "nowrap" }}>{timeAgo(sub.created_at)}</td>
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <FileText size={32} strokeWidth={1.5} style={{ color: "rgb(179,189,189)" }} />
                      <span style={{ fontSize: 13, color: "rgb(90,109,119)" }}>No submissions yet.</span>
                      <Link href="/dashboard/exams" className="btn-lp-outline" style={{ fontSize: 12, padding: "6px 14px" }}>Go to Exam Setup →</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom row: chart + live activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Throughput chart */}
        <div className="card-lp" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(31,34,35)" }}>Throughput — Last 7 Days</span>
            <span style={{ fontSize: 11, color: "rgb(90,109,119)" }}>Avg {throughputData.length ? (throughputData.reduce((a, b) => a + b.count, 0) / 7).toFixed(1) : 0}/day</span>
          </div>
          <BarChart data={throughputData} />
        </div>

        {/* Live activity */}
        <div className="card-lp" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(31,34,35)" }}>Live Activity</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: "#15803d" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Streaming
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {liveEvents.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
                <Activity size={14} style={{ color: "rgb(179,189,189)" }} />
                <span style={{ fontSize: 12, color: "rgb(179,189,189)" }}>No recent activity</span>
              </div>
            ) : liveEvents.map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < liveEvents.length - 1 ? "1px solid rgb(247,248,248)" : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ev.includes("flagged") || ev.includes("error") ? "#ef4444" : "#1f2223", marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "rgb(31,34,35)", lineHeight: 1.5 }}>{ev}</span>
              </div>
            ))}
          </div>
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
