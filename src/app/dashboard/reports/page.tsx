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
    <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10">
      {/* Title area */}
      <div className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full w-max">
            <Sparkles size={11} className="animate-pulse" />
            Performance & Analytics
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] mt-2">Institutional Reports & Analytics Dashboard</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Aggregate student metrics, class standard averages, and download fully-formatted report card PDFs.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Institutional Roster', value: stats?.total_students_active || 0, delta: 'Provisioned Students', deltaColor: 'text-brand-600', icon: <GraduationCap size={18} />, bg: 'bg-brand-500/10 text-brand-600 border border-brand-500/20' },
          { label: 'AI Papers Evaluated', value: stats?.total_papers_evaluated || 0, delta: 'Parallel OCR Pipes active', deltaColor: 'text-emerald-600', icon: <TrendingUp size={18} />, bg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
          { label: 'Overall Average Grade', value: `${(stats?.overall_average_percentage || 0).toFixed(1)}%`, delta: 'Institutional GPA Average', deltaColor: 'text-blue-600', icon: <BarChart3 size={18} />, bg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
          { label: 'Pass Percentage', value: `${(stats?.pass_percentage || 0).toFixed(0)}%`, delta: 'Above standard target', deltaColor: 'text-emerald-600', icon: <CheckCircle size={18} />, bg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:scale-[1.01] transition-transform duration-200 backdrop-blur-md bg-opacity-80">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-[var(--text-secondary)] font-medium">{s.label}</span>
              <div className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center ${s.bg}`}>{s.icon}</div>
            </div>
            <div className="text-[24px] font-bold font-mono text-[var(--text-primary)] leading-none mt-1">
              {isLoading ? <Loader2 className="animate-spin text-brand-500" size={20} /> : s.value}
            </div>
            <span className={`text-[11px] font-bold ${s.deltaColor} flex items-center gap-1`}>
              {i === 1 && <TrendingUp size={11} />}
              {i === 3 && <CheckCircle size={11} />}
              {s.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Report listing and interactive search/filter card */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden flex flex-col">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-opacity-50">
          <div className="font-bold text-[13.5px] text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={16} className="text-brand-600" />
            Student Performance Registry
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
            <div className="relative w-full max-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search Student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-1.5 pl-8 pr-3 text-[11.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
              />
            </div>
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-1.5 px-3 text-[11.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
            >
              <option value="">All Classes</option>
              <option value="Class 12">Class 12</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] bg-opacity-30">
                <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Class / Section</th>
                <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Total Papers</th>
                <th className="px-6 py-3.5 text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Overall Grade</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">PDF Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[var(--text-secondary)]">
                    <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                    Calculating grade distributions...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[var(--text-secondary)] text-[12.5px] font-medium bg-[var(--surface-secondary)] bg-opacity-10">
                    No report card data found. Run evaluations to populate.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.student_id} className="hover:bg-brand-500/5 transition-colors duration-150 group">
                    <td className="px-6 py-4 font-mono text-[12px] text-[var(--text-primary)] font-bold">{r.student_id}</td>
                    <td className="px-6 py-4 text-[13px] text-[var(--text-primary)] font-semibold">{r.student_name}</td>
                    <td className="px-6 py-4 text-[12.5px] text-[var(--text-secondary)] font-medium">{r.class_name} - {r.section_name}</td>
                    <td className="px-6 py-4 font-semibold text-[12px] text-[var(--text-primary)]">{r.total_exams} papers</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[100px] h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                          <div 
                            className="bg-brand-600 h-full rounded-full"
                            style={{ width: `${r.average_percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11.5px] font-bold text-[var(--text-primary)]">{r.average_percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11.5px] font-bold border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-brand-500 hover:bg-brand-500 hover:text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
    </div>
  );
}
