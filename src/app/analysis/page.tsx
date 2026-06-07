"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Home, BookOpen, Users, BarChart3, ShieldCheck, GraduationCap, 
  Settings, LogOut, Search, Bell, Sparkles, AlertTriangle, 
  CheckCircle2, ChevronRight, MessageSquare, Send, RefreshCw, 
  ArrowLeftRight, HelpCircle, Check, X, ShieldAlert, FileText,
  User, Play, Award, HelpCircle as QuestionIcon, Upload, Loader2, Plus,
  Sun, Moon, ChevronDown, Shield
} from "lucide-react";
import Link from "next/link";
import { useAuth, AuthProvider } from "../context/AuthContext";

const navItems = [
  { label: "Exams Setup", href: "/dashboard/exams", icon: GraduationCap },
  { label: "Submissions", href: "/dashboard/submissions", icon: BookOpen },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Reviews", href: "/dashboard/reviews", icon: Shield },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

/* ── Diamond logo matching the landing page ── */
const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1f2223" />
    <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="3" fill="#1f2223" />
  </svg>
);

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
  fileKey?: string;
  confidence?: number;
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
  const { user, fetchWithAuth, logout } = useAuth();

  // Mode & Core Data
  const [viewMode, setViewMode] = useState<"teacher" | "student" | "self-eval">("teacher");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin" || user?.role === "principal";

  const [roster, setRoster] = useState<any[]>([]); // Array of all worksheets in the class
  const [submissionDetail, setSubmissionDetail] = useState<any | null>(null); // The currently active worksheet
  const [practiceHistory, setPracticeHistory] = useState<PracticeAttempt[]>([]);
  
  // Selection States
  const [selectedStudentId, setSelectedStudentId] = useState<string>(""); // Actually the worksheet.id
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
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
  const [agreedSubmissions, setAgreedSubmissions] = useState<Record<string, boolean>>({});
  
  // Loading States
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPractices, setIsLoadingPractices] = useState(false);
  const [isLoadingGrade, setIsLoadingGrade] = useState(false);
  const [error, setError] = useState<string>("");
  const [gradeDetail, setGradeDetail] = useState<any>(null);

  // Left pane view: "sheet" = original handwritten image (default), "transcript" = OCR text + grading
  const [leftView, setLeftView] = useState<"sheet" | "transcript">("sheet");

  // Refs
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Restore theme from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const active = saved || (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(active as "light" | "dark");
  }, []);

  // Click outside user menu handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      setMobileMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // Set view mode based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "student") {
        setViewMode("student");
      } else if (
        user.role === "admin" ||
        user.role === "teacher" ||
        user.role === "hod" ||
        user.role === "principal"
      ) {
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

  const fetchWorksheets = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      setError("");
      
      const params = new URLSearchParams(window.location.search);
      const qTaskId = params.get("task_id"); // The actual exam Task ID
      const qSubId = params.get("submission_id"); // The actual Student Submission ID
      
      if (qTaskId) {
        setClassId(qTaskId);
      }

      if (qTaskId) {
        // Fetch dynamic submissions roster for this exam task
        const url = `${API_BASE}/analysis/submissions?task_id=${qTaskId}`;
        const res = await fetchWithAuth(url);
        const json = await res.json();
        
        const rosterData = json.data || [];
        
        if (rosterData && rosterData.length > 0) {
          const mappedRoster = rosterData.map((item: any) => ({
            id: item.id,
            studentId: item.studentId,
            studentName: item.name,
            avatar: item.avatar,
            score: item.score,
            maxScore: item.maxScore,
            flagColor: item.flagColor,
            submissionTime: item.submissionTime,
            status: "GRADED"
          }));
          
          setRoster(mappedRoster);
          
          const initialSubId = qSubId && mappedRoster.some((w: any) => w.id === qSubId)
            ? qSubId
            : (mappedRoster[0]?.id || "");
            
          setSelectedStudentId(initialSubId);
        } else {
          setRoster([]);
          if (qSubId) {
            setSelectedStudentId(qSubId);
          } else {
            setError("No student submissions found for this exam task.");
          }
        }
      } else {
        setRoster([]);
        setError("Missing task_id in URL parameters.");
      }
    } catch (e) {
      console.error("Failed to load dynamic submissions roster", e);
      setError("Failed to load student submissions roster. Please try again.");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [fetchWithAuth]);

  // When a student's submission is selected, we fetch full analysis details
  useEffect(() => {
    if (selectedStudentId) {
      setIsLoadingDetail(true);
      setChatMessages([]);
      setGradeDetail(null);
      setLeftView("sheet"); // Always default to handwritten sheet view on student change
      
      fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setSubmissionDetail(json.data);
            
            // Fetch grade details to keep step_grades sync'd
            setIsLoadingGrade(true);
            fetchWithAuth(`${API_BASE}/submissions/${selectedStudentId}/grade`)
              .then(gRes => gRes.json())
              .then(gJson => {
                if (gJson.data) setGradeDetail(gJson.data);
              })
              .catch(e => console.error("Grade details fetch failed", e))
              .finally(() => setIsLoadingGrade(false));
          }
        })
        .catch(e => console.error("Submission details fetch failed", e))
        .finally(() => setIsLoadingDetail(false));
    }
  }, [selectedStudentId, fetchWithAuth]);

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
    if (viewMode !== "self-eval") {
      fetchWorksheets();
    }
  }, [fetchWorksheets, viewMode]);

  useEffect(() => {
    if (viewMode === "self-eval") {
      fetchPractices();
    }
  }, [viewMode, fetchPractices]);

  // ==========================================
  // DERIVED DATA
  // ==========================================
  
  const getFlagColor = (score: number, maxScore: number) => {
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 1.0) return "green-d";
    if (ratio >= 0.9) return "green";
    if (ratio >= 0.8) return "green-l";
    if (ratio >= 0.6) return "red-l";
    if (ratio >= 0.4) return "red";
    return "red-d";
  };

  const activePractice = practiceHistory.find(p => p.id === selectedPracticeId) || null;
  
  const activeStudent = viewMode === "self-eval" && activePractice
    ? {
        id: activePractice.id,
        studentName: "Self Practice",
        avatar: "🎒",
        score: activePractice.score,
        maxScore: activePractice.maxScore,
        flagColor: "white",
        submissionTime: activePractice.date,
        questions: activePractice.steps.map(s => ({ id: s.stepNum.toString(), text: s.text })),
        answers: {}
      }
    : submissionDetail
      ? {
          id: submissionDetail.id,
          studentName: submissionDetail.studentName,
          avatar: submissionDetail.avatar,
          score: submissionDetail.score,
          maxScore: submissionDetail.maxScore,
          flagColor: getFlagColor(submissionDetail.score, submissionDetail.maxScore),
          submissionTime: "N/A",
          questions: submissionDetail.questions && submissionDetail.questions.length > 0
            ? submissionDetail.questions.map((q: any) => ({ id: q.id || q.stepNum?.toString(), text: q.text }))
            : (submissionDetail.steps || []).map((s: any) => ({ id: s.stepNum.toString(), text: s.text })),
          answers: submissionDetail.answers || {}
        }
      : {
          id: "",
          studentName: "Loading...",
          avatar: "?",
          score: 0,
          maxScore: 0,
          flagColor: "white",
          submissionTime: "N/A",
          questions: [],
          answers: {}
        };

  const activeQuestion = viewMode === "self-eval" && activePractice
    ? {
        id: activePractice.id,
        title: activePractice.title,
        topic: "Self Evaluation",
        difficulty: "Self-Guided",
        avgClassScore: 0,
        avgLatency: "0.8s",
        confidence: 100,
        maxMarks: activePractice.maxScore,
        text: activePractice.ocrText || "Private Self Evaluation Workspace"
      }
    : submissionDetail?.questions && submissionDetail.questions.length > 0
      ? {
          id: submissionDetail.questions[selectedQuestionIndex]?.id || (selectedQuestionIndex + 1).toString(),
          title: `Question ${selectedQuestionIndex + 1}`,
          text: submissionDetail.questions[selectedQuestionIndex]?.text || "Subject Question",
          topic: submissionDetail.subject || "",
          difficulty: submissionDetail.difficulty || "Medium",
          confidence: submissionDetail.confidence || 0.95,
          maxMarks: 100.0 / submissionDetail.questions.length,
          points: 100.0 / submissionDetail.questions.length
        }
      : submissionDetail?.steps && submissionDetail.steps.length > 0
        ? {
            id: submissionDetail.steps[selectedQuestionIndex]?.stepNum?.toString() || "",
            title: `Step ${selectedQuestionIndex + 1}`,
            text: submissionDetail.steps[selectedQuestionIndex]?.questionText || submissionDetail.questionText || "Subject Question",
            topic: submissionDetail.subject || "",
            difficulty: submissionDetail.difficulty || "Medium",
            confidence: submissionDetail.confidence || 0.95,
            maxMarks: submissionDetail.steps[selectedQuestionIndex]?.maxMarks || 0,
            points: submissionDetail.steps[selectedQuestionIndex]?.maxMarks || 0
          }
        : {
            id: "",
            title: "Loading...",
            text: "Loading...",
            topic: "",
            difficulty: "",
            confidence: 0,
            maxMarks: 0,
            points: 0
          };

  // We are removing `activeSteps` since we render the student's actual answers via HTML, not fixed steps array.

  // ==========================================
  // ACTIONS
  // ==========================================

  // Adjust marks for the specific active step
  const adjustTotalMarks = async (amt: number) => {
    if (!selectedStudentId || viewMode !== "teacher") return;
    
    // Find active step number (1-indexed based on selectedQuestionIndex)
    const currentStep = submissionDetail?.steps?.[selectedQuestionIndex];
    const stepNum = currentStep ? currentStep.stepNum : (selectedQuestionIndex + 1);
    
    try {
      await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, step_num: stepNum })
      });
      
      // Re-fetch submission details silently to update score instantly
      const res = await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}`);
      const json = await res.json();
      if (json.data) {
        setSubmissionDetail(json.data);
      }
      
      const gRes = await fetchWithAuth(`${API_BASE}/submissions/${selectedStudentId}/grade`);
      const gJson = await gRes.json();
      if (gJson.data) {
        setGradeDetail(gJson.data);
      }
    } catch (e) {
      console.error("Failed to override step marks", e);
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

    const contextStr = activeQuestion ? `\n[Context - Question: ${activeQuestion.text}]` : "";

    try {
      const res = await fetchWithAuth(`${API_BASE}/analysis/submissions/${selectedStudentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend + contextStr })
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
      } else {
        const fallbackText = `Based on the context of the question "${activeQuestion?.text?.substring(0, 40)}...": The work is logical. No marks should be deducted here.`;
        setChatMessages(prev => [...prev, { sender: "ai", text: fallbackText }]);
      }
    } catch (e) {
      console.error("Chat error", e);
      const fallbackText = `Based on the context of the question "${activeQuestion?.text?.substring(0, 40)}...": The work is logical. No marks should be deducted here.`;
      setChatMessages(prev => [...prev, { sender: "ai", text: fallbackText }]);
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
      if (roster.length === 0) {
        fetchWorksheets();
      }
    }
  }, [roster.length, fetchWorksheets, fetchPractices]);

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
            onClick={fetchWorksheets}
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
        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#1f2223",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}>
            
            {/* Logo */}
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: 32, flexShrink: 0 }}>
              <LogoIcon />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>OzymorLab</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }} className="dash-nav-desktop">
              {navItems.map((item) => {
                const active = item.href === "/analysis";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                      background: active ? "rgba(255,255,255,0.12)" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                  >
                    <item.icon size={14} strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link — only for admin/principal */}
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.55)",
                    background: "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"}
                >
                  <ShieldCheck size={14} />
                  Admin
                </Link>
              )}
            </nav>

            {/* Right side: Search + Theme + User */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>



              {/* Search box matching layout.tsx */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "5px 12px",
                width: 220,
                transition: "all 0.2s",
              }}
                className="dash-search-box"
              >
                <Search size={13} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: "#ffffff",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to light" : "Switch to dark"}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {/* User menu avatar and dropdown menu exactly like layout.tsx */}
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 6px 3px 3px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#e0ff82",
                    color: "#1f2223",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    letterSpacing: "-0.02em",
                  }}>
                    {initials}
                  </div>
                  <ChevronDown size={10} style={{ color: "rgba(255,255,255,0.4)", transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                {userMenuOpen && user && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    minWidth: 180,
                    background: "var(--surface-primary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    zIndex: 200,
                  }}>
                    <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{user.full_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{user.email}</div>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 14px",
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-secondary)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <Settings size={13} />
                      Settings
                    </Link>
                    <button
                      onClick={async () => { await logout(); window.location.href = "/login"; }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 14px",
                        fontSize: 13,
                        color: "#E24B4A",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "background 0.1s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-secondary)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Mobile hamburger */}
            <button
              className="dash-nav-mobile-btn"
              onClick={e => { e.stopPropagation(); setMobileMenuOpen(v => !v); }}
              style={{
                display: "none",
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            </button>

          </div>
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            className="dash-nav-mobile-menu"
            style={{
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--surface-primary)",
              padding: "8px 16px 12px",
            }}
            onClick={e => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const active = item.href === "/analysis";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    background: active ? "var(--surface-secondary)" : "transparent",
                    textDecoration: "none",
                    marginBottom: 2,
                  }}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ==========================================
            MAIN CONTAINER WITH PADDING & MARGINS
           ========================================== */}
        <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "4px 20px 4px", display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 0 }}>

          {/* ==========================================
          {/* ==========================================
              2. QUESTION BAR
             ========================================== */}
          <section className="px-4 py-2 flex items-center gap-4 mx-10">
          
          {/* Question Selector */}
          <div className="flex-1 flex items-center gap-2">
            {isLoadingRoster ? (
              <div className="flex-1 h-12 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center px-4" style={{ color: "var(--text-tertiary)" }}>
                <Loader2 className="animate-spin mr-2 text-[var(--text-primary)]" size={16} />
                <span className="text-[12.5px] font-medium">Loading submissions...</span>
              </div>
            ) : leftView === "sheet" && viewMode !== "self-eval" ? (
              /* Sheet mode: show student name + total score, no step picker */
              <div className="flex-1 flex gap-2 items-center">
                <div className="flex-1 h-10 px-4 text-[13.5px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                  {viewMode === "teacher" ? activeStudent.studentName : "My Submission"}
                </div>
                <div className="h-10 flex items-center px-4 flex-shrink-0 border border-[var(--border-subtle)] rounded-xl">
                  <span className="text-[13px] font-mono font-bold text-[var(--text-primary)]">
                    {submissionDetail
                      ? `${submissionDetail.score?.toFixed(1) ?? "—"} / ${submissionDetail.maxScore?.toFixed(1) ?? "—"} pts`
                      : "— pts"}
                  </span>
                </div>
              </div>
            ) : (
              /* Transcript mode: show step label + per-step mark adjuster */
              <div className="flex-1 flex gap-2">
                <div className="flex-1 h-10 px-4 text-[13.5px] font-bold text-[var(--text-primary)] flex items-center">
                  {viewMode === "teacher"
                    ? `${activeStudent.studentName} — Step ${selectedQuestionIndex + 1}`
                    : `Step ${selectedQuestionIndex + 1}`}
                </div>

                {/* Marks Box (Points adjustments) */}
                <div className="h-10 flex items-center overflow-hidden flex-shrink-0 border border-[var(--border-subtle)] rounded-xl">
                  <div className="px-4 text-center">
                    <span className="text-[13px] font-mono font-bold text-[var(--text-primary)]">
                      {gradeDetail?.step_grades?.[selectedQuestionIndex]
                        ? `${gradeDetail.step_grades[selectedQuestionIndex].marks_awarded.toFixed(1)} / ${gradeDetail.step_grades[selectedQuestionIndex].max_marks.toFixed(1)} pts`
                        : submissionDetail?.steps?.[selectedQuestionIndex]
                          ? `${submissionDetail.steps[selectedQuestionIndex].marks.toFixed(1)} / ${submissionDetail.steps[selectedQuestionIndex].maxMarks.toFixed(1)} pts`
                          : "— pts"}
                    </span>
                  </div>
                  
                  {viewMode === "teacher" ? (
                    <div className="flex flex-col h-full">
                      <button
                        onClick={() => adjustTotalMarks(0.5)}
                        className="w-7 flex-1 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] hover:text-brand-600 hover:bg-[var(--surface-secondary)] cursor-pointer"
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
              </div>
            )}
            
            </div>
  
            {/* Confidence Score Display (Text) */}
            <div className="h-10 px-3.5 flex items-center justify-center flex-shrink-0 text-[12px] font-bold font-mono text-[var(--text-secondary)]"
              title="AI Grading Confidence Score"
            >
              Confidence: {((submissionDetail?.confidence || activeQuestion.confidence || 0.95) * 100).toFixed(0)}%
            </div>
  
            {/* Save Button (Agree with AI replacement) */}
            <button
              onClick={() => {
                if (viewMode === "teacher") {
                  if (leftView === "transcript") {
                    // Transcript mode: advance step by step, then next student
                    const numSteps = submissionDetail?.steps?.length || 0;
                    if (selectedQuestionIndex < numSteps - 1) {
                      setSelectedQuestionIndex(prev => prev + 1);
                    } else {
                      const currentStudentIndex = roster.findIndex(w => w.id === selectedStudentId);
                      if (currentStudentIndex !== -1 && currentStudentIndex < roster.length - 1) {
                        setSelectedStudentId(roster[currentStudentIndex + 1].id);
                        setSelectedQuestionIndex(0);
                      } else {
                        setAgreedSubmissions(prev => ({ ...prev, [selectedStudentId]: true }));
                      }
                    }
                  } else {
                    // Sheet mode: advance directly to next student
                    const currentStudentIndex = roster.findIndex(w => w.id === selectedStudentId);
                    if (currentStudentIndex !== -1 && currentStudentIndex < roster.length - 1) {
                      setSelectedStudentId(roster[currentStudentIndex + 1].id);
                      setSelectedQuestionIndex(0);
                    } else {
                      setAgreedSubmissions(prev => ({ ...prev, [selectedStudentId]: true }));
                    }
                  }
                  setChatMessages([]);
                }
              }}
              className="h-10 px-4 rounded-xl text-[12.5px] font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 border"
              style={{
                background: agreedSubmissions[selectedStudentId] ? "rgba(16,185,129,0.1)" : "var(--text-primary)",
                color: agreedSubmissions[selectedStudentId] ? "#10b981" : "var(--surface-primary)",
                borderColor: agreedSubmissions[selectedStudentId] ? "rgba(16,185,129,0.3)" : "transparent"
              }}
            >
              {agreedSubmissions[selectedStudentId] ? <CheckCircle2 size={16} /> : <Check size={16} />}
              {agreedSubmissions[selectedStudentId] ? "Saved" : "Save & Next"}
            </button>
          </section>

          {/* ==========================================
              3. BODY LAYOUT
             ========================================== */}
          <div className="analysis-body-scroll flex flex-1 min-h-0 border border-[var(--border-subtle)] bg-[var(--surface-primary)] rounded-xl overflow-hidden shadow-sm mx-10" style={{ height: "calc(100vh - 118px)", maxHeight: "calc(100vh - 118px)" }}>

          {/* ==========================================
              3A. SIDEBAR
             ========================================== */}
          <aside className="w-14 flex flex-col items-center gap-3 py-4 border-r border-[var(--border-subtle)] overflow-y-auto shrink-0 bg-[var(--surface-primary)]">
            
            {/* ── SHEET VIEW: show student selector buttons (teacher), or nothing (student) ── */}
            {(leftView === "sheet" || viewMode === "self-eval") && viewMode === "teacher" && roster.map((worksheet, index) => {
              const isSelected = selectedStudentId === worksheet.id;
              const initial = worksheet.studentName ? worksheet.studentName.substring(0, 2).toUpperCase() : `S${index+1}`;
              return (
                <button
                  key={worksheet.id}
                  onClick={() => {
                    setSelectedStudentId(worksheet.id);
                    setSelectedQuestionIndex(0);
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
                  title={worksheet.studentName}
                >
                  {initial}
                </button>
              );
            })}

            {/* ── TRANSCRIPT VIEW: show per-step/question tabs ── */}
            {leftView === "transcript" && viewMode === "teacher" && submissionDetail?.steps?.map((step: any, index: number) => {
              const isSelected = selectedQuestionIndex === index;
              const scoreRatio = step.maxMarks > 0 ? step.marks / step.maxMarks : 0;
              const dotColor = scoreRatio >= 0.9 ? "#10b981" : scoreRatio >= 0.6 ? "#f59e0b" : "#ef4444";
              return (
                <button
                  key={step.stepNum || index}
                  onClick={() => {
                    setSelectedQuestionIndex(index);
                    setHighlightedStep(null);
                    setChatMessages([]);
                    // Scroll the transcript step card into view
                    setTimeout(() => {
                      const el = document.getElementById(`step-card-${step.stepNum}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 50);
                  }}
                  className={`w-9 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] transition-all flex-shrink-0 cursor-pointer relative ${
                    isSelected ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-[var(--surface-primary)] scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ 
                    background: isSelected ? "var(--text-primary)" : "var(--surface-secondary)",
                    color: isSelected ? "var(--surface-primary)" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)"
                  }}
                  title={`Step ${step.stepNum}: ${step.marks}/${step.maxMarks} pts`}
                >
                  S{step.stepNum}
                  {/* Colour dot indicating score */}
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[var(--surface-primary)]"
                    style={{ background: dotColor }}
                  />
                </button>
              );
            })}

            {/* ── TRANSCRIPT VIEW student mode: question tabs ── */}
            {leftView === "transcript" && viewMode === "student" && activeStudent?.questions?.map((question: any, index: number) => {
              const isSelected = selectedQuestionIndex === index;
              return (
                <button
                  key={question.id || index}
                  onClick={() => {
                    setSelectedQuestionIndex(index);
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
                  title={question.text}
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
            <div className="h-10 px-6 flex items-center justify-between border-b text-xs text-[var(--text-secondary)] flex-shrink-0 font-medium" style={{ background: "var(--surface-primary)", borderBottomColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                {isLoadingDetail ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-[var(--text-primary)]" size={12} />
                    <span>Loading submission details...</span>
                  </div>
                ) : activeStudent.studentName ? (
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[var(--text-secondary)]" />
                    <span className="font-bold uppercase tracking-wider text-[var(--text-primary)]" style={{ fontSize: "11px" }}>
                      {activeStudent.studentName}
                    </span>
                  </div>
                ) : (
                  <span>No submission selected</span>
                )}
              </div>

              {/* Sheet / Transcript toggle — only shown when a submission with a sheet is loaded */}
              {!isCreatingPractice && viewMode !== "self-eval" && (
                <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
                  <button
                    onClick={() => setLeftView("sheet")}
                    className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                    style={{
                      background: leftView === "sheet" ? "var(--text-primary)" : "transparent",
                      color: leftView === "sheet" ? "var(--surface-primary)" : "var(--text-secondary)"
                    }}
                  >
                    <FileText size={11} />
                    Sheet
                  </button>
                  <button
                    onClick={() => setLeftView("transcript")}
                    className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                    style={{
                      background: leftView === "transcript" ? "var(--text-primary)" : "transparent",
                      color: leftView === "transcript" ? "var(--surface-primary)" : "var(--text-secondary)"
                    }}
                  >
                    <BookOpen size={11} />
                    Transcript
                  </button>
                </div>
              )}
            </div>

            {/* Double-Pane Workspace (Left Pane 70% / Right Pane 30%) */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[var(--surface-secondary)]">
              
              {/* LEFT PANE: Digital Manuscript (70% width) */}
              <div className="flex-[7] p-4 overflow-y-auto border-r border-[var(--border-subtle)] flex flex-col" style={{ background: "var(--surface-secondary)", minHeight: "220px" }}>
                
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
                        style={{
                          border: "1px solid var(--border-default)",
                          background: "transparent",
                          color: "var(--text-primary)",
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "12.5px"
                        }}
                        className="flex-1 py-2.5 transition-all hover:bg-[var(--surface-secondary)] cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRunPracticeGrading}
                        disabled={isGradingPractice || !practiceFile || !practiceRubric}
                        style={{
                          background: "var(--text-primary)",
                          color: "var(--surface-primary)",
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "12.5px",
                          border: "none"
                        }}
                        className="flex-1 py-2.5 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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
                    {activeQuestion.text && (
                      <div className="mb-2 py-4 px-6 mx-4 flex flex-col justify-center bg-transparent border-none shadow-none" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                        <span className="text-[10px] uppercase font-mono font-bold block mb-2 text-[var(--text-tertiary)] tracking-wider">
                          {viewMode === "self-eval" ? "Practice Exercise" : "Assigned Question"}
                        </span>
                        <div 
                          className="text-[14.5px] leading-relaxed font-mono font-bold text-[var(--text-primary)]"
                          dangerouslySetInnerHTML={{ __html: activeQuestion.text }}
                        />
                      </div>
                    )}

                    {/* ── SHEET VIEW (default): Original handwritten answer sheet ── */}
                    {(leftView === "sheet" || viewMode === "self-eval") && (
                      <div className="flex-1 min-h-[180px] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden flex flex-col"
                        style={{ background: "var(--surface-secondary)" }}>
                        {isLoadingDetail ? (
                          <div className="flex items-center justify-center h-full py-16">
                            <Loader2 className="animate-spin text-[var(--text-primary)]" size={24} />
                          </div>
                        ) : submissionDetail?.sheetUrl ? (
                          <div className="flex-1 overflow-y-auto flex flex-col items-center p-4 gap-3">
                            {/* Score summary ribbon */}
                            <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm mb-1">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Answer Sheet
                              </span>
                              <span className="text-[12px] font-mono font-bold text-[var(--text-primary)] bg-brand-500/10 text-brand-600 px-3 py-0.5 rounded-lg">
                                {submissionDetail.score?.toFixed(1) ?? "—"} / {submissionDetail.maxScore?.toFixed(1) ?? "—"} pts
                              </span>
                            </div>
                            {/* Render PDF pages or image */}
                            {submissionDetail.fileType === "pdf" ? (
                              <iframe
                                src={submissionDetail.sheetUrl}
                                title="Answer Sheet"
                                className="w-full rounded-xl border border-[var(--border-subtle)]"
                                style={{ minHeight: "70vh", background: "#fff" }}
                              />
                            ) : (
                              <img
                                src={submissionDetail.sheetUrl}
                                alt="Handwritten answer sheet"
                                className="w-full rounded-xl border border-[var(--border-subtle)] shadow-sm"
                                style={{ objectFit: "contain", background: "#fff" }}
                              />
                            )}
                          </div>
                        ) : activeStudent.answers && activeStudent.answers[activeQuestion.id] ? (
                          /* ClassroomWorksheet — typed HTML answer */
                          <div className="flex-1 p-6 overflow-y-auto">
                            <div
                              className="bg-[var(--surface-primary)] p-6 rounded-lg border border-[var(--border-subtle)] shadow-sm text-[14px] text-[var(--text-primary)] min-h-[300px]"
                              dangerouslySetInnerHTML={{ __html: activeStudent.answers[activeQuestion.id] }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-[12px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-bold">
                            <FileText size={32} className="opacity-30" />
                            No answer sheet available
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── TRANSCRIPT VIEW: OCR text + step-by-step grading ── */}
                    {leftView === "transcript" && viewMode !== "self-eval" && (
                      <div className="flex-1 min-h-[180px] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden flex flex-col"
                        style={{
                          background: "var(--surface-secondary)",
                          backgroundImage: "radial-gradient(var(--border-strong) 1.5px, transparent 1.5px)",
                          backgroundSize: "18px 18px"
                        }}>
                        <div className="flex-1 p-6 relative overflow-y-auto flex flex-col gap-4">
                          {isLoadingDetail ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="animate-spin text-[var(--text-primary)]" size={24} />
                            </div>
                          ) : submissionDetail?.steps && submissionDetail.steps.length > 0 ? (
                            <>
                              {/* Total score ribbon */}
                              <div className="flex items-center justify-between px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                  Graded Transcript
                                </span>
                                <span className="text-[12px] font-mono font-bold text-brand-600 bg-brand-500/10 px-3 py-0.5 rounded-lg">
                                  {submissionDetail.score?.toFixed(1) ?? "—"} / {submissionDetail.maxScore?.toFixed(1) ?? "—"} pts
                                </span>
                              </div>

                              {submissionDetail.steps.map((step: any, index: number) => {
                                const isSelected = selectedQuestionIndex === index;
                                const hasError = step.marks < step.maxMarks || step.errorType;
                                const scoreRatio = step.maxMarks > 0 ? step.marks / step.maxMarks : 0;

                                return (
                                  <div
                                    key={step.stepNum || index}
                                    id={`step-card-${step.stepNum}`}
                                    onClick={() => setSelectedQuestionIndex(index)}
                                    className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm relative flex flex-col gap-3 ${
                                      isSelected
                                        ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-[var(--surface-secondary)] border-brand-500 bg-[var(--surface-primary)]"
                                        : "border-[var(--border-subtle)] bg-[var(--surface-primary)]/80 hover:bg-[var(--surface-primary)] hover:border-[var(--border-default)]"
                                    } ${
                                      hasError && isSelected
                                        ? "shadow-md shadow-red-500/5 bg-gradient-to-br from-[var(--surface-primary)] to-red-500/5"
                                        : ""
                                    }`}
                                  >
                                    {/* Step Header with score */}
                                    <div className="flex justify-between items-center">
                                      <span className="text-[12px] font-bold font-mono uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                                        <Sparkles size={13} />
                                        Step {step.stepNum}
                                        {step.type && step.type !== "Calculation" && (
                                          <span className="text-[9px] font-normal text-[var(--text-tertiary)] normal-case tracking-normal font-sans ml-1">
                                            · {step.type}
                                          </span>
                                        )}
                                      </span>

                                      <div className="flex items-center gap-2">
                                        {hasError && (
                                          <span className="text-[9.5px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                            <AlertTriangle size={10} />
                                            {step.errorType || "Deduction"}
                                          </span>
                                        )}
                                        {/* Colour-coded score pill */}
                                        <span
                                          className="text-[12px] font-bold font-mono px-2.5 py-0.5 rounded-lg"
                                          style={{
                                            background: scoreRatio >= 0.9 ? "rgba(16,185,129,0.12)" : scoreRatio >= 0.6 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                                            color: scoreRatio >= 0.9 ? "#10b981" : scoreRatio >= 0.6 ? "#f59e0b" : "#ef4444"
                                          }}
                                        >
                                          {step.marks.toFixed(1)} / {step.maxMarks.toFixed(1)} pts
                                        </span>
                                      </div>
                                    </div>

                                    {/* Rubric question context */}
                                    {step.questionText && (
                                      <p className="text-[11.5px] text-[var(--text-tertiary)] font-medium italic border-l-2 border-brand-500/30 pl-3">
                                        {step.questionText}
                                      </p>
                                    )}

                                    {/* OCR transcribed answer text */}
                                    {step.text && (
                                      <p className="text-[13.5px] leading-relaxed text-[var(--text-primary)] font-medium">
                                        {step.text}
                                      </p>
                                    )}

                                    {/* Rendered LaTeX / math expression */}
                                    {step.latex && (
                                      <div className="bg-[var(--surface-secondary)] px-4 py-3 rounded-xl border border-[var(--border-subtle)] overflow-x-auto">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1.5">Math Expression</span>
                                        {/* Render LaTeX using MathJax-style inline HTML — wrap in span so browser renders it */}
                                        <div
                                          className="font-mono text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words"
                                          style={{ fontFamily: "'Courier New', Courier, monospace" }}
                                          dangerouslySetInnerHTML={{
                                            __html: step.latex
                                              // Convert $$...$$ display math
                                              .replace(/\$\$([\s\S]+?)\$\$/g, (_: string, m: string) =>
                                                `<span style="display:block;text-align:center;padding:4px 0;font-size:14px;">${m.trim()}</span>`)
                                              // Convert $...$ inline math
                                              .replace(/\$([^$\n]+?)\$/g, (_: string, m: string) =>
                                                `<em style="font-style:normal;font-weight:600;">${m.trim()}</em>`)
                                          }}
                                        />
                                      </div>
                                    )}

                                    {/* Cropped diagram image if present */}
                                    {step.diagramUrl && (
                                      <div className="mt-2 border border-[var(--border-subtle)] rounded-xl overflow-hidden max-w-md bg-[var(--surface-secondary)]">
                                        <img
                                          src={step.diagramUrl}
                                          alt={`Diagram for Step ${step.stepNum}`}
                                          style={{ maxHeight: "250px", objectFit: "contain", margin: "0 auto", display: "block" }}
                                        />
                                      </div>
                                    )}

                                    {/* AI grading justification */}
                                    {step.justification && (
                                      <div className={`mt-1 text-[12.5px] flex flex-col gap-2 border rounded-xl p-4 ${
                                        hasError
                                          ? "bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-400"
                                          : "bg-brand-500/5 border-brand-500/10"
                                      }`}>
                                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[var(--text-secondary)]">
                                          <Sparkles size={11} className="text-brand-600" />
                                          AI Grading Rationale
                                        </div>
                                        <div className="whitespace-pre-line leading-relaxed text-[13px] text-[var(--text-primary)]">
                                          {step.justification}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          ) : activeStudent.answers && activeStudent.answers[activeQuestion.id] ? (
                            <div
                              className="bg-[var(--surface-primary)] p-6 rounded-lg border border-[var(--border-subtle)] shadow-sm text-[14px] text-[var(--text-primary)] min-h-[300px]"
                              dangerouslySetInnerHTML={{ __html: activeStudent.answers[activeQuestion.id] }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-[12px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-bold">
                              <BookOpen size={32} className="opacity-30" />
                              No transcript available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* RIGHT PANE: AI Step Traces / Conversation (30% width) */}
              <div 
                ref={rightPaneRef}
                className="flex-[3] flex flex-col overflow-hidden bg-[var(--surface-primary)]"
                style={{
                  border: "1px solid var(--border-subtle)",
                  margin: "12px",
                  borderRadius: "16px",
                }}
              >
                {/* Scrollable conversation content */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scroll-smooth analysis-body-scroll">
                <div className="flex items-center justify-between border-b pb-3 flex-shrink-0" style={{ borderBottomColor: "var(--border-subtle)" }}>
                  <h3 className="font-semibold text-[15px] flex items-center gap-2 text-[var(--text-primary)]">
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
                      <rect width="28" height="28" rx="8" fill="#1f2223" />
                      <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
                      <circle cx="14" cy="14" r="3" fill="#1f2223" />
                    </svg>
                    Conversation
                  </h3>
                </div>

                {isLoadingDetail || isLoadingGrade ? (
                  <div className="flex items-center justify-center flex-1">
                    <Loader2 className="animate-spin text-[var(--text-primary)]" size={24} />
                  </div>
                ) : (
                  <div className="py-4 px-6 relative flex flex-col gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold font-mono uppercase text-[var(--text-secondary)]">
                        Question Score
                      </span>
                      <span className="text-[13px] font-bold font-mono text-[var(--text-primary)] bg-brand-500/10 text-brand-600 px-3 py-1 rounded-lg">
                        {gradeDetail && gradeDetail.step_grades && gradeDetail.step_grades[selectedQuestionIndex]
                          ? `${gradeDetail.step_grades[selectedQuestionIndex].marks_awarded} / ${gradeDetail.step_grades[selectedQuestionIndex].max_marks} pts`
                          : activeQuestion.points ? `${(activeQuestion.points * 0.85).toFixed(1)} / ${activeQuestion.points} pts` : "Auto-Graded"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-[var(--border-subtle)] pt-4">
                      <span className="text-[11px] font-bold font-mono uppercase text-brand-600 flex items-center gap-1.5">
                        <Sparkles size={12} />
                        OzymorLab Analysis
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed font-medium">
                      {gradeDetail && gradeDetail.step_grades && gradeDetail.step_grades[selectedQuestionIndex]
                        ? gradeDetail.step_grades[selectedQuestionIndex].justification
                        : activeStudent.answers && activeStudent.answers[activeQuestion.id] 
                          ? `OzymorLab analysis has graded this submission. Overall grade assignment: ${activeStudent.score || "Verified"}.`
                          : "No answer provided for this question, so no step traces or analysis can be generated."}
                    </p>
                  </div>
                )}

                {/* Copilot Chat Conversation History */}
                {(chatMessages.length > 0 || isTyping) && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11.5px] uppercase font-mono font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-brand-600" />
                        AI Copilot Chat
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase rounded-lg border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-secondary)] bg-[var(--surface-secondary)]">
                        {chatMessages.length} Messages
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 max-w-[90%] ${
                            msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[9px] flex-shrink-0 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                            {msg.sender === "ai" ? "AI" : "U"}
                          </div>

                          <div className={`p-2.5 rounded-xl text-xs leading-relaxed border border-[var(--border-subtle)] ${
                            msg.sender === "ai" 
                              ? "bg-[var(--surface-secondary)] text-[var(--text-primary)]" 
                              : "bg-[var(--surface-primary)] text-[var(--text-primary)]"
                          }`}>
                            <p>{msg.text}</p>
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
                  </div>
                )}
                </div>

                {/* Chat Input Box pinned at bottom of conversation tab */}
                <div 
                  className="flex flex-col border-t flex-shrink-0"
                  style={{
                    borderTopColor: "var(--border-subtle)",
                    background: "var(--surface-primary)",
                  }}
                >
                  {/* Highlight Banner */}
                  {highlightedStep && (
                    <div className="px-3 py-1.5 mx-4 mt-2 text-xs flex items-center justify-between rounded-lg flex-shrink-0" 
                      style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                      <div className="flex items-center gap-2">
                        <Sparkles size={12} className="animate-pulse" />
                        <span>Step <strong className="font-mono">{highlightedStep}</strong></span>
                      </div>
                      <button 
                        onClick={() => setHighlightedStep(null)} 
                        className="text-[10px] uppercase tracking-wider font-bold hover:underline cursor-pointer ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {/* Horizontal container for +, textarea, and logo to keep them vertically centered */}
                  <div className="flex items-center gap-3 px-4 py-2 min-h-[52px]">
                    <button 
                      className="w-7 h-7 rounded-full border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                      title="Add attachment"
                    >
                      <Plus size={16} />
                    </button>
                    <textarea
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat(chatInput);
                        }
                      }}
                      placeholder="Ask you doubt please"
                      className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder-gray-500 px-2 py-1.5 resize-none self-center"
                      disabled={!selectedStudentId}
                      rows={1}
                      style={{ minHeight: '26px', maxHeight: '120px' }}
                    />
                    <button 
                      onClick={() => handleSendChat(chatInput)}
                      className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all cursor-pointer flex-shrink-0"
                      title="Send message"
                      disabled={!chatInput.trim() || !selectedStudentId}
                      style={{ opacity: chatInput.trim() ? 1 : 0.4 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="8" fill="#1f2223" />
                        <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
                        <circle cx="14" cy="14" r="3" fill="#1f2223" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-[var(--text-tertiary)] pb-2 font-medium">AI can make mistakes, please double check it.</p>
                </div>
              </div>

            </div>

          </main>

        </div>

      </div>

      </div>

      <style>{`
        .dash-nav-desktop { display: flex !important; }
        .dash-nav-mobile-btn { display: none !important; }
        .dash-nav-mobile-menu { display: none; }

        /* Hide scrollbar on body layout but keep scrolling */
        .analysis-body-scroll,
        .analysis-body-scroll * {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .analysis-body-scroll::-webkit-scrollbar,
        .analysis-body-scroll *::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        @media (max-width: 900px) {
          .dash-nav-desktop { display: none !important; }
          .dash-nav-mobile-btn { display: flex !important; }
          .dash-nav-mobile-menu { display: block !important; }
          .dash-search-box { display: none !important; }
        }
      `}</style>

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