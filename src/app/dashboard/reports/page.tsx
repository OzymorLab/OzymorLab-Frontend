"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, FileText, Download, Loader2, Sparkles, Search,
  ArrowUpRight, AlertTriangle, GraduationCap, CheckCircle, TrendingUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface StudentReportSummary {
  student_id: string;
  student_name: string;
  class_name: string;
  section_name: string;
  total_exams: number;
  average_percentage: number;
  graded_status: string;
}

interface SchoolStats {
  total_students_active: number;
  total_papers_evaluated: number;
  overall_average_percentage: number;
  pass_percentage: number;
}

export default function ReportsPage() {
  const { fetchWithAuth } = useAuth();
  
  // States
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [reportList, setReportList] = useState<StudentReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);

  useEffect(() => {
    fetchReportDashboard();
  }, [classFilter]);

  const fetchReportDashboard = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE}/reports/dashboard`;
      if (classFilter) url += `?class_name=${encodeURIComponent(classFilter)}`;
      
      const res = await fetchWithAuth(url);
      const json = await res.json();
      if (json.data) {
        setStats(json.data.stats || null);
        setReportList(json.data.students || []);
      }
    } catch (e) {
      console.error("Failed to load reports dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (studentId: string, studentName: string) => {
    setIsDownloadingPdf(studentId);
    try {
      const res = await fetchWithAuth(`${API_BASE}/reports/student/${studentId}/pdf`);
      if (!res.ok) throw new Error("Failed to generate report card PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ReportCard_${studentName.replace(/\s+/g, "_")}_${studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "An error occurred while generating PDF");
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // Filter students by search term
  const filteredReports = reportList.filter(r => {
    const term = searchQuery.toLowerCase();
    return r.student_name.toLowerCase().includes(term) || r.student_id.toLowerCase().includes(term);
  });

  return (
    <>
      {/* Title area */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
          <BarChart3 className="text-brand-500" size={22} />
          Institutional Reports & Analytics Dashboard
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">
          Aggregate student metrics, class standard averages, and download fully-formatted report card PDFs.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Active Institutional Roster', value: stats?.total_students_active || 0, delta: 'Provisioned Students', deltaColor: 'var(--brand-600)', icon: <GraduationCap size={18} />, bg: 'linear-gradient(135deg, var(--brand-50), rgba(83,74,183,0.12))' },
          { label: 'AI Papers Evaluated', value: stats?.total_papers_evaluated || 0, delta: 'Parallel OCR Pipes active', deltaColor: '#16a34a', icon: <TrendingUp size={18} />, bg: 'linear-gradient(135deg, rgba(22,163,106,0.08), rgba(22,163,106,0.15))' },
          { label: 'Overall Average Grade', value: `${(stats?.overall_average_percentage || 0).toFixed(1)}%`, delta: 'Institutional GPA Average', deltaColor: 'var(--brand-600)', icon: <BarChart3 size={18} />, bg: 'linear-gradient(135deg, rgba(55,138,221,0.08), rgba(55,138,221,0.15))' },
          { label: 'Assessment Pass Percentage', value: `${(stats?.pass_percentage || 0).toFixed(0)}%`, delta: 'Above standard target', deltaColor: '#16a34a', icon: <CheckCircle size={18} />, bg: 'linear-gradient(135deg, rgba(22,163,106,0.08), rgba(22,163,106,0.15))' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg, color: s.deltaColor }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {isLoading ? <Loader2 className="animate-spin text-brand-500" size={20} /> : s.value}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: s.deltaColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i === 1 && <TrendingUp size={11} />}
              {i === 3 && <CheckCircle size={11} />}
              {s.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Report listing and interactive search/filter card */}
      <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} className="text-brand-600" />
            Student Performance Registry
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            <input 
              type="text" 
              placeholder="Search Student ID/Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '7px 12px', fontSize: '12px', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', outline: 'none', width: '180px' }}
            />
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '7px 12px', fontSize: '12px', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="">All Classes</option>
              <option value="Class 12">Class 12</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class / Section</th>
                <th>Total Papers</th>
                <th>Overall Grade Average</th>
                <th className="w-[180px] text-right">Report Card PDF</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-tertiary">
                    <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                    Calculating grade distributions...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-tertiary text-[13px]">
                    No report card data found. Run evaluations to populate.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.student_id}>
                    <td className="col-primary font-mono text-[12.5px]">{r.student_id}</td>
                    <td>{r.student_name}</td>
                    <td>{r.class_name} - {r.section_name}</td>
                    <td className="font-semibold text-text-primary">{r.total_exams} papers</td>
                    <td>
                      <div className="grade-bar-cell">
                        <div className="grade-track">
                          <div 
                            className="grade-fill" 
                            style={{ width: `${r.average_percentage}%` }}
                          />
                        </div>
                        <span className="grade-num">{r.average_percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)', color: 'var(--text-secondary)', marginLeft: 'auto' }}
                        onClick={() => handleDownloadPdf(r.student_id, r.student_name)}
                        disabled={isDownloadingPdf === r.student_id}
                      >
                        {isDownloadingPdf === r.student_id ? (
                          <>
                            <Loader2 className="animate-spin" size={12} />
                            Building...
                          </>
                        ) : (
                          <>
                            <Download size={12} />
                            Download PDF
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
