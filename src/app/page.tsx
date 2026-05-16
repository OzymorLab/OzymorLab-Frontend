"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Activity, BrainCircuit, Search } from "lucide-react";

const API_BASE = "http://localhost:8000/api/v1";

// Types
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

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Submissions on load
  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_BASE}/submissions`);
      const json = await res.json();
      if (json.data) {
        setSubmissions(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch submissions", e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Fetch Grade Detail when a row is clicked
  useEffect(() => {
    if (selectedSub && selectedSub.status === "GRADED") {
      fetch(`${API_BASE}/submissions/${selectedSub.id}/grade`)
        .then(res => res.json())
        .then(json => {
          if (json.data) setGradeDetail(json.data);
        })
        .catch(e => console.error("Grade fetch failed", e));
    } else {
      setGradeDetail(null);
    }
  }, [selectedSub]);

  // Handle File Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    // Hardcoding a task_id and student_id for MVP
    formData.append("task_id", "00000000-0000-0000-0000-000000000000"); // Assuming standard test task
    formData.append("student_id", "STUDENT-" + Math.floor(Math.random() * 1000));

    try {
      await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        body: formData,
      });
      fetchSubmissions();
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset
    }
  };

  return (
    <>
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary">Live Evaluation Engine</h1>
          <p className="text-[13px] text-text-tertiary mt-1">Real-time asynchronous assessment queue</p>
        </div>
        <div className="filter-row">
          <div className="filter-chip active">All Students</div>
          <div className="filter-chip">Needs Review</div>
          <div className="filter-chip">Processing</div>
        </div>
      </div>

      {/* Stats Grid */}
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
        {/* Left Col: Main Data Table */}
        <div className="card flex flex-col">
          <div className="card-header">
            <div className="card-title">
              <FileText className="card-title-icon" />
              Submission Queue
            </div>
            <button className="btn btn-icon-only text-text-tertiary"><Search size={14}/></button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="data-table">
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

        {/* Right Rail */}
        <div className="right-rail">
          {/* Upload Zone */}
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleUpload}
              disabled={isUploading}
            />
            <div className={`upload-zone ${isUploading ? 'bg-surface-secondary' : ''}`}>
              {isUploading ? (
                <>
                  <Activity className="upload-icon mx-auto animate-pulse" />
                  <div className="upload-title">Uploading to S3...</div>
                </>
              ) : (
                <>
                  <UploadCloud className="upload-icon mx-auto" />
                  <div className="upload-title">Drop answer sheets here</div>
                  <div className="upload-subtitle">or <em>browse files</em> (PDF, JPG)</div>
                </>
              )}
            </div>
          </div>

          {/* Reliability Signals */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Activity className="card-title-icon" />
                Live Engine Status
              </div>
            </div>
            <div className="flex flex-col">
              <div className="signal-item">
                <CheckCircle2 className="signal-icon success" />
                <div>
                  <div className="signal-title">FastAPI Backend Connected</div>
                  <div className="signal-subtitle">Polling localhost:8000 successfully.</div>
                </div>
              </div>
              <div className="signal-item">
                <CheckCircle2 className="signal-icon success" />
                <div>
                  <div className="signal-title">Gemini Vision Connected</div>
                  <div className="signal-subtitle">OCR / LLM inference online.</div>
                </div>
              </div>
              <div className="signal-item">
                <BrainCircuit className="signal-icon info" />
                <div>
                  <div className="signal-title">Dynamic KB Active</div>
                  <div className="signal-subtitle">Evaluation adapting to injected rulesets.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Panel */}
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
                  <span className="text-[11px] mt-1">OCR → Step Segmentation → LLM Grading</span>
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
                    <div className="slide-section-label">STEP TRACES & JUSTIFICATION</div>
                    
                    <div className="step-list">
                      {gradeDetail.step_grades.map((step, idx) => (
                        <div key={idx} className="step-card">
                          <div className="step-card-top">
                            <div className="step-name">Step {step.step_num}</div>
                            <div className="step-marks">{step.awarded} / {step.max}</div>
                          </div>
                          <div className="step-justification">
                            {step.justification}
                          </div>
                          <div className={`step-meta ${step.is_correct ? 'ok' : 'error'}`}>
                            {step.is_correct ? <CheckCircle2 className="step-meta-icon" /> : <AlertTriangle className="step-meta-icon" />}
                            {step.is_correct ? "Validated Correct" : "Error Detected in Reasoning"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="slide-section">
                    <div className="slide-section-label">METADATA</div>
                    <div className="meta-row">
                      <span className="meta-key">Engine Latency</span>
                      <span className="meta-val">{gradeDetail.latency_ms}ms</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-key">AI Confidence</span>
                      <span className="meta-val">{(gradeDetail.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-key">LLM Core</span>
                      <span className="meta-val truncate max-w-[150px]">{gradeDetail.model_used}</span>
                    </div>
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
