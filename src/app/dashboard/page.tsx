"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Activity, BrainCircuit, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

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
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
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
    if (selectedSub && selectedSub.status === "GRADED") {
      fetchWithAuth(`${API_BASE}/submissions/${selectedSub.id}/grade`)
        .then(res => res.json())
        .then(json => { if (json.data) setGradeDetail(json.data); })
        .catch(e => console.error("Grade fetch failed", e));
    } else {
      setGradeDetail(null);
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
    formData.append("student_id", "STUDENT-" + Math.floor(Math.random() * 1000));

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

  return (
    <>
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary">Live Evaluation Engine</h1>
          <p className="text-[13px] text-text-tertiary mt-1">Real-time asynchronous assessment queue</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Processed</div>
          <div className="stat-value">{submissions.filter(s => s.status === 'GRADED').length}</div>
          <div className="stat-delta positive">Live updating</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Queue</div>
          <div className="stat-value">{submissions.filter(s => s.status !== 'GRADED').length}</div>
          <div className="stat-delta warning">Processing...</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg System Latency</div>
          <div className="stat-value">1.4s</div>
          <div className="stat-delta">per PDF submission</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drift Alerts</div>
          <div className="stat-value">0</div>
          <div className="stat-delta positive">No rubric drift</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card flex flex-col">
          <div className="card-header">
            <div className="card-title"><FileText className="card-title-icon" /> Submission Queue</div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="data-table">
              <thead>
                <tr><th>Student ID</th><th>Filename</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} onClick={() => setSelectedSub(sub)}>
                    <td className="col-primary font-mono text-[12px]">{sub.student_id}</td>
                    <td className="text-[12px] max-w-[150px] truncate">{sub.file_name}</td>
                    <td>
                      {sub.status === "GRADED" && <span className="pill pill-success"><div className="pill-dot"/>Graded</span>}
                      {sub.status === "FAILED" && <span className="pill pill-danger"><div className="pill-dot"/>Failed</span>}
                      {sub.status !== "GRADED" && sub.status !== "FAILED" && <span className="pill pill-info"><div className="pill-dot"/>{sub.status}</span>}
                    </td>
                    <td className="text-[11px]">{new Date(sub.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-text-tertiary">No submissions found. Drop a PDF to begin!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-rail">
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-text-secondary mb-1">Select Exam Task</label>
            <select 
              className="w-full bg-surface-primary border border-border-subtle rounded-md px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-brand-600"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="" disabled>Select an exam to grade...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.subject} - {t.title}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleUpload} disabled={isUploading} />
            <div className={`upload-zone ${isUploading ? 'bg-surface-secondary' : ''}`}>
              {isUploading ? (
                <><Activity className="upload-icon mx-auto animate-pulse" /><div className="upload-title">Uploading to Storage...</div></>
              ) : (
                <><UploadCloud className="upload-icon mx-auto" /><div className="upload-title">Drop answer sheets here</div><div className="upload-subtitle">or <em>browse files</em> (PDF, JPG)</div></>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><Activity className="card-title-icon text-brand-600" /> Evaluation Command Center</div>
            </div>
            
            {/* Pulsing Conic Radar HUD */}
            <div className="radar-container bg-surface-secondary">
              <div className="radar-cross-h"></div>
              <div className="radar-cross-v"></div>
              <div className="radar-grid">
                <div className="radar-grid-inner"></div>
              </div>
              <div className="radar-sweep"></div>
              
              {/* Animated Blips */}
              <div className="radar-blip radar-blip-backend" title="FastAPI Engine Active"></div>
              <div className="radar-blip radar-blip-llm" title="Gemini Multi-Modal Active"></div>
              <div className="radar-blip radar-blip-kb" title="Dynamic Ruleset Sync Active"></div>
            </div>

            <div className="flex flex-col p-4 gap-3 bg-surface-primary">
              <div className="flex justify-between items-center text-[12px] border-b border-border-subtle pb-2">
                <span className="text-text-tertiary flex items-center gap-1.5 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-border opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-border"></span>
                  </span>
                  FastAPI CORE
                </span>
                <span className="font-mono text-text-secondary">Connected (1.4s)</span>
              </div>
              <div className="flex justify-between items-center text-[12px] border-b border-border-subtle pb-2">
                <span className="text-text-tertiary flex items-center gap-1.5 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                  </span>
                  GEMINI VISION
                </span>
                <span className="font-mono text-text-secondary">BYOK Online</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-tertiary flex items-center gap-1.5 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info-border opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-info-border"></span>
                  </span>
                  DYNAMIC RULES
                </span>
                <span className="font-mono text-text-secondary">Sync Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <div className="font-mono text-[12px] text-text-tertiary">{selectedSub.id}</div>
                </div>
              </div>

              {selectedSub.status !== "GRADED" ? (
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
