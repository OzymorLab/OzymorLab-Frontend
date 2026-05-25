"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Activity, BrainCircuit, Search, Zap, Clock, TrendingUp, Sparkles, ArrowUpRight, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
    <>
      {/* Dashboard Header */}
      <div className="dash-header">
        <div className="dash-header-content">
          <div className="dash-header-badge">
            <Zap size={12} />
            <span>Live Engine</span>
          </div>
          <h1 className="dash-header-title">Evaluation Engine</h1>
          <p className="dash-header-subtitle">Real-time asynchronous assessment pipeline</p>
        </div>
        <div className="dash-header-glow" />
      </div>

      {/* Stats Grid */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card dash-stat-success">
          <div className="dash-stat-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div className="dash-stat-content">
            <div className="dash-stat-number">{processedCount}</div>
            <div className="dash-stat-label">Total Processed</div>
          </div>
          <div className="dash-stat-footer">
            <span className="dash-stat-live-dot" />
            <span>Live updating</span>
          </div>
          <div className="dash-stat-shimmer" />
        </div>

        <div className="dash-stat-card dash-stat-warning">
          <div className="dash-stat-icon-wrap">
            <AlertTriangle size={20} />
          </div>
          <div className="dash-stat-content">
            <div className="dash-stat-number">{queueCount}</div>
            <div className="dash-stat-label">In Queue</div>
          </div>
          <div className="dash-stat-footer">
            <Activity size={12} className="dash-stat-pulse" />
            <span>Processing...</span>
          </div>
          <div className="dash-stat-shimmer" />
        </div>

        <div className="dash-stat-card dash-stat-info">
          <div className="dash-stat-icon-wrap">
            <Clock size={20} />
          </div>
          <div className="dash-stat-content">
            <div className="dash-stat-number">1.4<span className="dash-stat-unit">s</span></div>
            <div className="dash-stat-label">Avg Latency</div>
          </div>
          <div className="dash-stat-footer">
            <TrendingUp size={12} />
            <span>per PDF submission</span>
          </div>
          <div className="dash-stat-shimmer" />
        </div>

        <div className="dash-stat-card dash-stat-brand">
          <div className="dash-stat-icon-wrap">
            <Shield size={20} />
          </div>
          <div className="dash-stat-content">
            <div className="dash-stat-number">0</div>
            <div className="dash-stat-label">Drift Alerts</div>
          </div>
          <div className="dash-stat-footer">
            <CheckCircle2 size={12} />
            <span>No rubric drift</span>
          </div>
          <div className="dash-stat-shimmer" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Submission Queue Card */}
        <div className="dash-card dash-card-main">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <div className="dash-card-title-icon">
                <FileText size={16} />
              </div>
              <span>Submission Queue</span>
            </div>
            <div className="dash-card-badge">{submissions.length} total</div>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Filename</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} onClick={() => setSelectedSub(sub)} className="dash-table-row">
                    <td className="col-primary font-mono text-[12px]">
                      {sub.student_id || <span className="dash-extracting">Extracting Identity...</span>}
                    </td>
                    <td className="text-[12px] max-w-[150px] truncate">{sub.file_name}</td>
                    <td>
                      {sub.status === "GRADED" && <span className="dash-pill dash-pill-success"><span className="dash-pill-dot" />Graded</span>}
                      {sub.status === "FAILED" && <span className="dash-pill dash-pill-danger"><span className="dash-pill-dot" />Failed</span>}
                      {sub.status === "IDENTITY_EXTRACTED" && <span className="dash-pill dash-pill-info"><span className="dash-pill-dot" />Identity Found</span>}
                      {sub.status === "GRADING" && <span className="dash-pill dash-pill-warning"><span className="dash-pill-dot" />Grading (AI)</span>}
                      {sub.status !== "GRADED" && sub.status !== "FAILED" && sub.status !== "IDENTITY_EXTRACTED" && sub.status !== "GRADING" && <span className="dash-pill dash-pill-info"><span className="dash-pill-dot" />{sub.status}</span>}
                    </td>
                    <td className="text-[11px] dash-time">{new Date(sub.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="dash-empty-state">
                      <div className="dash-empty-icon">
                        <FileText size={32} />
                      </div>
                      <span>No submissions found. Drop a PDF to begin!</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Rail */}
        <div className="right-rail">
          {/* Task Selector */}
          <div className="dash-task-selector">
            <label className="dash-task-label">
              <Sparkles size={14} />
              Select Exam Task
            </label>
            <select 
              className="dash-task-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="" disabled>Select an exam to grade...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.subject} - {t.title}</option>
              ))}
            </select>
          </div>

          {/* Upload Zone */}
          <div className="dash-upload-wrapper">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="dash-upload-input" onChange={handleUpload} disabled={isUploading} />
            <div className={`dash-upload-zone ${isUploading ? 'uploading' : ''}`}>
              <div className="dash-upload-border" />
              {isUploading ? (
                <>
                  <div className="dash-upload-spinner">
                    <Activity size={24} />
                  </div>
                  <div className="dash-upload-title">Uploading to Storage...</div>
                </>
              ) : (
                <>
                  <div className="dash-upload-icon-wrap">
                    <UploadCloud size={28} />
                  </div>
                  <div className="dash-upload-title">Drop answer sheets here</div>
                  <div className="dash-upload-subtitle">or <em>browse files</em> (PDF, JPG)</div>
                </>
              )}
            </div>
          </div>

          {/* Evaluation Command Center */}
          <div className="dash-card dash-command-center">
            <div className="dash-card-header">
              <div className="dash-card-title">
                <div className="dash-card-title-icon brand">
                  <BrainCircuit size={16} />
                </div>
                <span>Evaluation Command Center</span>
              </div>
            </div>
            
            {/* Radar HUD */}
            <div className="radar-container bg-surface-secondary">
              <div className="radar-cross-h"></div>
              <div className="radar-cross-v"></div>
              <div className="radar-grid">
                <div className="radar-grid-inner"></div>
              </div>
              <div className="radar-sweep"></div>
              
              <div className="radar-blip radar-blip-backend" title="FastAPI Engine Active"></div>
              <div className="radar-blip radar-blip-llm" title="Gemini Multi-Modal Active"></div>
              <div className="radar-blip radar-blip-kb" title="Dynamic Ruleset Sync Active"></div>
            </div>

            {/* System Status */}
            <div className="dash-system-status">
              <div className="dash-status-row">
                <div className="dash-status-left">
                  <span className="dash-status-indicator success">
                    <span className="dash-status-ping" />
                    <span className="dash-status-dot" />
                  </span>
                  <span className="dash-status-name">CORE</span>
                </div>
                <span className="dash-status-value">Connected (1.4s)</span>
              </div>
              <div className="dash-status-row">
                <div className="dash-status-left">
                  <span className="dash-status-indicator brand">
                    <span className="dash-status-ping" />
                    <span className="dash-status-dot" />
                  </span>
                  <span className="dash-status-name">INTELLIGENT VISION OCR</span>
                </div>
                <span className="dash-status-value">BYOK Online</span>
              </div>
              <div className="dash-status-row last">
                <div className="dash-status-left">
                  <span className="dash-status-indicator info">
                    <span className="dash-status-ping" />
                    <span className="dash-status-dot" />
                  </span>
                  <span className="dash-status-name">DYNAMIC RULES</span>
                </div>
                <span className="dash-status-value">Sync Complete</span>
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
    </>
  );
}
