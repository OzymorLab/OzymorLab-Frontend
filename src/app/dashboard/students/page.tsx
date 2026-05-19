"use client";

import { useState, useEffect } from "react";
import { Users, Search, Award, TrendingUp, BookOpen, User, Star, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface Submission {
  id: string;
  student_id: string;
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

  return (
    <div className="students-container py-4 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
          <Users size={22} className="text-brand-600" />
          Students Directory
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">Monitor cohort learning trends, aggregated performance charts, and audit histories.</p>
      </div>

      {/* Analytics Widgets */}
      <div className="stats-grid grid grid-cols-3 gap-4">
        <div className="stat-card bg-surface-primary border border-border-subtle p-4 rounded-lg flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-brand-50 rounded-lg text-brand-600">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-label text-[11.5px] text-text-tertiary">Total Students Registered</div>
            <div className="stat-value text-[20px] font-medium text-text-primary">{students.length}</div>
          </div>
        </div>
        <div className="stat-card bg-surface-primary border border-border-subtle p-4 rounded-lg flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-success-bg rounded-lg text-success-text">
            <Award size={22} className="text-color-success-border" />
          </div>
          <div>
            <div className="stat-label text-[11.5px] text-text-tertiary">Average Cohort Grade</div>
            <div className="stat-value text-[20px] font-medium text-text-primary">
              {students.length > 0 
                ? (students.reduce((acc, curr) => acc + parseFloat(curr.averageGrade), 0) / students.length).toFixed(1) + "%"
                : "N/A"}
            </div>
          </div>
        </div>
        <div className="stat-card bg-surface-primary border border-border-subtle p-4 rounded-lg flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-info-bg rounded-lg text-info-text">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label text-[11.5px] text-text-tertiary">Anomalies/Flagged Submissions</div>
            <div className="stat-value text-[20px] font-medium text-text-primary">0</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card bg-surface-primary border border-border-subtle p-4 rounded-lg flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-text-tertiary" size={16} />
            <input
              type="text"
              className="w-full bg-surface-secondary border border-border-default rounded-md py-2 pl-9 pr-4 text-[13px] focus:outline-none focus:border-brand-600 text-text-primary"
              placeholder="Search Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-text-secondary mr-2 font-medium">Batch Filter:</span>
          <div className="flex gap-1 bg-surface-secondary p-1 rounded-md border border-border-subtle">
            {["ALL", "Batch-A", "Batch-B"].map((cFilter) => (
              <button
                key={cFilter}
                onClick={() => setCohortFilter(cFilter)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  cohortFilter === cFilter
                    ? "bg-surface-primary text-text-primary shadow-xs border border-border-subtle"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {cFilter === "ALL" ? "All Cohorts" : cFilter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="card bg-surface-primary border border-border-subtle p-5 rounded-lg flex flex-col gap-4 shadow-sm hover:border-brand-600 transition">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="avatar w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[14px]">
                  {student.id.slice(-2)}
                </div>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-text-primary">{student.id}</h3>
                  <span className="text-[11.5px] text-text-tertiary font-medium">{student.cohort}</span>
                </div>
              </div>
              <div className="bg-success-bg text-success-text px-2.5 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1">
                <Star size={12} className="text-color-success-border fill-current" />
                {student.averageGrade}%
              </div>
            </div>

            <div className="divider my-0"></div>

            <div className="flex justify-between text-[12.5px] text-text-secondary">
              <span className="flex items-center gap-1"><BookOpen size={13} /> {student.totalSubmissions} runs</span>
              <span>Last Active: {new Date(student.lastActive).toLocaleDateString()}</span>
            </div>

            <Link href="/dashboard/submissions" className="btn btn-secondary justify-center py-2 text-[12px] font-medium mt-1 w-full">
              Audit Submissions <ArrowRight size={12} />
            </Link>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="col-span-full card p-8 text-center text-text-tertiary text-[13px]">
            No students found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
