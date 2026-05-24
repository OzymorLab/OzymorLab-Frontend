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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
          <Users size={22} className="text-brand-600" />
          Students Directory
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">Monitor cohort learning trends, aggregated performance charts, and audit histories.</p>
      </div>

      {/* Analytics Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Total Students */}
        <div style={{
          ...cardBase,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default',
        }}>
          <div style={iconWrap('linear-gradient(135deg, var(--brand-50), rgba(83,74,183,0.12))', 'var(--brand-600)')}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '4px' }}>Total Students Registered</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{students.length}</div>
          </div>
        </div>

        {/* Average Grade */}
        <div style={{
          ...cardBase,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={iconWrap('linear-gradient(135deg, var(--color-success-bg), rgba(99,153,34,0.12))', 'var(--color-success-border)')}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '4px' }}>Average Cohort Grade</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {students.length > 0 
                ? (students.reduce((acc, curr) => acc + parseFloat(curr.averageGrade), 0) / students.length).toFixed(1) + "%"
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Anomalies */}
        <div style={{
          ...cardBase,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={iconWrap('linear-gradient(135deg, var(--color-info-bg), rgba(55,138,221,0.12))', 'var(--color-info-text)')}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '4px' }}>Anomalies/Flagged Submissions</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>0</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        ...cardBase,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap' as const,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '500px' }}>
          <Search 
            size={15} 
            style={{ 
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', 
              color: 'var(--text-tertiary)', pointerEvents: 'none',
            }} 
          />
          <input
            type="text"
            placeholder="Search Student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '9px 14px 9px 36px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Cohort Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Batch Filter:</span>
          <div style={{
            display: 'flex', gap: '4px',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '3px',
          }}>
            {["ALL", "Batch-A", "Batch-B"].map((cFilter) => (
              <button
                key={cFilter}
                onClick={() => setCohortFilter(cFilter)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  border: cohortFilter === cFilter ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  background: cohortFilter === cFilter ? 'var(--surface-primary)' : 'transparent',
                  color: cohortFilter === cFilter ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: cohortFilter === cFilter ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {cFilter === "ALL" ? "All Cohorts" : cFilter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredStudents.map((student) => (
          <div key={student.id} style={{
            ...cardBase,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-600)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(83,74,183,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            {/* Student Info Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-50), rgba(83,74,183,0.18))',
                  color: 'var(--brand-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px',
                  border: '1px solid rgba(83,74,183,0.2)',
                  flexShrink: 0,
                }}>
                  {student.id.slice(-2)}
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{student.id}</h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{student.cohort}</span>
                </div>
              </div>
              <div style={{
                background: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid rgba(99,153,34,0.15)',
              }}>
                <Star size={11} style={{ fill: 'currentColor' }} />
                {student.averageGrade}%
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 0, borderTop: '1px solid var(--border-subtle)' }} />

            {/* Stats Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BookOpen size={13} /> {student.totalSubmissions} runs
              </span>
              <span>Last Active: {new Date(student.lastActive).toLocaleDateString()}</span>
            </div>

            {/* Action Button */}
            <Link href="/dashboard/submissions" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}>
              Audit Submissions <ArrowRight size={13} />
            </Link>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            ...cardBase,
            padding: '48px 20px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
          }}>
            No students found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
