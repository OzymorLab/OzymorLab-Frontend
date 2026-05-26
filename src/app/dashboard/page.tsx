"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Activity, BrainCircuit, Search, Zap, Clock, TrendingUp, Sparkles, ArrowUpRight, Shield } from "lucide-react";
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
    marks_awarded: number;
    max_marks: number;
    justification: string;
    error_type: string | null;
    sympy_valid: boolean | null;
  }>;
  latency_ms: number;
  model_used: string;
}

export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [subDetail, setSubDetail] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "student_answer">("evaluation");
  const [isUploading, setIsUploading] = useState(false);
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; subject: string }>>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const fetchTasks = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/tasks`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setTasks(json.data);
        if (!selectedTaskId) setSelectedTaskId(json.data[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/submissions`);
      const json = await res.json();
      if (json.data) setSubmissions(json.data);
    } catch (e) {
      console.error("Failed to fetch submissions", e);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSub) {
      // Fetch full submission details
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}`)
        .then(res => res.json())
        .then(json => { if (json.data) setSubDetail(json.data); })
        .catch(e => console.error("Detail fetch failed", e));

      if (selectedSub.status === "GRADED") {
        fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
          .then(res => res.json())
          .then(json => { if (json.data) setGradeDetail(json.data); })
          .catch(e => console.error("Grade fetch failed", e));
      } else {
        setGradeDetail(null);
      }
    } else {
      setSubDetail(null);
      setGradeDetail(null);
      setActiveTab("evaluation");
    }
  }, [selectedSub]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedTaskId) {
      alert("Please select an exam/task first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("task_id", selectedTaskId);

    try {
      await fetchWithAuth(`${API_BASE}/submissions`, { method: "POST", body: formData });
      fetchSubmissions();
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const processedCount = submissions.filter(s => s.status === 'GRADED').length;
  const queueCount = submissions.filter(s => s.status !== 'GRADED').length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10">
      
      {/* Dashboard Header */}
      <div className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-brand-600 uppercase bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded-full w-max">
            <Zap size={11} className="animate-pulse" />
            Live grading active
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] mt-2">OzymorLab Grading HUD</h1>
          <p className="text-[13px] text-[var(--text-secondary)]">Asynchronous multi-modal OCR assessment and SymPy trace validation console</p>
        </div>
        
        {/* Dynamic task picker */}
        <div className="flex flex-col gap-1.5 w-full md:w-[240px]">
          <label className="text-[9.5px] font-bold font-mono text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Sparkles size={11} className="text-brand-600" />
            Selected Exam Task
          </label>
          <select 
            className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm cursor-pointer w-full font-medium"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="" disabled>Select an exam task...</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.subject} - {t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
          <div className="w-[42px] h-[42px] bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <div className="text-[24px] font-bold font-mono leading-none">{processedCount}</div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1">Total Processed</div>
          </div>
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[9px] font-mono text-emerald-500 font-bold uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            Live
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
          <div className="w-[42px] h-[42px] bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center border border-amber-500/20">
            <AlertTriangle size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <div className="text-[24px] font-bold font-mono leading-none">{queueCount}</div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1">In Grading Queue</div>
          </div>
          {queueCount > 0 && (
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[9px] font-mono text-amber-500 font-bold uppercase">
              <Activity size={10} className="animate-spin" />
              Active
            </div>
          )}
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
          <div className="w-[42px] h-[42px] bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Clock size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <div className="text-[24px] font-bold font-mono leading-none">1.4s</div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1">Average Latency</div>
          </div>
          <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[9px] font-mono text-blue-500 font-bold uppercase">
            <TrendingUp size={10} />
            Fast
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
          <div className="w-[42px] h-[42px] bg-brand-500/10 text-brand-600 rounded-xl flex items-center justify-center border border-brand-500/20">
            <Shield size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <div className="text-[24px] font-bold font-mono leading-none">0</div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1">Drift Alerts</div>
          </div>
          <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[9px] font-mono text-brand-500 font-bold uppercase">
            <CheckCircle2 size={10} />
            Secure
          </div>
        </div>

      </div>

      {/* Main Double-Pane Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Interactive Submission Queue Card (takes 2/3 of grid) */}
        <div className="lg:col-span-2 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-semibold text-[14px] flex items-center gap-2">
              <FileText size={16} className="text-brand-600" />
              Recent Paper Submissions
            </h3>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase bg-[var(--surface-secondary)] px-2.5 py-0.5 rounded font-bold">
              {submissions.length} Total
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
                  <th className="text-[10px] font-bold font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-5 py-3">Student ID</th>
                  <th className="text-[10px] font-bold font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-5 py-3">Filename</th>
                  <th className="text-[10px] font-bold font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-5 py-3">Status</th>
                  <th className="text-[10px] font-bold font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-5 py-3">Uploaded Time</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    onClick={() => {
                      if (sub.status === "GRADED") {
                        router.push(`/analysis?task_id=${sub.task_id || ""}&submission_id=${sub.id}`);
                      } else {
                        setSelectedSub(sub);
                      }
                    }} 
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-secondary)]/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono text-[12px] font-bold text-brand-600">
                      {sub.student_id || (
                        <span className="text-[10.5px] italic text-[var(--text-tertiary)] animate-pulse">Extracting Student...</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-[var(--text-primary)] font-medium max-w-[180px] truncate">
                      {sub.file_name}
                    </td>
                    <td className="px-5 py-3.5">
                      {sub.status === "GRADED" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Graded
                        </span>
                      )}
                      {sub.status === "FAILED" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Failed
                        </span>
                      )}
                      {sub.status === "IDENTITY_EXTRACTED" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          Verified
                        </span>
                      )}
                      {sub.status === "GRADING" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Grading
                        </span>
                      )}
                      {sub.status !== "GRADED" && sub.status !== "FAILED" && sub.status !== "IDENTITY_EXTRACTED" && sub.status !== "GRADING" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-500/10 text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {sub.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] font-mono text-[var(--text-tertiary)]">
                      {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--text-tertiary)]">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={32} className="stroke-[1.5] text-[var(--text-tertiary)]" />
                        <span className="text-[12.5px] font-medium">No answer sheet submissions found in this portal yet.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT COLUMN: Drag-and-Drop Uploader & Command Center (takes 1/3 of grid) */}
        <div className="flex flex-col gap-6">
          
          {/* File uploader workspace */}
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative">
            <h4 className="font-semibold text-[13px] flex items-center gap-2">
              <UploadCloud size={15} className="text-brand-600" />
              Upload Student Answer Sheet
            </h4>
            
            <div className="border border-dashed border-[var(--border-subtle)] hover:border-brand-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[var(--surface-secondary)]/50 relative min-h-[140px]">
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload} 
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Activity className="animate-spin text-brand-600" size={24} />
                  <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">Parsing Handwriting OCR...</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">Analyzing math structure coordinates</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 text-center">
                  <UploadCloud className="text-brand-500 mb-1" size={26} />
                  <span className="text-[12.5px] font-semibold text-[var(--text-secondary)]">Drop file or click to browse</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">Supports PDF, JPG, PNG sheets</span>
                </div>
              )}
            </div>
          </div>

          {/* Engine Status Command Center */}
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            
            <div className="flex items-center gap-2">
              <BrainCircuit size={15} className="text-brand-600" />
              <h4 className="font-semibold text-[13px]">Engine Command Center</h4>
            </div>

            {/* Radar Sweep HUD Mockup */}
            <div className="radar-container bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl h-[90px] relative overflow-hidden flex items-center justify-center">
              <div className="radar-cross-h"></div>
              <div className="radar-cross-v"></div>
              <div className="radar-grid">
                <div className="radar-grid-inner"></div>
              </div>
              <div className="radar-sweep"></div>
              
              <div className="radar-blip radar-blip-backend" title="FastAPI Engine Active"></div>
              <div className="radar-blip radar-blip-llm" title="Gemini Multi-Modal Active"></div>
              <div className="radar-blip radar-blip-kb" title="SymPy Validation Rules Connected"></div>
            </div>

            {/* Core engine metrics status logs */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  CORE ENGINE
                </span>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">CONNECTED (1.4s)</span>
              </div>
              <div className="h-[0.5px] bg-[var(--border-subtle)]" />
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  VISION OCR
                </span>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">ACTIVE</span>
              </div>
              <div className="h-[0.5px] bg-[var(--border-subtle)]" />
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  SYMPY RULES
                </span>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">SYNC COMPLETE</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Detail Slide Panel */}
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
                  <div className="font-mono text-[12px] text-text-tertiary">{selectedSub.id}</div>
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
                  <div className="py-8 text-center text-text-tertiary flex flex-col items-center">
                    <Activity className="animate-pulse mb-3" size={32} />
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
                    <div className="divider"></div>
                    <div className="slide-section">
                      <div className="slide-section-label">STEP TRACES</div>
                      <div className="step-list">
                        {gradeDetail.step_grades.map((step, idx) => (
                          <div key={idx} className="step-card">
                            <div className="step-card-top">
                              <div className="step-name">Step {step.step_num}</div>
                              <div className="step-marks">{step.marks_awarded} / {step.max_marks}</div>
                            </div>
                            <div className="step-justification">{step.justification}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="slide-section">
                      <div className="slide-section-label">METADATA</div>
                      <div className="meta-row"><span className="meta-key">Latency</span><span className="meta-val">{gradeDetail.latency_ms}ms</span></div>
                      <div className="meta-row"><span className="meta-key">Confidence</span><span className="meta-val">{(gradeDetail.confidence * 100).toFixed(1)}%</span></div>
                      <div className="meta-row"><span className="meta-key">Model</span><span className="meta-val truncate max-w-[150px]">{gradeDetail.model_used}</span></div>
                    </div>
                  </>
                )
              ) : (
                !subDetail ? (
                  <div className="py-8 text-center text-text-tertiary">Loading student answer...</div>
                ) : subDetail.parsed_content?.steps && subDetail.parsed_content.steps.length > 0 ? (
                  <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {subDetail.parsed_content.steps.map((step, idx) => (
                      <div key={idx} className="bg-surface-secondary border border-border-secondary rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold text-primary uppercase tracking-wider">Step {step.step_num}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-medium">{step.step_type}</span>
                        </div>
                        <p className="text-text-primary text-[13.5px] leading-relaxed">{step.text}</p>
                        {step.equations && step.equations.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {step.equations.map((eq, eqIdx) => (
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
