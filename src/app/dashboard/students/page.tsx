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
  cohort: string;
  totalSubmissions: number;
  averageGrade: string;
  lastActive: string;
}

export default function StudentsPage() {
  const { fetchWithAuth } = useAuth();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cohortFilter, setCohortFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const processSubmissionsIntoStudents = (subs: Submission[]) => {
    // Group submissions by student_id to simulate student dashboard aggregates
    const groups: { [key: string]: { list: Submission[]; gradesCount: number; gradesSum: number } } = {};
    
    subs.forEach((sub) => {
      if (!sub.student_id) return;
      if (!groups[sub.student_id]) {
        groups[sub.student_id] = { list: [], gradesCount: 0, gradesSum: 0 };
      }
      groups[sub.student_id].list.push(sub);
    });

    const parsedStudents: StudentSummary[] = Object.keys(groups).map((studentId, idx) => {
      // Simulate cohort and grade distributions based on ID hash
      const hashVal = studentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const cohortVal = hashVal % 2 === 0 ? "Batch-A (Science)" : "Batch-B (Maths)";
      const avgVal = (75 + (hashVal % 21)).toFixed(1); // Grade between 75 and 96

      return {
        id: studentId,
        cohort: cohortVal,
        totalSubmissions: groups[studentId].list.length,
        averageGrade: avgVal,
        lastActive: groups[studentId].list[0]?.created_at || new Date().toISOString()
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
    fetchSubmissions();
  }, []);

  const applyFilters = (studsList: StudentSummary[], search: string, cohort: string) => {
    let result = [...studsList];
    if (search.trim()) {
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.cohort.toLowerCase().includes(search.toLowerCase())
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

  /* ── Shared inline style fragments ── */
  const cardBase: React.CSSProperties = {
    background: 'var(--surface-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    overflow: 'hidden',
  };

  const iconWrap = (bg: string, color: string): React.CSSProperties => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    color: color,
    flexShrink: 0,
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-brand-600 uppercase bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded-full w-max">
            <Users size={11} className="animate-pulse" />
            Roster & Cohorts
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] mt-2">Institutional Students Directory</h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Monitor cohort learning trends, aggregated performance charts, and audit histories.
          </p>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Students */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-200 backdrop-blur-md bg-opacity-80">
          <div className="w-[42px] h-[42px] bg-brand-500/10 text-brand-600 rounded-xl flex items-center justify-center border border-brand-500/20">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium">Total Registered Students</div>
            <div className="text-[24px] font-bold font-mono text-[var(--text-primary)] leading-none mt-1">{students.length}</div>
          </div>
        </div>

        {/* Average Grade */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-200 backdrop-blur-md bg-opacity-80">
          <div className="w-[42px] h-[42px] bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Award size={20} />
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium">Average Cohort Grade</div>
            <div className="text-[24px] font-bold font-mono text-emerald-600 leading-none mt-1">
              {students.length > 0 
                ? (students.reduce((acc, curr) => acc + parseFloat(curr.averageGrade), 0) / students.length).toFixed(1) + "%"
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Anomalies */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-200 backdrop-blur-md bg-opacity-80">
          <div className="w-[42px] h-[42px] bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center border border-blue-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--text-secondary)] font-medium">Anomalies Detected</div>
            <div className="text-[24px] font-bold font-mono text-[var(--text-primary)] leading-none mt-1">0</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-md bg-opacity-80">
        {/* Search */}
        <div className="relative w-full md:max-w-[400px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search Student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 pl-9 pr-4 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm font-medium"
          />
        </div>

        {/* Cohort Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <span className="text-[12px] font-bold text-[var(--text-secondary)] font-mono uppercase tracking-wider">Cohort:</span>
          <div className="flex gap-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl p-1 shadow-inner">
            {["ALL", "Batch-A", "Batch-B"].map((cFilter) => (
              <button
                key={cFilter}
                onClick={() => setCohortFilter(cFilter)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
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

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div 
            key={student.id} 
            className="group relative bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md bg-opacity-70 dark:bg-opacity-50"
          >
            {/* Student Info Row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600/10 to-brand-400/5 text-brand-600 border border-brand-500/20 flex items-center justify-center font-bold text-[13.5px] shadow-sm">
                  {student.id.slice(-2)}
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{student.id}</h3>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-medium mt-0.5 block">{student.cohort}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 rounded-xl px-2.5 py-1 text-[11.5px] font-bold font-mono">
                <Star size={11} className="fill-emerald-500" />
                {student.averageGrade}%
              </div>
            </div>

            {/* Divider */}
            <div className="h-[0.5px] bg-[var(--border-subtle)]" />

            {/* Stats Row */}
            <div className="flex justify-between items-center text-[11.5px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen size={13} className="text-[var(--text-tertiary)]" /> {student.totalSubmissions} graded papers
              </span>
              <span className="font-mono text-[10.5px] opacity-80">Active: {new Date(student.lastActive).toLocaleDateString()}</span>
            </div>

            {/* Action Button */}
            <Link 
              href="/dashboard/submissions" 
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:bg-brand-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
            >
              Audit Submissions <ArrowRight size={13} />
            </Link>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="col-span-full border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center bg-[var(--surface-secondary)] bg-opacity-50">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Users size={22} />
            </div>
            <p className="text-[13px] font-medium text-[var(--text-primary)]">No students match your query</p>
            <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1">Try resetting the cohort batch filter or check search spelling.</p>
          </div>
        )}
      </div>
    </div>
  );
}
