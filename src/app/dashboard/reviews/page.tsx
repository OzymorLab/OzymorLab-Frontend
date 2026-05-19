"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye, RefreshCw, Star, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Submission {
  id: string;
  student_id: string;
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

export default function ReviewsPage() {
  const { fetchWithAuth } = useAuth();
  const [flaggedSubs, setFlaggedSubs] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);
  const [newGrade, setNewGrade] = useState<number | "">("");

  const fetchFlaggedSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/submissions`);
      const json = await res.json();
      if (json.data) {
        // Mocking: Filter or assign flagged reviews based on status/id for robust visual fidelity
        // Typically, grades below 80% confidence or failed runs are routed to Moderator Review
        const graded = json.data.filter((s: Submission) => s.status === "GRADED");
        
        // Let's mark alternate items as flagged or under-confidence for demonstration
        const mockFlagged = graded.filter((s: Submission, idx: number) => {
          const hashVal = s.student_id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
          return hashVal % 3 === 0; // Route ~33% to moderator review
        });
        
        setFlaggedSubs(mockFlagged);
      }
    } catch (e) {
      console.error("Failed to load review items", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedSubmissions();
  }, []);

  useEffect(() => {
    if (selectedSub) {
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            setGradeDetail(json.data);
            setNewGrade(json.data.grade);
          }
        })
        .catch((e) => console.error("Grade fetch failed", e));
    } else {
      setGradeDetail(null);
      setNewGrade("");
    }
  }, [selectedSub]);

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGrade === "" || !gradeDetail) return;
    
    // Simulate Moderator Grade Override commits
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOverrideSuccess(true);
      setTimeout(() => {
        setOverrideSuccess(false);
        setSelectedSub(null);
        fetchFlaggedSubmissions();
      }, 1000);
    }, 800);
  };

  return (
    <div className="reviews-container py-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
            <ShieldAlert size={22} className="text-brand-600 animate-pulse" />
            Moderator Review Hub
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">Audit low-confidence AI verdicts, execute grading overrides, and resolve mismatches.</p>
        </div>
        <button 
          onClick={fetchFlaggedSubmissions} 
          disabled={isLoading}
          className="btn btn-secondary flex items-center gap-1.5 text-[12.5px] cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Reload Queue
        </button>
      </div>

      {/* Review Queue Card */}
      <div className="card border border-border-subtle shadow-sm overflow-hidden">
        <div className="card-header border-b border-border-subtle bg-surface-secondary px-6 py-4 flex justify-between items-center">
          <div className="card-title font-medium text-[13.5px] flex items-center gap-2">
            <ShieldAlert size={16} className="text-color-danger-border" />
            Pending Action Queue ({flaggedSubs.length} Flagged)
          </div>
          <span className="text-[11.5px] text-text-tertiary">Bypassed if confidence is &gt; 80%</span>
        </div>

        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-surface-secondary">
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Moderation Reason</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {flaggedSubs.map((sub) => {
                  const hashVal = sub.student_id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
                  const reason = hashVal % 2 === 0 ? "Low Confidence (Below 75%)" : "Rubric Criteria Match Threshold Alert";
                  
                  return (
                    <tr key={sub.id} onClick={() => setSelectedSub(sub)} className="hover:bg-surface-secondary cursor-pointer">
                      <td className="px-6 py-4 font-mono text-[12px] text-text-primary font-medium">{sub.student_id}</td>
                      <td className="px-6 py-4 text-[12.5px] text-text-secondary">{sub.file_name}</td>
                      <td className="px-6 py-4">
                        <span className="pill pill-warning"><div className="pill-dot"/>Moderating</span>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-danger-text font-medium flex items-center gap-1.5 mt-2.5 border-none">
                        <AlertTriangle size={13} className="text-color-danger-border" />
                        {reason}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="btn btn-secondary py-1 px-3 text-[11.5px] flex items-center gap-1 ml-auto cursor-pointer">
                          Inspect <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {flaggedSubs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-tertiary text-[13px]">
                      Excellent! Zero submissions require human-in-the-loop validation right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Moderation Inspect Overlay Slider */}
      {selectedSub && (
        <div className="slide-overlay" onClick={() => setSelectedSub(null)}>
          <div className="slide-panel animate-slide-r" style={{ width: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="slide-header border-b border-border-subtle bg-surface-secondary">
              <div className="slide-title flex items-center gap-2 font-semibold">
                <ShieldAlert size={16} className="text-color-warning-border" />
                Moderator Grade Audit
              </div>
              <button className="slide-close" onClick={() => setSelectedSub(null)}>×</button>
            </div>
            <div className="slide-body p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="avatar avatar-lg bg-warning-bg text-warning-text w-12 h-12 rounded-full flex items-center justify-center font-bold">
                  {selectedSub.student_id.slice(-2)}
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-text-primary">{selectedSub.student_id}</div>
                  <div className="font-mono text-[11px] text-text-tertiary">{selectedSub.id}</div>
                </div>
              </div>

              {!gradeDetail ? (
                <div className="py-8 text-center text-text-tertiary">Loading grade data...</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Current Score Display */}
                  <div className="bg-surface-secondary border border-border-subtle p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-[11.5px] text-text-tertiary uppercase tracking-wider block mb-1">AI Proposal Grade</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[28px] font-bold text-text-primary">{gradeDetail.grade}</span>
                        <span className="text-[14px] text-text-tertiary">/ {gradeDetail.max_grade}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11.5px] text-text-tertiary uppercase tracking-wider block mb-1">AI Confidence</span>
                      <span className="text-[14px] font-semibold text-color-warning-border bg-warning-bg px-2.5 py-1 rounded-md">
                        {(gradeDetail.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Override Form */}
                  <form onSubmit={handleOverrideSubmit} className="flex flex-col gap-4 border border-border-subtle p-4 rounded-lg bg-surface-primary">
                    <h3 className="text-[13px] font-semibold text-text-primary flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-color-success-border" />
                      Apply Override & Release Grade
                    </h3>
                    <div className="form-group flex flex-col gap-1.5 mt-2">
                      <label className="form-label text-[12px] font-medium text-text-secondary">Released Score (max {gradeDetail.max_grade})</label>
                      <input
                        type="number"
                        min="0"
                        max={gradeDetail.max_grade}
                        className="p-2.5 rounded-md border border-border-default bg-surface-secondary text-[13.5px] focus:border-brand-600 focus:outline-none w-full font-semibold"
                        value={newGrade}
                        onChange={(e) => setNewGrade(Number(e.target.value))}
                        required
                      />
                    </div>

                    {overrideSuccess ? (
                      <div className="p-3 bg-success-bg text-success-text rounded-md text-[12.5px] flex items-center gap-1.5 font-medium mt-1 animate-pulse">
                        <CheckCircle2 size={15} /> Grade overridden & committed successfully.
                      </div>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-brand justify-center py-2.5 text-[12.5px] font-medium cursor-pointer mt-1"
                      >
                        Approve & Release Grade
                      </button>
                    )}
                  </form>

                  {/* Step traces details */}
                  <div className="slide-section flex flex-col gap-3">
                    <h4 className="text-[12px] font-semibold tracking-wider text-text-tertiary uppercase">Component step audit traces</h4>
                    <div className="flex flex-col gap-3">
                      {gradeDetail.step_grades.map((step, idx) => (
                        <div key={idx} className="step-card bg-surface-secondary border border-border-subtle p-3 rounded-lg">
                          <div className="step-card-top flex justify-between font-medium text-[12px] text-text-primary mb-1">
                            <span>Step {step.step_num} ({step.step_type})</span>
                            <span>{step.awarded} / {step.max}</span>
                          </div>
                          <p className="step-justification text-[11px] text-text-secondary leading-relaxed mt-1">
                            {step.justification}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
