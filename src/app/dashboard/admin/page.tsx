"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Loader2,
  Mail,
  PieChart,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

type TabKey = "analytics" | "teachers" | "students" | "classrooms" | "assignments" | "classes";

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

interface TeacherRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  assigned_classrooms?: Array<{ id: string; subject: string; class_name: string; session: string }>;
}

interface ClassroomRow {
  id: string;
  subject: string;
  class_name: string;
  session: string;
  activity_status: string;
  teacher_count: number;
  student_count: number;
  accepted_students: number;
  assignment_count: number;
  teachers: Array<{ id: string; name: string; email: string }>;
}

interface AssignmentRow {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  due_date: string;
  total_submissions: number;
  graded_count: number;
  pending_count: number;
  published_count: number;
  status: string;
  students: Array<{ worksheet_id: string; student_name: string; status: string; grade?: string | null }>;
}

interface Overview {
  school_name: string;
  stats: {
    total_students: number;
    total_teachers: number;
    total_classrooms: number;
    total_exams: number;
    total_assignments: number;
    active_assignments: number;
    total_evaluations: number;
  };
  performance_trends: Array<{ month: string; average: number }>;
  grade_distribution: { excellent: number; good: number; average: number; below: number };
  evaluation_pipeline: { pending: number; parsing: number; grading: number; graded: number; failed: number };
  recent_evaluation_runs: Array<{
    id: string;
    status: string;
    model: string;
    total_submissions: number;
    graded_count: number;
    failed_count: number;
    created_at: string;
  }>;
}

const tabs: Array<{ key: TabKey; label: string; icon: any }> = [
  { key: "analytics", label: "Dashboard & Analytics", icon: BarChart3 },
  { key: "teachers", label: "Manage Teachers", icon: ShieldCheck },
  { key: "students", label: "Manage Students", icon: Users },
  { key: "classrooms", label: "School Classrooms", icon: Building },
  { key: "assignments", label: "Exams & Assignments", icon: ClipboardList },
  { key: "classes", label: "Classes & Roster", icon: Layers },
];

const cardStyle = {
  background: "var(--surface-primary)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
} as const;

function StatCard({ label, value, caption, icon: Icon }: { label: string; value: string | number; caption: string; icon: any }) {
  return (
    <div style={{ ...cardStyle, padding: 18, display: "flex", justifyContent: "space-between", gap: 14 }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 26, color: "var(--text-primary)", fontWeight: 750, marginTop: 8, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 8 }}>{caption}</div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--brand-50)", color: "var(--brand-600)", flexShrink: 0 }}>
        <Icon size={18} />
      </div>
    </div>
  );
}

