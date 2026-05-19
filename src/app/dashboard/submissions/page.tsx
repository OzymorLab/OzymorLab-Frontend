"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Search, Filter, RefreshCw, CheckCircle2, 
  AlertTriangle, Clock, ArrowRight, Eye, Sparkles 
} from "lucide-react";
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

export default function SubmissionsPage() {
  const { fetchWithAuth } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
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
          s.student_id.toLowerCase().includes(search.toLowerCase()) ||
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
    if (selectedSub && selectedSub.status === "GRADED") {
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setGradeDetail(json.data);
        })
        .catch((e) => console.error("Grade fetch failed", e));
    } else {
      setGradeDetail(null);
    }
  }, [selectedSub]);

  return (
    <div className="submissions-container py-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
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
          className="btn btn-secondary flex items-center gap-1.5 text-[12.5px] cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Reload Queue
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card bg-surface-primary border border-border-subtle p-4 rounded-lg flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-text-tertiary" size={16} />
            <input
              type="text"
              className="w-full bg-surface-secondary border border-border-default rounded-md py-2 pl-9 pr-4 text-[13px] focus:outline-none focus:border-brand-600 text-text-primary"
              placeholder="Search Student ID or File name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-tertiary" />
          <span className="text-[12.5px] text-text-secondary mr-2 font-medium">Status:</span>
          <div className="flex gap-1 bg-surface-secondary p-1 rounded-md border border-border-subtle">
            {["ALL", "GRADED", "FAILED", "PENDING"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  statusFilter === status
                    ? "bg-surface-primary text-text-primary shadow-xs border border-border-subtle"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid or Table */}
      <div className="card overflow-hidden border border-border-subtle shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="bg-surface-secondary">
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Filename</th>
                <th className="px-6 py-4">Created Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} onClick={() => setSelectedSub(sub)} className="hover:bg-surface-secondary cursor-pointer">
                  <td className="px-6 py-4 font-mono text-[12px] text-text-primary font-medium">{sub.student_id}</td>
                  <td className="px-6 py-4 text-[12.5px] max-w-[200px] truncate text-text-secondary">{sub.file_name}</td>
                  <td className="px-6 py-4 text-[12px] text-text-tertiary">{new Date(sub.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {sub.status === "GRADED" && <span className="pill pill-success"><div className="pill-dot"/>Graded</span>}
                    {sub.status === "FAILED" && <span className="pill pill-danger"><div className="pill-dot"/>Failed</span>}
                    {sub.status !== "GRADED" && sub.status !== "FAILED" && <span className="pill pill-info"><div className="pill-dot"/>{sub.status}</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="btn btn-secondary py-1 px-3 text-[11.5px] flex items-center gap-1 ml-auto cursor-pointer">
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
                <div className="avatar avatar-lg avatar-purple">{selectedSub.student_id.slice(-2)}</div>
                <div>
                  <div className="text-[16px] font-medium text-text-primary">{selectedSub.student_id}</div>
                  <div className="font-mono text-[11.5px] text-text-tertiary">{selectedSub.id}</div>
                </div>
              </div>

              {selectedSub.status !== "GRADED" ? (
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
                  
                  <div className="bg-surface-secondary p-3 rounded-lg border border-border-subtle flex justify-between mb-6 text-[12.5px]">
                    <span className="text-text-secondary">AI Verdict Confidence</span>
                    <span className={`font-semibold ${gradeDetail.confidence >= 0.8 ? "text-success-text" : "text-warning-text"}`}>
                      {(gradeDetail.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="divider"></div>
                  
                  <div className="slide-section">
                    <div className="slide-section-label text-[11.5px] font-semibold tracking-wider text-text-tertiary mb-3 uppercase">Component Marks breakdown</div>
                    <div className="step-list flex flex-col gap-3">
                      {gradeDetail.step_grades.map((step, idx) => (
                        <div key={idx} className="step-card bg-surface-secondary border border-border-subtle p-3 rounded-lg">
                          <div className="step-card-top flex justify-between font-medium text-[12.5px] text-text-primary mb-1">
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={12} className="text-brand-600" />
                              Step {step.step_num} ({step.step_type})
                            </span>
                            <span>{step.awarded} / {step.max}</span>
                          </div>
                          <p className="step-justification text-[11.5px] text-text-secondary leading-relaxed mt-1">
                            {step.justification}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="slide-section">
                    <div className="slide-section-label text-[11.5px] font-semibold tracking-wider text-text-tertiary mb-3 uppercase">Metadata Logs</div>
                    <div className="flex flex-col gap-2 text-[12px]">
                      <div className="meta-row flex justify-between py-1 border-b border-border-subtle"><span className="text-text-tertiary">Processor latency</span><span className="text-text-primary font-medium">{gradeDetail.latency_ms}ms</span></div>
                      <div className="meta-row flex justify-between py-1 border-b border-border-subtle"><span className="text-text-tertiary">Language Model</span><span className="text-text-primary font-mono truncate max-w-[180px]">{gradeDetail.model_used}</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
