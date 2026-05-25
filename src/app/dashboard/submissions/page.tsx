"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Search, Filter, RefreshCw, CheckCircle2, 
  AlertTriangle, Clock, ArrowRight, Eye, Sparkles 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface Submission {
  id: string;
  student_id: string | null;
  file_name: string;
  status: string;
  created_at: string;
}

interface GradeDetail {
  grade: number;
  max_grade: number;
  confidence: number;
  step_grades: Array<{
    step_num: number;
    awarded: number;
    max: number;
    justification: string;
    is_correct: boolean;
    step_type: string;
  }>;
  latency_ms: number;
  model_used: string;
}

export default function SubmissionsPage() {
  const { fetchWithAuth } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [subDetail, setSubDetail] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "student_answer">("evaluation");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/submissions`);
      const json = await res.json();
      if (json.data) {
        setSubmissions(json.data);
        applyFilters(json.data, searchTerm, statusFilter);
      }
    } catch (e) {
      console.error("Failed to fetch submissions", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const applyFilters = (subsList: Submission[], search: string, status: string) => {
    let result = [...subsList];
    if (search.trim()) {
      result = result.filter(
        (s) =>
          (s.student_id || '').toLowerCase().includes(search.toLowerCase()) ||
          s.file_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== "ALL") {
      result = result.filter((s) => s.status === status);
    }
    setFilteredSubmissions(result);
  };

  useEffect(() => {
    applyFilters(submissions, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, submissions]);

  useEffect(() => {
    if (selectedSub) {
      // Fetch full submission details
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}`)
        .then((res) => res.json())
        .then((json) => { if (json.data) setSubDetail(json.data); })
        .catch((e) => console.error("Detail fetch failed", e));

      if (selectedSub.status === "GRADED") {
        fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
          .then((res) => res.json())
          .then((json) => {
            if (json.data) setGradeDetail(json.data);
          })
          .catch((e) => console.error("Grade fetch failed", e));
      } else {
        setGradeDetail(null);
      }
    } else {
      setSubDetail(null);
      setGradeDetail(null);
      setActiveTab("evaluation");
    }
  }, [selectedSub]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
            <FileText size={22} className="text-brand-600" />
            Evaluation Submissions
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">Audit complete grading streams, logs, and evidence-backed results.</p>
        </div>
        <button 
          onClick={fetchSubmissions} 
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface-primary)',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap' as const,
            flexShrink: 0,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Reload Queue
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '12px 16px',
        flexWrap: 'wrap' as const,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '500px' }}>
          <Search 
            size={15} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }} 
          />
          <input
            type="text"
            placeholder="Search Student ID or File name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '9px 14px 9px 36px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Filter size={13} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '3px',
          }}>
            {["ALL", "GRADED", "FAILED", "PENDING"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  border: statusFilter === status ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  background: statusFilter === status ? 'var(--surface-primary)' : 'transparent',
                  color: statusFilter === status ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Filename</th>
                <th>Created Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} onClick={() => setSelectedSub(sub)}>
                  <td className="col-primary font-mono text-[12px]">{sub.student_id || '—'}</td>
                  <td className="text-[12.5px] max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>{sub.file_name}</td>
                  <td className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{new Date(sub.created_at).toLocaleString()}</td>
                  <td>
                    {sub.status === "GRADED" && <span className="pill pill-success"><div className="pill-dot"/>Graded</span>}
                    {sub.status === "FAILED" && <span className="pill pill-danger"><div className="pill-dot"/>Failed</span>}
                    {sub.status !== "GRADED" && sub.status !== "FAILED" && <span className="pill pill-info"><div className="pill-dot"/>{sub.status}</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 500,
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--surface-secondary)',
                        color: 'var(--text-secondary)',
                        marginLeft: 'auto',
                      }}
                    >
                      <Eye size={12} /> Audit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-tertiary text-[13px]">
                    No submissions found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                <div className="avatar avatar-lg avatar-purple">{(selectedSub.student_id || '??').slice(-2)}</div>
                <div>
                  <div className="text-[16px] font-medium text-text-primary">{selectedSub.student_id || 'Unknown Student'}</div>
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
                ) : !gradeDetail ? (
                  <div className="py-8 text-center text-text-tertiary">Loading grade data...</div>
                ) : (
                  <>
                    <div className="score-display">
                      <div className="score-num">{gradeDetail.grade}</div>
                      <div className="score-max">/ {gradeDetail.max_grade}</div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginBottom: '20px',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                    }}>
                      <span>AI Verdict Confidence</span>
                      <span style={{
                        fontWeight: 700,
                        color: gradeDetail.confidence >= 0.8 ? 'var(--color-success-border)' : 'var(--color-warning-border)',
                      }}>
                        {(gradeDetail.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="divider"></div>
                    
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
                              <span className="step-marks">{step.marks_awarded} / {step.max_marks}</span>
                            </div>
                            <p className="step-justification">
                              {step.justification}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="divider"></div>

                    <div className="slide-section">
                      <div className="slide-section-label">Metadata Logs</div>
                      <div>
                        <div className="meta-row"><span className="meta-key">Processor latency</span><span className="meta-val">{gradeDetail.latency_ms}ms</span></div>
                        <div className="meta-row"><span className="meta-key">Language Model</span><span className="meta-val truncate max-w-[180px]">{gradeDetail.model_used}</span></div>
                      </div>
                    </div>
                  </>
                )
              ) : (
                !subDetail ? (
                  <div className="py-8 text-center text-text-tertiary">Loading student answer...</div>
                ) : subDetail.parsed_content?.steps && subDetail.parsed_content.steps.length > 0 ? (
                  <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {subDetail.parsed_content.steps.map((step: any, idx: number) => (
                      <div key={idx} className="bg-surface-secondary border border-border-secondary rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold text-primary uppercase tracking-wider">Step {step.step_num}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-medium">{step.step_type}</span>
                        </div>
                        <p className="text-text-primary text-[13.5px] leading-relaxed">{step.text}</p>
                        {step.equations && step.equations.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {step.equations.map((eq: string, eqIdx: number) => (
                              <code key={eqIdx} className="bg-surface-hover text-text-secondary px-2 py-0.5 rounded text-[11.5px] font-mono border border-border-subtle">
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
                  <div className="text-center text-text-tertiary py-8">No student answer text parsed yet.</div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
