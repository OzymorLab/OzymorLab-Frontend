"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Home, BookOpen, Users, BarChart3, ShieldCheck, GraduationCap, 
  Settings, LogOut, Search, Bell, Sparkles, AlertTriangle, 
  CheckCircle2, ChevronRight, MessageSquare, Send, RefreshCw, 
  ArrowLeftRight, HelpCircle, Check, X, ShieldAlert, FileText,
  User, Play, Award, HelpCircle as QuestionIcon, Upload, Loader2, Plus
} from "lucide-react";
import Link from "next/link";
import { useAuth, AuthProvider } from "../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface Step {
  stepNum: number;
  type: string;
  text: string;
  latex: string;
  sympyValid: boolean | null;
  justification: string;
  marks: number;
  maxMarks: number;
  errorType: string | null;
  boundingBox?: { x: number; y: number; w: number; h: number };
}

interface Submission {
  id: string;
  studentName: string;
  avatar: string;
  score: number;
  maxScore: number;
  flagColor: string;
  errorType?: string;
  submissionTime: string;
  steps?: Step[];
}

interface Task {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  avgClassScore: number;
  avgLatency: string;
  confidence: number;
  maxMarks: number;
  questionText?: string;
}

interface PracticeAttempt {
  id: string;
  title: string;
  date: string;
  rubricName: string;
  score: number;
  maxScore: number;
  steps: Step[];
  ocrText?: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  alignedStep?: number;
  alignedReason?: string;
}

