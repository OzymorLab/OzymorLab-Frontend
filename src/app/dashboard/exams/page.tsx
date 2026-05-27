"use client";

import { useState, useEffect } from "react";
import { 
  UploadCloud, CheckCircle2, AlertTriangle, FileText, 
  Activity, BrainCircuit, ArrowRight, ArrowLeft, Plus, 
  Trash2, FileSpreadsheet, Loader2, Sparkles, Check, Play,
  Calendar, Layers, ShieldCheck, UserCheck, RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface RubricStep {
  step_num: number;
  description: string;
  marks: number;
  step_type: string;
  component_type: string;
  expected_exprs: string[];
  marking_notes: string;
  partial_credit: boolean;
  diagram_relations: any[];
}

interface ExamCycle {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  status: string;
  task_count: number;
}

export default function ExamsPage() {
  const { user, fetchWithAuth } = useAuth();
  
  // Phase 4: Wizard steps (0: Cycle Selection, 1: Paper Upload, 2: Rubric Edit & State Machine, 3: Bulk Answer Upload, 4: Live Progress)
  const [step, setStep] = useState(0); 

  // Exam Cycles State
  const [cycles, setCycles] = useState<ExamCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  
  // Create Cycle Modal State
  const [newCycleName, setNewCycleName] = useState("");
  const [newCycleStart, setNewCycleStart] = useState("");
  const [newCycleEnd, setNewCycleEnd] = useState("");
  const [isCreatingCycle, setIsCreatingCycle] = useState(false);

  // Form Metadata
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [board, setBoard] = useState("CBSE");
  const [gradeLevel, setGradeLevel] = useState("Class 12");
  const [maxMarks, setMaxMarks] = useState(30);
  const [description, setDescription] = useState("");
  const [paperSet, setPaperSet] = useState("A");

  // Step 1: Question Paper
  const [qpaperFile, setQpaperFile] = useState<File | null>(null);
  const [isProcessingPaper, setIsProcessingPaper] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [questionPaperKey, setQuestionPaperKey] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0.0);

  // Step 2: Rubric Edit & Approval Status
  const [rubricSteps, setRubricSteps] = useState<RubricStep[]>([]);
  const [gradingNotes, setGradingNotes] = useState("");
  const [taskId, setTaskId] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [rubricApprovalStatus, setRubricApprovalStatus] = useState("DRAFT");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Step 3: Bulk Answer Upload
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [customStudentIds, setCustomStudentIds] = useState<string[]>([]);
  const [isUploadingAnswers, setIsUploadingAnswers] = useState(false);

  // Step 4: Live Grading
  const [runId, setRunId] = useState("");
  const [runStatus, setRunStatus] = useState<any>(null);

  // Existing Cycle Tasks State
  const [selectedCycleTasks, setSelectedCycleTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    fetchExamCycles();
  }, []);

  useEffect(() => {
    if (!selectedCycleId) {
      setSelectedCycleTasks([]);
      return;
    }
    fetchCycleTasks(selectedCycleId);
  }, [selectedCycleId]);

  const fetchCycleTasks = async (cycleId: string) => {
    setIsLoadingTasks(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/exam-cycles/${cycleId}`);
      const json = await res.json();
      if (json.data && json.data.tasks) {
        setSelectedCycleTasks(json.data.tasks);
      } else {
        setSelectedCycleTasks([]);
      }
    } catch (e) {
      console.error("Failed to fetch cycle tasks", e);
      setSelectedCycleTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchExamCycles = async () => {
    setIsLoadingCycles(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/exam-cycles`);
      const json = await res.json();
      if (json.data) {
        setCycles(json.data);
        if (json.data.length > 0 && !selectedCycleId) {
          setSelectedCycleId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch exam cycles", e);
    } finally {
      setIsLoadingCycles(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleName.trim()) return;

    setIsCreatingCycle(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/exam-cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCycleName,
          start_date: newCycleStart || null,
          end_date: newCycleEnd || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setCycles([json.data, ...cycles]);
        setSelectedCycleId(json.data.id);
        setNewCycleName("");
        setNewCycleStart("");
        setNewCycleEnd("");
      } else {
        throw new Error(json.detail || "Failed to create exam cycle");
      }
    } catch (e: any) {
      alert(e.message || "An error occurred");
    } finally {
      setIsCreatingCycle(false);
    }
  };

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
      
      setStep(2);
    } catch (e: any) {
      alert(e.message || "An error occurred while processing the question paper.");
    } finally {
      setIsProcessingPaper(false);
    }
  };

  const addRubricStep = () => {
    const nextNum = rubricSteps.length > 0 ? Math.max(...rubricSteps.map(s => s.step_num)) + 1 : 1;
    const newStep: RubricStep = {
      step_num: nextNum,
      description: "New step description",
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

  const removeRubricStep = (num: number) => {
    setRubricSteps(rubricSteps.filter(s => s.step_num !== num));
  };

  const updateStepValue = (num: number, key: keyof RubricStep, value: any) => {
    setRubricSteps(
      rubricSteps.map(s => (s.step_num === num ? { ...s, [key]: value } : s))
    );
  };

  // Confirm Rubric & Create Task in DRAFT
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
      exam_cycle_id: selectedCycleId,
      paper_set: paperSet,
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
      setRubricApprovalStatus("DRAFT"); // Default state when confirmed
    } catch (e: any) {
      alert(e.message || "Failed to create task & rubric");
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Submit for approval (Teacher workflow)
  const submitForApproval = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/question-papers/${taskId}/rubric/submit-for-approval`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setRubricApprovalStatus(json.data.approval_status);
        alert("Rubric submitted for HOD review successfully!");
      } else {
        throw new Error(json.detail || "Submission failed");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Direct approval (HOD/Principal workflow)
  const approveRubric = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/question-papers/${taskId}/rubric/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setRubricApprovalStatus(json.data.approval_status);
        alert("Rubric APPROVED. Evaluation unlocked!");
      } else {
        throw new Error(json.detail || "Approval failed");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

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

  const updateStudentId = (idx: number, id: string) => {
    setCustomStudentIds(prev => prev.map((item, i) => (i === idx ? id : item)));
  };

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
      const uploadRes = await fetchWithAuth(`${API_BASE}/submissions/bulk`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.detail || "Answer sheet bulk upload failed");
      }

      const gradePayload = {
        task_id: taskId,
        description: `Bulk evaluation run for ${title}`,
        temperature: 0.0,
      };

      setStep(4);
      
      // Initiate grading (requires APPROVED rubric status)
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
          } else if (json.detail) {
            alert(json.detail);
          }
        } catch (e: any) {
          console.log("Evaluation scheduling deferred.");
        }
      }, 2000);

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
      if (!res.ok) throw new Error(json.detail || "Grading failed to start. Submissions might still be parsing or rubric is not approved.");
      if (json.data && json.data.run_id) {
        setRunId(json.data.run_id);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in relative z-10">
      {/* Title Area */}
      <div className="flex flex-col gap-2.5 pb-4 mt-2">
        <div className="live-status-badge flex items-center gap-2.5 text-[11px] font-mono font-bold uppercase bg-[#e0ff82]/10 px-4 py-1.5 rounded-full w-max border border-[#e0ff82] shadow-sm shadow-[#e0ff82]/10">
          <span className="live-status-dot w-1.5 h-1.5 rounded-full animate-pulse" />
          Live Assessment Engine Active
        </div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)] mt-1.5 tracking-tight">Institutional Exam & Assessment Engine</h1>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          Group subject papers under institutional exam cycles, configure math/diagram rubrics, and run bulk graded evaluations.
        </p>
      </div>

      {/* Steps Indicator */}
      {step > 0 && (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm flex justify-between items-center gap-4">
          {[
            { num: 1, label: "Question Paper" },
            { num: 2, label: "Rubric & Approvals" },
            { num: 3, label: "Bulk answer sheets" },
            { num: 4, label: "Live evaluation queue" }
          ].map((s) => (
            <div key={s.num} className="flex-1 flex items-center gap-3 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all duration-300 ${
                step === s.num 
                  ? "bg-[#e0ff82] border-[#e0ff82] text-[#1f2223] shadow-md shadow-[#e0ff82]/10" 
                  : step > s.num 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" 
                    : "bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-tertiary)]"
              }`}>
                {step > s.num ? <Check size={14} className="stroke-[3]" /> : s.num}
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                  step === s.num ? "text-[#e0ff82]" : step > s.num ? "text-emerald-600" : "text-[var(--text-tertiary)]"
                }`}>Step 0{s.num}</span>
                <span className={`text-[12.5px] font-medium leading-none mt-0.5 ${
                  step === s.num ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)]"
                }`}>{s.label}</span>
              </div>
              {s.num < 4 && (
                <div className={`hidden md:block flex-1 h-[2px] mx-4 transition-all duration-300 ${
                  step > s.num ? "bg-emerald-500/30" : "bg-[var(--border-subtle)]"
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wizard Body */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cycle Selection Panel (Card 1) */}
          <div className="lg:col-span-2 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col" style={{ padding: "32px", gap: "24px" }}>
            <h3 className="text-[15.5px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#e0ff82]/20 text-[#2c302e] dark:text-[#e0ff82] flex items-center justify-center">
                <Layers size={14} />
              </div>
              Select Institutional Exam Cycle
            </h3>
            <p className="text-[12.5px] text-[var(--text-secondary)] -mt-2 leading-relaxed">
              Choose an active exam cycle to upload and decompose a new subject paper.
            </p>

              {isLoadingCycles ? (
                <div className="py-16 text-center text-[var(--text-secondary)]">
                  <Loader2 className="animate-spin mx-auto mb-3 text-[#e0ff82]" size={26} />
                  <span className="text-[12.5px] font-medium">Fetching exam cycles...</span>
                </div>
              ) : cycles.length === 0 ? (
                <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--surface-secondary)] transition-all duration-300 hover:border-[#e0ff82]/30 flex flex-col items-start text-left relative overflow-hidden" style={{ padding: "32px", gap: "20px", width: "100%" }}>
                  <div className="flex gap-4 items-start">
                    <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)]" />
                      <div className="absolute inset-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)]" />
                      <div className="relative w-6 h-6 rounded bg-[#e0ff82] text-[#1f2223] flex items-center justify-center shadow-sm">
                        <Layers size={13} className="animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[var(--text-primary)] mb-1">No Active Exam Cycles Found</h4>
                      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
                        Create a new cycle using the form on the right, or get started instantly with our pre-configured demo setup.
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const nextMonth = new Date();
                      nextMonth.setMonth(today.getMonth() + 1);
                      const formatDate = (d: Date) => {
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        return `${yyyy}-${mm}-${dd}`;
                      };
                      setNewCycleName("Mid-Term Oct 2026");
                      setNewCycleStart(formatDate(today));
                      setNewCycleEnd(formatDate(nextMonth));
                    }}
                    className="btn-lp-accent cursor-pointer active:scale-[0.98] transition-transform duration-200 border-0 self-end mt-2"
                  >
                    <Sparkles size={13} />
                    Quick Demo Setup
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cycles.map((c) => (
                    <div 
                      key={c.id} 
                      className={`border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
                        selectedCycleId === c.id 
                          ? "border-[#e0ff82] border-l-4 bg-[var(--surface-secondary)] shadow-sm shadow-[#e0ff82]/5" 
                          : "border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)]"
                      }`}
                      onClick={() => setSelectedCycleId(c.id)}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[13.5px] font-bold text-[var(--text-primary)] line-clamp-1">{c.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          c.status === "ACTIVE" 
                            ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]/20" 
                            : "bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)]/20"
                        }`}>{c.status}</span>
                      </div>
                      <div className="text-[11.5px] text-[var(--text-secondary)] flex items-center gap-1.5 mb-3">
                        <Calendar size={12} className="text-[var(--text-tertiary)]" />
                        <span>
                          {c.start_date ? new Date(c.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "TBD"}
                        </span>
                        <span className="text-[var(--text-tertiary)]">•</span>
                        <span>
                          {c.end_date ? new Date(c.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "TBD"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2.5 mt-2.5 text-[11px] text-[var(--text-secondary)] font-medium">
                        <Layers size={11} className="text-[#e0ff82]" />
                        <span>
                          <strong className="text-[var(--text-primary)] font-bold">{c.task_count}</strong> subject papers linked
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCycleId && (
                <div className="mt-6 border-t border-[var(--border-subtle)] pt-6">
                  <h4 className="text-[13.5px] font-bold text-[var(--text-primary)] mb-3.5 flex items-center gap-2">
                    <FileText size={14} className="text-[#e0ff82]" />
                    Existing Subject Papers in this Cycle:
                  </h4>
                  {isLoadingTasks ? (
                    <div className="py-6 text-center text-[var(--text-secondary)]">
                      <Loader2 className="animate-spin inline-block mr-2 text-[#e0ff82]" size={18} />
                      <span className="text-[12px] font-medium">Loading papers...</span>
                    </div>
                  ) : selectedCycleTasks.length === 0 ? (
                    <p className="text-[12px] text-[var(--text-tertiary)] italic bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-center">No subject papers created yet in this cycle. Select & proceed below to upload one.</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {selectedCycleTasks.map((t) => (
                        <div key={t.id} className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--surface-secondary)]/30 flex justify-between items-center hover:border-[var(--brand-600)]/20 hover:bg-[var(--surface-secondary)] transition-all duration-300">
                          <div>
                            <div className="text-[13px] font-bold text-[var(--text-primary)]">{t.title}</div>
                            <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>Subject: <strong className="text-[var(--text-primary)] font-semibold">{t.subject}</strong></span>
                              <span className="text-[var(--text-tertiary)]">•</span>
                              <span>Grade: <strong className="text-[var(--text-primary)] font-semibold">{t.grade_level}</strong></span>
                              <span className="text-[var(--text-tertiary)]">•</span>
                              <span>Set: <strong className="text-[var(--text-primary)] font-semibold">{t.paper_set}</strong></span>
                              <span className="text-[var(--text-tertiary)]">•</span>
                              <span>Max Marks: <strong className="text-[var(--text-primary)] font-semibold">{t.max_marks}</strong></span>
                            </div>
                          </div>
                          <button
                            className="btn-lp-accent cursor-pointer active:scale-[0.98] transition-transform duration-200 border-0"
                            onClick={() => {
                              setTaskId(t.id);
                              setTitle(t.title);
                              setSubject(t.subject);
                              setBoard(t.board);
                              setGradeLevel(t.grade_level);
                              setMaxMarks(t.max_marks);
                              setPaperSet(t.paper_set);
                              setStep(3); // Go straight to bulk answer sheets upload!
                            }}
                          >
                            <UploadCloud size={14} />
                            Upload Answers
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {cycles.length > 0 && (
                <div className="flex justify-end pt-5 border-t border-[var(--border-subtle)] mt-6">
                  <button 
                    className="btn-lp-accent cursor-pointer active:scale-[0.98] transition-transform duration-200 border-0"
                    onClick={() => {
                      const cycle = cycles.find(c => c.id === selectedCycleId);
                      if (cycle) {
                        setTitle(`${cycle.name} - Physics Paper`);
                      }
                      setStep(1);
                    }}
                  >
                    Create New Subject Paper & Rubric
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Create Cycle Panel (Card 2) */}
            <div className="lg:col-span-1 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col" style={{ padding: "32px", gap: "24px" }}>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#e0ff82]/20 text-[#2c302e] dark:text-[#e0ff82] flex items-center justify-center">
                  <Plus size={14} />
                </div>
                Create New Exam Cycle
              </h3>

              <form onSubmit={handleCreateCycle} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Cycle Title</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] flex items-center pointer-events-none">
                      <Layers size={15} />
                    </div>
                    <input 
                      type="text" 
                      className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-primary)] focus:ring-[3px] focus:ring-[var(--border-subtle)] focus:bg-[var(--surface-primary)] shadow-sm w-full font-medium transition-all duration-200"
                      style={{ paddingLeft: "42px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", fontSize: "14px" }}
                      placeholder="e.g. Mid-Term Oct 2026"
                      value={newCycleName}
                      onChange={(e) => setNewCycleName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Start Date</label>
                  <input 
                    type="date" 
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] focus:ring-[3px] focus:ring-[var(--border-subtle)] focus:bg-[var(--surface-primary)] shadow-sm w-full font-medium transition-all duration-200"
                    style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", fontSize: "14px" }}
                    value={newCycleStart}
                    onChange={(e) => setNewCycleStart(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">End Date</label>
                  <input 
                    type="date" 
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] focus:ring-[3px] focus:ring-[var(--border-subtle)] focus:bg-[var(--surface-primary)] shadow-sm w-full font-medium transition-all duration-200"
                    style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", fontSize: "14px" }}
                    value={newCycleEnd}
                    onChange={(e) => setNewCycleEnd(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-lp-accent cursor-pointer active:scale-[0.98] transition-transform duration-200 border-0 w-max self-end mt-3"
                  disabled={isCreatingCycle}
                >
                  {isCreatingCycle ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Exam Cycle
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {step > 0 && (
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm" style={{ padding: "32px" }}>
            {/* ── Step 1: Upload Question Paper ── */}
            {step === 1 && (
              <div className="animate-fade-in flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col gap-4">
                <h3 className="text-[14.5px] font-bold text-[var(--text-primary)]">Exam Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Subject Paper Title</label>
                    <input type="text" className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics Grade 12" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Subject</label>
                    <select className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" value={subject} onChange={(e) => setSubject(e.target.value)}>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Paper Set</label>
                    <select className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" value={paperSet} onChange={(e) => setPaperSet(e.target.value)}>
                      <option value="A">Set A</option>
                      <option value="B">Set B</option>
                      <option value="C">Set C</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Board</label>
                    <select className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" value={board} onChange={(e) => setBoard(e.target.value)}>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Grade Level</label>
                    <input type="text" className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Max Marks</label>
                    <input type="number" className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium font-mono" value={isNaN(maxMarks) ? "" : maxMarks} onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMaxMarks(isNaN(val) ? 0 : val);
                    }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Exam Description</label>
                  <textarea className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional exam description, sections details..." />
                </div>
              </div>

              {/* Question Paper File Dropzone */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[14.5px] font-bold text-[var(--text-primary)]">Question Paper PDF</h3>
                <div className="relative flex-1 min-h-[180px] border border-dashed border-[var(--border-subtle)] rounded-2xl flex flex-col justify-center items-center p-6 hover:border-brand-500/50 transition-colors cursor-pointer bg-[var(--surface-secondary)] bg-opacity-50">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePaperUpload} />
                  <UploadCloud className="text-brand-500 mb-3" size={40} />
                  {qpaperFile ? (
                    <div className="text-center">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)] max-w-[200px] truncate">{qpaperFile.name}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5">{(qpaperFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-[13px] font-bold text-[var(--text-secondary)]">Click or drag Question Paper</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Supports PDF, High-res JPG, PNG</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-[var(--border-subtle)] mt-6">
              <button className="btn-lp-outline cursor-pointer" onClick={() => setStep(0)}>
                <ArrowLeft size={14} /> Change Cycle
              </button>
              <button 
                className="btn-lp-accent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={processQuestionPaper} 
                disabled={isProcessingPaper || !qpaperFile}
              >
                {isProcessingPaper ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    AI Decomposing Paper...
                  </>
                ) : (
                  <>
                    Decompose with Gemini
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Edit Rubric + Approvals ── */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-6">
            {/* Top info and Approval Status panel */}
            <div className="flex flex-col gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Gemini-Generated Rubric Structure</h3>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1 flex items-center gap-2 font-medium">
                    <BrainCircuit className="text-brand-500" size={14} />
                    AI confidence: <strong className="text-brand-600 font-mono">{(aiConfidence * 100).toFixed(0)}%</strong> • Verify marks allocation before proceeding.
                  </p>
                </div>
                
                {/* Approval Status Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium text-[var(--text-secondary)]">Approval Status:</span>
                  <span className={`text-[11px] font-bold py-1 px-3 rounded-full ${
                    rubricApprovalStatus === "APPROVED" 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : rubricApprovalStatus === "PENDING_APPROVAL" 
                        ? "bg-amber-500/10 text-amber-600" 
                        : "bg-red-500/10 text-red-600"
                  }`}>
                    {rubricApprovalStatus}
                  </span>
                  
                  {/* Action buttons inside the wizard */}
                  {!taskId ? (
                    <button className="btn-lp-accent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" onClick={confirmRubric} disabled={isCreatingTask}>
                      {isCreatingTask ? <Loader2 className="animate-spin" size={12} /> : "Save Rubric Schema"}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      {rubricApprovalStatus === "DRAFT" && (
                        <button className="btn-lp-accent border-0 cursor-pointer flex items-center gap-1.5" onClick={submitForApproval}>
                          <ShieldCheck size={14} />
                          Submit for HOD Approval
                        </button>
                      )}
                      {rubricApprovalStatus === "PENDING_APPROVAL" && (
                        <button className="btn-lp-accent border-0 cursor-pointer flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={approveRubric}>
                          <UserCheck size={14} />
                          Approve Rubric
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rubric General Grading Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">General Grading Guidelines</label>
              <textarea 
                className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-mono min-h-[60px]" 
                value={gradingNotes} 
                onChange={(e) => setGradingNotes(e.target.value)} 
                placeholder="Board-level instructions for evaluators..."
              />
            </div>

            {/* Steps List */}
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
              {rubricSteps.map((s, idx) => (
                <div key={s.step_num} className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--surface-secondary)]/30 hover:border-brand-500/20 transition-all duration-200 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-brand-600 bg-brand-500/10 px-2.5 py-1 rounded-lg">
                      Step {s.step_num}
                    </span>
                    <button className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors cursor-pointer" onClick={() => removeRubricStep(s.step_num)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Question / Task Description</label>
                      <input 
                        type="text" 
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" 
                        value={s.description} 
                        onChange={(e) => updateStepValue(s.step_num, "description", e.target.value)} 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Component Type</label>
                      <select 
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" 
                        value={s.component_type} 
                        onChange={(e) => updateStepValue(s.step_num, "component_type", e.target.value)}
                      >
                        <option value="text">Text (General)</option>
                        <option value="reasoning">Reasoning (SymPy)</option>
                        <option value="diagram">Diagram (DEIS)</option>
                        <option value="labels">Labels (DEIS)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Marks Allocated</label>
                      <input 
                        type="number" 
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-mono" 
                        value={isNaN(s.marks) ? "" : s.marks} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateStepValue(s.step_num, "marks", isNaN(val) ? 0 : val);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">SymPy Formula Expectation</label>
                      <input 
                        type="text" 
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-mono" 
                        value={s.expected_exprs.join(", ")} 
                        onChange={(e) => updateStepValue(s.step_num, "expected_exprs", e.target.value.split(",").map(t => t.trim()))} 
                        placeholder="e.g. F = k * q1 * q2 / r**2"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] font-bold font-mono text-[var(--text-secondary)] uppercase">Specific Step Marking Notes</label>
                      <input 
                        type="text" 
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm w-full font-medium" 
                        value={s.marking_notes} 
                        onChange={(e) => updateStepValue(s.step_num, "marking_notes", e.target.value)} 
                        placeholder="Expected keywords, alternative equations..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-5 border-t border-[var(--border-subtle)] mt-6">
              <button className="btn-lp-outline cursor-pointer" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Back
              </button>
              
              <button 
                className="btn-lp-accent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => setStep(3)}
                disabled={rubricApprovalStatus !== "APPROVED"}
                title={rubricApprovalStatus !== "APPROVED" ? "HOD/Principal must approve the rubric before evaluations can begin." : ""}
              >
                Proceed to Bulk Evaluation
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Bulk Answer Sheet Upload ── */}
        {step === 3 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div>
              <h3 className="text-[14.5px] font-bold text-[var(--text-primary)] mb-1">Upload Student Answer Sheets</h3>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Drop all student papers (PDF, JPEG) at once. The system will auto-extract text and queue them for evaluation under <strong>{title}</strong>.
              </p>
            </div>

            {/* Answer files upload dropzone */}
            <div className="relative border border-dashed border-[var(--border-subtle)] rounded-2xl min-h-[160px] flex flex-col justify-center items-center p-6 bg-[var(--surface-secondary)] bg-opacity-50 hover:border-brand-500/50 transition-colors cursor-pointer">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleAnswersDrop} />
              <FileSpreadsheet className="text-brand-500 mb-3 animate-bounce" size={40} />
              <div className="text-center">
                <p className="text-[13.5px] font-bold text-[var(--text-secondary)]">Drag & Drop All Student Answer Sheets</p>
                <p className="text-[11.5px] text-[var(--text-tertiary)] mt-0.5">Supports bulk upload up to 100 files simultaneously</p>
              </div>
            </div>

            {/* Files List Table */}
            {answerFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)] font-mono">{answerFiles.length} files selected</span>
                  <button className="text-[11px] text-red-500 font-bold hover:underline cursor-pointer" onClick={() => { setAnswerFiles([]); setCustomStudentIds([]); }}>Clear All</button>
                </div>
                <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto bg-[var(--surface-primary)]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)]">
                        <th className="px-4 py-3 text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Filename</th>
                        <th className="px-4 py-3 text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Auto-assigned Student ID</th>
                        <th className="px-4 py-3 text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">File Size</th>
                        <th className="px-4 py-3 text-[11.5px] font-bold text-[var(--text-secondary)] uppercase text-center w-[80px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {answerFiles.map((file, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="px-4 py-2.5 text-[12.5px] max-w-[200px] truncate text-[var(--text-primary)] font-medium">{file.name}</td>
                          <td className="px-4 py-2.5">
                            <input 
                              type="text" 
                              className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1 text-[12px] text-[var(--text-primary)] font-mono focus:outline-none focus:border-brand-500 shadow-sm w-full font-bold" 
                              value={customStudentIds[idx] || ""} 
                              onChange={(e) => updateStudentId(idx, e.target.value)} 
                            />
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-[var(--text-tertiary)] font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                          <td className="px-4 py-2.5 text-center">
                            <button className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors cursor-pointer" onClick={() => removeAnswerFile(idx)}>
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

            <div className="flex justify-between pt-5 border-t border-[var(--border-subtle)] mt-6">
              <button className="btn-lp-outline cursor-pointer" onClick={() => setStep(2)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button 
                className="btn-lp-accent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={uploadAndStartGrading} 
                disabled={isUploadingAnswers || answerFiles.length === 0}
              >
                {isUploadingAnswers ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Uploading Answer Sheets...
                  </>
                ) : (
                  <>
                    Upload & Start Evaluating
                    <Play size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Live Grading Progress ── */}
        {step === 4 && (
          <div className="animate-fade-in text-center py-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-4 border border-brand-500/20 shadow-lg shadow-brand-500/5">
              <Activity className="animate-pulse" size={32} />
            </div>
            <h3 className="text-[16.5px] font-bold text-[var(--text-primary)] mb-1">Asynchronous Evaluation Queue Active</h3>
            <p className="text-[12.5px] text-[var(--text-secondary)] max-w-[450px] mb-8">
              All student answer sheets are being transferred to Supabase Storage. Once completed, the parallel evaluation pipelines will execute synchronously.
            </p>

            {runStatus ? (
              <div className="w-full max-w-[500px] border border-[var(--border-subtle)] rounded-2xl p-6 bg-[var(--surface-secondary)]/30 backdrop-blur-sm flex flex-col gap-4 text-left shadow-md">
                <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[11.5px] font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)]">Evaluation Run Status</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    runStatus.status === "COMPLETED" 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-brand-500/10 text-brand-600"
                  }`}>{runStatus.status}</span>
                </div>
                
                <div className="flex flex-col gap-2.5 text-[13px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)] font-medium">Total student papers:</span>
                    <span className="font-bold text-[var(--text-primary)] font-mono">{runStatus.total_submissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)] font-medium">Graded successfully:</span>
                    <span className="font-bold text-emerald-600 font-mono">{runStatus.graded_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)] font-medium">Failures/drift flags:</span>
                    <span className="font-bold text-red-500 font-mono">{runStatus.failed_count}</span>
                  </div>
                </div>

                <div className="w-full bg-[var(--surface-secondary)] h-2 rounded-full overflow-hidden mt-2 border border-[var(--border-subtle)]">
                  <div 
                    className="bg-brand-500 h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${runStatus.total_submissions > 0 ? (runStatus.graded_count / runStatus.total_submissions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-[12.5px] text-[var(--text-tertiary)]">Waiting for upload task to trigger evaluations...</p>
                <button className="btn-lp-outline cursor-pointer" onClick={startGradingManual}>
                  <Loader2 className="animate-spin" size={13} /> Start Grading Manually
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] w-full flex justify-center">
              <a href="/dashboard" className="btn-lp-accent border-0 cursor-pointer">
                Go to Evaluation Queue Dashboard
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  );
}