function MiniBars({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "end", height: 170, paddingTop: 18 }}>
      {data.map((item) => (
        <div key={item.label} style={{ flex: 1, minWidth: 42, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ height: 118, width: "100%", display: "flex", alignItems: "end", borderBottom: "1px solid var(--border-subtle)" }}>
            <div title={`${item.label}: ${item.value}`} style={{ width: "100%", height: `${Math.max((item.value / max) * 100, 4)}%`, background: "var(--brand-600)", borderRadius: "4px 4px 0 0" }} />
          </div>
          <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", textAlign: "center" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: Array<{ month: string; average: number }> }) {
  const display = data.length ? data : [
    { month: "Jan", average: 0 },
    { month: "Feb", average: 0 },
    { month: "Mar", average: 0 },
    { month: "Apr", average: 0 },
    { month: "May", average: 0 },
  ];
  return <MiniBars data={display.map((d) => ({ label: d.month, value: Math.round(d.average) }))} />;
}

function StatusPill({ children }: { children: string }) {
  return (
    <span className="pill pill-info px-2.5" style={{ whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export default function SchoolAdminPage() {
  const { fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [teacherEmails, setTeacherEmails] = useState("");
  const [inviteRole, setInviteRole] = useState("teacher");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ invited: number; skipped: number; errors: any[] } | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; total_rows: number; errors: any[] } | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudentClassroom, setSelectedStudentClassroom] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const loadResource = async <T,>(url: string, fallback: T) => {
    const res = await fetchWithAuth(url);
    if (!res.ok) return fallback;
    const json = await res.json();
    return (json.data ?? fallback) as T;
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overviewData, classesData, studentsData, teachersData, classroomsData, assignmentsData] = await Promise.all([
        loadResource<Overview | null>(`${API_BASE}/schools/overview`, null),
        loadResource<ClassInfo[]>(`${API_BASE}/schools/classes`, []),
        loadResource<StudentRow[]>(`${API_BASE}/schools/students?limit=200`, []),
        loadResource<TeacherRow[]>(`${API_BASE}/schools/teachers`, []),
        loadResource<ClassroomRow[]>(`${API_BASE}/schools/classrooms`, []),
        loadResource<AssignmentRow[]>(`${API_BASE}/schools/assignments`, []),
      ]);
      setOverview(overviewData);
      setClasses(classesData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setClassrooms(classroomsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Failed to load school admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.toLowerCase();
    return students.filter((student) => {
      const matchesTerm = student.name.toLowerCase().includes(term) || student.roll_number.toLowerCase().includes(term);
      const matchesClass = !classFilter || student.class_name === classFilter;
      return matchesTerm && matchesClass;
    });
  }, [students, studentSearch, classFilter]);

  const filteredTeachers = useMemo(() => {
    const term = teacherSearch.toLowerCase();
    return teachers.filter((teacher) => teacher.name.toLowerCase().includes(term) || teacher.email.toLowerCase().includes(term));
  }, [teachers, teacherSearch]);

  const handleBulkInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const emails = teacherEmails
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes("@"));
    if (!emails.length) {
      alert("No valid email addresses found.");
      return;
    }

    setIsInviting(true);
    setInviteResult(null);
    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/users/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, role: inviteRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Bulk invite failed");
      setInviteResult(json.data);
      setTeacherEmails("");
      loadAdminData();
    } catch (error: any) {
      alert(error.message || "An error occurred during invites");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setIsImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", csvFile);
    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/students/bulk-import`, { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "CSV import failed");
      setImportResult(json.data);
      setCsvFile(null);
      loadAdminData();
    } catch (error: any) {
      alert(error.message || "An error occurred during student import");
    } finally {
      setIsImporting(false);
    }
  };

  const updateTeacherRole = async (teacher: TeacherRow, role: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Unable to update teacher");
      setTeachers((current) => current.map((row) => row.id === teacher.id ? { ...row, role } : row));
    } catch (error: any) {
      alert(error.message || "Teacher update failed.");
    }
  };

  const removeTeacher = async (teacher: TeacherRow) => {
    if (!confirm(`Remove ${teacher.name} from this school?`)) return;
    const res = await fetchWithAuth(`${API_BASE}/schools/teachers/${teacher.id}`, { method: "DELETE" });
    if (res.ok) loadAdminData();
  };

  const saveStudent = async () => {
    if (!editingStudent) return;
    const res = await fetchWithAuth(`${API_BASE}/schools/students/${editingStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingStudent),
    });
    if (res.ok) {
      setEditingStudent(null);
      loadAdminData();
    }
  };

  const removeStudent = async (student: StudentRow) => {
    if (!confirm(`Remove ${student.name} from the roster?`)) return;
    const res = await fetchWithAuth(`${API_BASE}/schools/students/${student.id}`, { method: "DELETE" });
    if (res.ok) loadAdminData();
  };

  const assignTeacher = async () => {
    if (!selectedClassroom || !selectedTeacher) return;
    const classroom = classrooms.find((item) => item.id === selectedClassroom);
    const teacherIds = Array.from(new Set([...(classroom?.teachers.map((teacher) => teacher.id) || []), selectedTeacher]));
    const res = await fetchWithAuth(`${API_BASE}/schools/classrooms/${selectedClassroom}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_ids: teacherIds }),
    });
    if (res.ok) {
      setSelectedTeacher("");
      loadAdminData();
    }
  };

  const assignStudent = async () => {
    if (!selectedStudentClassroom || !selectedStudent) return;
    const res = await fetchWithAuth(`${API_BASE}/schools/classrooms/${selectedStudentClassroom}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_ids: [selectedStudent] }),
    });
    if (res.ok) {
      setSelectedStudent("");
      loadAdminData();
    }
  };

  const pipeline = overview?.evaluation_pipeline || { pending: 0, parsing: 0, grading: 0, graded: 0, failed: 0 };
  const distribution = overview?.grade_distribution || { excellent: 0, good: 0, average: 0, below: 0 };

  return (
    <>
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
            <School className="text-brand-500" size={22} />
            School Administration Portal
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            Manage staff, students, classrooms, assignments, evaluations, and school-wide analytics.
          </p>
        </div>
        {loading && <Loader2 className="animate-spin text-brand-500 mt-1" size={20} />}
      </div>

      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border-subtle)", marginBottom: 22, overflowX: "auto" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--brand-600)" : "var(--text-tertiary)",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid var(--brand-600)" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in">
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
              <StatCard label="Students" value={overview?.stats.total_students ?? students.length} caption="Rostered learners" icon={Users} />
              <StatCard label="Teachers" value={overview?.stats.total_teachers ?? teachers.length} caption="Active staff" icon={ShieldCheck} />
              <StatCard label="Classrooms" value={overview?.stats.total_classrooms ?? classrooms.length} caption="Live spaces" icon={Building} />
              <StatCard label="Exams" value={overview?.stats.total_exams ?? 0} caption="Exam cycles" icon={GraduationCap} />
              <StatCard label="Assignments" value={overview?.stats.total_assignments ?? assignments.length} caption="Tasks and sheets" icon={ClipboardList} />
              <StatCard label="Evaluations" value={overview?.stats.total_evaluations ?? 0} caption="Pipeline total" icon={Activity} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section style={{ ...cardStyle, padding: 20 }}>
                <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2"><BarChart3 size={17} className="text-brand-500" /> Performance Trends</h2>
                <TrendChart data={overview?.performance_trends || []} />
              </section>
              <section style={{ ...cardStyle, padding: 20 }}>
                <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2"><PieChart size={17} className="text-brand-500" /> Grade Distribution</h2>
                <MiniBars data={[
                  { label: "Excellent", value: distribution.excellent },
                  { label: "Good", value: distribution.good },
                  { label: "Average", value: distribution.average },
                  { label: "Below", value: distribution.below },
                ]} />
              </section>
            </div>

            <section style={{ ...cardStyle, padding: 20 }}>
              <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2 mb-4"><Activity size={17} className="text-brand-500" /> Evaluation Pipeline</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  ["Pending", pipeline.pending],
                  ["Parsing", pipeline.parsing],
                  ["Grading", pipeline.grading],
                  ["Graded", pipeline.graded],
                  ["Failed", pipeline.failed],
                ].map(([label, value]) => (
                  <div key={label} className="bg-surface-secondary/50 border border-border-subtle rounded-lg p-3">
                    <div className="text-[11px] text-text-tertiary uppercase font-semibold">{label}</div>
                    <div className="text-[24px] font-bold text-text-primary mt-1">{value}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section style={{ ...cardStyle, padding: 20 }}>
              <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2"><UserPlus size={17} className="text-brand-500" /> Bulk Invite</h2>
              <form onSubmit={handleBulkInvite} className="flex flex-col gap-4 mt-4">
                <select className="input-field" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="admin">School Admin</option>
                </select>
                <textarea className="input-field min-h-[130px] font-mono text-[12px]" placeholder="teacher@school.edu, hod@school.edu" value={teacherEmails} onChange={(e) => setTeacherEmails(e.target.value)} />
                <button type="submit" className="btn btn-brand flex justify-center items-center gap-2" disabled={isInviting || !teacherEmails.trim()}>
                  {isInviting ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                  Invite Educators
                </button>
              </form>
              {inviteResult && (
                <div className="mt-4 bg-success-bg/20 border border-success-border rounded-lg p-3 text-[12px] text-text-secondary">
                  <CheckCircle2 size={15} className="inline mr-1 text-success-border" />
                  {inviteResult.invited} invited, {inviteResult.skipped} skipped.
                </div>
              )}
            </section>

            <section style={{ ...cardStyle, padding: 20 }} className="xl:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2"><Users size={17} className="text-brand-500" /> Teacher Directory</h2>
                <div className="flex items-center gap-2 input-field !py-1.5 !w-[240px]"><Search size={13} /><input className="bg-transparent outline-none w-full text-[12px]" placeholder="Search teachers..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} /></div>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td className="col-primary">{teacher.name}</td>
                        <td className="font-mono text-[12px]">{teacher.email}</td>
                        <td>
                          <select className="input-field !py-1 !text-[12px]" value={teacher.role} onChange={(e) => updateTeacherRole(teacher, e.target.value)}>
                            <option value="teacher">Teacher</option>
                            <option value="hod">HOD</option>
                            <option value="admin">Admin</option>
                            <option value="principal">Principal</option>
                          </select>
                        </td>
                        <td><StatusPill>{teacher.status}</StatusPill></td>
                        <td>{teacher.assigned_classrooms?.length || 0} classrooms</td>
                        <td><button className="btn py-1 px-2" onClick={() => removeTeacher(teacher)}><Trash2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mt-4">
                <select className="input-field" value={selectedClassroom} onChange={(e) => setSelectedClassroom(e.target.value)}>
                  <option value="">Select classroom</option>
                  {classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.subject} - {classroom.class_name}</option>)}
                </select>
                <select className="input-field" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                </select>
                <button className="btn btn-brand" onClick={assignTeacher}>Assign</button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "students" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section style={{ ...cardStyle, padding: 20 }}>
              <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2"><FileSpreadsheet size={17} className="text-brand-500" /> Roster CSV Import</h2>
              <div className="bg-surface-secondary/40 border border-border-subtle rounded-lg p-3 my-4">
                <div className="text-[11px] font-semibold uppercase text-text-secondary mb-2">Required Headers</div>
                <div className="flex flex-wrap gap-2">{["roll_number", "name", "class_name", "section_name"].map((header) => <code key={header} className="text-[11px] bg-surface-tertiary px-1.5 py-0.5 rounded border border-border-subtle">{header}</code>)}</div>
              </div>
              <div className="relative upload-zone mb-4">
                <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                <UploadCloud className="mx-auto text-text-tertiary mb-3" size={28} />
                <div className="upload-title truncate">{csvFile ? csvFile.name : "Drop your CSV file here"}</div>
                <div className="upload-subtitle">max 500 rows</div>
              </div>
              <button className="btn btn-brand w-full flex justify-center items-center gap-2" disabled={!csvFile || isImporting} onClick={handleCsvImport}>
                {isImporting && <Loader2 className="animate-spin" size={14} />}
                Parse & Import Roster
              </button>
              {importResult && <div className="mt-4 text-[12px] text-success-border">{importResult.created} created, {importResult.updated} updated, {importResult.total_rows} rows processed.</div>}
            </section>

            <section style={{ ...cardStyle, padding: 20 }} className="xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2"><Users size={17} className="text-brand-500" /> Student Directory</h2>
                <div className="flex gap-2">
                  <input className="input-field !w-[180px]" placeholder="Search name/roll..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                  <select className="input-field" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Section</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="font-mono text-[12px]">{student.roll_number}</td>
                        <td className="col-primary">{student.name}</td>
                        <td>{student.class_name}</td>
                        <td><StatusPill>{student.section_name}</StatusPill></td>
                        <td className="flex gap-2">
                          <button className="btn py-1 px-3 text-[11px]" onClick={() => setEditingStudent(student)}>Edit</button>
                          <button className="btn py-1 px-2" onClick={() => removeStudent(student)}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mt-4">
                <select className="input-field" value={selectedStudentClassroom} onChange={(e) => setSelectedStudentClassroom(e.target.value)}>
                  <option value="">Select classroom</option>
                  {classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.subject} - {classroom.class_name}</option>)}
                </select>
                <select className="input-field" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  <option value="">Select student</option>
                  {students.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.roll_number})</option>)}
                </select>
                <button className="btn btn-brand" onClick={assignStudent}>Assign</button>
              </div>
            </section>

            {editingStudent && (
              <section style={{ ...cardStyle, padding: 20 }} className="xl:col-span-3">
                <h2 className="text-[15px] font-semibold text-text-primary mb-4">Edit Student</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input className="input-field" value={editingStudent.roll_number} onChange={(e) => setEditingStudent({ ...editingStudent, roll_number: e.target.value })} />
                  <input className="input-field md:col-span-2" value={editingStudent.name} onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} />
                  <input className="input-field" value={editingStudent.class_name} onChange={(e) => setEditingStudent({ ...editingStudent, class_name: e.target.value })} />
                  <input className="input-field" value={editingStudent.section_name} onChange={(e) => setEditingStudent({ ...editingStudent, section_name: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-brand" onClick={saveStudent}>Save Student</button>
                  <button className="btn" onClick={() => setEditingStudent(null)}>Cancel</button>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === "classrooms" && (
          <section style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }} className="font-semibold text-[14px] text-text-primary">All School Classrooms</div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Class</th><th>Session</th><th>Teachers</th><th>Students</th><th>Assignments</th><th>Status</th></tr></thead>
                <tbody>
                  {classrooms.map((classroom) => (
                    <tr key={classroom.id}>
                      <td className="col-primary">{classroom.subject}</td>
                      <td>{classroom.class_name}</td>
                      <td>{classroom.session}</td>
                      <td>{classroom.teachers.length ? classroom.teachers.map((teacher) => teacher.name).join(", ") : "Unassigned"}</td>
                      <td>{classroom.accepted_students}/{classroom.student_count}</td>
                      <td>{classroom.assignment_count}</td>
                      <td><StatusPill>{classroom.activity_status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "assignments" && (
          <section style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }} className="font-semibold text-[14px] text-text-primary">Active Exams & Assignments</div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Title</th><th>Subject</th><th>Teacher</th><th>Deadline</th><th>Submissions</th><th>Evaluation</th><th>Details</th></tr></thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={`${assignment.id}-${assignment.title}`}>
                      <td className="col-primary">{assignment.title}</td>
                      <td>{assignment.subject}</td>
                      <td>{assignment.teacher}</td>
                      <td>{assignment.due_date}</td>
                      <td>{assignment.total_submissions}</td>
                      <td>{assignment.graded_count} graded, {assignment.pending_count} pending</td>
                      <td><StatusPill>{assignment.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "classes" && (
          <section style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
              Class Standard & Section Hierarchies
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Class Standard</th><th>Linked Sections</th><th>Students Count</th><th className="w-[120px] text-right">Drilldown</th></tr></thead>
                <tbody>
                  {classes.map((item) => (
                    <tr key={item.id} onClick={() => { setClassFilter(item.name); setActiveTab("students"); }}>
                      <td className="col-primary text-[14px]">{item.name}</td>
                      <td><div className="flex gap-2.5 flex-wrap">{item.sections.map((section) => <span key={section.id} className="pill pill-info text-[11px] font-mono px-3 py-1">{section.name} ({section.student_count} std)</span>)}</div></td>
                      <td className="font-semibold text-text-primary text-[13px]">{item.total_students} students</td>
                      <td className="text-right"><button className="btn py-1 px-3 flex items-center gap-1 ml-auto text-[11px]">View Students<ChevronRight size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {!loading && activeTab !== "students" && activeTab !== "teachers" && (
        <div className="mt-4 text-[11.5px] text-text-tertiary flex items-center gap-2">
          <Sparkles size={13} /> Data refreshes when roster, teacher, or classroom assignments change.
        </div>
      )}
      {!loading && !classes.length && (
        <div className="mt-4 bg-info-bg border border-info-border/20 rounded-lg p-3 flex gap-2.5 items-start">
          <AlertCircle size={16} className="text-info-border flex-shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-info-text leading-relaxed">Import a roster CSV to populate classes, sections, and the student directory.</p>
        </div>
      )}
    </>
  );
}
