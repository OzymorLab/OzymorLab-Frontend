"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, Eye, RefreshCw, 
  Star, ShieldCheck, ChevronRight, Check, X, Loader2, Sparkles,
  Search, BookOpen, AlertCircle, FileText
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

interface ReviewItem {
  submission_id: string;
  student_id: string | null;
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
  student_id: string | null;
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
  raw_text?: string | null;
  parsed_content?: any | null;
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
  const [activeTab, setActiveTab] = useState<"evaluation" | "student_answer">("evaluation");
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(10);

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
      setActiveTab("evaluation");
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
    <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10" style={{ padding: "4px 0" }}>
      {/* ── Page Header ── */}
      <div
        className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="flex flex-col gap-2">
          {/* Badge — border only, no background */}
          <div
            className="flex items-center gap-2 w-max"
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "999px",
              padding: "3px 10px",
            }}
          >
            <ShieldAlert size={11} />
            Security &amp; Oversight
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "2px 0 0",
            }}
          >
            Institutional Moderation &amp; Approval Center
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.6 }}>
            Resolve grading drifts, approve rubrics, and release institutional assessments.
          </p>
        </div>
        <button
          onClick={() => { fetchPendingReviews(); if (isAdminOrHOD) fetchPendingRubrics(); }}
          disabled={isLoadingReviews || isLoadingRubrics}
          className="flex items-center justify-center gap-1.5 rounded-xl text-[12px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:bg-brand-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm shrink-0"
          style={{ padding: "10px 18px" }}
        >
          <RefreshCw size={13} className={isLoadingReviews || isLoadingRubrics ? "animate-spin" : ""} />
          Refresh Lists
        </button>
      </div>

      {/* ── State Machine Rubric Approvals (HOD / Admin only) ── */}
      {isAdminOrHOD && (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex justify-between items-center" style={{ padding: "18px 24px" }}>
            <div className="font-bold text-[13.5px] text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-600" />
              Teacher Rubrics Awaiting Approval
              <span className="text-[10px] font-mono bg-brand-500/10 text-brand-600 border border-brand-500/20 px-2 py-0.5 rounded-full ml-1 font-bold">
                {pendingRubrics.length} Pending
              </span>
            </div>
            <span className="text-[11px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/20 px-2.5 py-1 rounded-lg border border-brand-500/15">
              HOD Approval Gate
            </span>
          </div>

          <div className="overflow-x-auto px-6 pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-30">
                  <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Subject Paper</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Set</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Grade Level</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Max Marks</th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {isLoadingRubrics ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-[var(--text-secondary)]">
                      <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                      Fetching pending rubrics...
                    </td>
                  </tr>
                ) : pendingRubrics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[var(--text-secondary)] text-[12.5px] font-medium bg-[var(--surface-secondary)] bg-opacity-10">
                      No teacher rubrics currently pending approval.
                    </td>
                  </tr>
                ) : (
                  pendingRubrics.map((r) => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRubric(r)} 
                      className="hover:bg-brand-500/5 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 font-bold text-[13px] text-[var(--text-primary)] group-hover:text-brand-600 transition-colors">
                        {r.subject} - {r.title}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11.5px] text-[var(--text-secondary)]">{r.paper_set || "A"}</td>
                      <td className="px-6 py-4 text-[12px] text-[var(--text-secondary)] font-medium">{r.grade_level || "Class 12"}</td>
                      <td className="px-6 py-4 font-semibold font-mono text-[12px] text-[var(--text-primary)]">{r.max_marks} marks</td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center justify-center gap-1 py-1.5 px-3.5 rounded-lg text-[11.5px] font-bold bg-brand-500 hover:bg-brand-600 text-white transition-all cursor-pointer shadow-sm">
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
      )}

      {/* ── Submissions Flagged for Human Review ── */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex flex-col md:flex-row md:items-center justify-between gap-2" style={{ padding: "18px 24px" }}>
          <div className="font-bold text-[13.5px] text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" />
            Submissions Requiring Moderator Review
            <span className="text-[10px] font-mono bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded-full ml-1 font-bold">
              {reviews.length} Flagged
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium italic">
            Triggered when confidence score drifts or fails rubric parameters
          </span>
        </div>

        <div className="overflow-x-auto px-6 pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-30">
                <th className="px-6 py-5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Subject Exam</th>
                <th className="px-6 py-5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Flagged Reason</th>
                <th className="px-6 py-5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Current Score</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoadingReviews ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-[var(--text-secondary)]">
                    <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                    Loading flagged evaluation queues...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--text-secondary)] text-[12.5px] font-medium bg-[var(--surface-secondary)] bg-opacity-10">
                    Excellent! Zero submissions currently require moderation review.
                  </td>
                </tr>
              ) : (
                reviews.slice(0, visibleReviewsCount).map((r) => {
                  const reason = r.review_reasons && r.review_reasons.length > 0 
                    ? r.review_reasons.join(", ") 
                    : "Low Confidence drift score (< 80%)";
                  return (
                    <tr 
                      key={r.submission_id} 
                      onClick={() => setSelectedSub(r)} 
                      className="hover:bg-red-500/5 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-6 py-5 text-[13px] text-[var(--text-primary)] font-semibold">
                        {generateStudentName(r.student_id).name}
                      </td>
                      <td className="px-6 py-5 text-[12.5px] text-[var(--text-secondary)] font-medium">{r.task_title}</td>
                      <td className="px-6 py-5 text-[12px] text-red-500 font-semibold">
                        <div className="flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5 w-max">
                          <AlertCircle size={13} className="shrink-0" />
                          {reason}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold font-mono text-[13px] text-[var(--text-primary)]">{r.grade} / {r.max_grade}</td>
                      <td className="px-6 py-5 text-right">
                        <button
                          style={{ padding: "7.5px 18px", fontSize: "12.5px", borderRadius: "8px" }}
                          className="inline-flex items-center justify-center gap-2 font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-white transition-all cursor-pointer shadow-sm whitespace-nowrap"
                        >
                          Inspect Verdict <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {reviews.length > 10 && (
          <div className="flex justify-center gap-3 p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-20">
            {visibleReviewsCount < reviews.length && (
              <button
                onClick={(e) => { e.stopPropagation(); setVisibleReviewsCount(prev => prev + 5); }}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-600 transition-all cursor-pointer shadow-sm"
              >
                See More +5
              </button>
            )}
            {visibleReviewsCount > 10 && (
              <button
                onClick={(e) => { e.stopPropagation(); setVisibleReviewsCount(10); }}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:border-red-500 hover:text-red-600 transition-all cursor-pointer shadow-sm"
              >
                Show Less
              </button>
            )}
          </div>
        )}
      </div>

      {/* Moderation Inspect Overlay Slider */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity flex justify-end" onClick={() => setSelectedSub(null)}>
          <div 
            className="w-full max-w-[550px] bg-[var(--surface-primary)] border-l border-[var(--border-subtle)] h-full flex flex-col shadow-2xl relative animate-slide-in-right overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--text-primary)]">
                <ShieldAlert size={16} className="text-amber-500 animate-pulse" />
                Moderator Verdict Audit Center
              </div>
              <button 
                onClick={() => setSelectedSub(null)}
                className="w-8 h-8 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-500 flex items-center justify-center font-bold text-[16px] cursor-pointer transition-all shadow-sm"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-[var(--surface-secondary)] bg-opacity-40 border border-[var(--border-subtle)] p-4 rounded-xl">
                <div>
                  <div className="text-[15px] font-bold text-[var(--text-primary)]">
                    {generateStudentName(selectedSub.student_id).name}
                  </div>
                  <div className="font-mono text-[10.5px] text-[var(--text-tertiary)] mt-0.5">{selectedSub.submission_id}</div>
                </div>
              </div>

              {isLoadingDetail ? (
                <div className="py-16 text-center text-[var(--text-secondary)] flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin mb-3 text-brand-500" size={28} />
                  <span className="font-medium text-[13px]">Loading grading breakdown audit...</span>
                </div>
              ) : !reviewDetail ? (
                <div className="py-12 text-center text-red-500 font-medium">Failed to retrieve grade detail logs.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Segmented Tab Control */}
                  <div className="flex border-b border-[var(--border-subtle)] p-0.5 bg-[var(--surface-secondary)] rounded-xl">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-center font-bold text-[12px] transition-all rounded-lg cursor-pointer ${
                        activeTab === "evaluation"
                          ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)]"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                      }`}
                      onClick={() => setActiveTab("evaluation")}
                    >
                      Evaluation & Moderation
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-center font-bold text-[12px] transition-all rounded-lg cursor-pointer ${
                        activeTab === "student_answer"
                          ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)]"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                      }`}
                      onClick={() => setActiveTab("student_answer")}
                    >
                      Student Answer File
                    </button>
                  </div>

                  {activeTab === "evaluation" ? (
                    <div className="flex flex-col gap-6">
                      {/* Current Score Display */}
                      <div className="grid grid-cols-2 gap-4 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl">
                        <div>
                          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-1">AI Proposed Grade</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[26px] font-bold font-mono text-[var(--text-primary)]">{reviewDetail.grade}</span>
                            <span className="text-[12px] text-[var(--text-tertiary)]">/ {reviewDetail.max_grade}</span>
                          </div>
                        </div>
                        <div className="border-l border-[var(--border-subtle)] pl-4">
                          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-1">AI Confidence</span>
                          <span className="inline-block text-[13px] font-bold font-mono text-amber-500 bg-amber-500/10 border border-amber-500/10 rounded-lg px-2.5 py-1 mt-1">
                            {(reviewDetail.confidence * 100).toFixed(0)}% Match
                          </span>
                        </div>
                      </div>

                      {/* Actions Grid */}
                      <div className="flex flex-col gap-4 border border-[var(--border-subtle)] p-5 rounded-xl bg-[var(--surface-primary)] relative shadow-sm overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-amber-500" />
                        <h3 className="text-[12.5px] font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider font-mono">
                          <ShieldCheck size={14} className="text-brand-600" />
                          Human-in-the-Loop Verdict
                        </h3>

                        {/* Grade override input */}
                        <form onSubmit={handleOverrideGrade} className="flex flex-col gap-4 mt-2">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Corrected Score override</label>
                            <div className="relative">
                              <input 
                                type="number"
                                min="0"
                                max={reviewDetail.max_grade}
                                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 font-mono font-bold"
                                value={newGrade === "" ? "" : newGrade}
                                onChange={(e) => setNewGrade(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-[var(--text-tertiary)]">
                                max: {reviewDetail.max_grade}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Moderator Verdict Rationale</label>
                            <textarea 
                              className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 min-h-[80px]"
                              placeholder="Describe your reasoning or comments for releasing this grade override..."
                              value={moderationNotes}
                              onChange={(e) => setModerationNotes(e.target.value)}
                            />
                          </div>

                          {actionSuccess ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[12px] flex items-center justify-center gap-1.5 font-bold mt-1">
                              <CheckCircle2 size={14} className="animate-bounce" /> Action successfully synchronized!
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <button 
                                type="button"
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                onClick={handleApproveGrade}
                                disabled={isSubmittingAction}
                              >
                                Approve AI Grade
                              </button>
                              <button 
                                type="submit"
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all cursor-pointer"
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
                        <h4 className="text-[10px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase font-mono">Component Step Audit traces</h4>
                        <div className="flex flex-col gap-3">
                          {(reviewDetail.step_grades || []).map((step, idx) => (
                            <div key={idx} className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl hover:border-brand-500/30 transition-all duration-200">
                              <div className="flex justify-between font-bold text-[12px] text-[var(--text-primary)] mb-2 font-mono">
                                <span>Step {step.step_num} ({step.component_type || "text"})</span>
                                <span className="text-brand-600 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
                                  {step.marks_awarded || step.awarded} / {step.max_marks || step.max} pts
                                </span>
                              </div>
                              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mt-1">
                                {step.justification}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {reviewDetail.parsed_content?.steps && reviewDetail.parsed_content.steps.length > 0 ? (
                        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {reviewDetail.parsed_content.steps.map((step: any, idx: number) => (
                            <div key={idx} className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-2">
                              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2 mb-1">
                                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider font-mono">Step {step.step_num}</span>
                                <span className="text-[10px] bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-full uppercase font-bold">{step.step_type}</span>
                              </div>
                              <p className="text-[var(--text-primary)] text-[12.5px] leading-relaxed">{step.text}</p>
                              {step.equations && step.equations.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {step.equations.map((eq: string, eqIdx: number) => (
                                    <code key={eqIdx} className="bg-[var(--surface-primary)] text-[var(--text-secondary)] px-2.5 py-1 rounded text-[11px] font-mono border border-[var(--border-subtle)] shadow-sm">
                                      {eq}
                                    </code>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : reviewDetail.raw_text ? (
                        <div className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 font-mono text-[12px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                          {reviewDetail.raw_text}
                        </div>
                      ) : (
                        <div className="text-center text-[var(--text-tertiary)] py-12">No student answer text parsed yet.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rubric Approval Detail Slider */}
      {selectedRubric && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity flex justify-end" onClick={() => setSelectedRubric(null)}>
          <div 
            className="w-full max-w-[550px] bg-[var(--surface-primary)] border-l border-[var(--border-subtle)] h-full flex flex-col shadow-2xl relative animate-slide-in-right overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[14px] text-brand-800">
                <ShieldCheck size={16} className="text-brand-600 animate-pulse" />
                HOD Rubric Audit Gate
              </div>
              <button 
                onClick={() => setSelectedRubric(null)}
                className="w-8 h-8 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-500 flex items-center justify-center font-bold text-[16px] cursor-pointer transition-all shadow-sm"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2 bg-[var(--surface-secondary)] bg-opacity-40 border border-[var(--border-subtle)] p-4 rounded-xl">
                <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider font-mono">Pending Institutional Rubric</span>
                <h3 className="text-[16.5px] font-bold text-[var(--text-primary)] mt-1">{selectedRubric.subject} - {selectedRubric.title}</h3>
                <div className="grid grid-cols-2 gap-3 text-[12px] text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-subtle)] font-mono">
                  <div>Grade Level: <strong className="text-[var(--text-primary)]">{selectedRubric.grade_level}</strong></div>
                  <div>Paper Set: <strong className="text-[var(--text-primary)]">{selectedRubric.paper_set || "A"}</strong></div>
                  <div className="col-span-2 mt-1">Max Marks: <strong className="text-[var(--text-primary)]">{selectedRubric.max_marks} marks</strong></div>
                </div>
              </div>

              {/* Rubric steps details */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase font-mono">Rubric Decomposed Steps</h4>
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {(selectedRubric.steps || []).map((step: any, idx: number) => (
                    <div key={idx} className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl">
                      <div className="flex justify-between items-center text-[12px] font-bold text-[var(--text-primary)] mb-2 font-mono">
                        <span>Step {step.step_num} ({step.component_type})</span>
                        <span className="text-brand-600 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded">{step.marks} marks</span>
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{step.description}</div>
                      {step.expected_exprs && step.expected_exprs.length > 0 && (
                        <div className="text-[10.5px] font-mono text-brand-600 mt-2 bg-brand-500/5 p-2 rounded-lg border border-brand-500/10">
                          Expected Math Syntax: {step.expected_exprs.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Form */}
              <div className="flex flex-col gap-4 border border-[var(--border-subtle)] p-5 rounded-xl bg-[var(--surface-primary)] relative shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-emerald-500" />
                <h3 className="text-[12.5px] font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Approve or Reject Rubric Schema</h3>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Rejection notes (Required to send back)</label>
                  <textarea 
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 min-h-[80px]"
                    placeholder="Provide specific notes if rejecting this rubric schema..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button 
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    onClick={() => handleRubricApproval("reject")}
                    disabled={isRubricActioning}
                  >
                    <X size={14} /> Reject & Send Back
                  </button>
                  <button 
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer"
                    onClick={() => handleRubricApproval("approve")}
                    disabled={isRubricActioning}
                  >
                    <Check size={14} /> Approve Rubric
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