function AnalysisHUDPageContent() {
  const { user, fetchWithAuth } = useAuth();

  // Mode & Core Data
  const [viewMode, setViewMode] = useState<"teacher" | "student" | "self-eval">("teacher");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roster, setRoster] = useState<Submission[]>([]);
  const [submissionDetail, setSubmissionDetail] = useState<Submission | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeAttempt[]>([]);
  
  // Selection States
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>("");
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  
  // Practice Creation States
  const [isCreatingPractice, setIsCreatingPractice] = useState<boolean>(false);
  const [practiceRubric, setPracticeRubric] = useState<string>("");
  const [customRubricText, setCustomRubricText] = useState<string>("");
  const [practiceFile, setPracticeFile] = useState<File | null>(null);
  const [isGradingPractice, setIsGradingPractice] = useState<boolean>(false);
  const [practiceError, setPracticeError] = useState<string>("");
  
  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Loading States
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPractices, setIsLoadingPractices] = useState(false);
  const [error, setError] = useState<string>("");

  // Refs
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Set view mode based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "student") {
        setViewMode("student");
      } else if (user.role === "admin" || user.role === "teacher") {
        setViewMode("teacher");
      }
    }
  }, [user]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // ==========================================
  // DATA FETCHING FUNCTIONS
  // ==========================================

  // Fetch available tasks/questions
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      setError("");
      const res = await fetchWithAuth(`${API_BASE}/analysis/tasks`);
      const json = await res.json();
      
      if (json.data && json.data.length > 0) {
        setTasks(json.data);
        
        // Check URL params for initial selection
        const params = new URLSearchParams(window.location.search);
        let qTaskId = params.get("task_id");
        const qSubId = params.get("submission_id");
        
        if (qSubId && !qTaskId) {
          try {
            const subRes = await fetchWithAuth(`${API_BASE}/submissions/${qSubId}`);
            const subJson = await subRes.json();
            if (subJson.data && subJson.data.task_id) {
              qTaskId = subJson.data.task_id;
            }
          } catch (err) {
            console.error("Failed to resolve task_id for submission", err);
          }
        }
        
        const initialTaskId = qTaskId && json.data.some((t: Task) => t.id === qTaskId) 
          ? qTaskId 
          : json.data[0].id;
        
        setSelectedQuestionId(initialTaskId);
        
        if (qSubId) {
          setSelectedStudentId(qSubId);
        }
      } else {
        setError("No tasks available");
      }
    } catch (e) {
      console.error("Failed to load tasks", e);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [fetchWithAuth]);

  // Fetch roster/submissions for selected question
  const fetchRoster = useCallback(async (taskId: string) => {
    if (!taskId) return;
    
    try {
      setIsLoadingRoster(true);
      setSubmissionDetail(null);
      
      const res = await fetchWithAuth(`${API_BASE}/analysis/submissions?task_id=${taskId}`);
      const json = await res.json();
      
      if (json.data && json.data.length > 0) {
        setRoster(json.data);
        
        // Check URL params or select first submission
        const params = new URLSearchParams(window.location.search);
        const qSubId = params.get("submission_id");
        
        const initialSubId = qSubId && json.data.some((r: Submission) => r.id === qSubId)
          ? qSubId
          : json.data[0].id;
        
        setSelectedStudentId(initialSubId);
      } else {
        setRoster([]);
        setSelectedStudentId("");
        setSubmissionDetail(null);
      }
    } catch (e) {
      console.error("Failed to load roster", e);
      setRoster([]);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [fetchWithAuth]);

  // Fetch submission details
  const fetchSubmissionDetail = useCallback(async (submissionId: string) => {
    if (!submissionId) return;
    
    try {
      setIsLoadingDetail(true);
      
      const res = await fetchWithAuth(`${API_BASE}/analysis/submissions/${submissionId}`);
      const json = await res.json();
      
      if (json.data) {
        setSubmissionDetail(json.data);
        
        // Initialize chat with welcome message
        setChatMessages([{
          sender: "ai",
          text: "Welcome to the Edexia AIOS Question Copilot! Ask me anything about the OCR digitizations, SymPy algebraic validations, or rubric justifications on this question."
        }]);
      }
    } catch (e) {
      console.error("Failed to load submission details", e);
      setSubmissionDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [fetchWithAuth]);

  // Fetch practice history
  const fetchPractices = useCallback(async () => {
    try {
      setIsLoadingPractices(true);
      
      const res = await fetchWithAuth(`${API_BASE}/analysis/practices`);
      const json = await res.json();
      
      if (json.data && json.data.length > 0) {
        setPracticeHistory(json.data);
        setSelectedPracticeId(json.data[0].id);
      }
    } catch (e) {
      console.error("Failed to load practice history", e);
      // Practice history is optional, don't show error
    } finally {
      setIsLoadingPractices(false);
    }
  }, [fetchWithAuth]);

  // ==========================================
  // INITIAL DATA LOADING
  // ==========================================
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (selectedQuestionId) {
      fetchRoster(selectedQuestionId);
    }
  }, [selectedQuestionId, fetchRoster]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchSubmissionDetail(selectedStudentId);
    }
  }, [selectedStudentId, fetchSubmissionDetail]);

  useEffect(() => {
    if (viewMode === "self-eval") {
      fetchPractices();
    }
  }, [viewMode, fetchPractices]);

  // ==========================================
  // DERIVED DATA
  // ==========================================
  
  const activePractice = practiceHistory.find(p => p.id === selectedPracticeId) || null;
  
  const activeQuestion: Task = viewMode === "self-eval" && activePractice
    ? {
        id: activePractice.id,
        title: activePractice.title,
        topic: "Self Evaluation",
        difficulty: "Self-Guided",
        avgClassScore: 0,
        avgLatency: "0.8s",
        confidence: 100,
        maxMarks: activePractice.maxScore,
        questionText: activePractice.ocrText || "Private Self Evaluation Workspace"
      }
    : tasks.find(t => t.id === selectedQuestionId) || {
        id: "",
        title: "Loading...",
        topic: "",
        difficulty: "",
        avgClassScore: 0,
        avgLatency: "",
        confidence: 0,
        maxMarks: 0,
        questionText: ""
      };
  
  const activeStudent = viewMode === "self-eval" && activePractice
    ? {
        id: activePractice.id,
        studentName: "Self Practice",
        avatar: "🎒",
        score: activePractice.score,
        maxScore: activePractice.maxScore,
        flagColor: "white",
        submissionTime: activePractice.date
      }
    : roster.find(r => r.id === selectedStudentId) || submissionDetail || {
        id: "",
        studentName: "Loading...",
        avatar: "?",
        score: 0,
        maxScore: 0,
        flagColor: "white",
        submissionTime: "N/A"
      };
  
  const activeSteps: Step[] = viewMode === "self-eval" && activePractice
    ? activePractice.steps
    : submissionDetail?.steps || [];

  // ==========================================
  // ACTIONS
  // ==========================================

  // Adjust marks (teacher mode)
  const adjustTotalMarks = async (amt: number) => {
    if (!selectedStudentId || viewMode !== "teacher") return;
    
    try {
      await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt })
      });
      
      // Refresh data
      await fetchSubmissionDetail(selectedStudentId);
      await fetchRoster(selectedQuestionId);
    } catch (e) {
      console.error("Failed to override marks", e);
    }
  };

  // Create practice attempt
  const handleRunPracticeGrading = async () => {
    if (!practiceFile || !practiceRubric) {
      setPracticeError("Please select a rubric and upload a file");
      return;
    }

    setIsGradingPractice(true);
    setPracticeError("");

    try {
      const formData = new FormData();
      formData.append("file", practiceFile);
      formData.append("rubric", practiceRubric === "Custom Rubric (Paste text below)" ? customRubricText : practiceRubric);

      const res = await fetchWithAuth(`${API_BASE}/analysis/practices/grade`, {
        method: "POST",
        body: formData,
      });
      
      const json = await res.json();
      
      if (json.data) {
        // Refresh practice history
        await fetchPractices();
        setIsCreatingPractice(false);
        setPracticeFile(null);
        setCustomRubricText("");
      } else {
        setPracticeError(json.message || "Grading failed. Please try again.");
      }
    } catch (e) {
      console.error("Failed to grade practice", e);
      setPracticeError("Failed to grade practice. Please try again.");
    } finally {
      setIsGradingPractice(false);
    }
  };

  // Send chat message
  const handleSendChat = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedStudentId) return;

    // Append user message
    const userMessage: ChatMessage = { sender: "user", text: textToSend };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });
      const json = await res.json();
      
      if (json.data) {
        const { text, alignedStep, alignedReason } = json.data;
        
        const aiMessage: ChatMessage = {
          sender: "ai",
          text: text,
          alignedStep: alignedStep || undefined,
          alignedReason: alignedReason || undefined
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Handle step highlighting
        if (alignedStep) {
          setHighlightedStep(alignedStep);
          
          setTimeout(() => {
            const stepElement = document.getElementById(`step-card-${alignedStep}`);
            if (stepElement && rightPaneRef.current) {
              const container = rightPaneRef.current;
              const topPos = stepElement.offsetTop - container.offsetTop - 16;
              container.scrollTo({ top: topPos, behavior: "smooth" });
            }
          }, 150);
        }
      }
    } catch (e) {
      console.error("Chat API failed", e);
      
      const errorMessage: ChatMessage = {
        sender: "ai",
        text: "I experienced a minor latency lapse communicating with the analysis engine. Please try re-submitting your query."
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // View mode switching with data refresh
  const switchViewMode = useCallback((mode: "teacher" | "student" | "self-eval") => {
    setViewMode(mode);
    setHighlightedStep(null);
    setIsCreatingPractice(false);
    setChatMessages([]);
    
    if (mode === "self-eval") {
      fetchPractices();
    } else if (mode === "teacher" || mode === "student") {
      if (tasks.length === 0) {
        fetchTasks();
      }
    }
  }, [tasks.length, fetchTasks, fetchPractices]);

  // ==========================================
  // NAVIGATION TABS
  // ==========================================
  
  const teacherTabs: Array<{ name: string; href: string; active?: boolean }> = [
    { name: "Home", href: "/dashboard" },
    { name: "Exams", href: "/dashboard/exams" },
    { name: "Reports", href: "/dashboard/reports" },
    { name: "Reviews", href: "/dashboard/reviews" },
    { name: "Students", href: "/dashboard/students" },
    { name: "Submissions", href: "/dashboard/submissions", active: true }
  ];

  const studentTabs: Array<{ name: string; href: string; active?: boolean }> = [
    { name: "Home", href: "/dashboard" },
    { name: "Submissions", href: "/dashboard/submissions" },
    { name: "Review", href: "/dashboard/reviews" },
    { name: "Reports", href: "/dashboard/reports" },
    { name: "Analysis", href: "#", active: true }
  ];

  const activeNavTabs = viewMode === "teacher" ? teacherTabs : studentTabs;

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================
  
  if (isLoadingTasks && viewMode !== "self-eval") {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center" style={{ background: "#f0f0f0" }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} style={{ color: "#4caf50" }} />
          <p className="text-sm text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error && viewMode !== "self-eval") {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center" style={{ background: "#f0f0f0" }}>
        <div className="text-center max-w-md p-8 rounded-lg border bg-white" style={{ borderColor: "#ef9a9a" }}>
          <AlertTriangle size={32} className="mx-auto mb-4" style={{ color: "#c62828" }} />
          <p className="text-sm text-gray-800 mb-4">{error}</p>
          <button 
            onClick={fetchTasks}
            className="px-4 py-2 rounded text-white text-sm"
            style={{ background: "#4caf50" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-sans" style={{ background: "var(--surface-page)" }}>
      
      <div className="flex-1 w-full flex flex-col" style={{ background: "var(--surface-page)" }}>
        
        {/* ==========================================
            1. TOP NAVIGATION (Premium Dark Themed Header)
           ========================================== */}
        <header className="h-16 px-6 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-80 gap-4">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
              Oz
            </div>
            <span className="hidden sm:inline text-[15px] font-bold text-[var(--text-primary)] tracking-tight">OzymorLab</span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 flex-1">
            {activeNavTabs.map((tab, idx) => (
              <Link
                key={idx}
                href={tab.href}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                  tab.active 
                    ? "bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-brand-600 shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 ml-auto">
            {user?.role === "student" ? (
              <>
                <button
                  onClick={() => switchViewMode("student")}
                  className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    viewMode === "student"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Evaluations
                </button>
                <button
                  onClick={() => switchViewMode("self-eval")}
                  className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    viewMode === "self-eval"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Self-Eval
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => switchViewMode("teacher")}
                  className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    viewMode === "teacher"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Teacher
                </button>
                <button
                  onClick={() => switchViewMode("student")}
                  className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    viewMode === "student"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => switchViewMode("self-eval")}
                  className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    viewMode === "self-eval"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Sandbox
                </button>
              </>
            )}
            
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="h-8 px-3.5 rounded-xl text-[11px] font-bold bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer ml-1"
            >
              Log-Out
            </button>
          </div>
        </header>

        {/* ==========================================
            2. QUESTION BAR
           ========================================== */}
        <section className="px-6 py-4 flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-40">
          
          {/* Question Selector */}
          <div className="flex-1 flex items-center gap-2">
            {isLoadingRoster ? (
              <div className="flex-1 h-12 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center px-4" style={{ color: "var(--text-tertiary)" }}>
                <Loader2 className="animate-spin mr-2 text-[var(--text-primary)]" size={16} />
                <span className="text-[12.5px] font-medium">Loading submissions...</span>
              </div>
            ) : (
              <select
                value={selectedQuestionId}
                onChange={(e) => {
                  setSelectedQuestionId(e.target.value);
                  setHighlightedStep(null);
                  setChatMessages([]);
                }}
                className="flex-1 h-12 px-4 rounded-xl text-[13px] font-bold bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm cursor-pointer"
                disabled={tasks.length === 0}
              >
                {tasks.length === 0 ? (
                  <option value="">No questions available</option>
                ) : (
                  tasks.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))
                )}
              </select>
            )}
            
            {activeQuestion.id && (
              <div className="hidden lg:flex items-center gap-3 text-[11px] text-[var(--text-secondary)] font-mono font-semibold">
                <span className="px-2.5 py-0.5 rounded-full uppercase border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
                  {activeQuestion.difficulty}
                </span>
                <span>Avg: {activeQuestion.avgClassScore}%</span>
                <span>Lat: {activeQuestion.avgLatency}</span>
              </div>
            )}
          </div>

          {/* Confidence Indicator */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--border-subtle)]" 
            style={{ 
              background: activeQuestion.confidence > 80 ? "rgba(16,185,129,0.15)" : activeQuestion.confidence > 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
              color: activeQuestion.confidence > 80 ? "#10b981" : activeQuestion.confidence > 50 ? "#f59e0b" : "#ef4444"
            }} 
            title={`AI Confidence: ${activeQuestion.confidence}%`}
          >
            <Sparkles size={16} />
          </div>

          {/* Correctness Indicator */}
          {activeSteps.length > 0 && (
            <div className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0" 
              style={{ 
                background: activeSteps.every((s) => s.sympyValid !== false) ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                borderColor: activeSteps.every((s) => s.sympyValid !== false) ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
                color: activeSteps.every((s) => s.sympyValid !== false) ? "#10b981" : "#ef4444"
              }}
            >
              {activeSteps.every((s) => s.sympyValid !== false) ? (
                <CheckCircle2 size={18} strokeWidth={2.5} />
              ) : (
                <AlertTriangle size={18} strokeWidth={2.5} />
              )}
            </div>
          )}

          {/* Marks Box */}
          <div className="h-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center overflow-hidden flex-shrink-0">
            <div className="px-4 text-center border-r border-[var(--border-subtle)]">
              <span className="text-[13px] font-mono font-bold text-[var(--text-primary)]">
                {activeStudent.score?.toFixed(1) || "0.0"}
                <span className="text-[11px] text-[var(--text-tertiary)] font-normal font-sans"> / {activeQuestion.maxMarks || 0} pts</span>
              </span>
            </div>
            
            {viewMode === "teacher" ? (
              <div className="flex flex-col h-full bg-[var(--surface-primary)]">
                <button
                  onClick={() => adjustTotalMarks(0.5)}
                  className="w-7 flex-1 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] hover:text-brand-600 hover:bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)] cursor-pointer"
                  disabled={!selectedStudentId}
                >
                  +
                </button>
                <button
                  onClick={() => adjustTotalMarks(-0.5)}
                  className="w-7 flex-1 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] hover:text-brand-600 hover:bg-[var(--surface-secondary)] cursor-pointer"
                  disabled={!selectedStudentId}
                >
                  -
                </button>
              </div>
            ) : (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-500/10 font-mono flex items-center h-full">
                Locked
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            3. BODY LAYOUT
           ========================================== */}
        <div className="flex flex-1 min-h-0" style={{ minHeight: "360px" }}>

          {/* ==========================================
              3A. SIDEBAR
             ========================================== */}
          <aside className="w-14 flex flex-col items-center gap-3 py-4 border-r border-[var(--border-subtle)] overflow-y-auto shrink-0 bg-[var(--surface-primary)]">
            
            {/* Teacher Roster Flags */}
            {viewMode === "teacher" && !isLoadingRoster && roster.map((student) => {
              const flagColors: Record<string, string> = {
                "red-d": "#c62828",
                "red": "#ef5350",
                "red-l": "#ef9a9a",
                "white": "var(--surface-secondary)",
                "green-l": "#a5d6a7",
                "green": "#66bb6a",
                "green-d": "#2e7d32"
              };

              const isActive = selectedStudentId === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setHighlightedStep(null);
                    setChatMessages([]);
                  }}
                  className={`w-9 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] relative group transition-all flex-shrink-0 cursor-pointer ${
                    isActive ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-[var(--surface-primary)] scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ 
                    background: flagColors[student.flagColor] || "#fff",
                    border: student.flagColor === "white" ? "1px solid var(--border-subtle)" : "none",
                    color: ["white", "green-l", "red-l"].includes(student.flagColor) ? "var(--text-primary)" : "#fff"
                  }}
                  title={`${student.studentName} - Score: ${student.score}/${student.maxScore}`}
                >
                  {student.avatar || student.studentName?.charAt(0) || "?"}
                </button>
              );
            })}

            {viewMode === "teacher" && isLoadingRoster && (
              <Loader2 className="animate-spin mt-2 text-[var(--text-primary)]" size={16} />
            )}

            {viewMode === "teacher" && !isLoadingRoster && roster.length === 0 && (
              <span className="text-[9px] text-[var(--text-tertiary)] font-bold text-center px-1 font-mono uppercase">None</span>
            )}

            {/* Student Question Flags */}
            {viewMode === "student" && tasks.map((question, index) => {
              const isSelected = selectedQuestionId === question.id;
              return (
                <button
                  key={question.id}
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setHighlightedStep(null);
                    setChatMessages([]);
                  }}
                  className={`w-9 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-[11px] transition-all flex-shrink-0 cursor-pointer ${
                    isSelected ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-[var(--surface-primary)] scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ 
                    background: isSelected ? "var(--text-primary)" : "var(--surface-secondary)",
                    color: isSelected ? "var(--surface-primary)" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)"
                  }}
                  title={question.title}
                >
                  Q{index + 1}
                </button>
              );
            })}

            {/* Self-Evaluation Practices */}
            {viewMode === "self-eval" && !isLoadingPractices && practiceHistory.map((practice, index) => {
              const isSelected = selectedPracticeId === practice.id && !isCreatingPractice;
              return (
                <button
                  key={practice.id}
                  onClick={() => {
                    setSelectedPracticeId(practice.id);
                    setIsCreatingPractice(false);
                    setHighlightedStep(null);
                    setChatMessages([]);
                  }}
                  className={`w-9 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-[11px] transition-all flex-shrink-0 cursor-pointer ${
                    isSelected ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-[var(--surface-primary)] scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ 
                    background: isSelected ? "var(--text-primary)" : "var(--surface-secondary)",
                    border: isSelected ? "none" : "1px solid var(--border-subtle)",
                    color: isSelected ? "var(--surface-primary)" : "var(--text-secondary)"
                  }}
                  title={practice.title}
                >
                  P{index + 1}
                </button>
              );
            })}

            {viewMode === "self-eval" && isLoadingPractices && (
              <Loader2 className="animate-spin mt-2 text-[var(--text-primary)]" size={16} />
            )}

            {/* New Practice Button */}
            {viewMode === "self-eval" && (
              <button
                onClick={() => {
                  setIsCreatingPractice(true);
                  setHighlightedStep(null);
                  setChatMessages([]);
                }}
                className="w-9 h-7 rounded-lg border border-dashed flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                style={{ 
                  borderColor: isCreatingPractice ? "var(--text-primary)" : "var(--border-subtle)",
                  background: isCreatingPractice ? "rgba(255,255,255,0.05)" : "transparent",
                  color: "var(--text-primary)"
                }}
                title="Create New Practice"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            )}
          </aside>

          {/* ==========================================
              3B. MAIN CONTENT
             ========================================== */}
          <main className="flex-1 flex flex-col min-w-0">
            
            {/* Answer Label Bar */}
            <div className="h-10 px-6 flex items-center border-b text-xs text-[var(--text-secondary)] flex-shrink-0 font-medium" style={{ background: "var(--surface-primary)", borderBottomColor: "var(--border-subtle)" }}>
              {isLoadingDetail ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-[var(--text-primary)]" size={12} />
                  <span>Loading submission details...</span>
                </div>
              ) : activeSteps.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span className="font-bold font-mono uppercase text-brand-600">
                    {activeSteps.length} Steps Digitized
                  </span>
                  <span>• Student: {activeStudent.studentName}</span>
                </div>
              ) : (
                <span>No steps available</span>
              )}
            </div>

            {/* Double-Pane Workspace */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[var(--surface-secondary)]">
              
              {/* LEFT PANE: Digital Manuscript */}
              <div className="flex-1 p-4 overflow-y-auto border-r border-[var(--border-subtle)]" style={{ background: "var(--surface-secondary)", minHeight: "220px" }}>
                
                {isCreatingPractice ? (
                  /* Practice Creation Form */
                  <div className="flex flex-col gap-4 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm">
                    <div>
                      <h3 className="text-[14px] font-bold flex items-center gap-2 text-[var(--text-primary)] font-mono uppercase tracking-wider">
                        <Sparkles size={14} className="text-brand-600" />
                        Configure Practice Workspace
                      </h3>
                      <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                        Upload your handwritten sheets to trigger private step-grading.
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">1. Assessment Rubric</label>
                      <select 
                        value={practiceRubric} 
                        onChange={(e) => setPracticeRubric(e.target.value)}
                        className="h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 cursor-pointer font-medium"
                      >
                        <option value="">Select a rubric...</option>
                        <option value="CBSE Physics Class 12 - Electrostatics (15 Marks)">CBSE Physics - Electrostatics (15 Marks)</option>
                        <option value="CBSE Mathematics Class 12 - Calculus (20 Marks)">CBSE Math - Calculus (20 Marks)</option>
                        <option value="Custom Rubric (Paste text below)">Custom Rubric</option>
                      </select>
                    </div>

                    {practiceRubric === "Custom Rubric (Paste text below)" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">Paste Custom Rubric</label>
                        <textarea 
                          value={customRubricText}
                          onChange={(e) => setCustomRubricText(e.target.value)}
                          placeholder="Step 1: Coulomb's Law statement (2 marks)\nStep 2: Surface integration (3 marks)..."
                          className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 min-h-[90px]"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">2. Upload Answer Sheet</label>
                      <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-35 rounded-xl p-6 flex flex-col items-center justify-center relative transition-colors hover:border-brand-500 cursor-pointer">
                        <input 
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPracticeFile(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="mb-2 text-brand-600" size={24} />
                        {practiceFile ? (
                          <div className="text-center">
                            <span className="text-[12px] font-bold text-[var(--text-primary)] block truncate max-w-[200px]">{practiceFile.name}</span>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-mono block">{(practiceFile.size / 1024).toFixed(0)} KB</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[12px] font-bold text-[var(--text-primary)] block">Upload answer page photo or PDF</span>
                            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5 font-medium">Supports high-res scans &amp; camera snapshots</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {practiceError && (
                      <div className="p-3 rounded-xl text-xs flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-500">
                        <AlertTriangle size={12} className="shrink-0" />
                        {practiceError}
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          setIsCreatingPractice(false);
                          setPracticeFile(null);
                          setPracticeError("");
                        }}
                        className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-primary)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRunPracticeGrading}
                        disabled={isGradingPractice || !practiceFile || !practiceRubric}
                        className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 cursor-pointer"
                      >
                        {isGradingPractice ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            AI Analyzing...
                          </>
                        ) : (
                          <>
                            <Play size={13} />
                            Grade Sheet
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Question Card */}
                    {activeQuestion.questionText && (
                      <div className="mb-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
                        <span className="text-[10px] uppercase font-mono font-bold block mb-1.5 text-[var(--text-tertiary)]">
                          {viewMode === "self-eval" ? "Practice Exercise" : "Assigned Question"}
                        </span>
                        <p className="text-sm leading-relaxed font-mono font-bold text-[var(--text-primary)]">{activeQuestion.questionText}</p>
                      </div>
                    )}

                    {/* Manuscript Canvas (Premium Grid Background) */}
                    <div className="flex-1 min-h-[260px] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden flex flex-col" 
                      style={{ 
                        background: "var(--surface-secondary)", 
                        backgroundImage: "radial-gradient(var(--border-strong) 1.5px, transparent 1.5px)",
                        backgroundSize: "18px 18px"
                      }}>
                      
                      <div className="border-b border-dashed border-[var(--border-subtle)] py-3 px-4 flex justify-between items-center text-[10px] uppercase text-[var(--text-tertiary)] font-bold flex-shrink-0">
                        <span>Sheet #{selectedStudentId?.slice(-4) || "0000"} - OCR Manuscript</span>
                        <span className="font-semibold text-brand-600">
                          {activeSteps.length > 0 ? "Verified" : "Pending"}
                        </span>
                      </div>

                      <div className="flex-1 p-6 relative flex flex-col justify-around gap-4 overflow-y-auto">
                        
                        {isLoadingDetail ? (
                          <div className="flex items-center justify-center flex-1">
                            <Loader2 className="animate-spin text-[var(--text-primary)]" size={24} />
                          </div>
                        ) : activeSteps.length === 0 ? (
                          <div className="flex items-center justify-center flex-1 text-[var(--text-tertiary)] text-xs font-mono font-bold uppercase tracking-wider">
                            {selectedStudentId ? "No OCR steps available for this submission" : "Select a submission to view OCR steps"}
                          </div>
                        ) : (
                          activeSteps.map((step) => {
                            const isStepHighlighted = highlightedStep === step.stepNum;
                            const isStepErroneous = step.sympyValid === false;

                            return (
                              <div
                                key={step.stepNum}
                                onClick={() => setHighlightedStep(step.stepNum)}
                                className={`relative p-3 rounded-lg border border-dashed transition-all duration-300 cursor-pointer ${
                                  isStepHighlighted ? "shadow-md scale-[1.01]" : "hover:bg-white/5"
                                }`}
                                style={{
                                  background: isStepHighlighted ? "rgba(16,185,129,0.08)" : "transparent",
                                  borderColor: isStepErroneous ? "rgba(239,68,68,0.4)" : isStepHighlighted ? "#10b981" : "transparent"
                                }}
                              >
                                <div className="absolute -top-2 left-2 text-[var(--text-primary)] bg-[var(--surface-secondary)] border border-[var(--border-subtle)] font-mono font-bold text-[8px] px-1.5 py-0.5 rounded shadow uppercase z-10">
                                  Step {step.stepNum} (OCR)
                                </div>

                                <div className="pl-4 py-1">
                                  <code className="text-sm font-mono font-bold text-[var(--text-primary)]">{step.latex}</code>
                                  <span className="text-xs text-[var(--text-secondary)] italic block mt-0.5">{step.text}</span>
                                </div>

                                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                                  {step.sympyValid === true && (
                                    <span className="w-5 h-5 rounded flex items-center justify-center" 
                                      style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                                      <Check size={11} strokeWidth={3} />
                                    </span>
                                  )}
                                  {step.sympyValid === false && (
                                    <span className="w-5 h-5 rounded flex items-center justify-center" 
                                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                                      <X size={11} strokeWidth={3} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}

                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* RIGHT PANE: AI Step Traces */}
              <div 
                ref={rightPaneRef}
                className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scroll-smooth bg-[var(--surface-primary)]"
              >
                <div className="flex items-center justify-between border-b pb-2.5 flex-shrink-0" style={{ borderBottomColor: "var(--border-subtle)" }}>
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
                    <Sparkles size={14} className="text-brand-600" />
                    AI Grading Step Traces
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase rounded-lg border border-[var(--border-subtle)] px-2.5 py-0.5 text-[var(--text-secondary)] bg-[var(--surface-secondary)]">
                    {activeSteps.length} Steps
                  </span>
                </div>

                {isLoadingDetail ? (
                  <div className="flex items-center justify-center flex-1">
                    <Loader2 className="animate-spin text-[var(--text-primary)]" size={24} />
                  </div>
                ) : activeSteps.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 text-[var(--text-tertiary)] text-xs font-mono font-bold uppercase tracking-wider">
                    No step traces available
                  </div>
                ) : (
                  activeSteps.map((step) => {
                    const isStepHighlighted = highlightedStep === step.stepNum;
                    const isStepErroneous = step.sympyValid === false;

                    return (
                      <div
                        key={step.stepNum}
                        id={`step-card-${step.stepNum}`}
                        onClick={() => setHighlightedStep(step.stepNum)}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex-shrink-0 ${
                          isStepHighlighted ? "shadow-md scale-[1.01]" : ""
                        }`}
                        style={{
                          background: isStepHighlighted ? "rgba(16,185,129,0.08)" : "var(--surface-secondary)",
                          borderColor: isStepErroneous ? "rgba(239,68,68,0.4)" : isStepHighlighted ? "#10b981" : "var(--border-subtle)"
                        }}
                      >
                        {isStepHighlighted && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#10b981]" />
                        )}

                        <div className="flex justify-between items-start mb-2.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase block text-[#10b981]">
                              Step {step.stepNum}: {step.type}
                            </span>
                            <code className="text-sm font-mono font-bold block mt-0.5 text-[var(--text-primary)]">{step.latex}</code>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                              {step.marks} <span className="text-[10px] text-[var(--text-tertiary)]">/ {step.maxMarks}</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 font-medium">{step.justification}</p>

                        <div className="flex flex-wrap gap-2 items-center text-[10px]">
                          
                          <div className="px-2 py-0.5 rounded-lg flex items-center gap-1 font-mono uppercase text-[9px]"
                            style={{
                              background: step.sympyValid === true ? "rgba(16,185,129,0.15)" : step.sympyValid === false ? "rgba(239,68,68,0.15)" : "var(--surface-secondary)",
                              color: step.sympyValid === true ? "#10b981" : step.sympyValid === false ? "#ef4444" : "var(--text-tertiary)",
                              border: `1px solid ${step.sympyValid === true ? "rgba(16,185,129,0.3)" : step.sympyValid === false ? "rgba(239,68,68,0.3)" : "var(--border-subtle)"}`
                            }}>
                            {step.sympyValid === true ? (
                              <>
                                <CheckCircle2 size={10} />
                                <span>SymPy: Valid</span>
                              </>
                            ) : step.sympyValid === false ? (
                              <>
                                <AlertTriangle size={10} />
                                <span>SymPy: Inconsistent</span>
                              </>
                            ) : (
                              <>
                                <HelpCircle size={10} />
                                <span>Not Evaluated</span>
                              </>
                            )}
                          </div>

                          {step.errorType && (
                            <div className="px-2 py-0.5 rounded-lg font-mono uppercase text-[9px] flex items-center gap-1" 
                              style={{ 
                                background: "rgba(239,68,68,0.15)", 
                                color: "#ef4444", 
                                border: "1px solid rgba(239,68,68,0.3)" 
                              }}>
                              <AlertTriangle size={10} />
                              {step.errorType}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

              </div>

            </div>

            {/* ==========================================
                4. CHAT BAR (Premium Rounded B&W Inputs)
               ========================================== */}
            <footer className="border-t border-[var(--border-subtle)] flex-shrink-0 bg-[var(--surface-primary)]">
              
              {/* Highlight Banner */}
              {highlightedStep && (
                <div className="px-4 py-2 text-xs flex items-center justify-between" 
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", borderBottom: "1px solid rgba(16,185,129,0.25)" }}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Aligned View to <strong className="font-mono">Step {highlightedStep}</strong> on the Manuscript OCR panel above.</span>
                  </div>
                  <button 
                    onClick={() => setHighlightedStep(null)} 
                    className="text-[11px] uppercase tracking-wider font-bold hover:underline cursor-pointer"
                  >
                    Clear Link
                  </button>
                </div>
              )}

              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <div className="max-h-[140px] overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 max-w-[85%] ${
                        msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[9px] flex-shrink-0 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)]`}>
                        {msg.sender === "ai" ? "AI" : "U"}
                      </div>

                      <div className={`p-2.5 rounded-xl text-xs leading-relaxed border border-[var(--border-subtle)] ${
                        msg.sender === "ai" 
                          ? "bg-[var(--surface-secondary)] text-[var(--text-primary)]" 
                          : "bg-[var(--surface-primary)] text-[var(--text-primary)]"
                      }`}>
                        <p>{msg.text}</p>
                        
                        {msg.alignedStep && (
                          <div 
                            onClick={() => setHighlightedStep(msg.alignedStep || null)}
                            className="mt-2 w-max px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-all flex items-center gap-1 bg-brand-500/10 border border-brand-500/20 text-brand-600"
                          >
                            <ChevronRight size={10} />
                            <span>Link: Step {msg.alignedStep} ({msg.alignedReason})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[9px] text-white flex-shrink-0 bg-brand-500">
                        AI
                      </div>
                      <div className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* Quick Action Chips (Premium fully refactored B&W Pills) */}
              {activeSteps.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-35">
                  <span className="text-[10px] text-[var(--text-tertiary)] self-center uppercase font-mono font-bold mr-1">Ask AI:</span>
                  {[
                    { text: "Why did Step 2 fail?", query: "Explain Step 2 coefficients and why it failed." },
                    { text: "Audit Step 4 constants", query: "Check the notation constant compliance check in Step 4." },
                    { text: "Scan Step 3 logical anomaly", query: "What logic anomaly was flagged in Step 3?" }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChat(chip.query)}
                      className="px-3 py-1 rounded-full border border border-[var(--border-subtle)] text-[11px] font-bold bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-500 transition-all cursor-pointer shadow-sm"
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="p-3.5 flex items-center gap-2.5">
                <div className="flex-1 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center px-4 gap-2 focus-within:border-brand-500 transition-colors">
                  <QuestionIcon size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendChat(chatInput);
                    }}
                    placeholder="Ask the AI Copilot to analyze a specific step or override scores..."
                    className="flex-1 bg-transparent border-none outline-none text-xs placeholder-gray-500 text-[var(--text-primary)]"
                    disabled={!selectedStudentId}
                  />
                </div>

                <button
                  onClick={() => handleSendChat(chatInput)}
                  disabled={!chatInput.trim() || !selectedStudentId}
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50 flex-shrink-0 bg-brand-500 hover:bg-brand-600 cursor-pointer shadow-sm"
                >
                  <Send size={13} />
                </button>
              </div>
            </footer>

          </main>

        </div>

      </div>

    </div>
  );
}

export default function AnalysisHUDPage() {
  return (
    <AuthProvider>
      <AnalysisHUDPageContent />
    </AuthProvider>
  );
}