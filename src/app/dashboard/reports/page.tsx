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
      <div className="flex-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={24} />
            Institutional Reports & Analytics Dashboard
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            Aggregate student metrics, class standard averages, and download fully-formatted report card PDFs.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Institutional Roster</div>
          <div className="stat-value">
            {isLoading ? <Loader2 className="animate-spin text-brand-500" size={20} /> : stats?.total_students_active || 0}
          </div>
          <div className="stat-delta positive">Provisioned Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Papers Evaluated</div>
          <div className="stat-value">
            {isLoading ? <Loader2 className="animate-spin text-brand-500" size={20} /> : stats?.total_papers_evaluated || 0}
          </div>
          <div className="stat-delta flex items-center gap-1">
            <TrendingUp size={12} className="text-green-600" />
            Parallel OCR Pipes active
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Average Grade</div>
          <div className="stat-value">
            {isLoading ? <Loader2 className="animate-spin text-brand-500" size={20} /> : `${(stats?.overall_average_percentage || 0).toFixed(1)}%`}
          </div>
          <div className="stat-delta positive">Institutional GPA Average</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Assessment Pass Percentage</div>
          <div className="stat-value">
            {isLoading ? <Loader2 className="animate-spin text-brand-500" size={20} /> : `${(stats?.pass_percentage || 0).toFixed(0)}%`}
          </div>
          <div className="stat-delta flex items-center gap-1 text-green-600 font-semibold">
            <CheckCircle size={12} className="stroke-[2.5]" /> Above standard target
          </div>
        </div>
      </div>

      {/* Report listing and interactive search/filter card */}
      <div className="card flex flex-col">
        <div className="card-header flex-between gap-4 flex-wrap">
          <div className="card-title flex items-center gap-2">
            <FileText size={16} className="text-brand-600" />
            Student Performance Registry
          </div>
          <div className="flex gap-2 flex-wrap">
            <input 
              type="text" 
              className="bg-surface-secondary border border-border-subtle rounded-md px-2.5 py-1 text-[12px] text-text-primary placeholder-text-tertiary focus:outline-none w-[170px]"
              placeholder="Search Student ID/Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="bg-surface-secondary border border-border-subtle rounded-md px-2 py-1 text-[12px] text-text-primary focus:outline-none"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
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
                        className="btn btn-secondary py-1 px-3 text-[11px] flex items-center gap-1 ml-auto"
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
