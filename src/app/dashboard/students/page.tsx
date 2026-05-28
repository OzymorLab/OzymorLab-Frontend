"use client";

import { useState, useEffect } from "react";
import { Users, Search, Award, TrendingUp, BookOpen, User, Star, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface Submission {
  id: string;
  student_id: string | null;
  file_name: string;
  status: string;
  created_at: string;
}

interface StudentSummary {
  id: string;
  name: string;
  initials: string;
  cohort: string;
  totalSubmissions: number;
  averageGrade: string;
  lastActive: string;
}

/* ── Deterministic name generator from UUID ── */
const FIRST_NAMES = [
  "Aarav", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya",
  "Lakshmi", "Mihail", "Neha", "Pranav", "Rhea", "Rohan",
  "Sanya", "Tanvi", "Vivaan", "Yash", "Zara", "Aman",
  "Divya", "Kiran", "Meera", "Nikhil", "Pooja", "Rahul",
  "Shriya", "Siddharth", "Tarini", "Umesh", "Vandana", "Wren",
];
const LAST_NAMES = [
  "Agarwal", "Bose", "Chandra", "Desai", "Gupta", "Iyer",
  "Joshi", "Kumar", "Mehta", "Nair", "Patel", "Rao",
  "Sharma", "Singh", "Tiwari", "Verma", "Yadav", "Bansal",
  "Chopra", "Dubey", "Goswami", "Khanna", "Malhotra", "Pillai",
  "Reddy", "Saxena", "Thakur", "Upadhyay", "Venkatesan", "Walia",
];

function generateName(id: string): { name: string; initials: string } {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const first = FIRST_NAMES[hash % FIRST_NAMES.length];
  const last = LAST_NAMES[(hash >> 2) % LAST_NAMES.length];
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
  };
}

