"use client";

import { useState, useEffect } from "react";
import { 
  Users, UserPlus, UploadCloud, FileSpreadsheet, Loader2, 
  CheckCircle2, AlertCircle, Search, ChevronRight, School,
  Sparkles, Trash2, Mail, TrendingUp, Building, Presentation, Download, FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

interface SectionInfo {
  id: string;
  name: string;
  student_count: number;
}

interface ClassInfo {
  id: string;
  name: string;
  sections: SectionInfo[];
  total_students: number;
}

interface StudentRow {
  id: string;
  roll_number: string;
  name: string;
  class_name: string;
  section_name: string;
}

export default function SchoolAdminPage() {
  const { user, fetchWithAuth } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "classes">("students");

  // Roster / Hierarchy State
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // Teacher Invite State
  const [teacherEmails, setTeacherEmails] = useState("");
  const [inviteRole, setInviteRole] = useState("teacher");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ invited: number; skipped: number; errors: any[] } | null>(null);

  // Student CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; total_rows: number; errors: any[] } | null>(null);

  // Dashboard Stats State
  const [stats, setStats] = useState<{
    total_teachers: number;
    total_students: number;
    total_exam_cycles: number;
    total_tasks: number;
    total_submissions: number;
    total_graded: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    fetchClassHierarchy();
    fetchStudentsList();
    fetchSchoolStats();
  }, []);

  const fetchClassHierarchy = async () => {
    setIsLoadingClasses(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/classes`);
      const json = await res.json();
      if (json.data) {
        setClasses(json.data);
      }
    } catch (e) {
      console.error("Failed to load class hierarchy", e);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchStudentsList = async () => {
    setIsLoadingStudents(true);
    try {
      let url = `${API_BASE}/schools/students?limit=100`;
      if (classFilter) url += `&class_name=${encodeURIComponent(classFilter)}`;
      if (sectionFilter) url += `&section_name=${encodeURIComponent(sectionFilter)}`;
      
      const res = await fetchWithAuth(url);
      const json = await res.json();
      if (json.data) {
        setStudents(json.data);
      }
    } catch (e) {
      console.error("Failed to load students", e);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchSchoolStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/reports/school/dashboard`);
      const json = await res.json();
      if (json.data) {
        setStats(json.data);
      }
    } catch (e) {
      console.error("Failed to load school stats", e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Re-fetch when class/section filters change
  useEffect(() => {
    fetchStudentsList();
  }, [classFilter, sectionFilter]);

  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmails.trim()) return;

    setIsInviting(true);
    setInviteResult(null);

    const emails = teacherEmails
      .split(/[\n,;]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes("@"));

    if (emails.length === 0) {
      alert("No valid email addresses found.");
      setIsInviting(false);
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/users/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, role: inviteRole }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setInviteResult(json.data);
        setTeacherEmails("");
        fetchSchoolStats();
      } else {
        throw new Error(json.detail || "Bulk invite failed");
      }
    } catch (e: any) {
      alert(e.message || "An error occurred during invites");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setImportResult(null);
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;

    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/students/bulk-import`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setImportResult(json.data);
        setCsvFile(null);
        // Refresh listings
        fetchClassHierarchy();
        fetchStudentsList();
        fetchSchoolStats();
      } else {
        throw new Error(json.detail || "CSV import failed");
      }
    } catch (e: any) {
      alert(e.message || "An error occurred during student import");
    } finally {
      setIsImporting(false);
    }
  };

  // Filter students by search term
  const filteredStudents = students.filter(s => {
    const term = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.roll_number.toLowerCase().includes(term);
  });

  return (
    <>
      {/* Title Area */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <School className="text-brand-500" size={24} />
            Institutional Administration Panel
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            Manage school rosters, import classrooms, and orchestrate role permissions.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-4 border-b border-border-subtle mb-6 pb-px">
        <button 
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 relative ${activeTab === "students" ? "text-brand-600 border-brand-600 font-semibold" : "text-text-tertiary border-transparent hover:text-text-primary"}`}
          onClick={() => setActiveTab("students")}
        >
          Student Imports
        </button>
        <button 
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 relative ${activeTab === "teachers" ? "text-brand-600 border-brand-600 font-semibold" : "text-text-tertiary border-transparent hover:text-text-primary"}`}
          onClick={() => setActiveTab("teachers")}
        >
          Teacher Invites
        </button>
        <button 
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 relative ${activeTab === "classes" ? "text-brand-600 border-brand-600 font-semibold" : "text-text-tertiary border-transparent hover:text-text-primary"}`}
          onClick={() => setActiveTab("classes")}
        >
          Classes & Roster
        </button>
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in">
        
        {/* ── Students Tab ── */}
        {activeTab === "students" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Premium Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-icon bg-info-bg text-info-text"><Users size={18} /></div>
                <div className="stat-num">{isLoadingStats ? "..." : (stats?.total_students ?? 0)}</div>
                <div className="stat-label">Total Students</div>
                <div className="stat-delta positive"><TrendingUp size={12} /> Live tracking</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-success-bg text-success-border"><Building size={18} /></div>
                <div className="stat-num">{isLoadingClasses ? "..." : classes.length}</div>
                <div className="stat-label">Active Classes</div>
                <div className="stat-delta positive"><TrendingUp size={12} /> Configured</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-brand-50 text-brand-600"><Presentation size={18} /></div>
                <div className="stat-num">{isLoadingStats ? "..." : (stats?.total_teachers ?? 0)}</div>
                <div className="stat-label">Educators</div>
                <div className="stat-delta text-text-tertiary">Registered in system</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-warning-bg text-warning-border"><FileText size={18} /></div>
                <div className="stat-num">{isLoadingStats ? "..." : (stats?.total_submissions ?? 0)}</div>
                <div className="stat-label">Total Submissions</div>
                <div className="stat-delta positive"><TrendingUp size={12} /> Graded: {stats?.total_graded ?? 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CSV Import Card */}
              <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="card p-6">
                <h3 className="text-[16px] font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-brand-500" />
                  Roster CSV Import
                </h3>
                <p className="text-[12.5px] text-text-tertiary mb-4 leading-relaxed">
                  Upload a student roster CSV to bulk-provision class standards, sections, and student identifiers.
                </p>

                {/* Expected Columns */}
                <div className="bg-surface-secondary/40 border border-border-subtle rounded-lg p-3 mb-5">
                  <div className="text-[11px] font-semibold uppercase text-text-secondary mb-2">Required Headers</div>
                  <div className="flex flex-wrap gap-2">
                    {["roll_number", "name", "class_name", "section_name"].map((h) => (
                      <code key={h} className="text-[11px] bg-surface-tertiary px-1.5 py-0.5 rounded text-text-secondary border border-border-subtle">
                        {h}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Dropzone */}
                <div className="relative upload-zone mb-4">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleCsvChange}
                  />
                  <UploadCloud className="mx-auto text-text-tertiary mb-3" size={28} />
                  {csvFile ? (
                    <div>
                      <div className="upload-title truncate">{csvFile.name}</div>
                      <div className="upload-subtitle">{(csvFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  ) : (
                    <div>
                      <div className="upload-title">Drop your CSV file here</div>
                      <div className="upload-subtitle">or <em>click to browse</em> · max 500 rows</div>
                    </div>
                  )}
                </div>

                <div className="bg-info-bg border border-info-border/20 rounded-lg p-3 flex gap-2.5 items-start mb-4">
                  <AlertCircle size={16} className="text-info-border flex-shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-info-text leading-relaxed">Rows with missing required fields will be skipped. Duplicate roll numbers will update existing records.</p>
                </div>

                <button 
                  className="btn btn-brand w-full flex items-center justify-center gap-2"
                  disabled={!csvFile || isImporting}
                  onClick={handleCsvImport}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Syncing Institutional Database...
                    </>
                  ) : (
                    <>
                      Parse & Import Roster
                    </>
                  )}
                </button>
              </div>

              {/* Import Feedback */}
              {importResult && (
                <div className="card p-5 border-success-border bg-success-bg/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-success-border">
                    <CheckCircle2 size={18} />
                    <span className="font-semibold text-[13px]">Roster Synced Successfully</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-surface-secondary/50 p-2 rounded-lg border border-border-subtle">
                      <div className="text-[18px] font-bold text-text-primary">{importResult.created}</div>
                      <div className="text-[10px] uppercase text-text-tertiary">Created</div>
                    </div>
                    <div className="bg-surface-secondary/50 p-2 rounded-lg border border-border-subtle">
                      <div className="text-[18px] font-bold text-text-primary">{importResult.updated}</div>
                      <div className="text-[10px] uppercase text-text-tertiary">Updated</div>
                    </div>
                    <div className="bg-surface-secondary/50 p-2 rounded-lg border border-border-subtle">
                      <div className="text-[18px] font-bold text-text-primary">{importResult.total_rows}</div>
                      <div className="text-[10px] uppercase text-text-tertiary">Total Rows</div>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 border-t border-border-subtle pt-2">
                      <div className="text-[11px] font-bold text-red-500 mb-1">Import Errors ({importResult.errors.length}):</div>
                      <div className="max-h-[100px] overflow-y-auto text-[11px] font-mono bg-surface-secondary p-2 rounded flex flex-col gap-1 border border-border-subtle">
                        {importResult.errors.map((err, i) => (
                          <div key={i} className="text-red-600">Row {err.row}: {err.error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Students List Card */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="card flex flex-col flex-1">
                <div className="card-header flex-between gap-4 flex-wrap">
                  <div className="card-title flex items-center gap-2">
                    <Users size={16} className="text-brand-600" />
                    Student Directory
                  </div>
                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    <input 
                      type="text" 
                      className="bg-surface-secondary border border-border-subtle rounded-md px-2.5 py-1 text-[12px] text-text-primary placeholder-text-tertiary focus:outline-none w-[150px]"
                      placeholder="Search name/roll..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                    <select 
                      className="bg-surface-secondary border border-border-subtle rounded-md px-2 py-1 text-[12px] text-text-primary focus:outline-none"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <option value="">All Classes</option>
                      {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Class Standard</th>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingStudents ? (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-text-tertiary">
                            <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                            Fetching student directory...
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-text-tertiary">
                            No students found matching current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr key={s.id}>
                            <td className="col-primary font-mono text-[12.5px]">{s.roll_number}</td>
                            <td>
                              <span className="stu-av">{s.name.substring(0, 2).toUpperCase()}</span>
                              {s.name}
                            </td>
                            <td>{s.class_name}</td>
                            <td>
                              <span className="pill pill-info px-2.5 font-mono">{s.section_name}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* ── Teachers Tab ── */}
        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Invite Form Card */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                <h3 className="text-[16px] font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <UserPlus size={18} className="text-brand-500" />
                  Bulk Invite Educators
                </h3>
                <p className="text-[12.5px] text-text-tertiary mb-4 leading-relaxed">
                  Invite teachers, heads of departments (HOD), or administrative colleagues. They will be registered under your school entity instantly.
                </p>

                <form onSubmit={handleBulkInvite} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase">Educator Roles</label>
                    <select 
                      className="input-field"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="teacher">Teacher (Standard Evaluator)</option>
                      <option value="hod">HOD (Department Rubric Reviewer)</option>
                      <option value="admin">School Admin (Full Access)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-secondary uppercase flex justify-between">
                      <span>Educator Email Addresses</span>
                      <span className="text-[10px] text-text-tertiary font-normal">Separated by commas/newlines</span>
                    </label>
                    <textarea 
                      className="input-field min-h-[140px] font-mono text-[12px]"
                      placeholder="teacher1@school.edu, HOD.math@school.edu"
                      value={teacherEmails}
                      onChange={(e) => setTeacherEmails(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-brand flex justify-center items-center gap-2 py-2.5"
                    disabled={isInviting || !teacherEmails.trim()}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="animate-spin animate-infinite" size={14} />
                        Sending Invites...
                      </>
                    ) : (
                      <>
                        <Mail size={14} />
                        Invite Educators
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Invite Results Column */}
            <div className="lg:col-span-2">
              {inviteResult ? (
                <div className="card p-6 border-brand-500/30 flex flex-col gap-4">
                  <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
                    <Sparkles className="text-brand-500" size={16} />
                    Invite Batch Results
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-center max-w-sm">
                    <div className="bg-brand-500/10 p-3 rounded-lg border border-brand-500/20 text-brand-600">
                      <div className="text-[24px] font-bold">{inviteResult.invited}</div>
                      <div className="text-[10.5px] uppercase font-semibold">Accounts Provisioned</div>
                    </div>
                    <div className="bg-surface-secondary p-3 rounded-lg border border-border-subtle text-text-secondary">
                      <div className="text-[24px] font-bold">{inviteResult.skipped}</div>
                      <div className="text-[10.5px] uppercase font-semibold">Skipped / Exists</div>
                    </div>
                  </div>

                  {inviteResult.errors && inviteResult.errors.length > 0 ? (
                    <div className="border-t border-border-subtle pt-4">
                      <div className="text-[12px] font-bold text-red-500 flex items-center gap-1.5 mb-2">
                        <AlertCircle size={14} />
                        Skipped Emails / Validation Warnings:
                      </div>
                      <div className="max-h-[180px] overflow-y-auto border border-border-subtle rounded-lg bg-surface-secondary">
                        <table className="data-table text-[12px]">
                          <thead>
                            <tr><th>Email</th><th>Reason</th></tr>
                          </thead>
                          <tbody>
                            {inviteResult.errors.map((err, i) => (
                              <tr key={i}>
                                <td className="font-mono text-red-600">{err.email}</td>
                                <td>{err.error}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[12.5px] text-green-600 font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20 mt-2">
                      <CheckCircle2 size={16} /> All email addresses provisioned successfully! Provisional login password: <code className="font-mono bg-surface-secondary px-1 border rounded ml-1">edexia-temp-2026</code>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-8 flex flex-col justify-center items-center text-center text-text-tertiary h-[300px]">
                  <Users size={36} className="mb-2 opacity-50 text-text-tertiary" />
                  <p className="text-[13px]">Enter teacher email lists on the left to configure accounts.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Classes & Roster Tab ── */}
        {activeTab === "classes" && (
          <div className="card flex flex-col">
            <div className="card-header">
              <div className="card-title">Class Standard & Section Hierarchies</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class Standard</th>
                    <th>Linked Sections</th>
                    <th>Students Count</th>
                    <th className="w-[120px] text-right">Drilldown</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingClasses ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-text-tertiary">
                        <Loader2 className="animate-spin mx-auto mb-2 text-brand-500" size={24} />
                        Loading school roster schema...
                      </td>
                    </tr>
                  ) : classes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-text-tertiary">
                        No classes found in school database. Import a CSV to populate.
                      </td>
                    </tr>
                  ) : (
                    classes.map((c) => (
                      <tr key={c.id} onClick={() => { setClassFilter(c.name); setActiveTab("students"); }}>
                        <td className="col-primary text-[14px]">{c.name}</td>
                        <td>
                          <div className="flex gap-2.5">
                            {c.sections.map((s) => (
                              <span key={s.id} className="pill pill-info text-[11px] font-mono px-3 py-1">
                                {s.name} ({s.student_count} std)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="font-semibold text-text-primary text-[13px]">{c.total_students} students</td>
                        <td className="text-right">
                          <button className="btn py-1 px-3 flex items-center gap-1 ml-auto text-[11px]">
                            View Students
                            <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
