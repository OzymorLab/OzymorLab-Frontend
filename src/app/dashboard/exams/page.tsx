"use client";

import { useState, useEffect } from "react";
import { 
  UploadCloud, CheckCircle2, AlertTriangle, FileText, 
  Activity, BrainCircuit, ArrowRight, ArrowLeft, Plus, 
  Trash2, FileSpreadsheet, Loader2, Sparkles, Check, Play
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://localhost:8000/api/v1";

interface RubricStep {
  step_num: number;
  description: str;
  marks: number;
  step_type: string;
  component_type: string;
  expected_exprs: string[];
  marking_notes: string;
  partial_credit: boolean;
  diagram_relations: any[];
}

interface DraftRubric {
  steps: RubricStep[];
  grading_notes: string;
  total_marks_allocated: number;
  question_count: number;
}

export default function ExamsPage() {
  const { fetchWithAuth } = useAuth();
  const [step, setStep] = useState(1); // 1: Paper Upload, 2: Rubric Edit, 3: Bulk Answer Upload, 4: Live Progress
  
  // Form Metadata
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [board, setBoard] = useState("CBSE");
  const [gradeLevel, setGradeLevel] = useState("Class 12");
  const [maxMarks, setMaxMarks] = useState(30);
  const [description, setDescription] = useState("");

  // Step 1: Question Paper
  const [qpaperFile, setQpaperFile] = useState<File | null>(null);
  const [isProcessingPaper, setIsProcessingPaper] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [questionPaperKey, setQuestionPaperKey] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0.0);

  // Step 2: Rubric Edit
  const [rubricSteps, setRubricSteps] = useState<RubricStep[]>([]);
  const [gradingNotes, setGradingNotes] = useState("");
  const [taskId, setTaskId] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Step 3: Bulk Answer Upload
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [customStudentIds, setCustomStudentIds] = useState<string[]>([]);
  const [isUploadingAnswers, setIsUploadingAnswers] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Step 4: Live Grading
  const [runId, setRunId] = useState("");
  const [runStatus, setRunStatus] = useState<any>(null);

  // Auto-generate task title when subject/grade changes
  useEffect(() => {
    if (!title) {
      setTitle(`${subject} ${gradeLevel} - Mid-Term Exam`);
    }
  }, [subject, gradeLevel]);

  // Poll grading run progress in Step 4
  useEffect(() => {
    if (step !== 4 || !runId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/runs/${runId}`);
        const json = await res.json();
        if (json.data) {
          setRunStatus(json.data);
          if (json.data.status === "COMPLETED" || json.data.status === "FAILED") {
            clearInterval(pollInterval);
          }
        }
      } catch (e) {
        console.error("Failed to poll run status", e);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [step, runId]);

  // Handle Question Paper Upload & Process
  const handlePaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQpaperFile(file);
  };

  const processQuestionPaper = async () => {
    if (!qpaperFile) return;

    setIsProcessingPaper(true);
    const formData = new FormData();
    formData.append("file", qpaperFile);
    formData.append("subject", subject);
    formData.append("board", board);
    formData.append("grade_level", gradeLevel);
    formData.append("max_marks", maxMarks.toString());

    try {
      const res = await fetchWithAuth(`${API_BASE}/question-papers/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to parse question paper");
      }

      const json = await res.json();
      const data = json.data;

      setQuestionPaperKey(data.question_paper_key);
      setExtractedText(data.extracted_text);
      setRubricSteps(data.draft_rubric.steps || []);
      setGradingNotes(data.draft_rubric.grading_notes || "");
      setAiConfidence(data.ai_confidence);
      
      // Move to Step 2 (Rubric Edit)
      setStep(2);
    } catch (e: any) {
      alert(e.message || "An error occurred while processing the question paper.");
    } finally {
      setIsProcessingPaper(false);
    }
  };

  // Add new step in Rubric Review
  const addRubricStep = () => {
    const nextNum = rubricSteps.length > 0 ? Math.max(...rubricSteps.map(s => s.step_num)) + 1 : 1;
    const newStep: RubricStep = {
      step_num: nextNum,
      description: "New question description",
      marks: 5,
      step_type: "statement",
      component_type: "text",
      expected_exprs: [],
      marking_notes: "",
      partial_credit: true,
      diagram_relations: [],
    };
    setRubricSteps([...rubricSteps, newStep]);
  };

  // Remove rubric step
  const removeRubricStep = (num: number) => {
    setRubricSteps(rubricSteps.filter(s => s.step_num !== num));
  };

  // Update step values
  const updateStepValue = (num: number, key: keyof RubricStep, value: any) => {
    setRubricSteps(
      rubricSteps.map(s => (s.step_num === num ? { ...s, [key]: value } : s))
    );
  };

  // Confirm Rubric & Create Task
  const confirmRubric = async () => {
    setIsCreatingTask(true);
    const payload = {
      title,
      subject,
      board,
      grade_level: gradeLevel,
      max_marks: maxMarks,
      description,
      question_paper_key: questionPaperKey,
      rubric: {
        version: "1.0.0",
        grading_notes: gradingNotes,
        steps: rubricSteps,
      }
    };

    try {
      const res = await fetchWithAuth(`${API_BASE}/question-papers/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to confirm rubric");
      }

      const json = await res.json();
      setTaskId(json.data.id);
      
      // Move to Step 3 (Bulk Answer Sheet Upload)
      setStep(3);
    } catch (e: any) {
      alert(e.message || "Failed to create task & rubric");
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Step 3: Handle Answer sheets drop
  const handleAnswersDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setAnswerFiles(prev => [...prev, ...filesArray]);
    setCustomStudentIds(prev => [
      ...prev,
      ...filesArray.map((f, i) => {
        const cleaned = f.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "-").toUpperCase();
        return `STUDENT-${cleaned}`;
      })
    ]);
  };

  // Update specific student ID
  const updateStudentId = (idx: number, id: string) => {
    setCustomStudentIds(prev => prev.map((item, i) => (i === idx ? id : item)));
  };

  // Remove answer file
  const removeAnswerFile = (idx: number) => {
    setAnswerFiles(prev => prev.filter((_, i) => i !== idx));
    setCustomStudentIds(prev => prev.filter((_, i) => i !== idx));
  };

  // Upload and Start grading
  const uploadAndStartGrading = async () => {
    if (answerFiles.length === 0) return;

    setIsUploadingAnswers(true);
    const formData = new FormData();
    formData.append("task_id", taskId);
    answerFiles.forEach(file => {
      formData.append("files", file);
    });
    formData.append("student_ids", JSON.stringify(customStudentIds));

    try {
      // Step 3a: Upload files to S3 & register submissions
      const uploadRes = await fetchWithAuth(`${API_BASE}/submissions/bulk`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.detail || "Answer sheet bulk upload failed");
      }

      // Step 3b: Wait brief moment, then start grading run
      // In real scenario, Celery handles parsing asynchronously, but we trigger the bulk-grade
      // We will show step 4 and poll until parsing is done, then let grading run start.
      // Or we call the bulk-grade endpoint immediately which queues everything if parsed or tells us status.
      // Since parsing takes some seconds, let's start the run. Let's call /submissions/bulk-grade.
      // We wrap this inside an alert or direct attempt because some sheets might still be parsing.
      // We will attempt to trigger immediately or let the user click "Start Evaluation" once ready.
      
      // Let's call the bulk grade api
      const gradePayload = {
        task_id: taskId,
        description: `Bulk evaluation run for ${title}`,
        temperature: 0.0,
      };

      // Let's poll for a moment until submissions are parsed or just navigate to step 4
      setStep(4);
      
      // Try initiating grading
      setTimeout(async () => {
        try {
          const res = await fetchWithAuth(`${API_BASE}/submissions/bulk-grade`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gradePayload),
          });
          const json = await res.json();
          if (json.data && json.data.run_id) {
            setRunId(json.data.run_id);
          }
        } catch (e) {
          console.log("Submissions still parsing, will let auto-polling manage.");
        }
      }, 3000);

    } catch (e: any) {
      alert(e.message || "Bulk grading start failed");
    } finally {
      setIsUploadingAnswers(false);
    }
  };

  const startGradingManual = async () => {
    try {
      const gradePayload = {
        task_id: taskId,
        description: `Bulk evaluation run for ${title}`,
        temperature: 0.0,
      };
      const res = await fetchWithAuth(`${API_BASE}/submissions/bulk-grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradePayload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Grading failed to start. Submissions might still be parsing.");
      if (json.data && json.data.run_id) {
        setRunId(json.data.run_id);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <>
      {/* ── Title Area ── */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="text-brand-500 animate-pulse" size={24} />
            AI-Assisted Exam Evaluation Setup
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            Complete assessment lifecycle from physical question papers to automated component grading
          </p>
        </div>
      </div>

      {/* ── Steps Indicator ── */}
      <div className="steps-container mb-8">
        {[
          { num: 1, label: "Question Paper" },
          { num: 2, label: "Rubric Configuration" },
          { num: 3, label: "Bulk Student Answers" },
          { num: 4, label: "Live Grading & Analytics" }
        ].map((s) => (
          <div key={s.num} className={`step-item ${step === s.num ? "active" : ""} ${step > s.num ? "completed" : ""}`}>
            <div className="step-number">
              {step > s.num ? <Check size={14} className="stroke-[3]" /> : s.num}
            </div>
            <div className="step-label">{s.label}</div>
            {s.num < 4 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      {/* ── Wizard Body ── */}
      <div className="card p-6">
        
        {/* ── Step 1: Upload Question Paper ── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 flex flex-col gap-4">
                <h3 className="text-[16px] font-medium text-text-primary">Exam Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase">Exam Title</label>
                    <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics Mid-Term" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase">Subject</label>
                    <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)}>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase">Board</label>
                    <select className="input-field" value={board} onChange={(e) => setBoard(e.target.value)}>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase">Grade Level</label>
                    <input type="text" className="input-field" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase">Max Marks</label>
                    <input type="number" className="input-field" value={maxMarks} onChange={(e) => setMaxMarks(parseInt(e.target.value))} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-text-secondary uppercase">Exam Description</label>
                  <textarea className="input-field min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional exam description, sections details..." />
                </div>
              </div>

              {/* Question Paper File Dropzone */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[16px] font-medium text-text-primary">Question Paper PDF</h3>
                <div className="relative flex-1 min-h-[180px] border border-dashed border-border-secondary rounded-lg flex flex-col justify-center items-center p-4 hover:border-brand-500 transition-colors cursor-pointer bg-surface-secondary/40">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePaperUpload} />
                  <UploadCloud className="text-brand-500 mb-2" size={36} />
                  {qpaperFile ? (
                    <div className="text-center">
                      <p className="text-[13px] font-medium text-text-primary max-w-[200px] truncate">{qpaperFile.name}</p>
                      <p className="text-[11px] text-text-tertiary">{(qpaperFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-[13px] font-medium text-text-secondary">Click or drag Question Paper</p>
                      <p className="text-[11px] text-text-tertiary">PDF or High-res scan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border-secondary">
              <button 
                className="btn btn-brand btn-lg flex items-center gap-2" 
                onClick={processQuestionPaper} 
                disabled={isProcessingPaper || !qpaperFile}
              >
                {isProcessingPaper ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    AI Decomposing Paper...
                  </>
                ) : (
                  <>
                    Decompose with Gemini
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Edit Rubric ── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex-between mb-4 pb-2 border-b border-border-secondary">
              <div>
                <h3 className="text-[16px] font-medium text-text-primary">Gemini-Generated Rubric Structure</h3>
                <p className="text-[12px] text-text-tertiary mt-1 flex items-center gap-2">
                  <BrainCircuit className="text-brand-500" size={14} />
                  AI confidence: {(aiConfidence * 100).toFixed(0)}% • Please verify matching components and marks distribution before finalizing.
                </p>
              </div>
              <button className="btn flex items-center gap-1 text-[12px] py-1 px-3" onClick={addRubricStep}>
                <Plus size={14} /> Add Step
              </button>
            </div>

            {/* Rubric General Grading Notes */}
            <div className="flex flex-col gap-1 mb-6">
              <label className="text-[11px] font-medium text-text-secondary uppercase">General Grading Guidelines</label>
              <textarea 
                className="input-field min-h-[60px] font-mono text-[12px]" 
                value={gradingNotes} 
                onChange={(e) => setGradingNotes(e.target.value)} 
                placeholder="Board-level instructions for evaluators..."
              />
            </div>

            {/* Steps List */}
            <div className="flex flex-col gap-4 mb-6 max-h-[450px] overflow-y-auto pr-2">
              {rubricSteps.map((s, idx) => (
                <div key={s.step_num} className="border border-border-secondary rounded-lg p-4 bg-surface-secondary/20 flex flex-col gap-3">
                  <div className="flex-between">
                    <span className="text-[12px] font-semibold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded">
                      Step {s.step_num}
                    </span>
                    <button className="text-text-tertiary hover:text-red-500 transition-colors" onClick={() => removeRubricStep(s.step_num)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-medium text-text-secondary uppercase">Question / Task Description</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={s.description} 
                        onChange={(e) => updateStepValue(s.step_num, "description", e.target.value)} 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-medium text-text-secondary uppercase">Component Type</label>
                      <select 
                        className="input-field" 
                        value={s.component_type} 
                        onChange={(e) => updateStepValue(s.step_num, "component_type", e.target.value)}
                      >
                        <option value="text">Text (General)</option>
                        <option value="reasoning">Reasoning (SymPy)</option>
                        <option value="diagram">Diagram (DEIS)</option>
                        <option value="labels">Labels (DEIS)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-medium text-text-secondary uppercase">Marks Allocated</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        value={s.marks} 
                        onChange={(e) => updateStepValue(s.step_num, "marks", parseInt(e.target.value))} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-medium text-text-secondary uppercase">SymPy Formula Expectation</label>
                      <input 
                        type="text" 
                        className="input-field font-mono text-[11px]" 
                        value={s.expected_exprs.join(", ")} 
                        onChange={(e) => updateStepValue(s.step_num, "expected_exprs", e.target.value.split(",").map(t => t.trim()))} 
                        placeholder="e.g. F = k * q1 * q2 / r**2 (optional)"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-medium text-text-secondary uppercase">Specific Step Marking Notes</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={s.marking_notes} 
                        onChange={(e) => updateStepValue(s.step_num, "marking_notes", e.target.value)} 
                        placeholder="Expected keywords, alternative equations..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-between pt-4 border-t border-border-secondary">
              <button className="btn btn-lg flex items-center gap-2" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                className="btn btn-brand btn-lg flex items-center gap-2" 
                onClick={confirmRubric} 
                disabled={isCreatingTask}
              >
                {isCreatingTask ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Configuring Task...
                  </>
                ) : (
                  <>
                    Confirm & Proceed
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Bulk Answer Sheet Upload ── */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-[16px] font-medium text-text-primary mb-2">Upload Student Answer Sheets</h3>
            <p className="text-[12px] text-text-tertiary mb-6">
              Drop all student papers (PDF, JPEG) at once. The system will auto-extract text and queue them for evaluation under <strong>{title}</strong>.
            </p>

            {/* Answer files upload dropzone */}
            <div className="relative border border-dashed border-border-secondary rounded-lg min-h-[160px] flex flex-col justify-center items-center p-6 bg-surface-secondary/40 hover:border-brand-500 transition-colors mb-6">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleAnswersDrop} />
              <FileSpreadsheet className="text-brand-500 mb-2" size={40} />
              <div className="text-center">
                <p className="text-[14px] font-medium text-text-secondary">Drag & Drop All Student Answer Sheets</p>
                <p className="text-[11px] text-text-tertiary mt-1">Supports bulk upload up to 100 files simultaneously</p>
              </div>
            </div>

            {/* Files List Table */}
            {answerFiles.length > 0 && (
              <div className="mb-6">
                <div className="flex-between mb-2">
                  <span className="text-[12px] font-medium text-text-secondary">{answerFiles.length} files selected</span>
                  <button className="text-[11px] text-red-500 font-semibold" onClick={() => { setAnswerFiles([]); setCustomStudentIds([]); }}>Clear All</button>
                </div>
                <div className="border border-border-secondary rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Filename</th>
                        <th>Auto-assigned Student ID (Editable)</th>
                        <th>File Size</th>
                        <th className="w-[50px] text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {answerFiles.map((file, idx) => (
                        <tr key={idx}>
                          <td className="text-[12px] max-w-[200px] truncate">{file.name}</td>
                          <td>
                            <input 
                              type="text" 
                              className="input-field py-1 font-mono text-[12px]" 
                              value={customStudentIds[idx] || ""} 
                              onChange={(e) => updateStudentId(idx, e.target.value)} 
                            />
                          </td>
                          <td className="text-[11px] text-text-tertiary">{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                          <td className="text-center">
                            <button className="text-text-tertiary hover:text-red-500 transition-colors" onClick={() => removeAnswerFile(idx)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex-between pt-4 border-t border-border-secondary">
              <button className="btn btn-lg flex items-center gap-2" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                className="btn btn-brand btn-lg flex items-center gap-2" 
                onClick={uploadAndStartGrading} 
                disabled={isUploadingAnswers || answerFiles.length === 0}
              >
                {isUploadingAnswers ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Uploading Answer Sheets...
                  </>
                ) : (
                  <>
                    Upload & Start Evaluating
                    <Play size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Live Grading Progress ── */}
        {step === 4 && (
          <div className="animate-fade-in text-center py-8">
            <Activity className="animate-pulse text-brand-500 mx-auto mb-4" size={48} />
            <h3 className="text-[18px] font-semibold text-text-primary mb-2">Asynchronous Evaluation Queue Active</h3>
            <p className="text-[13px] text-text-tertiary max-w-[450px] mx-auto mb-8">
              All student answer sheets are being transferred to AWS S3 storage. Once completed, the parallel evaluation pipelines (Text, Diagram, Reasoning) will execute synchronously.
            </p>

            {/* Run Progress status */}
            {runStatus ? (
              <div className="max-w-[500px] mx-auto border border-border-secondary rounded-lg p-6 bg-surface-secondary/10 flex flex-col gap-4 text-left">
                <div className="flex-between pb-2 border-b border-border-secondary">
                  <span className="text-[12px] font-semibold uppercase text-text-secondary">Evaluation Run Status</span>
                  <span className={`pill ${runStatus.status === "COMPLETED" ? "pill-success" : "pill-info"}`}>{runStatus.status}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex-between text-[13px]">
                    <span className="text-text-secondary">Total student papers:</span>
                    <span className="font-semibold text-text-primary">{runStatus.total_submissions}</span>
                  </div>
                  <div className="flex-between text-[13px]">
                    <span className="text-text-secondary">Graded successfully:</span>
                    <span className="font-semibold text-green-600">{runStatus.graded_count}</span>
                  </div>
                  <div className="flex-between text-[13px]">
                    <span className="text-text-secondary">Failures/drift flags:</span>
                    <span className="font-semibold text-red-500">{runStatus.failed_count}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-border-secondary h-2 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-brand-500 h-full transition-all duration-500" 
                    style={{ width: `${runStatus.total_submissions > 0 ? (runStatus.graded_count / runStatus.total_submissions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-[13px] text-text-tertiary">Waiting for S3 upload task to trigger evaluations...</p>
                <button className="btn flex items-center gap-2" onClick={startGradingManual}>
                  <Loader2 className="animate-spin" size={14} /> Start Grading Manually
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border-secondary flex justify-center">
              <a href="/dashboard" className="btn btn-brand btn-lg flex items-center gap-2">
                Go to Evaluation Queue Dashboard
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