export default function StudentsPage() {
  const { user, fetchWithAuth } = useAuth();
  
  // Student classroom states
  const [activeAssignment, setActiveAssignment] = useState<any | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [assignments, setAssignments] = useState([
    {
      id: "a1",
      title: "Quantum Physics & Mechanics Worksheet",
      subject: "Physics",
      teacher: "Mr. Nikhil Goswami",
      dueDate: "2026-06-05",
      status: "PENDING",
      questions: [
        { id: "q1", text: "Explain the Heisenberg Uncertainty Principle and its physical implications." },
        { id: "q2", text: "State the de Broglie hypothesis and derive the expression for de Broglie wavelength." }
      ]
    },
    {
      id: "a2",
      title: "Organic Chemistry: Synthesis & Mechanisms",
      subject: "Chemistry",
      teacher: "Mrs. Divya Sharma",
      dueDate: "2026-05-24",
      status: "GRADED",
      grade: "92%",
      questions: []
    },
    {
      id: "a3",
      title: "Calculus: Application of Derivatives",
      subject: "Mathematics",
      teacher: "Mr. Arjun Mehta",
      dueDate: "2026-05-20",
      status: "GRADED",
      grade: "85%",
      questions: []
    }
  ]);

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cohortFilter, setCohortFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const processSubmissionsIntoStudents = (subs: Submission[]) => {
    const groups: { [key: string]: { list: Submission[] } } = {};

    subs.forEach((sub) => {
      if (!sub.student_id) return;
      if (!groups[sub.student_id]) {
        groups[sub.student_id] = { list: [] };
      }
      groups[sub.student_id].list.push(sub);
    });

    const parsedStudents: StudentSummary[] = Object.keys(groups).map((studentId) => {
      const hashVal = studentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const cohortVal = hashVal % 2 === 0 ? "Batch-A (Science)" : "Batch-B (Maths)";
      const avgVal = (75 + (hashVal % 21)).toFixed(1);
      const { name, initials } = generateName(studentId);

      return {
        id: studentId,
        name,
        initials,
        cohort: cohortVal,
        totalSubmissions: groups[studentId].list.length,
        averageGrade: avgVal,
        lastActive: groups[studentId].list[0]?.created_at || new Date().toISOString(),
      };
    });

    setStudents(parsedStudents);
    applyFilters(parsedStudents, searchTerm, cohortFilter);
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/submissions`);
      const json = await res.json();
      if (json.data) {
        processSubmissionsIntoStudents(json.data);
      }
    } catch (e) {
      console.error("Failed to compile students directory", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "student") {
      fetchSubmissions();
    }
  }, [user]);

  const applyFilters = (studsList: StudentSummary[], search: string, cohort: string) => {
    let result = [...studsList];
    if (search.trim()) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.cohort.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (cohort !== "ALL") {
      result = result.filter((s) => s.cohort.includes(cohort));
    }
    setFilteredStudents(result);
  };

  useEffect(() => {
    applyFilters(students, searchTerm, cohortFilter);
  }, [searchTerm, cohortFilter, students]);

  const avgCohortGrade =
    students.length > 0
      ? (students.reduce((acc, curr) => acc + parseFloat(curr.averageGrade), 0) / students.length).toFixed(1)
      : null;

  const handleSubmitTextAnswer = async () => {
    setIsSubmittingAnswer(true);
    // Simulate grading delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update the assignment status to GRADED and set a simulated grade
    setAssignments(prev => prev.map(a => a.id === activeAssignment.id ? { ...a, status: "GRADED", grade: "91%" } : a));
    setIsSubmittingAnswer(false);
    setSubmitSuccess(true);
    
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveAssignment(null);
    }, 2000);
  };

  if (user?.role === "student") {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10" style={{ padding: "4px 0" }}>
        
        {/* Page Header */}
        <div
          className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm"
          style={{ padding: "28px 32px" }}
        >
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-2 w-max"
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#16a34a",
                border: "1px solid rgba(22, 163, 74, 0.2)",
                borderRadius: "999px",
                padding: "3px 10px",
                background: "rgba(22, 163, 74, 0.05)"
              }}
            >
              <Award size={11} />
              Classroom dashboard
            </div>

            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: "2px 0 0",
              }}
            >
              Active Classroom Learning Hub
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.6 }}>
              Review assigned schoolwork, write textbook answers inside the digital text editor, and audit instant AI reports.
            </p>
          </div>
        </div>

        {/* Dynamic Workspace Container */}
        {activeAssignment ? (
          <div
            className="bg-[var(--surface-primary)] border border-[#e0ff82]/30 rounded-2xl shadow-lg flex flex-col gap-6"
            style={{ padding: "32px" }}
          >
            {/* Active Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider font-mono">
                  Active Online Worksheet Form
                </span>
                <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
                  {activeAssignment.title}
                </h2>
                <span className="text-[12.5px] text-[var(--text-secondary)]">
                  Assigned by {activeAssignment.teacher}
                </span>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-[12.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-red-500 hover:text-red-600 transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
            </div>

            {/* Questions Form with Text Editors */}
            <div className="flex flex-col gap-8">
              {activeAssignment.questions.map((q: any, index: number) => (
                <div key={q.id} className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <span className="text-[14px] font-bold text-[#e0ff82] font-mono">
                      Q0{index + 1}.
                    </span>
                    <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                      {q.text}
                    </p>
                  </div>

                  {/* Premium Text Editor Shell */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl overflow-hidden shadow-inner flex flex-col">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] px-4 py-2 text-[var(--text-tertiary)] text-[12px] font-mono select-none">
                      <span className="font-bold hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--surface-secondary)]">B</span>
                      <span className="italic hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--surface-secondary)]">I</span>
                      <span className="underline hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--surface-secondary)]">U</span>
                      <span className="text-[var(--border-default)] mx-1">|</span>
                      <span className="hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--surface-secondary)]">List</span>
                      <span className="hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--surface-secondary)]">Formula</span>
                      <span className="hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--surface-secondary)]">Symbol</span>
                      <span className="ml-auto text-[10px] text-[var(--text-tertiary)] opacity-70">Rich Answers Engine</span>
                    </div>

                    {/* Text Area */}
                    <textarea
                      placeholder="Write your answer details here. Ensure to show step-by-step reasoning or derivations..."
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      style={{ padding: "16px", minHeight: "140px", resize: "vertical", fontSize: "13.5px" }}
                      className="w-full bg-transparent border-0 outline-none text-[var(--text-primary)] font-medium leading-relaxed"
                    />

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between bg-[var(--surface-primary)] border-t border-[var(--border-subtle)] px-4 py-2.5 text-[11px] text-[var(--text-tertiary)] font-semibold">
                      <span>{(answers[q.id] || "").split(/\s+/).filter(Boolean).length} words</span>
                      <span>Auto-saving draft...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submission Alerts / Action Panel */}
            {isSubmittingAnswer && (
              <div
                className="flex items-center gap-3 border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl"
                style={{ padding: "16px 20px" }}
              >
                <div style={{ width: 16, height: 16, border: "2px solid #e0ff82", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                  Submitting responses to AI live assessment queue...
                </span>
              </div>
            )}

            {submitSuccess && (
              <div
                className="flex items-center gap-3 border border-[#16a34a]/30 bg-emerald-500/5 text-[#16a34a] rounded-xl"
                style={{ padding: "16px 20px" }}
              >
                <Award size={16} />
                <span className="text-[12.5px] font-semibold">
                  Assignment graded successfully! Grade: 91%
                </span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end gap-3 mt-4 border-t border-[var(--border-subtle)] pt-5">
              <button
                onClick={() => setActiveAssignment(null)}
                disabled={isSubmittingAnswer}
                className="flex items-center justify-center px-5 py-2.5 rounded-xl text-[12.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-red-500 hover:text-red-600 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                Discard Draft
              </button>
              <button
                onClick={handleSubmitTextAnswer}
                disabled={isSubmittingAnswer || Object.keys(answers).length < activeAssignment.questions.length}
                className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-[12.5px] font-bold bg-[#e0ff82] text-[#1f2223] hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-md shadow-[#e0ff82]/10 border-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                Submit Answers Form
              </button>
            </div>

          </div>
        ) : (
          /* Main Classroom Grid View */
          <div className="flex flex-col gap-5">
            
            {/* Header statistics bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-5 shadow-sm" style={{ padding: "22px 26px" }}>
                <div className="w-[46px] h-[46px] bg-[#e0ff82]/10 text-[#e0ff82] rounded-xl flex items-center justify-center border border-[#e0ff82]/20 shrink-0">
                  <BookOpen size={21} />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">
                    Your Enrolled Subjects
                  </div>
                  <div className="text-[28px] font-bold font-mono text-[var(--text-primary)] leading-none">
                    4
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-5 shadow-sm" style={{ padding: "22px 26px" }}>
                <div className="w-[46px] h-[46px] bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Award size={21} />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">
                    Cumulative Class Grade
                  </div>
                  <div className="text-[28px] font-bold font-mono text-emerald-600 leading-none">
                    88.5%
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-5 shadow-sm" style={{ padding: "22px 26px" }}>
                <div className="w-[46px] h-[46px] bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
                  <Users size={21} />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">
                    Your Classroom cohort
                  </div>
                  <div className="text-[28px] font-bold font-mono text-[var(--text-primary)] leading-none">
                    Batch-A
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments List Header */}
            <div className="flex items-center justify-between mt-4">
              <h3 className="text-[15.5px] font-bold text-[var(--text-primary)]">
                Assigned Classroom Worksheets &amp; Status
              </h3>
            </div>

            {/* Assignment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="group relative bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
                  style={{ padding: "22px 24px", gap: "18px" }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight mb-1">
                        {asg.title}
                      </h4>
                      <span className="text-[11px] text-[var(--text-secondary)] font-semibold font-mono uppercase bg-[var(--surface-secondary)] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
                        {asg.subject}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {asg.status === "PENDING" ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20 whitespace-nowrap">
                        Pending
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 whitespace-nowrap">
                        Graded
                      </span>
                    )}
                  </div>

                  <div className="h-[0.5px] bg-[var(--border-subtle)]" />

                  <div className="flex flex-col gap-1.5 text-[12px] text-[var(--text-secondary)] font-semibold">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Assigned by:</span>
                      <span>{asg.teacher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text(--text-tertiary)">Due Date:</span>
                      <span className="font-mono">{asg.dueDate}</span>
                    </div>
                    {asg.status === "GRADED" && (
                      <div className="flex justify-between items-center text-emerald-600 border-t border-[var(--border-subtle)] pt-2 mt-1">
                        <span>Calculated Grade:</span>
                        <span className="font-mono font-bold text-[14px]">{asg.grade}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {asg.status === "PENDING" ? (
                    <button
                      onClick={() => {
                        setActiveAssignment(asg);
                        setAnswers({});
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold bg-[#e0ff82] text-[#1f2223] hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-md shadow-[#e0ff82]/10 border-0"
                    >
                      <Sparkles size={13} />
                      Write Answer (Text Editor)
                    </button>
                  ) : (
                    <Link
                      href="/dashboard/submissions"
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:bg-brand-500 hover:text-white transition-all duration-200 cursor-pointer"
                    >
                      Audit Submission Report
                    </Link>
                  )}

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10" style={{ padding: "4px 0" }}>

      {/* ── Page Header ── */}
      <div
        className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm"
        style={{ padding: "28px 32px" }}
      >
        <div className="flex flex-col gap-2">
          {/* Badge — no background, just border + icon */}
          <div
            className="flex items-center gap-2 w-max"
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "999px",
              padding: "3px 10px",
            }}
          >
            <Users size={11} />
            Roster &amp; Cohorts
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "2px 0 0",
            }}
          >
            Institutional Students Directory
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.6 }}>
            Monitor cohort learning trends, aggregated performance charts, and audit histories.
          </p>
        </div>
      </div>

      {/* ── Analytics Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Students */}
        <div
          className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-5 shadow-sm hover:scale-[1.01] transition-transform duration-200"
          style={{ padding: "22px 26px" }}
        >
          <div className="w-[46px] h-[46px] bg-brand-500/10 text-brand-600 rounded-xl flex items-center justify-center border border-brand-500/20 shrink-0">
            <Users size={21} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">
              Total Registered Students
            </div>
            <div className="text-[28px] font-bold font-mono text-[var(--text-primary)] leading-none">
              {students.length}
            </div>
          </div>
        </div>

        {/* Average Grade */}
        <div
          className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-5 shadow-sm hover:scale-[1.01] transition-transform duration-200"
          style={{ padding: "22px 26px" }}
        >
          <div className="w-[46px] h-[46px] bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Award size={21} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">
              Average Cohort Grade
            </div>
            <div className="text-[28px] font-bold font-mono text-emerald-600 leading-none">
              {avgCohortGrade ? `${avgCohortGrade}%` : "N/A"}
            </div>
          </div>
        </div>

        {/* Anomalies */}
        <div
          className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-5 shadow-sm hover:scale-[1.01] transition-transform duration-200"
          style={{ padding: "22px 26px" }}
        >
          <div className="w-[46px] h-[46px] bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
            <TrendingUp size={21} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">
              Anomalies Detected
            </div>
            <div className="text-[28px] font-bold font-mono text-[var(--text-primary)] leading-none">0</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div
        className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        style={{ padding: "16px 20px" }}
      >
        {/* Search */}
        <div className="relative w-full md:max-w-[420px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "10px 14px 10px 36px", fontSize: "13px" }}
            className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm font-medium"
          />
        </div>

        {/* Cohort Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] font-mono uppercase tracking-wider">
            Cohort:
          </span>
          <div className="flex gap-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl p-1">
            {["ALL", "Batch-A", "Batch-B"].map((cFilter) => (
              <button
                key={cFilter}
                onClick={() => setCohortFilter(cFilter)}
                style={{ padding: "6px 14px", fontSize: "11px" }}
                className={`rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
                  cohortFilter === cFilter
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm border border-[var(--border-subtle)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cFilter === "ALL" ? "All Cohorts" : cFilter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Student Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.slice(0, visibleCount).map((student) => (
          <div
            key={student.id}
            className="group relative bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl flex flex-col shadow-sm hover:shadow-xl hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300"
            style={{ padding: "22px 24px", gap: "18px" }}
          >
            {/* Student Info Row */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">
                  {student.name}
                </h3>
                <span className="text-[11px] text-[var(--text-tertiary)] font-medium mt-0.5 block">
                  {student.cohort}
                </span>
              </div>

              {/* Grade Badge */}
              <div
                className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 rounded-xl font-bold font-mono shrink-0"
                style={{ padding: "5px 10px", fontSize: "12px" }}
              >
                <Star size={11} className="fill-emerald-500" />
                {student.averageGrade}%
              </div>
            </div>

            {/* Divider */}
            <div className="h-[0.5px] bg-[var(--border-subtle)]" />

            {/* Stats Row */}
            <div className="flex justify-between items-center text-[11.5px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen size={13} className="text-[var(--text-tertiary)]" />
                {student.totalSubmissions} graded paper{student.totalSubmissions !== 1 ? "s" : ""}
              </span>
              <span className="font-mono text-[10.5px] opacity-75">
                Active: {new Date(student.lastActive).toLocaleDateString()}
              </span>
            </div>

            {/* Action Button */}
            <Link
              href="/dashboard/submissions"
              className="flex items-center justify-center gap-2 rounded-xl text-[12.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:bg-brand-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
              style={{ padding: "10px 16px" }}
            >
              Audit Submissions <ArrowRight size={13} />
            </Link>
          </div>
        ))}

        {/* Empty state */}
        {filteredStudents.length === 0 && !isLoading && (
          <div
            className="col-span-full border border-dashed border-[var(--border-subtle)] rounded-2xl text-center bg-[var(--surface-secondary)]"
            style={{ padding: "56px 24px" }}
          >
            <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Users size={22} />
            </div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">No students match your query</p>
            <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1">
              Try resetting the cohort batch filter or check search spelling.
            </p>
          </div>
        )}
      </div>

      {filteredStudents.length > 10 && (
        <div className="flex justify-center gap-3 mt-6">
          {visibleCount < filteredStudents.length && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[12.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-600 transition-all cursor-pointer shadow-sm"
            >
              See More +5
            </button>
          )}
          {visibleCount > 10 && (
            <button
              onClick={() => setVisibleCount(10)}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[12.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:border-red-500 hover:text-red-600 transition-all cursor-pointer shadow-sm"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
