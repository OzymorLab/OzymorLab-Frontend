"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, Eye, RefreshCw, 
  Star, ShieldCheck, ChevronRight, Check, X, Loader2, Sparkles,
  Search, BookOpen, AlertCircle, FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface ReviewItem {
  submission_id: string;
  student_id: string;
  task_title: string;
  grade: number;
  max_grade: number;
  confidence: number;
  review_status: string;
  review_reasons?: string[];
  flagged_components?: string[];
  graded_at?: string;
}

interface ReviewDetail {
  submission_id: string;
  student_id: string;
  task_title: string;
  grade: number;
  max_grade: number;
  confidence: number;
  review_status: string;
  review_reasons?: string[];
  flagged_components?: string[];
  component_grades?: any[];
  step_grades?: any[];
  justification?: string;
  review_notes?: string;
  reviewed_by?: string;
}

interface PendingRubric {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  max_marks: number;
  paper_set?: string;
  approval_status: string;
  created_by_name?: string;
  steps: any[];
}

export default function ReviewsPage() {
  const { user, fetchWithAuth } = useAuth();
  
  // Pending review items
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedSub, setSelectedSub] = useState<ReviewItem | null>(null);
  const [reviewDetail, setReviewDetail] = useState<ReviewDetail | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Moderation state
  const [newGrade, setNewGrade] = useState<number | "">("");
  const [moderationNotes, setModerationNotes] = useState("");
  const [actionSuccess, setActionSuccess] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Pending Rubrics State (State Machine Center for HODs)
  const [pendingRubrics, setPendingRubrics] = useState<PendingRubric[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<PendingRubric | null>(null);
  const [isLoadingRubrics, setIsLoadingRubrics] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isRubricActioning, setIsRubricActioning] = useState(false);

  const isAdminOrHOD = user?.role === "hod" || user?.role === "principal" || user?.role === "admin";

  useEffect(() => {
    fetchPendingReviews();
    if (isAdminOrHOD) {
      fetchPendingRubrics();
    }
  }, [user]);

  const fetchPendingReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/reviews/pending`);
      const json = await res.json();
      if (json.data) {
        setReviews(json.data);
      }
    } catch (e) {
      console.error("Failed to load review items", e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchPendingRubrics = async () => {
    setIsLoadingRubrics(true);
    try {
      // Fetch all tasks and filter for those with PENDING_APPROVAL status
      const res = await fetchWithAuth(`${API_BASE}/tasks`);
      const json = await res.json();
      if (json.data) {
        const pending = json.data.filter((t: any) => t.rubric_approval_status === "PENDING_APPROVAL");
        setPendingRubrics(pending);
      }
    } catch (e) {
      console.error("Failed to load pending rubrics", e);
    } finally {
      setIsLoadingRubrics(false);
    }
  };

  // Fetch detailed review components
  useEffect(() => {
    if (selectedSub) {
      setIsLoadingDetail(true);
      fetchWithAuth(`${API_BASE}/reviews/${selectedSub.submission_id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            setReviewDetail(json.data);
            setNewGrade(json.data.grade);
            setModerationNotes(json.data.review_notes || "");
          }
        })
        .catch((e) => console.error("Detail fetch failed", e))
        .finally(() => setIsLoadingDetail(false));
    } else {
      setReviewDetail(null);
      setNewGrade("");
      setModerationNotes("");
    }
  }, [selectedSub]);

  // Handle Approve Grade
  const handleApproveGrade = async () => {
    if (!selectedSub) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/reviews/${selectedSub.submission_id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: user?.email || "moderator",
          notes: moderationNotes || "AI evaluation approved",
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionSuccess(true);
        setTimeout(() => {
          setActionSuccess(false);
          setSelectedSub(null);
          fetchPendingReviews();
        }, 1000);
      } else {
        throw new Error(json.detail || "Approval failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Override Grade
  const handleOverrideGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || newGrade === "" || !moderationNotes.trim()) {
      alert("Override requires a score and descriptive notes.");
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/reviews/${selectedSub.submission_id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: Number(newGrade),
          notes: moderationNotes,
          reviewer_id: user?.email || "moderator",
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionSuccess(true);
        setTimeout(() => {
          setActionSuccess(false);
          setSelectedSub(null);
          fetchPendingReviews();
        }, 1000);
      } else {
        throw new Error(json.detail || "Override failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Rubric Approval Action
  const handleRubricApproval = async (action: "approve" | "reject") => {
    if (!selectedRubric) return;
    setIsRubricActioning(true);
    try {
      let url = `${API_BASE}/question-papers/${selectedRubric.id}/rubric/${action}`;
      const payload: any = {};
      if (action === "reject") {
        if (!rejectionNotes.trim()) {
          alert("Rejection notes are required to reject a rubric.");
          setIsRubricActioning(false);
          return;
        }
        payload.notes = rejectionNotes;
      }

      const res = await fetchWithAuth(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify(payload) : undefined,
      });

      const json = await res.json();
      if (res.ok) {
        alert(`Rubric ${action === "approve" ? "APPROVED" : "REJECTED"} successfully!`);
        setSelectedRubric(null);
        setRejectionNotes("");
        fetchPendingRubrics();
      } else {
        throw new Error(json.detail || "Rubric action failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsRubricActioning(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title block */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <ShieldAlert size={24} className="text-brand-600 animate-pulse" />
            Institutional Moderation & Approval Center
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            Resolve grading drifts, approve rubrics, and release institutional assessments.
          </p>
        </div>
        <button 
          onClick={() => { fetchPendingReviews(); if (isAdminOrHOD) fetchPendingRubrics(); }}
          disabled={isLoadingReviews || isLoadingRubrics}
          className="btn flex items-center gap-1.5 text-[12.5px]"
        >
          <RefreshCw size={13} className={isLoadingReviews || isLoadingRubrics ? "animate-spin" : ""} />
          Refresh Lists
        </button>
      </div>

      {/* ── State Machine Rubric Approvals (HOD / Admin only) ── */}
      {isAdminOrHOD && (
        <div className="card border border-brand-500/25 bg-brand-500/5 overflow-hidden">
          <div className="card-header border-b border-brand-500/20 bg-brand-500/10 px-6 py-4 flex justify-between items-center">
            <div className="card-title font-semibold text-[13.5px] text-brand-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-600" />
              Teacher Rubrics Awaiting Approval ({pendingRubrics.length} Pending)
            </div>
            <span className="text-[11px] text-brand-700 font-medium px-2 py-0.5 rounded bg-brand-500/20">HOD Approval Gate</span>
          </div>

          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="bg-surface-secondary/40">
                    <th className="px-6 py-3">Subject Paper</th>
                    <th className="px-6 py-3">Set</th>
                    <th className="px-6 py-3">Grade Level</th>
                    <th className="px-6 py-3">Max Marks</th>
                    <th className="px-6 py-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingRubrics ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-text-tertiary">
                        <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={20} />
                        Fetching pending rubrics...
                      </td>
                    </tr>
                  ) : pendingRubrics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-text-tertiary text-[12.5px]">
                        No teacher rubrics currently pending approval.
                      </td>
                    </tr>
                  ) : (
                    pendingRubrics.map((r) => (
                      <tr key={r.id} onClick={() => setSelectedRubric(r)} className="hover:bg-brand-500/5 cursor-pointer">
                        <td className="px-6 py-3 font-semibold text-text-primary">{r.subject} - {r.title}</td>
                        <td className="px-6 py-3 font-mono text-[11px]">{r.paper_set || "A"}</td>
                        <td className="px-6 py-3">{r.grade_level || "Class 12"}</td>
                        <td className="px-6 py-3 font-semibold text-text-primary">{r.max_marks} marks</td>
                        <td className="px-6 py-3 text-right">
                          <button className="btn btn-brand py-1 px-3 text-[11px] flex items-center gap-1 ml-auto">
                            Review Rubric <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Submissions Flagged for Human Review ── */}
      <div className="card border border-border-subtle shadow-sm overflow-hidden">
        <div className="card-header border-b border-border-subtle bg-surface-secondary px-6 py-4 flex justify-between items-center">
          <div className="card-title font-medium text-[13.5px] flex items-center gap-2">
            <ShieldAlert size={16} className="text-color-danger-border animate-pulse" />
            Submissions Requiring Moderator Review ({reviews.length} Flagged)
          </div>
          <span className="text-[11px] text-text-tertiary">Triggered when confidence score drifts or fails rubric parameters</span>
        </div>

        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-surface-secondary">
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Subject Exam</th>
                  <th className="px-6 py-4">Flagged Reason</th>
                  <th className="px-6 py-4">Current Score</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingReviews ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-tertiary">
                      <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                      Loading flagged evaluation queues...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-tertiary text-[13px]">
                      Excellent! Zero submissions currently require moderation review.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => {
                    const reason = r.review_reasons && r.review_reasons.length > 0 
                      ? r.review_reasons.join(", ") 
                      : "Low Confidence drift score (< 80%)";
                    return (
                      <tr key={r.submission_id} onClick={() => setSelectedSub(r)} className="hover:bg-surface-secondary cursor-pointer">
                        <td className="px-6 py-4 font-mono text-[12px] text-text-primary font-bold">{r.student_id}</td>
                        <td className="px-6 py-4 text-[12.5px] text-text-secondary">{r.task_title}</td>
                        <td className="px-6 py-4 text-[12px] text-color-danger-border font-medium">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle size={13} />
                            {reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">{r.grade} / {r.max_grade}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="btn btn-secondary py-1 px-3 text-[11.5px] flex items-center gap-1 ml-auto">
                            Inspect Verdict <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Moderation Inspect Overlay Slider */}
      {selectedSub && (
        <div className="slide-overlay" onClick={() => setSelectedSub(null)}>
          <div className="slide-panel animate-slide-r" style={{ width: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="slide-header border-b border-border-subtle bg-surface-secondary">
              <div className="slide-title flex items-center gap-2 font-semibold text-text-primary">
                <ShieldAlert size={16} className="text-color-warning-border" />
                Moderator Verdict Audit
              </div>
              <button className="slide-close" onClick={() => setSelectedSub(null)}>×</button>
            </div>
            
            <div className="slide-body p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="avatar avatar-lg bg-brand-500/10 text-brand-600 w-12 h-12 rounded-full flex items-center justify-center font-bold">
                  {selectedSub.student_id.slice(-2)}
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-text-primary">{selectedSub.student_id}</div>
                  <div className="font-mono text-[11px] text-text-tertiary">{selectedSub.submission_id}</div>
                </div>
              </div>

              {isLoadingDetail ? (
                <div className="py-12 text-center text-text-tertiary flex flex-col items-center">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  Loading grade breakdown...
                </div>
              ) : !reviewDetail ? (
                <div className="py-8 text-center text-text-tertiary">Failed to retrieve grade detail.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Current Score Display */}
                  <div className="bg-surface-secondary border border-border-subtle p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-[11.5px] text-text-tertiary uppercase tracking-wider block mb-1">AI Proposed Grade</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[28px] font-bold text-text-primary">{reviewDetail.grade}</span>
                        <span className="text-[14px] text-text-tertiary">/ {reviewDetail.max_grade}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11.5px] text-text-tertiary uppercase tracking-wider block mb-1">AI Confidence</span>
                      <span className="text-[14px] font-semibold text-color-warning-border bg-warning-bg px-2.5 py-1 rounded-md">
                        {(reviewDetail.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-col gap-4 border border-border-subtle p-4 rounded-lg bg-surface-primary">
                    <h3 className="text-[13px] font-semibold text-text-primary flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-brand-600" />
                      Human-in-the-Loop Moderation Form
                    </h3>

                    {/* Grade override input */}
                    <form onSubmit={handleOverrideGrade} className="flex flex-col gap-3 mt-2">
                      <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">Corrected Score</label>
                          <input 
                            type="number"
                            min="0"
                            max={reviewDetail.max_grade}
                            className="input-field py-2 text-[13px]"
                            value={newGrade}
                            onChange={(e) => setNewGrade(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-text-secondary uppercase">Moderation notes / rationale</label>
                        <textarea 
                          className="input-field min-h-[70px] text-[12.5px]"
                          placeholder="Why are you approving or overriding this grade?"
                          value={moderationNotes}
                          onChange={(e) => setModerationNotes(e.target.value)}
                        />
                      </div>

                      {actionSuccess ? (
                        <div className="p-3 bg-success-bg text-success-text rounded-md text-[12px] flex items-center gap-1.5 font-semibold mt-1">
                          <CheckCircle2 size={14} /> Moderation action committed successfully!
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <button 
                            type="button"
                            className="btn btn-secondary py-2 justify-center text-[12.5px]"
                            onClick={handleApproveGrade}
                            disabled={isSubmittingAction}
                          >
                            Approve AI Grade
                          </button>
                          <button 
                            type="submit"
                            className="btn btn-brand py-2 justify-center text-[12.5px]"
                            disabled={isSubmittingAction || newGrade === "" || !moderationNotes.trim()}
                          >
                            {isSubmittingAction ? <Loader2 className="animate-spin" size={14} /> : "Override AI Grade"}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Component step breakdowns */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[11.5px] font-semibold tracking-wider text-text-tertiary uppercase">Component Step Audit traces</h4>
                    <div className="flex flex-col gap-3">
                      {(reviewDetail.step_grades || []).map((step, idx) => (
                        <div key={idx} className="step-card bg-surface-secondary border border-border-subtle p-3 rounded-lg">
                          <div className="step-card-top flex justify-between font-medium text-[12px] text-text-primary mb-1">
                            <span>Step {step.step_num} ({step.component_type || "text"})</span>
                            <span className="font-semibold">{step.marks_awarded || step.awarded} / {step.max_marks || step.max}</span>
                          </div>
                          <p className="step-justification text-[11.5px] text-text-secondary leading-relaxed mt-1">
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

      {/* Rubric Approval Detail Slider */}
      {selectedRubric && (
        <div className="slide-overlay" onClick={() => setSelectedRubric(null)}>
          <div className="slide-panel animate-slide-r" style={{ width: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="slide-header border-b border-border-subtle bg-surface-secondary">
              <div className="slide-title flex items-center gap-2 font-semibold text-brand-800">
                <ShieldCheck size={16} className="text-brand-600" />
                HOD Rubric Audit Gate
              </div>
              <button className="slide-close" onClick={() => setSelectedRubric(null)}>×</button>
            </div>

            <div className="slide-body p-6">
              <div className="flex flex-col gap-2 mb-6">
                <span className="text-[11px] text-brand-600 font-bold uppercase">Pending Institutional Rubric</span>
                <h3 className="text-[18px] font-bold text-text-primary">{selectedRubric.subject} - {selectedRubric.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-[12px] text-text-secondary mt-2 bg-surface-secondary p-3 rounded-lg border">
                  <div>Grade Level: <strong>{selectedRubric.grade_level}</strong></div>
                  <div>Paper Set: <strong>{selectedRubric.paper_set || "A"}</strong></div>
                  <div>Max Marks: <strong>{selectedRubric.max_marks} marks</strong></div>
                </div>
              </div>

              {/* Rubric steps details */}
              <div className="flex flex-col gap-3 mb-6">
                <h4 className="text-[11.5px] font-bold tracking-wider text-text-tertiary uppercase">Rubric Decomposed Steps</h4>
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {(selectedRubric.steps || []).map((step: any, idx: number) => (
                    <div key={idx} className="bg-surface-secondary border p-3 rounded-lg">
                      <div className="flex-between text-[12px] font-semibold text-text-primary mb-1">
                        <span>Step {step.step_num} ({step.component_type})</span>
                        <span>{step.marks} marks</span>
                      </div>
                      <div className="text-[11.5px] text-text-secondary">{step.description}</div>
                      {step.expected_exprs && step.expected_exprs.length > 0 && (
                        <div className="text-[10px] font-mono text-brand-600 mt-1 bg-brand-500/5 p-1 rounded">
                          Expected Math: {step.expected_exprs.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Form */}
              <div className="flex flex-col gap-4 border border-border-subtle p-4 rounded-lg bg-surface-primary">
                <h3 className="text-[13px] font-bold text-text-primary">Approve or Reject Rubric Schema</h3>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-semibold text-text-secondary uppercase">Rejection notes (Required only for rejection)</label>
                  <textarea 
                    className="input-field min-h-[70px] text-[12px]"
                    placeholder="Provide specific notes if rejecting this rubric schema..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button 
                    className="btn btn-danger py-2 justify-center text-[12.5px] flex items-center gap-1"
                    onClick={() => handleRubricApproval("reject")}
                    disabled={isRubricActioning}
                  >
                    <X size={14} /> Reject & Send Back
                  </button>
                  <button 
                    className="btn btn-brand py-2 justify-center text-[12.5px] bg-green-600 border-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                    onClick={() => handleRubricApproval("approve")}
                    disabled={isRubricActioning}
                  >
                    <Check size={14} /> Approve Rubric Schema
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
