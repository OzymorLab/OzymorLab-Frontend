
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, Search, Filter, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, ArrowRight, Eye, Sparkles, XCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

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

function generateStudentName(id: string | null): { name: string; initials: string } {
  if (!id) return { name: "Unknown Student", initials: "?" };
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const first = FIRST_NAMES[hash % FIRST_NAMES.length];
  const last = LAST_NAMES[(hash >> 2) % LAST_NAMES.length];
  return { name: `${first} ${last}`, initials: `${first[0]}${last[0]}` };
}

interface Submission {
  id: string;
  task_id?: string;
  student_id: string | null;
  file_name: string;
  status: string;
  created_at: string;
  raw_text?: string | null;
  parsed_content?: {
    steps: Array<{
      step_num: number;
      text: string;
      equations: string[];
      step_type: string;
    }>;
    detected_language: string;
    has_diagrams: boolean;
    parse_confidence: number;
  } | null;
}

interface GradeDetail {
  grade: number;
  max_grade: number;
  confidence: number;
  step_grades: Array<{
    step_num: number;
    awarded: number;
    max: number;
    marks_awarded?: number;
    max_marks?: number;
    justification: string;
    is_correct: boolean;
    step_type: string;
  }>;
  latency_ms: number;
  model_used: string;
}

export default function SubmissionsPage() {
  const { fetchWithAuth, user } = useAuth();
  const router = useRouter();

  // FIX #10: Use Next.js useSearchParams() instead of window.location directly
  const searchParams = useSearchParams();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [subDetail, setSubDetail] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null); // FIX #6: track grade fetch errors
  const [activeTab, setActiveTab] = useState<"evaluation" | "student_answer">("evaluation");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [hasMore, setHasMore] = useState(false); // FIX #7: proper server-side pagination tracking

  // FIX #10: Read task_id from searchParams hook (SSR-safe)
  const taskIdFilter = searchParams.get("task_id");

  // FIX #5: track in-flight fetch to avoid race conditions on auto-poll
  const isFetchingRef = useRef(false);

  // FIX #1 + #2: fetchSubmissions now sends task_id to API, and taskIdFilter is a proper dep
  const fetchSubmissions = useCallback(async (limitVal?: number) => {
    if (isFetchingRef.current) return; // FIX #5: skip if already fetching
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const currentLimit = limitVal ?? visibleCount;
      const statusParam = statusFilter !== "ALL" ? `&status=${statusFilter}` : "";
      // FIX #1: pass task_id to the API so server-side filtering is correct
      const taskParam = taskIdFilter ? `&task_id=${taskIdFilter}` : "";
      const res = await fetchWithAuth(
        `${API_BASE}/submissions?limit=${currentLimit + 1}${statusParam}${taskParam}`
      );
      const json = await res.json();
      if (json.data) {
        // FIX #7: fetch limit+1 to detect if more records exist
        const hasMoreData = json.data.length > currentLimit;
        const sliced = hasMoreData ? json.data.slice(0, currentLimit) : json.data;
        setHasMore(hasMoreData);
        setSubmissions(sliced);
        applyClientFilters(sliced, searchTerm);
      }
    } catch (e) {
      console.error("Failed to fetch submissions", e);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, statusFilter, taskIdFilter, searchTerm]);

  // FIX #2: taskIdFilter is now included in deps (via fetchSubmissions callback dep)
  useEffect(() => {
    fetchSubmissions(visibleCount);
    const interval = setInterval(() => {
      // FIX #5: don't fire poll if already fetching
      if (!isFetchingRef.current) fetchSubmissions(visibleCount);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchSubmissions, visibleCount]);

  // FIX #4: simplified client-side filter — student isolation is handled by backend
  // Only do lightweight text search client-side; remove broken fuzzy name matching
  const applyClientFilters = (subsList: Submission[], search: string) => {
    let result = [...subsList];
    if (search.trim()) {
      result = result.filter(
        (s) =>
          (s.student_id || "").toLowerCase().includes(search.toLowerCase()) ||
          s.file_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredSubmissions(result);
  };

  useEffect(() => {
    applyClientFilters(submissions, searchTerm);
  }, [searchTerm, submissions]);

  useEffect(() => {
    if (selectedSub) {
      setSubDetail(null);
      setGradeDetail(null);
      setGradeError(null);

      // Fetch full submission details
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}`)
        .then((res) => res.json())
        .then((json) => { if (json.data) setSubDetail(json.data); })
        .catch((e) => console.error("Detail fetch failed", e));

      if (selectedSub.status === "GRADED") {
        fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
          .then((res) => {
            // FIX #6: handle non-OK HTTP responses
            if (!res.ok) throw new Error(`Grade fetch failed: ${res.status} ${res.statusText}`);
            return res.json();
          })
          .then((json) => {
            if (json.data) setGradeDetail(json.data);
            else throw new Error("No grade data in response.");
          })
          .catch((e) => {
            console.error("Grade fetch failed", e);
            // FIX #6: surface error to user instead of infinite spinner
            setGradeError(e.message || "Failed to load grade details.");
          });
      }
    } else {
      setSubDetail(null);
      setGradeDetail(null);
      setGradeError(null);
      setActiveTab("evaluation");
    }
  }, [selectedSub]);

  const clearTaskFilter = () => {
    // FIX #10: use Next.js router to update URL instead of window.history directly
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task_id");
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.push(newUrl);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
            <FileText size={22} className="text-brand-600" />
            Evaluation Submissions
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            Audit complete grading streams, logs, and evidence-backed results.
          </p>
        </div>
        <button
          onClick={() => fetchSubmissions(visibleCount)}
          disabled={isLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid var(--border-subtle)",
            background: "var(--surface-primary)",
            color: "var(--text-primary)",
            whiteSpace: "nowrap" as const,
            flexShrink: 0,
            fontFamily: "var(--font-sans)",
          }}
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Reload Queue
        </button>
      </div>

      {taskIdFilter && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            background: "rgba(224, 255, 130, 0.1)",
            border: "1px solid rgba(224, 255, 130, 0.3)",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "13px",
            color: "var(--text-primary)",
            fontWeight: 500,
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-600 animate-pulse" />
            <span>Filtering submissions by subject paper.</span>
          </div>
          {/* FIX #10: clearTaskFilter uses router.push instead of window.history */}
          <button
            onClick={clearTaskFilter}
            style={{
              color: "var(--text-secondary)",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
              padding: "2.5px 10px",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-primary)",
            }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          background: "var(--surface-primary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          padding: "12px 16px",
          flexWrap: "wrap" as const,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "500px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search Student ID or File name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "var(--surface-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "9px 14px 9px 36px",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <Filter size={13} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Status:</span>
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "var(--surface-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "3px",
            }}
          >
            {["ALL", "GRADED", "FAILED", "PENDING"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  border: statusFilter === status ? "1px solid var(--border-subtle)" : "1px solid transparent",
                  background: statusFilter === status ? "var(--surface-primary)" : "transparent",
                  color: statusFilter === status ? "var(--text-primary)" : "var(--text-tertiary)",
                  boxShadow: statusFilter === status ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden", border: "1px solid var(--border-subtle)", borderRadius: "16px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Filename</th>
                <th>Created Time</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* FIX #8: show skeleton rows while loading initial data */}
              {isLoading && submissions.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} style={{ opacity: 0.4 }}>
                      <td><div style={{ height: 14, width: 120, background: "var(--border-subtle)", borderRadius: 6 }} /></td>
                      <td><div style={{ height: 14, width: 160, background: "var(--border-subtle)", borderRadius: 6 }} /></td>
                      <td><div style={{ height: 14, width: 100, background: "var(--border-subtle)", borderRadius: 6 }} /></td>
                      <td><div style={{ height: 20, width: 70, background: "var(--border-subtle)", borderRadius: 10 }} /></td>
                      <td />
                    </tr>
                  ))
                : filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => {
                        if (sub.status === "GRADED") {
                          router.push(`/analysis?task_id=${sub.task_id || ""}&submission_id=${sub.id}`);
                        } else {
                          setSelectedSub(sub);
                        }
                      }}
                    >
                      <td className="col-primary font-medium text-[13px]">
                        {sub.status === "GRADED" ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/analysis?task_id=${sub.task_id || ""}&submission_id=${sub.id}`);
                            }}
                            className="text-[var(--text-primary)] hover:text-brand-600 hover:underline transition-colors cursor-pointer"
                          >
                            {generateStudentName(sub.student_id).name}
                          </span>
                        ) : (
                          generateStudentName(sub.student_id).name
                        )}
                      </td>
                      <td
                        className="text-[12.5px] max-w-[200px] truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {sub.file_name}
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td>
                        {sub.status === "GRADED" && (
                          <span className="pill pill-success">
                            <div className="pill-dot" />Graded
                          </span>
                        )}
                        {sub.status === "FAILED" && (
                          <span className="pill pill-danger">
                            <div className="pill-dot" />Failed
                          </span>
                        )}
                        {sub.status !== "GRADED" && sub.status !== "FAILED" && (
                          <span className="pill pill-info">
                            <div className="pill-dot" />{sub.status}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            fontSize: "11.5px",
                            fontWeight: 500,
                            fontFamily: "var(--font-sans)",
                            cursor: "pointer",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--surface-secondary)",
                            color: "var(--text-secondary)",
                            marginLeft: "auto",
                          }}
                        >
                          <Eye size={12} /> Audit
                        </button>
                      </td>
                    </tr>
                  ))}
              {!isLoading && filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-tertiary text-[13px]">
                    No submissions found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FIX #7: pagination now driven by server hasMore flag, not client array length comparison */}
        {(hasMore || visibleCount > 10) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              padding: "16px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--surface-secondary)",
              opacity: 0.85,
            }}
          >
            {hasMore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleCount((prev) => prev + 5);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface-primary)",
                  color: "var(--text-primary)",
                }}
              >
                See More +5
              </button>
            )}
            {visibleCount > 10 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleCount(10);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface-primary)",
                  color: "var(--text-primary)",
                }}
              >
                Show Less
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details Slide Overlay */}
      {selectedSub && (
        <div className="slide-overlay" onClick={() => setSelectedSub(null)}>
          <div className="slide-panel animate-slide-r" onClick={(e) => e.stopPropagation()}>
            <div className="slide-header">
              <div className="slide-title">Evaluation Details</div>
              <button className="slide-close" onClick={() => setSelectedSub(null)}>×</button>
            </div>
            <div className="slide-body">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <div className="text-[16px] font-medium text-text-primary">
                    {generateStudentName(selectedSub.student_id).name}
                  </div>
                  <div className="font-mono text-[11.5px] text-text-tertiary">{selectedSub.id}</div>
                </div>
              </div>

              {/* Segmented Tab Control */}
              <div className="flex border-b border-border-secondary mb-5">
                <button
                  type="button"
                  className={`flex-1 pb-2.5 text-center font-medium text-[13px] transition-all relative ${
                    activeTab === "evaluation"
                      ? "text-primary border-b-2 border-primary font-semibold"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                  onClick={() => setActiveTab("evaluation")}
                >
                  Evaluation Traces
                </button>
                <button
                  type="button"
                  className={`flex-1 pb-2.5 text-center font-medium text-[13px] transition-all relative ${
                    activeTab === "student_answer"
                      ? "text-primary border-b-2 border-primary font-semibold"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                  onClick={() => setActiveTab("student_answer")}
                >
                  Student Answer
                </button>
              </div>

              {activeTab === "evaluation" ? (
                selectedSub.status !== "GRADED" ? (
                  <div className="py-8 text-center text-text-tertiary flex flex-col items-center gap-3">
                    <Clock className="animate-pulse text-brand-600" size={32} />
                    <span>Evaluation in progress...</span>
                  </div>
                ) : gradeError ? (
                  // FIX #6: show error instead of infinite spinner
                  <div className="py-8 text-center flex flex-col items-center gap-3">
                    <XCircle size={32} className="text-red-400" />
                    <span className="text-[13px] text-text-secondary">{gradeError}</span>
                    <button
                      onClick={() => {
                        setGradeError(null);
                        setGradeDetail(null);
                        // retry
                        fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
                          .then((res) => {
                            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                            return res.json();
                          })
                          .then((json) => { if (json.data) setGradeDetail(json.data); })
                          .catch((e) => setGradeError(e.message));
                      }}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--surface-secondary)",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : !gradeDetail ? (
                  <div className="py-8 text-center text-text-tertiary">Loading grade data...</div>
                ) : (
                  <>
                    <div className="score-display">
                      <div className="score-num">{gradeDetail.grade}</div>
                      <div className="score-max">/ {gradeDetail.max_grade}</div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--surface-secondary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        marginBottom: "20px",
                        fontSize: "12.5px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>AI Verdict Confidence</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            gradeDetail.confidence >= 0.8
                              ? "var(--color-success-border)"
                              : "var(--color-warning-border)",
                        }}
                      >
                        {(gradeDetail.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="divider" />

                    <div className="slide-section">
                      <div className="slide-section-label">Component Marks breakdown</div>
                      <div className="step-list">
                        {gradeDetail.step_grades.map((step: any, idx: number) => (
                          <div key={idx} className="step-card">
                            <div className="step-card-top">
                              <span className="step-name flex items-center gap-1.5">
                                <Sparkles size={12} className="text-brand-600" />
                                Step {step.step_num}
                              </span>
                              <span className="step-marks">
                                {step.marks_awarded} / {step.max_marks}
                              </span>
                            </div>
                            <p className="step-justification">{step.justification}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="divider" />

                    <div className="slide-section">
                      <div className="slide-section-label">Metadata Logs</div>
                      <div>
                        <div className="meta-row">
                          <span className="meta-key">Processor latency</span>
                          <span className="meta-val">{gradeDetail.latency_ms}ms</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Language Model</span>
                          <span className="meta-val truncate max-w-[180px]">{gradeDetail.model_used}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )
              ) : !subDetail ? (
                <div className="py-8 text-center text-text-tertiary">Loading student answer...</div>
              ) : subDetail.parsed_content?.steps && subDetail.parsed_content.steps.length > 0 ? (
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {subDetail.parsed_content.steps.map((step: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-surface-secondary border border-border-secondary rounded-lg p-4 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-primary uppercase tracking-wider">
                          Step {step.step_num}
                        </span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-medium">
                          {step.step_type}
                        </span>
                      </div>
                      <p className="text-text-primary text-[13.5px] leading-relaxed">{step.text}</p>
                      {step.equations && step.equations.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {step.equations.map((eq: string, eqIdx: number) => (
                            <code
                              key={eqIdx}
                              className="bg-surface-hover text-text-secondary px-2 py-0.5 rounded text-[11.5px] font-mono border border-border-subtle"
                            >
                              {eq}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : subDetail.raw_text ? (
                <div className="bg-surface-secondary border border-border-secondary rounded-lg p-4 font-mono text-[12.5px] text-text-secondary whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {subDetail.raw_text}
                </div>
              ) : (
                <div className="text-center text-text-tertiary py-8">
                  No student answer text parsed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}