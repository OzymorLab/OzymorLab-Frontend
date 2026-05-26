"use client";

import { useState, useEffect, useRef } from "react";
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

interface Student {
  id: string;
  name: string;
  avatar: string;
  score: number;
  maxScore: number;
  flagColor: "red-d" | "red" | "red-l" | "white" | "green-l" | "green" | "green-d";
  errorType?: string;
  submissionTime: string;
}

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
  boundingBox: { x: number; y: number; w: number; h: number };
}

interface Question {
  id: string;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  avgClassScore: number;
  avgLatency: string;
  confidence: number;
  status: "Correct" | "Partial" | "Incorrect";
  maxMarks: number;
  stepsByStudent: Record<string, Step[]>; // studentId -> steps
  questionText: string;
}

function AnalysisHUDPageContent() {
  const { user, fetchWithAuth } = useAuth();

  // Mode switcher: "teacher" | "student" | "self-eval"
  const [viewMode, setViewMode] = useState<"teacher" | "student" | "self-eval">("teacher");

  useEffect(() => {
    if (user) {
      if (user.role === "student") {
        setViewMode("student");
      } else if (user.role === "admin" || user.role === "teacher") {
        setViewMode("teacher");
      }
    }
  }, [user]);

  // Student Self-Evaluation States
  interface PracticeAttempt {
    id: string;
    title: string;
    date: string;
    rubricName: string;
    score: number;
    maxScore: number;
    steps: Array<{
      stepNum: number;
      type: string;
      latex: string;
      text: string;
      marks: number;
      maxMarks: number;
      justification: string;
      sympyValid: boolean | null;
      errorType?: string;
    }>;
    ocrText?: string;
  }

  const [practiceHistory, setPracticeHistory] = useState<PracticeAttempt[]>([
    {
      id: "P01",
      title: "Practice: Physics Electrostatics",
      date: "May 25, 2026",
      rubricName: "CBSE Physics Class 12 - Electrostatics (15 Marks)",
      score: 11.5,
      maxScore: 15,
      ocrText: "E = q / (4 * pi * epsilon_0 * r^2)\nIntegrating E.dA = q_enc / epsilon_0\nHence E = 0 inside conductor.",
      steps: [
        {
          stepNum: 1,
          type: "formula",
          latex: "E = \\frac{q}{4 \\pi \\epsilon_0 r^2}",
          text: "Coulomb's Law statement for point charge",
          marks: 4,
          maxMarks: 4,
          justification: "Correct application of Coulomb's Law formula for a point charge.",
          sympyValid: true
        },
        {
          stepNum: 2,
          type: "integration",
          latex: "\\oint E \\cdot dA = \\frac{q_{enc}}{\\epsilon_0}",
          text: "Gauss Law surface area integration",
          marks: 5,
          maxMarks: 5,
          justification: "Correct mathematical integration of Gauss's Law across the surface area.",
          sympyValid: true
        },
        {
          stepNum: 3,
          type: "conclusion",
          latex: "E = 0",
          text: "Inside ideal spherical conductor",
          marks: 2.5,
          maxMarks: 6,
          justification: "Logical error: Charge density outside must be balanced by external surface distribution. SymPy flagged inconsistency in boundary conditions.",
          sympyValid: false,
          errorType: "Boundary Conditions Missed"
        }
      ]
    },
    {
      id: "P02",
      title: "Practice: Kinematics Retardation",
      date: "May 22, 2026",
      rubricName: "CBSE Physics Class 12 - Kinematics (10 Marks)",
      score: 10,
      maxScore: 10,
      ocrText: "v^2 = u^2 + 2as\n0 = 20^2 + 2 * a * 50\na = -4 m/s^2\nF = m*a = 1000 * -4 = -4000 N",
      steps: [
        {
          stepNum: 1,
          type: "formula",
          latex: "v^2 = u^2 + 2as",
          text: "Third equation of motion",
          marks: 3,
          maxMarks: 3,
          justification: "Correct third equation of motion applied.",
          sympyValid: true
        },
        {
          stepNum: 2,
          type: "algebra",
          latex: "a = -4 \\text{ m/s}^2",
          text: "Constant retardation deceleration",
          marks: 4,
          maxMarks: 4,
          justification: "Correct algebraic derivation of constant acceleration.",
          sympyValid: true
        },
        {
          stepNum: 3,
          type: "conclusion",
          latex: "F = -4000 \\text{ N}",
          text: "Newton Second Law force product",
          marks: 3,
          maxMarks: 3,
          justification: "Correct force calculation using Newton's Second Law.",
          sympyValid: true
        }
      ]
    }
  ]);

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>("P01");
  const [isCreatingPractice, setIsCreatingPractice] = useState<boolean>(false);
  const [practiceRubric, setPracticeRubric] = useState<string>("CBSE Physics Class 12 - Electrostatics (15 Marks)");
  const [customRubricText, setCustomRubricText] = useState<string>("");
  const [practiceFile, setPracticeFile] = useState<File | null>(null);
  const [isGradingPractice, setIsGradingPractice] = useState<boolean>(false);

  // Selected states
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [roster, setRoster] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(""); // Holds the selected submission ID!
  const [activeTab, setActiveTab] = useState<string>("Multimodal OCR");
  
  // Highlighted step (linked between right trace, left canvas, and chat reasoning)
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);

  // Submission detail state (holds steps, OCR bounding boxes, etc.)
  const [submissionDetail, setSubmissionDetail] = useState<any>(null);

  // Chat Log states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; alignedStep?: number; alignedReason?: string }>>([
    { sender: "ai", text: "Welcome to the Edexia AIOS Question Copilot! Ask me anything about the OCR digitizations, SymPy algebraic validations, or rubric justifications on this question." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // References
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Theme states
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Sync theme
    const activeTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(activeTheme);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
  };

  // 1. Fetch tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/analysis/tasks`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTasks(json.data);
          
          // Check query params safely on client-side
          const params = new URLSearchParams(window.location.search);
          const qTaskId = params.get("task_id");
          const qSubId = params.get("submission_id");
          
          if (qTaskId && json.data.some((t: any) => t.id === qTaskId)) {
            setSelectedQuestionId(qTaskId);
          } else {
            setSelectedQuestionId(json.data[0].id);
          }
          
          if (qSubId) {
            setSelectedStudentId(qSubId);
          }
        }
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    };
    loadTasks();
  }, []);

  // 2. Fetch roster when selectedQuestionId changes
  useEffect(() => {
    if (!selectedQuestionId) return;
    const loadRoster = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/analysis/submissions?task_id=${selectedQuestionId}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setRoster(json.data);
          
          // If we had a query param submission_id and it belongs to this roster, select it
          const params = new URLSearchParams(window.location.search);
          const qSubId = params.get("submission_id");
          if (qSubId && json.data.some((r: any) => r.id === qSubId)) {
            setSelectedStudentId(qSubId);
          } else {
            setSelectedStudentId(json.data[0].id);
          }
        } else {
          setRoster([]);
          setSelectedStudentId("");
          setSubmissionDetail(null);
        }
      } catch (e) {
        console.error("Failed to load task roster", e);
      }
    };
    loadRoster();
  }, [selectedQuestionId]);

  // 3. Fetch submission details when selectedStudentId changes
  useEffect(() => {
    if (!selectedStudentId) return;
    const loadDetail = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}`);
        const json = await res.json();
        if (json.data) {
          setSubmissionDetail(json.data);
        }
      } catch (e) {
        console.error("Failed to load submission details", e);
      }
    };
    loadDetail();
  }, [selectedStudentId]);

  // Find active practice attempt
  const activePractice = practiceHistory.find(p => p.id === selectedPracticeId) || practiceHistory[0];

  // Resolve active elements based on viewMode
  const isSelfEval = viewMode === "self-eval";

  // Find active data elements
  const activeQuestion = isSelfEval ? {
    id: activePractice.id,
    title: activePractice.title,
    topic: "Self Evaluation",
    difficulty: "Self-Guided",
    avgClassScore: 0,
    avgLatency: "0.8s",
    confidence: 100,
    maxMarks: activePractice.maxScore,
    questionText: activePractice.ocrText || "Private Self Evaluation Workspace"
  } : (tasks.find(t => t.id === selectedQuestionId) || {
    id: selectedQuestionId,
    title: "Loading Question...",
    topic: "Calculus",
    difficulty: "Medium",
    avgClassScore: 78,
    avgLatency: "1.2s",
    confidence: 0.96,
    maxMarks: 10,
    questionText: submissionDetail?.questionText || "Evaluate the math workspace..."
  });
  
  // Resolve active student from roster or detail
  const activeStudent = isSelfEval ? {
    id: activePractice.id,
    name: "Self Practice",
    avatar: "🎒",
    score: activePractice.score,
    maxScore: activePractice.maxScore,
    flagColor: "white" as const,
    submissionTime: activePractice.date
  } : (roster.find(r => r.id === selectedStudentId) || {
    id: selectedStudentId,
    name: submissionDetail?.studentName || "Loading...",
    avatar: submissionDetail?.avatar || "?",
    score: submissionDetail?.score || 0,
    maxScore: submissionDetail?.maxScore || 10,
    flagColor: "white" as const,
    submissionTime: "N/A"
  });
  
  // Steps
  const activeSteps = isSelfEval ? activePractice.steps : (submissionDetail?.steps || []);

  // Stepper marks override (Teacher mode)
  const adjustTotalMarks = async (amt: number) => {
    if (!selectedStudentId) return;
    try {
      // Optimistically update local score
      if (submissionDetail) {
        setSubmissionDetail((prev: any) => {
          if (!prev) return prev;
          const nextScore = Math.min(prev.maxScore, Math.max(0, prev.score + amt));
          return { ...prev, score: nextScore };
        });
      }
      
      await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt })
      });
      
      // Reload details from DB to sync up
      const detailRes = await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}`);
      const detailJson = await detailRes.json();
      if (detailJson.data) {
        setSubmissionDetail(detailJson.data);
      }
      
      // Reload roster to update sidebar
      const rosterRes = await fetchWithAuth(`${API_BASE}/analysis/submissions?task_id=${selectedQuestionId}`);
      const rosterJson = await rosterRes.json();
      if (rosterJson.data) {
        setRoster(rosterJson.data);
      }
    } catch (e) {
      console.error("Failed to override marks", e);
    }
  };

  // Run practice grading simulation
  const handleRunPracticeGrading = () => {
    setIsGradingPractice(true);
    setTimeout(() => {
      const isMath = practiceRubric.includes("Mathematics") || practiceRubric.includes("Calculus");
      const newAttempt: PracticeAttempt = {
        id: `P0${practiceHistory.length + 1}`,
        title: `Practice: ${practiceRubric.split(" - ")[0]}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        rubricName: practiceRubric,
        score: isMath ? 17.5 : 13.5,
        maxScore: isMath ? 20 : 15,
        ocrText: isMath 
          ? "f(x) = x^3 - 3x^2 + 4\nf'(x) = 3x^2 - 6x\nSetting f'(x) = 0 => 3x(x - 2) = 0\nCritical points at x=0, x=2."
          : "E = q / (4 * pi * epsilon_0 * r^2)\nIntegrating E.dA = q_enc / epsilon_0\nHence E = 0 inside conductor.",
        steps: isMath ? [
          {
            stepNum: 1,
            type: "derivation",
            latex: "f'(x) = 3x^2 - 6x",
            text: "Differentiate polynomial term by term",
            marks: 5,
            maxMarks: 5,
            justification: "Correct derivative calculated using power rule.",
            sympyValid: true
          },
          {
            stepNum: 2,
            type: "algebra",
            latex: "3x(x - 2) = 0",
            text: "Factor quadratic derivative expression",
            marks: 5,
            maxMarks: 5,
            justification: "Algebraic factorization verified successfully via SymPy.",
            sympyValid: true
          },
          {
            stepNum: 3,
            type: "conclusion",
            latex: "x = 0, x = 2",
            text: "Identify critical extrema coordinate roots",
            marks: 7.5,
            maxMarks: 10,
            justification: "Partially correct. Identified roots but did not perform the second derivative test to classify local extrema status.",
            sympyValid: true,
            errorType: "Extrema Classification Incomplete"
          }
        ] : [
          {
            stepNum: 1,
            type: "formula",
            latex: "E = \\frac{q}{4 \\pi \\epsilon_0 r^2}",
            text: "Coulomb's Law statement for point charge",
            marks: 4,
            maxMarks: 4,
            justification: "Correct application of Coulomb's Law formula for a point charge.",
            sympyValid: true
          },
          {
            stepNum: 2,
            type: "integration",
            latex: "\\oint E \\cdot dA = \\frac{q_{enc}}{\\epsilon_0}",
            text: "Gauss Law surface area integration",
            marks: 5,
            maxMarks: 5,
            justification: "Correct mathematical integration of Gauss's Law across the surface area.",
            sympyValid: true
          },
          {
            stepNum: 3,
            type: "conclusion",
            latex: "E = 0",
            text: "Inside ideal spherical conductor",
            marks: 4.5,
            maxMarks: 6,
            justification: "Handwriting OCR verified. Integration boundaries successfully converged under SymPy verification.",
            sympyValid: true
          }
        ]
      };
      setPracticeHistory([newAttempt, ...practiceHistory]);
      setSelectedPracticeId(newAttempt.id);
      setIsCreatingPractice(false);
      setIsGradingPractice(false);
      setPracticeFile(null);
    }, 2000);
  };

  // Submit chat queries
  const handleSendChat = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedStudentId) return;

    // Append user message
    setChatMessages(prev => [...prev, { sender: "user", text: textToSend }]);
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
        
        setChatMessages(prev => [...prev, { 
          sender: "ai", 
          text: text,
          alignedStep: alignedStep || undefined,
          alignedReason: alignedReason || undefined
        }]);
        
        // Trigger structural highlight animations
        if (alignedStep) {
          setHighlightedStep(alignedStep);
          
          // Auto scroll Right Pane to the step
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
      setChatMessages(prev => [...prev, { 
        sender: "ai", 
        text: "I experienced a minor latency lapse communicating with the analysis engine. Please try re-submitting your query."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Navbars tabs arrays based on mode
  const teacherTabs: Array<{ name: string; href: string; active?: boolean }> = [
    { name: "Home", href: "/dashboard" },
    { name: "Exams", href: "/dashboard/exams" },
    { name: "Reports", href: "/dashboard/reports" },
    { name: "Reviews", href: "/dashboard/reviews" },
    { name: "Students", href: "/dashboard/students" },
    { name: "Submissions", href: "/dashboard/submissions" }
  ];

  const studentTabs: Array<{ name: string; href: string; active?: boolean }> = [
    { name: "Home", href: "/dashboard" },
    { name: "Submissions", href: "/dashboard/submissions" },
    { name: "Review", href: "/dashboard/reviews" },
    { name: "Reports", href: "/dashboard/reports" },
    { name: "Analysis", href: "#", active: true }
  ];

  const activeNavTabs = viewMode === "teacher" ? teacherTabs : studentTabs;

  return (
    <div className="min-h-screen w-screen bg-[var(--surface-page)] text-[var(--text-primary)] font-sans overflow-hidden flex flex-col relative transition-all duration-300">
      
      {/* Dynamic Background Glow Rings for "Cloudy" Aesthetics */}
      <div className="absolute top-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-brand-600/10 to-brand-400/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-brand-500/5 to-cyan-500/10 blur-[100px] pointer-events-none z-0" />

      {/* ==========================================
          1. TOP NAVIGATION (.nav equivalent)
         ========================================== */}
      <header className="h-[56px] px-6 bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 z-10 backdrop-blur-md bg-opacity-80">
        
        {/* Logo and Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-[32px] h-[32px] bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-brand-600/20 group-hover:scale-105 transition-transform duration-200">
              Oz
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-[14.5px] tracking-tight text-[var(--text-primary)]">OzymorLab HUD</span>
              <span className="text-[10.5px] text-[var(--text-tertiary)] block -mt-1 font-mono uppercase tracking-wider">Multi-Modal V4</span>
            </div>
          </Link>

          {/* ROLE-AWARE VIEW MODE TOGGLE (Sleek Glass Segmented Button) */}
          {user?.role === "student" ? (
            <div className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-0.5 rounded-lg flex items-center shadow-sm">
              <button
                onClick={() => {
                  setViewMode("student");
                  setHighlightedStep(null);
                  setIsCreatingPractice(false);
                }}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "student"
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Teacher Evaluations
              </button>
              <button
                onClick={() => {
                  setViewMode("self-eval");
                  setHighlightedStep(null);
                  setIsCreatingPractice(false);
                }}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "self-eval"
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                AI Self-Evaluation
              </button>
            </div>
          ) : (
            <div className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-0.5 rounded-lg flex items-center shadow-sm">
              <button
                onClick={() => {
                  setViewMode("teacher");
                  setSelectedStudentId("S01");
                  setSelectedQuestionId("Q1");
                  setHighlightedStep(null);
                  setIsCreatingPractice(false);
                }}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "teacher"
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Teacher View
              </button>
              <button
                onClick={() => {
                  setViewMode("student");
                  setSelectedStudentId("S01");
                  setSelectedQuestionId("Q1");
                  setHighlightedStep(null);
                  setIsCreatingPractice(false);
                }}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "student"
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Student View
              </button>
              <button
                onClick={() => {
                  setViewMode("self-eval");
                  setHighlightedStep(null);
                  setIsCreatingPractice(false);
                }}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "self-eval"
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Practice Sandbox
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {activeNavTabs.map((tab, idx) => (
            <Link
              key={idx}
              href={tab.href}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all ${
                tab.active || tab.name === "Analysis" || (viewMode === "teacher" && tab.name === "Submissions")
                  ? "bg-brand-50 dark:bg-brand-900/40 text-brand-600 font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>

        {/* Corner Actions: Theme, Profile, Log-Out */}
        <div className="flex items-center gap-3">
          
          {/* Quick Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="w-[34px] h-[34px] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

          {/* Profile Corner Link */}
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-secondary)] transition-all"
            title="View Profile"
          >
            <div className="w-[26px] h-[26px] bg-brand-100 dark:bg-brand-800 rounded-full flex items-center justify-center text-brand-600 font-bold text-[11px]">
              {activeStudent.avatar}
            </div>
            <span className="hidden sm:inline text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Profile
            </span>
          </Link>

          {/* Log-Out Corner Button */}
          <button
            onClick={() => alert("Simulating dashboard exit...")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all font-medium text-[12px] cursor-pointer"
            title="Log Out"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Log-Out</span>
          </button>
        </div>
      </header>

      {/* ==========================================
          2. QUESTION BAR (.question-bar equivalent)
         ========================================== */}
      <section className="h-[64px] px-6 bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 gap-4 z-10">
        
        {/* Selection Box & Info */}
        <div className="flex items-center gap-3 max-w-[50%]">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-brand-600 w-5 h-5 hidden sm:block" />
            <select
              value={selectedQuestionId}
              onChange={(e) => {
                setSelectedQuestionId(e.target.value);
                setHighlightedStep(null);
              }}
              className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 font-medium text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-brand-600 shadow-sm"
            >
              {tasks.map((q: any) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 text-[11.5px] text-[var(--text-tertiary)] border-l border-[var(--border-subtle)] pl-3 font-mono">
            <span className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 px-1.5 py-0.5 rounded uppercase">{activeQuestion.difficulty}</span>
            <span>Class Avg: {activeQuestion.avgClassScore}%</span>
            <span>Latency: {activeQuestion.avgLatency}</span>
          </div>
        </div>

        {/* HUD Elements: Confidence Dot, Correctness Tick-Box, Marks Box */}
        <div className="flex items-center gap-3">
          
          {/* Confidence Ring Indicator (.conf-dot equivalent) */}
          <div 
            className="flex items-center gap-2 bg-[var(--surface-primary)] border border-[var(--border-subtle)] pl-2.5 pr-3 py-1.5 rounded-lg shadow-sm"
            title="AI Evaluation Confidence Score"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              <span className="relative w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-black" />
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block leading-none">Confidence</span>
              <span className="text-[12.5px] font-bold text-[var(--text-primary)] font-mono leading-none">{activeQuestion.confidence}%</span>
            </div>
          </div>

          {/* Correctness Tick-Box (.tick-box equivalent) */}
          <div 
            className={`w-[36px] h-[36px] rounded-lg border flex items-center justify-center shadow-sm transition-colors ${
              activeSteps.every((s: any) => s.sympyValid !== false)
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600"
                : activeSteps.some((s: any) => s.sympyValid === false) && activeSteps.some((s: any) => s.sympyValid === true)
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-600"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-600"
            }`}
            title={`Status: ${activeSteps.every((s: any) => s.sympyValid !== false) ? "Fully Correct" : "Flagged Corrections"}`}
          >
            {activeSteps.every((s: any) => s.sympyValid !== false) ? (
              <CheckCircle2 size={20} className="stroke-[2.5]" />
            ) : (
              <AlertTriangle size={20} className="stroke-[2.5]" />
            )}
          </div>

          {/* Marks Stepper HUD (.marks-box equivalent) */}
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg flex items-center overflow-hidden h-[36px] shadow-sm">
            <div className="px-3 text-center border-r border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono leading-none -mt-0.5">Score</div>
              <div className="text-[14px] font-bold text-brand-600 font-mono leading-none">
                {activeStudent.score.toFixed(1)}
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal ml-0.5">/ {activeQuestion.maxMarks}</span>
              </div>
            </div>

            {/* Stepper Buttons (Enabled only in Teacher View) */}
            {viewMode === "teacher" ? (
              <div className="flex flex-col h-full bg-[var(--surface-secondary)]">
                <button
                  onClick={() => adjustTotalMarks(0.5)}
                  className="flex-1 w-[24px] flex items-center justify-center text-[10px] text-[var(--text-secondary)] hover:text-brand-600 hover:bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] font-bold transition-all cursor-pointer"
                  title="Increase score by 0.5"
                >
                  +
                </button>
                <button
                  onClick={() => adjustTotalMarks(-0.5)}
                  className="flex-1 w-[24px] flex items-center justify-center text-[10px] text-[var(--text-secondary)] hover:text-brand-600 hover:bg-[var(--surface-primary)] font-bold transition-all cursor-pointer"
                  title="Decrease score by 0.5"
                >
                  -
                </button>
              </div>
            ) : (
              <div className="px-2.5 h-full bg-brand-50 dark:bg-brand-950/20 text-brand-600 font-bold text-[10px] flex items-center justify-center uppercase tracking-wider select-none font-mono">
                Locked
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ==========================================
          3. BODY LAYOUT (.body equivalent)
         ========================================== */}
      <div className="flex flex-1 min-h-0 relative z-10">

        {/* ==========================================
            3A. FLAG SIDEBAR (.sidebar equivalent)
           ========================================== */}
        <aside className="w-[56px] bg-[var(--surface-secondary)] border-r border-[var(--border-subtle)] flex flex-col items-center py-4 gap-2.5 shrink-0 select-none">
          
          <div className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase font-semibold text-center mb-1 tracking-wider leading-none">
            {viewMode === "teacher" ? "Roster" : viewMode === "student" ? "Exam" : "Practice"}
          </div>

          {/* Teacher Sidebar: List of color-coded flags representing students */}
          {viewMode === "teacher" && (
            roster.map((student: any) => {
              // Map flags colors to tailwind styles
              const bgColors: Record<string, string> = {
                "red-d": "bg-rose-800 border-rose-950 text-white hover:bg-rose-700",
                "red": "bg-rose-500 border-rose-600 text-white hover:bg-rose-400",
                "red-l": "bg-rose-200 border-rose-300 text-rose-800 hover:bg-rose-100",
                "white": "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
                "green-l": "bg-emerald-200 border-emerald-300 text-emerald-800 hover:bg-emerald-100",
                "green": "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-400",
                "green-d": "bg-emerald-800 border-emerald-950 text-white hover:bg-emerald-700"
              };

              const isActive = selectedStudentId === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setHighlightedStep(null);
                  }}
                  className={`w-[36px] h-[30px] rounded border flex items-center justify-center font-bold text-[10px] transition-all relative group cursor-pointer ${
                    bgColors[student.flagColor] || bgColors["white"]
                  } ${isActive ? "ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-zinc-950 scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"}`}
                >
                  {student.avatar}

                  {/* Rich Flag Tooltip */}
                  <span className="absolute left-[48px] bg-slate-900 text-white text-[11px] p-2.5 rounded-lg border border-slate-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50 pointer-events-none w-[180px]">
                    <span className="font-semibold block text-slate-100">{student.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">ID: {student.id} | time: {student.submissionTime}</span>
                    <span className="h-[0.5px] bg-slate-800 block my-1" />
                    <span className="flex justify-between items-center text-[10.5px] mt-1 font-mono">
                      <span>Score:</span>
                      <span className="font-bold text-emerald-400">{student.score} / {student.maxScore}</span>
                    </span>
                    {student.errorType && (
                      <span className="block text-[9.5px] text-rose-400 mt-1 font-mono uppercase bg-rose-500/10 px-1 py-0.5 rounded w-max">
                        {student.errorType}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}

          {/* Student Sidebar: List of color-coded flags representing Exam Questions */}
          {viewMode === "student" && (
            tasks.map((question: any, index: number) => {
              const qNum = index + 1;
              const hasErrors = selectedQuestionId === question.id && activeSteps.some((s: any) => s.sympyValid === false);
              const isSelected = selectedQuestionId === question.id;

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setHighlightedStep(null);
                  }}
                  className={`w-[36px] h-[30px] rounded border flex items-center justify-center font-bold font-mono text-[11px] transition-all relative group cursor-pointer ${
                    isSelected
                      ? "bg-brand-600 border-brand-700 text-white ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-zinc-950 scale-105"
                      : hasErrors
                      ? "bg-rose-500 border-rose-600 text-white hover:bg-rose-400"
                      : "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-400"
                  }`}
                >
                  Q{qNum}

                  {/* Question Tooltip */}
                  <span className="absolute left-[48px] bg-slate-900 text-white text-[11px] p-2.5 rounded-lg border border-slate-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50 pointer-events-none w-[180px]">
                    <span className="font-semibold block text-slate-100">{question.title}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Topic: {question.topic}</span>
                    <span className="h-[0.5px] bg-slate-800 block my-1" />
                    <span className="flex justify-between items-center text-[10.5px] mt-1 font-mono">
                      <span>My status:</span>
                      <span className={`font-bold ${hasErrors ? "text-rose-400" : "text-emerald-400"}`}>
                        {hasErrors ? "Flagged Error" : "100% Perfect"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })
          )}

          {/* Self-Evaluation Sidebar: List of practice attempts */}
          {viewMode === "self-eval" && (
            <>
              {practiceHistory.map((practice, index) => {
                const isSelected = selectedPracticeId === practice.id && !isCreatingPractice;
                return (
                  <button
                    key={practice.id}
                    onClick={() => {
                      setSelectedPracticeId(practice.id);
                      setIsCreatingPractice(false);
                      setHighlightedStep(null);
                    }}
                    className={`w-[36px] h-[30px] rounded border flex items-center justify-center font-bold font-mono text-[11px] transition-all relative group cursor-pointer ${
                      isSelected
                        ? "bg-brand-600 border-brand-700 text-white ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-zinc-950 scale-105"
                        : "bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    P{index + 1}

                    {/* Practice Tooltip */}
                    <span className="absolute left-[48px] bg-slate-900 text-white text-[11px] p-2.5 rounded-lg border border-slate-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50 pointer-events-none w-[180px]">
                      <span className="font-semibold block text-slate-100">{practice.title}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{practice.date}</span>
                      <span className="h-[0.5px] bg-slate-800 block my-1" />
                      <span className="flex justify-between items-center text-[10.5px] mt-1 font-mono">
                        <span>Score:</span>
                        <span className="font-bold text-brand-400">{practice.score} / {practice.maxScore}</span>
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* Create new practice icon */}
              <button
                onClick={() => {
                  setIsCreatingPractice(true);
                  setHighlightedStep(null);
                }}
                className={`w-[36px] h-[30px] rounded border border-dashed flex items-center justify-center transition-all cursor-pointer ${
                  isCreatingPractice
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20 text-brand-600 ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-zinc-950 scale-105"
                    : "border-[var(--border-subtle)] text-brand-600 bg-[var(--surface-primary)] hover:bg-brand-500/10 hover:border-brand-500"
                }`}
                title="Create New Practice Attempt"
              >
                <Plus size={14} className="stroke-[3]" />
              </button>
            </>
          )}
        </aside>

        {/* ==========================================
            3B. MAIN ANALYSIS AREA (.main equivalent)
           ========================================== */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--surface-primary)]">
          
          {/* Answer Label Bar (.answer-label equivalent) */}
          <div className="h-[36px] px-6 bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 font-mono text-[10.5px] text-[var(--text-tertiary)] select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-brand-600">
                {activeTab === "Multimodal OCR" ? "OCR Manuscript Sandbox" : "SymPy Trace Tree"}
              </span>
              <span>• Student: {activeStudent.name} ({activeStudent.id})</span>
            </div>
            <div className="flex items-center gap-4">
              <span>LATENCY: 42ms</span>
              <span>VERIFIER: SYMPY ENGINE V1.3</span>
            </div>
          </div>

          {/* DOUBLE-PANE WORKSPACE (.image-area equivalent) */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            
            {/* LEFT PANE: Digital Manuscript Viewport */}
            <div className="flex-1 border-r border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-6 overflow-y-auto flex flex-col relative select-none">
              
              {isCreatingPractice ? (
                /* New Practice Setup Form */
                <div className="flex flex-col gap-5 p-5 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-xl shadow-sm animate-fade-in">
                  <div>
                    <h3 className="text-[15px] font-bold text-brand-600 flex items-center gap-2">
                      <Sparkles size={16} />
                      Configure New Practice Attempt
                    </h3>
                    <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1">
                      Upload your answer sheet and select or paste a custom assessment rubric to grade privately.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">1. Select Assessment Rubric</label>
                    <select 
                      value={practiceRubric} 
                      onChange={(e) => setPracticeRubric(e.target.value)}
                      className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm cursor-pointer"
                    >
                      <option value="CBSE Physics Class 12 - Electrostatics (15 Marks)">CBSE Physics Class 12 - Electrostatics (15 Marks)</option>
                      <option value="CBSE Mathematics Class 12 - Calculus (20 Marks)">CBSE Mathematics Class 12 - Calculus (20 Marks)</option>
                      <option value="Custom Rubric (Paste text below)">Custom Rubric (Paste text below)</option>
                    </select>
                  </div>

                  {practiceRubric.includes("Custom") && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Paste Custom Rubric Criteria</label>
                      <textarea 
                        value={customRubricText}
                        onChange={(e) => setCustomRubricText(e.target.value)}
                        placeholder="e.g. Step 1: Coulomb's Law statement (2 marks)\nStep 2: Surface integration (3 marks)..."
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm min-h-[80px] font-mono text-[12px]"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">2. Upload Your Answer Sheet</label>
                    <div className="border border-dashed border-[var(--border-subtle)] hover:border-brand-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[var(--surface-secondary)]/50 relative">
                      <input 
                        type="file" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setPracticeFile(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="text-brand-500 mb-2" size={28} />
                      {practiceFile ? (
                        <div className="text-center">
                          <span className="text-[12px] font-semibold text-[var(--text-primary)] block truncate max-w-[200px]">{practiceFile.name}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)] block">{(practiceFile.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-[12px] font-semibold text-[var(--text-secondary)] block">Upload answer page photo or PDF</span>
                          <span className="text-[10px] text-[var(--text-tertiary)] block">Support high-res handwriting scans</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleRunPracticeGrading}
                    disabled={isGradingPractice || !practiceFile}
                    className="w-full flex items-center justify-center gap-1.5 text-[12.5px] py-2.5 font-semibold mt-2 rounded-xl text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isGradingPractice ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={14} />
                        AI Analyzing Bounding Boxes...
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        Run AI Practice Grading
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Standard Digital Manuscript Panel */
                <>
                  {/* Question card */}
                  <div className="mb-4 bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block font-semibold mb-1">
                      {isSelfEval ? "Practice Exercise Criteria" : "Assigned Formula Query"}
                    </span>
                    <p className="text-[13.5px] leading-relaxed font-mono font-medium">{activeQuestion.questionText}</p>
                  </div>

                  {/* Scanned sheet layout mockup */}
                  <div className="flex-1 min-h-[300px] bg-amber-50/10 dark:bg-zinc-950/20 border border-[var(--border-subtle)] rounded-xl relative overflow-hidden flex flex-col shadow-inner" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
                    
                    {/* Header branding on paper sheet */}
                    <div className="border-b border-[var(--border-subtle)] border-dashed py-2.5 px-4 flex justify-between items-center text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
                      <span>Sheet #{(selectedQuestionId === "Q1") ? "4102" : "7891"} - Edexia Multimodal OCR</span>
                      <span className="text-brand-600 font-semibold">Manuscript Verified</span>
                    </div>

                    {/* Simulated Student Handwriting Math Formulas Canvas */}
                    <div className="flex-1 p-6 relative flex flex-col justify-around gap-6">
                      
                      {activeSteps.map((step: any) => {
                        const isStepHighlighted = highlightedStep === step.stepNum;
                        const isStepErroneous = step.sympyValid === false;

                        return (
                          <div
                            key={step.stepNum}
                            onClick={() => setHighlightedStep(step.stepNum)}
                            className={`relative p-3 rounded-lg border border-dashed transition-all duration-300 cursor-pointer ${
                              isStepHighlighted
                                ? "bg-brand-50/40 dark:bg-brand-900/20 border-brand-500 shadow-md scale-[1.01]"
                                : isStepErroneous
                                ? "border-rose-300/60 bg-rose-500/5 hover:border-rose-400"
                                : "border-transparent hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)]/50"
                            }`}
                          >
                            {/* Interactive Bounding Box Indicator */}
                            <div className="absolute -top-2 left-2 bg-slate-900 text-white font-mono text-[8px] px-1 py-0.2 rounded shadow uppercase tracking-wider z-20">
                              Step {step.stepNum} (OCR)
                            </div>

                            {/* Equation layout */}
                            <div className="pl-4 py-1">
                              <code className="text-[15px] font-mono font-bold tracking-tight text-[var(--text-primary)]">
                                {step.latex}
                              </code>
                              <span className="text-[11.5px] text-[var(--text-tertiary)] italic block mt-0.5">
                                {step.text}
                              </span>
                            </div>

                            {/* SymPy logic quick indicator */}
                            <div className="absolute right-2 top-2 flex items-center gap-1.5">
                              {step.sympyValid === true && (
                                <span className="w-5 h-5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded flex items-center justify-center" title="SymPy Verified">
                                  <Check size={11} className="stroke-[3]" />
                                </span>
                              )}
                              {step.sympyValid === false && (
                                <span className="w-5 h-5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded flex items-center justify-center animate-pulse" title="Logic Broken">
                                  <X size={11} className="stroke-[3]" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    </div>

                  </div>
                </>
              )}

            </div>

            {/* RIGHT PANE: Structured AI Justifications & SymPy Trace Tree */}
            <div 
              ref={rightPaneRef}
              className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 select-none scroll-smooth"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <h3 className="font-semibold text-[13.5px] flex items-center gap-2">
                  <Sparkles size={15} className="text-brand-600" />
                  AI Grading Step Traces
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
                  {activeSteps.length} OCR Steps Digitized
                </span>
              </div>

              {activeSteps.map((step: any) => {
                const isStepHighlighted = highlightedStep === step.stepNum;
                const isStepErroneous = step.sympyValid === false;

                return (
                  <div
                    key={step.stepNum}
                    id={`step-card-${step.stepNum}`}
                    onClick={() => setHighlightedStep(step.stepNum)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isStepHighlighted
                        ? "bg-brand-50/30 dark:bg-brand-900/20 border-brand-500 shadow-md shadow-brand-500/5 ring-1 ring-brand-500 scale-[1.01]"
                        : isStepErroneous
                        ? "bg-rose-500/5 border-rose-200 hover:border-rose-300 dark:border-rose-950/50"
                        : "bg-[var(--surface-primary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                    }`}
                  >
                    {/* Glowing highlight indicator */}
                    {isStepHighlighted && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500" />
                    )}

                    {/* Step Card Top Row */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-brand-600 uppercase tracking-wider block">
                          Step {step.stepNum}: {step.type}
                        </span>
                        <code className="text-[13.5px] font-mono font-semibold text-[var(--text-primary)] block mt-0.5">
                          {step.latex}
                        </code>
                      </div>
                      
                      {/* Step Score badge */}
                      <div className="text-right">
                        <span className="text-[12.5px] font-bold text-[var(--text-primary)] font-mono">
                          {step.marks} <span className="text-[9.5px] text-[var(--text-tertiary)]">/ {step.maxMarks}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-2.5">
                      {step.justification}
                    </p>

                    {/* Logic checks HUD */}
                    <div className="flex flex-wrap gap-2 items-center text-[10.5px]">
                      
                      {/* SymPy verifier tag */}
                      <div className={`px-2 py-0.5 rounded flex items-center gap-1 font-mono uppercase text-[9.5px] ${
                        step.sympyValid === true
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : step.sympyValid === false
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse"
                          : "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                      }`}>
                        {step.sympyValid === true ? (
                          <>
                            <CheckCircle2 size={10} />
                            <span>SymPy: Algebraic Valid</span>
                          </>
                        ) : step.sympyValid === false ? (
                          <>
                            <AlertTriangle size={10} />
                            <span>SymPy: Logical Inconsistency</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle size={10} />
                            <span>SymPy: Not Evaluated</span>
                          </>
                        )}
                      </div>

                      {/* Error Tag if any */}
                      {step.errorType && (
                        <div className="px-2 py-0.5 rounded font-mono uppercase text-[9.5px] bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-shake">
                          {step.errorType}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>

          </div>

          {/* ==========================================
              4. AI COPILOT CHAT SEGMENT (.chat-bar equivalent)
             ========================================== */}
          <footer className="border-t border-[var(--border-subtle)] p-4 shrink-0 flex flex-col bg-slate-950/90 text-white relative shadow-2xl z-20 backdrop-blur-xl bg-opacity-95">
            
            {/* Cloudy/Glass Glowing Backdrop Accent */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/5 to-cyan-500/5 pointer-events-none z-0" />

            {/* Aligned Highlight Banner (Shows when chat aligns with a specific step - "Point to block of answer") */}
            {highlightedStep && (
              <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[11px] font-mono flex items-center justify-between z-10 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles size={11} className="animate-pulse" />
                  <span>Aligned View to <strong>Step {highlightedStep}</strong> on the Manuscript OCR panel above.</span>
                </div>
                <button
                  onClick={() => setHighlightedStep(null)}
                  className="text-slate-400 hover:text-slate-200 transition-colors text-[9px] uppercase cursor-pointer"
                >
                  Clear Link
                </button>
              </div>
            )}

            {/* Chat Logs Window - Generous but compact dashboard height */}
            <div className="max-h-[140px] overflow-y-auto mb-3 flex flex-col gap-2.5 pr-2 z-10 scrollbar-thin">
              {chatMessages.map((msg, idx) => {
                const isAI = msg.sender === "ai";
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      isAI ? "" : "ml-auto flex-row-reverse"
                    }`}
                  >
                    <div className={`w-[24px] h-[24px] rounded-full shrink-0 flex items-center justify-center font-bold text-[9px] font-mono uppercase ${
                      isAI ? "bg-brand-600 text-white" : "bg-zinc-700 text-zinc-100"
                    }`}>
                      {isAI ? "Cop" : "User"}
                    </div>

                    {/* Cloudy/Frosted Glass bubble */}
                    <div className={`p-3 rounded-xl text-[12px] leading-relaxed border ${
                      isAI 
                        ? "bg-slate-900/60 border-slate-800 backdrop-blur-md shadow-lg" 
                        : "bg-brand-600/40 border-brand-600/30 text-slate-100 shadow"
                    }`}>
                      <p>{msg.text}</p>
                      
                      {/* Aligned target tag in bubble */}
                      {msg.alignedStep && (
                        <div 
                          onClick={() => setHighlightedStep(msg.alignedStep || null)}
                          className="mt-2 w-max px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[9.5px] font-mono uppercase cursor-pointer hover:bg-brand-500/20 transition-all flex items-center gap-1"
                        >
                          <ChevronRight size={9} />
                          <span>Link: Step {msg.alignedStep} ({msg.alignedReason})</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="w-[24px] h-[24px] rounded-full bg-brand-600 text-white shrink-0 flex items-center justify-center font-bold text-[9px] font-mono uppercase">
                    Cop
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11.5px] text-slate-400 flex items-center gap-1.5 shadow">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              
              <div ref={chatBottomRef} />
            </div>

            {/* Quick interactive chips to test highlighting links */}
            <div className="flex flex-wrap gap-2 mb-3 z-10">
              <span className="text-[10px] text-slate-400 self-center uppercase font-mono tracking-wider mr-1">Ask AI:</span>
              <button
                onClick={() => handleSendChat("Explain Step 2 coefficients and why it failed.")}
                className="px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300 font-medium cursor-pointer"
              >
                "Why did Step 2 fail?"
              </button>
              <button
                onClick={() => handleSendChat("Check the notation constant compliance check in Step 4.")}
                className="px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300 font-medium cursor-pointer"
              >
                "Audits Constant in Step 4"
              </button>
              <button
                onClick={() => handleSendChat("What logic anomaly was flagged in Step 3?")}
                className="px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300 font-medium cursor-pointer"
              >
                "Scan Step 3 logical anomaly"
              </button>
            </div>

            {/* Inputs & Actions */}
            <div className="flex items-center gap-3 z-10">
              <div className="flex-1 bg-slate-900/80 border border-slate-800 focus-within:border-brand-600 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-inner transition-colors">
                <QuestionIcon size={14} className="text-slate-500" />
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat(chatInput);
                  }}
                  placeholder="Ask the AI Copilot to analyze a specific step or override scores..."
                  className="flex-1 bg-transparent border-none outline-none text-[12px] placeholder-slate-500 text-white font-sans"
                />
              </div>

              <button
                onClick={() => handleSendChat(chatInput)}
                className="px-4 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all text-[12px] flex items-center gap-1.5 shadow-md shadow-brand-600/30 cursor-pointer"
              >
                <span>Send</span>
                <Send size={12} />
              </button>
            </div>

          </footer>

        </main>

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
