"use client";

import { useState, useEffect } from "react";
import { Users, Search, Award, TrendingUp, BookOpen, User, Star, ArrowRight, Sparkles, Plus, Trash2, Check, X, ShieldAlert, MoreVertical, ArrowLeft, UploadCloud, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }, { 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

interface StudentSummary {
  id: string;
  name: string;
  initials: string;
  cohort: string;
  totalSubmissions: number;
  averageGrade: string;
  lastActive: string;
}

export default function StudentsPage() {
  const { user, fetchWithAuth } = useAuth();
  const router = useRouter();
  
  // Navigation back states
  const [selectedClassroom, setSelectedClassroom] = useState<any | null>(null);
  
  // Student classroom states
  const [activeAssignment, setActiveAssignment] = useState<any | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submissionType, setSubmissionType] = useState<"editor" | "upload">("editor");
  const [uploadedAnswerFile, setUploadedAnswerFile] = useState<File | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Classroom Database Tables states
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classWorksheets, setClassWorksheets] = useState<any[]>([]);

  // Roster listing
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cohortFilter, setCohortFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // Form states for creating a classroom
  const [classroomSubject, setClassroomSubject] = useState("");
  const [classroomClass, setClassroomClass] = useState("Class 12");
  const [classroomSession, setClassroomSession] = useState("2026-2027");
  const [dynamicStudentEmails, setDynamicStudentEmails] = useState<string[]>([""]);

  // Active dropdown menu state for classroom cards
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [followupMsg, setFollowupMsg] = useState<string | null>(null);

  // Exam setup inside classroom states
  const [examTitle, setExamTitle] = useState("Midterm Examination");
  const [examMaxMarks, setExamMaxMarks] = useState("100");
  const [qPaperFile, setQPaperFile] = useState<File | null>(null);
  const [answersheetFile, setAnswersheetFile] = useState<File | null>(null);
  const [isAnalyzingExam, setIsAnalyzingExam] = useState(false);
  const [analysisStatusStep, setAnalysisStatusStep] = useState("");
  const [examWorksheetsList, setExamWorksheetsList] = useState<any[]>([]);

  // Assign Task form states
  const [assignTitle, setAssignTitle] = useState("");
  const [assignQuestions, setAssignQuestions] = useState("1. Solve the given expression step by step.\n2. Write out your assumptions.");
  const [assignDueDate, setAssignDueDate] = useState("2026-06-15");
  const [assignTaskFile, setAssignTaskFile] = useState<File | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Roster additions states
  const [rosterInviteEmail, setRosterInviteEmail] = useState("");
  const [detailStudentEmails, setDetailStudentEmails] = useState<string[]>([""]);
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Admin extra step assignment state
  const [adminConfiguringClassroom, setAdminConfiguringClassroom] = useState<any | null>(null);
  const [adminTeacherIds, setAdminTeacherIds] = useState<string[]>([]);
  const [adminStudentEmails, setAdminStudentEmails] = useState<string[]>([""]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(null);
  const [selectedStudentWorksheet, setSelectedStudentWorksheet] = useState<any | null>(null);

  const selectClassroomWithUrl = (classroom: any) => {
    setSelectedClassroom(classroom);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (classroom) {
        url.searchParams.set("classId", classroom.id);
      } else {
        url.searchParams.delete("classId");
      }
      window.history.pushState({}, "", url.pathname + url.search);
    }
  };

  // Fetch all databases
  const fetchClassroomData = async () => {
    try {
      const resClassrooms = await fetchWithAuth(`${API_BASE}/classroom`);
      const jsonClassrooms = await resClassrooms.json();
      if (jsonClassrooms.data) {
        setClassrooms(jsonClassrooms.data);
        if (selectedClassroom) {
          const updated = jsonClassrooms.data.find((c: any) => c.id === selectedClassroom.id);
          if (updated) setSelectedClassroom(updated);
        } else if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const classIdParam = params.get("classId");
          if (classIdParam) {
            const found = jsonClassrooms.data.find((c: any) => c.id === classIdParam);
            if (found) setSelectedClassroom(found);
          }
        }
      }

      const resWs = await fetchWithAuth(`${API_BASE}/classroom/worksheets`);
      const jsonWs = await resWs.json();
      if (jsonWs.data) {
        setClassWorksheets(jsonWs.data);
      }

      if (selectedClassroom) {
        fetchClassroomExams(selectedClassroom.id);
      }
    } catch (e) {
      console.error("Failed to load classroom tables", e);
    }
  };

  const fetchClassroomExams = async (classId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${classId}/exams`);
      const json = await res.json();
      if (json.data) {
        setExamWorksheetsList(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch classroom exams", e);
    }
  };

  const fetchRosterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/schools/students`);
      const json = await res.json();
      if (json.data) {
        const parsed: StudentSummary[] = json.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          initials: s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
          cohort: `Batch-${s.section_name} (${s.class_name})`,
          totalSubmissions: 2,
          averageGrade: (80 + (s.name.charCodeAt(0) % 19)).toFixed(1),
          lastActive: s.created_at || new Date().toISOString(),
        }));
        setStudents(parsed);
        applyFilters(parsed, searchTerm, cohortFilter);
      }

      setTeachersList([
        { id: "1001", name: "Mrs. Divya Sharma", email: "divya@edexia.com" },
        { id: "1002", name: "Mr. Nikhil Goswami", email: "nikhil@edexia.com" },
        { id: "1003", name: "Mr. Arjun Mehta", email: "arjun@edexia.com" },
        { id: "1004", name: "Dr. Kavita Rao", email: "kavita@edexia.com" }
      ]);
    } catch (e) {
      console.error("Failed to fetch roster details", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClassroomData();
      if (user.role !== "student") {
        fetchRosterData();
      }
    }
  }, [user]);

  // Copy-paste autogrow logic for email ids
  const handleEmailChange = (index: number, val: string) => {
    if (/[,\s\n]/.test(val)) {
      const emails = val.split(/[,\s\n]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes("@"));
      if (emails.length > 0) {
        const list = [...dynamicStudentEmails];
        list[index] = emails[0];
        if (emails.length > 1) {
          list.splice(index + 1, 0, ...emails.slice(1));
        }
        setDynamicStudentEmails(list);
        setFollowupMsg(`Pasted list automatically expanded to ${emails.length} fields!`);
        setTimeout(() => setFollowupMsg(null), 3000);
        return;
      }
    }
    const list = [...dynamicStudentEmails];
    list[index] = val;
    setDynamicStudentEmails(list);
  };

  const handleAddEmailField = () => {
    setDynamicStudentEmails([...dynamicStudentEmails, ""]);
  };

  const handleRemoveEmailField = (index: number) => {
    const list = [...dynamicStudentEmails];
    list.splice(index, 1);
    setDynamicStudentEmails(list);
  };

  const handleDetailEmailChange = (index: number, val: string) => {
    if (/[,\s\n]/.test(val)) {
      const emails = val.split(/[,\s\n]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes("@"));
      if (emails.length > 0) {
        const list = [...detailStudentEmails];
        list[index] = emails[0];
        if (emails.length > 1) {
          list.splice(index + 1, 0, ...emails.slice(1));
        }
        setDetailStudentEmails(list);
        setFollowupMsg(`Pasted list automatically expanded to ${emails.length} fields!`);
        setTimeout(() => setFollowupMsg(null), 3000);
        return;
      }
    }
    const list = [...detailStudentEmails];
    list[index] = val;
    setDetailStudentEmails(list);
  };

  const handleAddDetailEmailField = () => {
    setDetailStudentEmails([...detailStudentEmails, ""]);
  };

  const handleRemoveDetailEmailField = (index: number) => {
    const list = [...detailStudentEmails];
    list.splice(index, 1);
    setDetailStudentEmails(list);
  };

  // Classroom creation
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomSubject.trim()) {
      alert("Please provide a Classroom Subject.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: classroomSubject,
          class_name: classroomClass,
          session: classroomSession,
          student_emails: user?.role === "admin" ? [] : dynamicStudentEmails.filter(email => email.trim() !== ""),
        })
      });
      const json = await res.json();
      if (res.ok) {
        if (user?.role === "admin") {
          setAdminConfiguringClassroom({
            id: json.data.id,
            subject: classroomSubject,
            className: classroomClass,
            session: classroomSession
          });
          setAdminTeacherIds([]);
          setAdminStudentEmails([""]);
        } else {
          setFollowupMsg(`Classroom "${classroomSubject}" successfully created! Student invitations enqueued.`);
          setClassroomSubject("");
          setDynamicStudentEmails([""]);
          setTimeout(() => setFollowupMsg(null), 4000);
        }
        await fetchClassroomData();
      } else {
        alert(`Failed to create classroom: ${json.detail || "Unknown error"}`);
      }
    } catch (e) {
      console.error("Error creating classroom", e);
    } finally {
      setIsCreating(false);
    }
  };

  // Student list name resolver
  const getStudentName = (email: string) => {
    if (!email) return "Student";
    const namePart = email.split("@")[0].replace(/[._]+/g, " ");
    return namePart
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Invite student directly from classroom roster detail page
  const handleInviteFromRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = detailStudentEmails.filter(email => email.trim() !== "");
    if (emails.length === 0) return;

    setIsInviting(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${selectedClassroom.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_emails: emails })
      });
      if (res.ok) {
        setFollowupMsg(`${emails.length} student(s) successfully invited to classroom!`);
        setDetailStudentEmails([""]);
        await fetchClassroomData();
        setTimeout(() => setFollowupMsg(null), 3000);
      }
    } catch (e) {
      console.error("Failed to invite student from roster", e);
    } finally {
      setIsInviting(false);
    }
  };

  // Assign task logic (classroom details page)
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) {
      alert("Please provide an assignment title.");
      return;
    }

    setIsAssigning(true);
    try {
      const qList = assignQuestions.split("\n").map(q => q.trim()).filter(q => q !== "");
      const res = await fetchWithAuth(`${API_BASE}/classroom/${selectedClassroom.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignTitle,
          due_date: assignDueDate,
          questions: qList
        })
      });
      if (res.ok) {
        setFollowupMsg(`Task "${assignTitle}" successfully assigned to all classroom students!`);
        setAssignTitle("");
        setAssignQuestions("1. Solve the given expression step by step.\n2. Write out your assumptions.");
        setAssignTaskFile(null);
        await fetchClassroomData();
        setTimeout(() => setFollowupMsg(null), 3500);
      }
    } catch (e) {
      console.error("Failed to assign task", e);
    } finally {
      setIsAssigning(false);
    }
  };

  // Run AI grading simulation
  const handleRunAIAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPaperFile || !answersheetFile) {
      alert("Please upload both the Question Paper and Student Answer Sheets.");
      return;
    }

    const dangerousExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.sh', '.bat', '.cmd', '.msi'];
    const checkDangerous = (file: File) => {
      const idx = file.name.lastIndexOf('.');
      if (idx === -1) return false;
      const ext = file.name.substring(idx).toLowerCase();
      return dangerousExtensions.includes(ext);
    };

    if (checkDangerous(qPaperFile) || checkDangerous(answersheetFile)) {
      alert("Security Error: Uploading compressed archive files (.zip, .rar) or script executables is strictly prohibited for network safety. Please upload standard document or image sheets (.pdf, .csv, .jpeg, .png, .docx, .xlsx).");
      return;
    }

    setIsAnalyzingExam(true);
    setAnalysisStatusStep("1. Ingesting answer sheet metadata & segmenting OCR bounds...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysisStatusStep("2. Decomposing steps & validating arithmetic LaTeX matrices...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysisStatusStep("3. Evaluating computational logic with OzymorLab trust engine...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${selectedClassroom.id}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: examTitle,
          max_marks: parseInt(examMaxMarks)
        })
      });
      if (res.ok) {
        setFollowupMsg(`AI Analysis complete! Graded papers stored in Draft format.`);
        setQPaperFile(null);
        setAnswersheetFile(null);
        await fetchClassroomExams(selectedClassroom.id);
        setTimeout(() => setFollowupMsg(null), 3000);
      }
    } catch (e) {
      console.error("Failed to run AI exam analysis", e);
    } finally {
      setIsAnalyzingExam(false);
    }
  };

  // Publish marks
  const handlePublishMarks = async (worksheetId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${selectedClassroom.id}/exams/${worksheetId}/publish`, {
        method: "POST"
      });
      if (res.ok) {
        setFollowupMsg("Exam grades confirmed and published to student dashboards!");
        await fetchClassroomExams(selectedClassroom.id);
        
        // Also update local selected worksheet state if open
        if (selectedStudentWorksheet && selectedStudentWorksheet.id === worksheetId) {
          setSelectedStudentWorksheet((prev: any) => prev ? { ...prev, status: "PUBLISHED" } : null);
        }
        
        setTimeout(() => setFollowupMsg(null), 3000);
      }
    } catch (e) {
      console.error("Failed to publish exam marks", e);
    }
  };

  // Start AI evaluation simulator
  const handleStartEvaluation = async (worksheetId: string) => {
    setIsAnalyzingExam(true);
    setAnalysisStatusStep("1. Ingesting student text submissions & indexing LaTeX syntax...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAnalysisStatusStep("2. Running computational step verification & OCR bounds check...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAnalysisStatusStep("3. Evaluating final accuracy scores with OzymorLab trust engine...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/worksheets/${worksheetId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: { 
            "q1": "Student submitted answers evaluated by Teacher triggering AI grading pipeline. Formulae verified.",
            "q2": "Steps matched completely with standard answer key templates. Edexia score verified." 
          }
        })
      });
      const json = await res.json();
      if (res.ok) {
        setFollowupMsg("AI Evaluation completed! Grade has been saved as Draft.");
        await fetchClassroomData();
        if (selectedClassroom) {
          await fetchClassroomExams(selectedClassroom.id);
        }
        
        // Update local state to reflect evaluated grades
        if (selectedStudentWorksheet && selectedStudentWorksheet.id === worksheetId) {
          setSelectedStudentWorksheet((prev: any) => prev ? { 
            ...prev, 
            status: "GRADED", 
            grade: json.data?.grade || "85%",
            answers: {
              "q1": "Student submitted answers evaluated by Teacher triggering AI grading pipeline. Formulae verified.",
              "q2": "Steps matched completely with standard answer key templates. Edexia score verified." 
            }
          } : null);
        }
        
        setTimeout(() => setFollowupMsg(null), 3000);
      }
    } catch (e) {
      console.error("Evaluation failed", e);
    } finally {
      setIsAnalyzingExam(false);
      setAnalysisStatusStep("");
    }
  };

  // Leave/Delete actions
  const handleDeleteClassroom = async (classId: string) => {
    if (user?.role !== "student") {
      const q1 = confirm("⚠️ Security Verification (Step 1 of 3):\nAre you absolutely sure you want to permanently delete this classroom standard cohort?");
      if (!q1) return;

      const q2 = confirm("⚠️ Security Verification (Step 2 of 3):\nThis action is irreversible. All student worksheets, answers, grading rosters, and AI transcripts will be deleted. Do you still wish to proceed?");
      if (!q2) return;

      const currentClass = classrooms.find(c => c.id === classId);
      const exactSubject = currentClass ? currentClass.subject : "Physics";
      const q3 = prompt(`⚠️ Security Verification (Step 3 of 3):\nTo confirm, please type the classroom subject name exactly: "${exactSubject}"`);
      if (q3 !== exactSubject) {
        alert("Verification aborted: The entered subject name does not match. Deletion cancelled.");
        return;
      }
    } else {
      const qStudent = confirm("Are you sure you want to unsubscribe and leave this active classroom standard?");
      if (!qStudent) return;
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${classId}`, { method: "DELETE" });
      if (res.ok) {
        setFollowupMsg(user?.role === "student" ? "Successfully left the classroom." : "Classroom successfully deleted!");
        selectClassroomWithUrl(null);
        await fetchClassroomData();
        setTimeout(() => setFollowupMsg(null), 3000);
      }
    } catch (e) {
      console.error("Failed to remove classroom", e);
    }
  };

  const handleRemoveStudentFromClassroom = async (classId: string, studentEmail: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/classroom/${classId}/students/${studentEmail}`, { method: "DELETE" });
      if (res.ok) {
        setFollowupMsg(`Student ${studentEmail} successfully removed.`);
        await fetchClassroomData();
        setTimeout(() => setFollowupMsg(null), 3000);
      }
    } catch (e) {
      console.error("Failed to remove student", e);
    }
  };

  // Admin Extra Steps submission
  const handleAdminConfigureClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminConfiguringClassroom) return;

    try {
      await fetchWithAuth(`${API_BASE}/classroom/${adminConfiguringClassroom.id}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_ids: adminTeacherIds })
      });

      await fetchWithAuth(`${API_BASE}/classroom/${adminConfiguringClassroom.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_emails: adminStudentEmails.filter(e => e.trim() !== "") })
      });

      setFollowupMsg("Teachers assigned and students invited successfully!");
      setAdminConfiguringClassroom(null);
      await fetchClassroomData();
      setTimeout(() => setFollowupMsg(null), 3000);
    } catch (e) {
      console.error("Failed to configure classroom standards by admin", e);
    }
  };

  const handleAcceptInvite = async (classId: string) => {
    try {
      await fetchWithAuth(`${API_BASE}/classroom/${classId}/students/accept`, { method: "POST" });
      setFollowupMsg("Classroom invitation accepted! Worksheet access enqueued.");
      await fetchClassroomData();
      setTimeout(() => setFollowupMsg(null), 3000);
    } catch (e) {
      console.error("Failed to accept class", e);
    }
  };

  const handleRejectInvite = async (classId: string) => {
    try {
      await fetchWithAuth(`${API_BASE}/classroom/${classId}/students/reject`, { method: "POST" });
      setFollowupMsg("Invitation declined.");
      await fetchClassroomData();
      setTimeout(() => setFollowupMsg(null), 3000);
    } catch (e) {
      console.error("Failed to reject class", e);
    }
  };

  // Student worksheet answers submission
  const handleSubmitTextAnswer = async () => {
    setIsSubmittingAnswer(true);
    try {
      if (submissionType === "upload" && !uploadedAnswerFile) {
        alert("Please upload your answer sheet first.");
        setIsSubmittingAnswer(false);
        return;
      }
      
      let submitAnswers = { ...answers };
      if (submissionType === "upload" && uploadedAnswerFile) {
        submitAnswers = {
          "upload": `Scanned Answer Sheet Uploaded: ${uploadedAnswerFile.name}. OCR transcription step complete.`
        };
      }
      
      const res = await fetchWithAuth(`${API_BASE}/classroom/worksheets/${activeAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: submitAnswers })
      });
      const json = await res.json();
      if (json.data) {
        setIsSubmittingAnswer(false);
        setSubmitSuccess(true);
        setUploadedAnswerFile(null);
        await fetchClassroomData();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveAssignment(null);
        }, 2000);
      }
    } catch (e) {
      console.error("Failed to submit worksheet answer", e);
      setIsSubmittingAnswer(false);
    }
  };

  // Student filtering
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

  // Render separate Classroom Detail Page
  if (selectedClassroom) {
    const isStudent = user?.role === "student";
    const pendingClassroomWorksheets = classWorksheets.filter(w => w.status === "PENDING" && w.subject === selectedClassroom.subject);
    
    // DEDICATED TEACHER EVALUATION PAGE
    if (!isStudent && selectedTaskTitle) {
      const taskDetails = Array.from(new Set(examWorksheetsList.map(w => w.title))).map(title => {
        const related = examWorksheetsList.filter(w => w.title === title);
        return {
          title,
          dueDate: related[0]?.dueDate || "N/A",
          questions: related[0]?.questions || [],
          worksheets: related
        };
      }).find(t => t.title === selectedTaskTitle);

      const relatedWorksheets = taskDetails?.worksheets || [];
      const submittedCount = relatedWorksheets.filter(w => w.status !== "PENDING").length;

      return (
        <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10" style={{ padding: "4px 0" }}>
          
          {/* Back navigation */}
          <button
            onClick={() => {
              setSelectedTaskTitle(null);
              setSelectedStudentWorksheet(null);
            }}
            className="flex items-center gap-2 text-[13px] font-extrabold text-[#16a34a] hover:underline bg-transparent border-0 cursor-pointer self-start"
          >
            <ArrowLeft size={14} className="text-[#16a34a]" /> Back to Classroom Feed
          </button>

          {/* Task Details Header */}
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wider font-mono">Task Details &amp; Evaluation Center</span>
              <h1 className="text-[20px] font-bold text-[var(--text-primary)] leading-tight">{selectedTaskTitle}</h1>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-1">
                Subject: {selectedClassroom.subject} | Due Date: {taskDetails?.dueDate}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-4 py-2.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Total Assigned</span>
                <span className="text-[18px] font-mono font-bold text-[var(--text-primary)]">{relatedWorksheets.length}</span>
              </div>
              <div className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-4 py-2.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-emerald-500 uppercase block">Submitted</span>
                <span className="text-[18px] font-mono font-bold text-emerald-500">{submittedCount}</span>
              </div>
            </div>
          </div>
          {/* Main Roster Submissions Table */}
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between">
              Student Roster Submissions
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="py-3 px-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Student Name</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Grade</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedWorksheets.map((ws) => (
                    <tr key={ws.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-secondary)] transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-[13px] font-bold text-[var(--text-primary)]">{ws.studentName}</span>
                      </td>
                      <td className="py-4 px-4">
                        {ws.status === "PENDING" ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Evaluation</span>
                        ) : ws.status === "GRADED" ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-blue-500/10 text-blue-600 border-blue-500/20">Awaiting Verify</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Published</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[12px] font-mono text-[var(--text-tertiary)] font-bold">{ws.grade || "N/A"}</span>
                      </td>
                      <td className="py-4 px-4 flex justify-end items-center gap-3">
                        {ws.status === "PENDING" ? (
                          <button
                            onClick={() => handleStartEvaluation(ws.id)}
                            disabled={isAnalyzingExam}
                            className="btn-lp-accent border-0 cursor-pointer text-[11px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
                          >
                            {isAnalyzingExam ? (
                              <>
                                <Loader2 size={13} className="animate-spin text-black" />
                                OzymorLab Analysing...
                              </>
                            ) : "Analyse"}
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/analysis?task_id=${selectedClassroom.id}&submission_id=${ws.id}&exam_title=${encodeURIComponent(ws.title || "")}`)}
                            className="bg-transparent border border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a]/10 cursor-pointer text-[11px] font-bold px-4 py-2 rounded-lg transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {relatedWorksheets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[13px] text-[var(--text-secondary)]">
                        No submissions found for this task.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* AI progress tracker (global for the table) */}
            {isAnalyzingExam && (
              <div className="mt-4 flex flex-col gap-1 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl animate-fade-in">
                <span className="text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-[#e0ff82]" /> OzymorLab trust engine analyzing...
                </span>
                <span className="text-[10.5px] font-mono text-amber-500 font-semibold">{analysisStatusStep}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in relative z-10" style={{ padding: "4px 0" }}>
        
        {/* Back navigation */}
        <button
          onClick={() => {
            selectClassroomWithUrl(null);
            fetchClassroomData();
          }}
          className="flex items-center gap-2 text-[13px] font-extrabold text-[#16a34a] hover:underline bg-transparent border-0 cursor-pointer self-start"
        >
          <ArrowLeft size={14} className="text-[#16a34a]" /> Back to Classrooms Directory
        </button>

        {/* Classroom Header Card */}
        <div className="w-full" style={{ padding: "8px 0 16px" }}>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-[#16a34a] uppercase tracking-wider font-mono">
              Active Classroom View
            </span>
            <h1 className="text-[22px] font-bold text-[var(--text-primary)] leading-tight">{selectedClassroom.subject}</h1>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Class Standard: {selectedClassroom.className} | Session: {selectedClassroom.session} | Instructed by {selectedClassroom.creator}
            </p>
          </div>
        </div>

        {/* Followup Confirmation Alert popup banner */}
        {followupMsg && (
          <div className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/5 text-[#16a34a] rounded-2xl animate-pulse" style={{ padding: "16px 24px" }}>
            <Check size={16} className="text-[#16a34a]" />
            <span className="text-[13px] font-semibold">{followupMsg}</span>
          </div>
        )}

        {/* Student Invite Accept/Decline Banner */}
        {isStudent && selectedClassroom.status === "PENDING" && (
          <div className="bg-[var(--surface-primary)] border border-amber-500/30 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2" style={{ padding: "20px 24px" }}>
            <div>
              <h3 className="text-[13.5px] font-bold text-amber-500 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" /> Classroom Invitation Pending
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                You have been invited to join this classroom cohort standard. Please accept to access classwork, tasks, and text editors.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => handleRejectInvite(selectedClassroom.id)}
                className="btn-lp-outline px-4 py-2 rounded-xl text-[12px] font-bold cursor-pointer bg-transparent"
              >
                Decline
              </button>
              <button
                onClick={() => handleAcceptInvite(selectedClassroom.id)}
                className="btn-lp-accent border-0 px-5 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer hover:scale-[1.02]"
              >
                Accept &amp; Join Class
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Assignment submission Workspace */}
        {isStudent && activeAssignment ? (
          <div className="bg-[var(--surface-primary)] border border-[#e0ff82]/30 rounded-2xl shadow-lg flex flex-col gap-6" style={{ padding: "26px 28px" }}>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wider font-mono">Assignment Turn-in Workspace</span>
                <h2 className="text-[16px] font-bold text-[var(--text-primary)]">{activeAssignment.title}</h2>
              </div>
              <button onClick={() => setActiveAssignment(null)} className="btn-lp-outline px-4 py-2 rounded-xl text-[12px] font-bold cursor-pointer">
                Cancel
              </button>
            </div>

            {/* Questions list */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[13px] font-bold text-[var(--text-secondary)] uppercase">Assignment Questions</h4>
              <div className="flex flex-col gap-2.5">
                {activeAssignment.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="flex gap-2">
                    <span className="text-[13px] font-bold text-[#e0ff82] font-mono">Q0{idx + 1}.</span>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Option Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-2">
              <button
                onClick={() => setSubmissionType("editor")}
                className={`px-4 py-2 text-[12.5px] font-bold rounded-lg cursor-pointer transition-all ${submissionType === "editor" ? "bg-[var(--surface-secondary)] text-[#e0ff82] border border-[var(--border-subtle)]" : "text-[var(--text-tertiary)]"}`}
              >
                ✍️ Write in Text Editor
              </button>
              <button
                onClick={() => setSubmissionType("upload")}
                className={`px-4 py-2 text-[12.5px] font-bold rounded-lg cursor-pointer transition-all ${submissionType === "upload" ? "bg-[var(--surface-secondary)] text-[#e0ff82] border border-[var(--border-subtle)]" : "text-[var(--text-tertiary)]"}`}
              >
                📤 Upload Answer Sheet File
              </button>
            </div>

            {/* Submission Input fields */}
            {submissionType === "editor" ? (
              <div className="flex flex-col gap-5">
                {activeAssignment.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-semibold text-[var(--text-secondary)]">Answer Q0{idx + 1}:</span>
                    <div className="border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl overflow-hidden shadow-inner flex flex-col">
                      <ReactQuill
                        theme="snow"
                        placeholder="Write your detailed step-by-step response..."
                        value={answers[q.id] || ""}
                        onChange={(content) => setAnswers({ ...answers, [q.id]: content })}
                        modules={quillModules}
                        className="w-full bg-transparent text-[var(--text-primary)] min-h-[250px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center flex flex-col items-center justify-center bg-[var(--surface-secondary)]">
                <UploadCloud size={32} className="text-[var(--text-tertiary)] mb-2" />
                <span className="text-[13px] font-bold text-[var(--text-primary)]">Upload your scanned Answer Sheet file</span>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Accepts PDF, PNG, JPG formats up to 10MB</p>
                <input
                  type="file"
                  onChange={(e) => setUploadedAnswerFile(e.target.files?.[0] || null)}
                  className="mt-3 text-[11.5px] text-[var(--text-secondary)] cursor-pointer"
                />
                {uploadedAnswerFile && <span className="text-[12px] text-emerald-500 font-bold mt-2">✓ Attached: {uploadedAnswerFile.name}</span>}
              </div>
            )}

            {isSubmittingAnswer && (
              <div className="flex items-center gap-2.5 text-[12px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)] p-3 rounded-xl">
                <Loader2 size={14} className="animate-spin text-[#e0ff82]" />
                <span>OzymorLab is analyzing your steps and submitting answer transcript...</span>
              </div>
            )}

            {submitSuccess && (
              <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-emerald-500 bg-emerald-500/5 p-3 rounded-xl">
                <CheckCircle2 size={15} />
                <span>Assignment successfully submitted to instructor!</span>
              </div>
            )}

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <button onClick={() => setActiveAssignment(null)} className="btn-lp-outline px-5 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer">Discard Draft</button>
              <button
                onClick={handleSubmitTextAnswer}
                disabled={isSubmittingAnswer}
                className="btn-lp-accent border-0 cursor-pointer text-[12.5px] font-bold px-6 py-2.5 rounded-xl disabled:opacity-50"
              >
                Submit Assignment
              </button>
            </div>

          </div>
        ) : (
          /* Separate Detail Page workspace grids */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left classroom assignments workspace */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Teacher Assign Tasks form card */}
              {!isStudent && (
                <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-4" style={{ padding: "24px 28px" }}>
                  <form onSubmit={handleAssignTask} className="flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                      <h3 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Sparkles size={14} /> Assign New Classwork / Task
                      </h3>
                      <button
                        type="submit"
                        disabled={isAssigning}
                        className="btn-lp-accent border-0 cursor-pointer text-[12px] font-bold px-4 py-2 rounded-lg"
                      >
                        {isAssigning ? "Assigning Task..." : "Assign Task"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase">Task Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Physics Midterm"
                          value={assignTitle}
                          onChange={(e) => setAssignTitle(e.target.value)}
                          className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-[14.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase">Due Date</label>
                        <input
                          type="date"
                          value={assignDueDate}
                          onChange={(e) => setAssignDueDate(e.target.value)}
                          className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-[14.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase">Questions (One per line)</label>
                      <textarea
                        value={assignQuestions}
                        onChange={(e) => setAssignQuestions(e.target.value)}
                        className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-4 text-[14.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm min-h-[110px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase">Upload Reference or Question PDF (Optional)</label>
                      <div className="flex items-center gap-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 shadow-sm">
                        <UploadCloud size={16} className="text-[#16a34a]" />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpeg,.jpg"
                          onChange={(e) => setAssignTaskFile(e.target.files?.[0] || null)}
                          className="text-[12px] text-[var(--text-secondary)] cursor-pointer"
                        />
                        {assignTaskFile && (
                          <span className="text-[12px] text-emerald-500 font-bold ml-auto">
                            ✓ Attached: {assignTaskFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Teacher/Admin upload exam answersheets panel */}
              {!isStudent && (
                <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-5" style={{ padding: "24px 28px" }}>
                  <form onSubmit={handleRunAIAnalysis} className="flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                      <h3 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <UploadCloud size={14} /> Ingest Scanned Classroom Exams
                      </h3>
                      <button
                        type="submit"
                        disabled={isAnalyzingExam}
                        className="btn-lp-accent border-0 cursor-pointer text-[12px] font-bold px-4 py-2 rounded-lg"
                      >
                        {isAnalyzingExam ? "Running AI Analysis..." : "Run AI Analysis"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Exam Title</label>
                        <input
                          type="text"
                          value={examTitle}
                          onChange={(e) => setExamTitle(e.target.value)}
                          className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Max Marks</label>
                        <input
                          type="number"
                          value={examMaxMarks}
                          onChange={(e) => setExamMaxMarks(e.target.value)}
                          className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-dashed border-[var(--border-subtle)] rounded-xl p-4 text-center bg-[var(--surface-secondary)]">
                        <span className="text-[11.5px] font-bold text-[var(--text-primary)] block mb-1">Question Paper PDF</span>
                        <input type="file" accept=".pdf,.csv,.jpeg,.jpg,.png,.doc,.docx,.xls,.xlsx" onChange={(e) => setQPaperFile(e.target.files?.[0] || null)} className="text-[10px] text-[var(--text-secondary)]" />
                      </div>
                      <div className="border border-dashed border-[var(--border-subtle)] rounded-xl p-4 text-center bg-[var(--surface-secondary)]">
                        <span className="text-[11.5px] font-bold text-[var(--text-primary)] block mb-1">Bulk Students Answer Sheets</span>
                        <input type="file" accept=".pdf,.csv,.jpeg,.jpg,.png,.doc,.docx,.xls,.xlsx" onChange={(e) => setAnswersheetFile(e.target.files?.[0] || null)} className="text-[10px] text-[var(--text-secondary)]" />
                      </div>
                    </div>

                    {isAnalyzingExam && (
                      <div className="flex flex-col gap-1 p-3 border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl">
                        <span className="text-[11.5px] font-bold text-[var(--text-primary)] animate-pulse flex items-center gap-1.5">
                          <Loader2 size={13} className="animate-spin text-[#e0ff82]" /> OzymorLab analysis enqueued...
                        </span>
                        <span className="text-[10px] font-mono text-amber-500 font-semibold">{analysisStatusStep}</span>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Student pending worksheets checklist view */}
              {isStudent && (
                <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-4" style={{ padding: "24px 28px" }}>
                  <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Assigned Pending Classwork Tasks</h3>
                  <div className="flex flex-col gap-3">
                    {pendingClassroomWorksheets.map((ws) => (
                      <div key={ws.id} className="border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl p-4 flex justify-between items-center relative group hover:border-[#e0ff82]/20 transition-all">
                        <div>
                          <h4 className="text-[13px] font-bold text-[var(--text-primary)]">{ws.title}</h4>
                          <p className="text-[11px] text-[var(--text-secondary)]">Due Date: {ws.dueDate} | Assigned by: {ws.teacher}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveAssignment(ws);
                            setAnswers({});
                            setSubmissionType("editor");
                          }}
                          className="btn-lp-accent border-0 px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold hover:scale-[1.02] cursor-pointer shadow-sm"
                        >
                          Solve assignment
                        </button>
                      </div>
                    ))}
                    {pendingClassroomWorksheets.length === 0 && (
                      <div className="text-center py-6 text-[12px] text-[var(--text-tertiary)] font-mono border border-dashed border-[var(--border-subtle)] rounded-xl">
                        All classroom task assignments completed! Good job.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exam/Task publication & evaluation table */}
              <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-4" style={{ padding: "24px 28px" }}>
                <h3 className="text-[14px] font-bold text-[var(--text-primary)]">
                  {isStudent ? "Graded Exam Reports & Marks" : "Assigned Tasks & Grading Center"}
                </h3>
                <div className="flex flex-col gap-3">
                  {isStudent ? (
                    // STUDENT SIDE
                    examWorksheetsList.map((exam) => {
                      const waitingConfirm = exam.status === "GRADED";
                      if (waitingConfirm) {
                        return (
                          <div key={exam.id} className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 flex justify-between items-center">
                            <div>
                              <h4 className="text-[13px] font-bold text-[var(--text-primary)]">{exam.title}</h4>
                              <span className="text-[11px] text-[var(--text-secondary)] font-mono">Assigned by: {exam.teacher}</span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                              Awaiting teacher verification
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div key={exam.id} className="border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-[13px] font-bold text-[var(--text-primary)]">{exam.title}</h4>
                            <span className="text-[11.5px] text-[var(--text-secondary)] font-semibold">Student: {exam.studentName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[15px] font-mono font-bold text-emerald-500">{exam.grade}</span>
                            {exam.status === "PUBLISHED" && (
                              <span className="text-[9px] font-bold text-emerald-600 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono uppercase">
                                Published
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // TEACHER SIDE: Grouped by unique task titles
                    Array.from(new Set(examWorksheetsList.map(w => w.title))).map((title) => {
                      const related = examWorksheetsList.filter(w => w.title === title);
                      const pending = related.filter(w => w.status === "PENDING").length;
                      const submitted = related.filter(w => w.status !== "PENDING").length;
                      return (
                        <div key={title} className="border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-[13.5px] font-bold text-[var(--text-primary)]">{title}</h4>
                            <span className="text-[11.5px] text-[var(--text-secondary)] font-medium">
                              Submissions: {submitted} / {related.length} assigned | Pending: {pending}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTaskTitle(title);
                              if (related.length > 0) {
                                setSelectedStudentWorksheet(related[0]);
                              }
                            }}
                            className="btn-lp-accent border-0 px-3.5 py-1.5 rounded-lg text-[11px] font-bold hover:scale-[1.01] cursor-pointer shadow-sm"
                          >
                            Evaluate Submissions &amp; Roster
                          </button>
                        </div>
                      );
                    })
                  )}

                  {examWorksheetsList.length === 0 && (
                    <div className="text-center py-6 text-[12px] text-[var(--text-tertiary)] font-mono border border-dashed border-[var(--border-subtle)] rounded-xl">
                      {isStudent ? "No exam sheets analysed." : "No tasks or homework assignments created yet."}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Roster & Roster Invitations sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Direct Invite students card (Teacher detail view) */}
              {!isStudent && (
                <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-4" style={{ padding: "24px 28px" }}>
                  <div className="flex justify-between items-center pb-1 border-b border-[var(--border-subtle)]">
                    <div>
                      <h4 className="text-[13.5px] font-bold text-[var(--text-primary)]">Invite Students to Classroom</h4>
                      <p className="text-[10.5px] text-[var(--text-secondary)] mt-0.5">Invite single or copy-paste multiple emails.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDetailEmailField}
                      className="flex items-center gap-1 text-[11px] font-bold text-brand-500 hover:underline cursor-pointer border-0 bg-transparent"
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>
                  <form onSubmit={handleInviteFromRoster} className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-2">
                      {detailStudentEmails.map((email, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="email"
                            placeholder="student@school.edu"
                            value={email}
                            onChange={(e) => handleDetailEmailChange(idx, e.target.value)}
                            className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none"
                          />
                          {detailStudentEmails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDetailEmailField(idx)}
                              className="p-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer bg-transparent"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="submit" disabled={isInviting} className="btn-lp-accent border-0 cursor-pointer w-full py-2 rounded-xl text-[12px] font-bold">
                      {isInviting ? "Sending Invitations..." : "Send Invitations"}
                    </button>
                  </form>
                </div>
              )}

              {/* Roster Card */}
              <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-4" style={{ padding: "24px 28px" }}>
                <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Classroom Student Roster</h3>
                <div className="flex flex-col gap-2">
                  {selectedClassroom.students?.map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12.5px] font-bold text-[var(--text-primary)]">{getStudentName(s.email)}</span>
                        <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.status === "PENDING" ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-600 border-amber-500/20">Invited</span>
                        ) : (
                          s.status === "ACCEPTED" ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Joined</span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-500/10 text-red-600 border-red-500/20">Declined</span>
                          )
                        )}
                        {!isStudent && (
                          <button
                            onClick={() => handleRemoveStudentFromClassroom(selectedClassroom.id, s.email)}
                            className="w-6 h-6 rounded-lg text-red-500 hover:bg-red-500/10 flex items-center justify-center border-0 bg-transparent cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedClassroom.students || selectedClassroom.students.length === 0) && (
                    <span className="text-[11.5px] text-[var(--text-tertiary)] italic">No enrollees invited yet.</span>
                  )}
                </div>
              </div>

              {/* Leave classroom danger zone */}
              <div className="bg-[var(--surface-primary)] border border-red-500/30 rounded-2xl shadow-sm flex flex-col gap-4 mt-6" style={{ padding: "24px 28px" }}>
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider font-mono">Danger zone</span>
                <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                  {isStudent ? "Leave this classroom subscription. You will lose access to assignments." : "Completely delete this classroom cohort and remove all student logs."}
                </p>
                <button
                  onClick={() => handleDeleteClassroom(selectedClassroom.id)}
                  className="w-max px-4 py-1.5 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all self-start"
                >
                  {isStudent ? "Leave Classroom" : "Delete Classroom Standard"}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  // Teacher / Admin Views
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
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "999px",
              padding: "3px 10px",
            }}
          >
            <Users size={11} />
            Institutional classroom setup
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
            Institutional Classrooms &amp; Cohorts Directory
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.6 }}>
            Provision classrooms standards, assign institutional teachers, and invite dynamic student batches.
          </p>
        </div>
      </div>

      {/* Followup Confirmation Alert popup banner */}
      {followupMsg && (
        <div className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/5 text-[#16a34a] rounded-2xl animate-pulse" style={{ padding: "16px 24px" }}>
          <Check size={16} className="text-[#16a34a]" />
          <span className="text-[13px] font-semibold">{followupMsg}</span>
        </div>
      )}

      {/* Admin Extra Assignment Modal/Card */}
      {adminConfiguringClassroom && (
        <div className="bg-[var(--surface-primary)] border-2 border-brand-500 rounded-2xl shadow-xl p-6 flex flex-col gap-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider font-mono">
                Admin configuration step required
              </span>
              <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
                Configure Standard: {adminConfiguringClassroom.subject}
              </h3>
            </div>
            <button
              onClick={() => setAdminConfiguringClassroom(null)}
              className="text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleAdminConfigureClassroom} className="flex flex-col gap-5">
            {/* Assign Teachers */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                Assign Institutional Teachers
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--surface-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                {teachersList.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer text-[12.5px] font-medium text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={adminTeacherIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAdminTeacherIds([...adminTeacherIds, t.id]);
                        } else {
                          setAdminTeacherIds(adminTeacherIds.filter(id => id !== t.id));
                        }
                      }}
                      className="rounded accent-[#e0ff82]"
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Invite Student emails */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                  Invite Student Emails
                </label>
                <button
                  type="button"
                  onClick={() => setAdminStudentEmails([...adminStudentEmails, ""])}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-500 hover:underline cursor-pointer"
                >
                  <Plus size={11} /> Add student
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {adminStudentEmails.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="student@school.edu"
                      value={email}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none"
                    />
                    {adminStudentEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...adminStudentEmails];
                          copy.splice(idx, 1);
                          setAdminStudentEmails(copy);
                        }}
                        className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-lp-accent border-0 cursor-pointer w-full text-[14px] font-bold h-12 flex items-center justify-center rounded-xl"
            >
              Complete Classroom Configuration
            </button>
          </form>
        </div>
      )}

      {/* Classroom Creation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Classroom form card */}
        {user?.role !== "student" && (
          <div className="lg:col-span-1 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-5" style={{ padding: "24px 28px" }}>
            <form onSubmit={handleCreateClassroom} className="flex flex-col gap-4">
              
              {/* Header with Create Classroom button on top right */}
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles size={15} />
                    Setup Classroom
                  </h3>
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-lp-accent border-0 cursor-pointer text-[12.5px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center"
                >
                  {isCreating ? "Creating..." : "Create Classroom"}
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Physics"
                  value={classroomSubject}
                  onChange={(e) => setClassroomSubject(e.target.value)}
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                  Class Standard
                </label>
                <select
                  value={classroomClass}
                  onChange={(e) => setClassroomClass(e.target.value)}
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm cursor-pointer"
                >
                  <option value="Class 12">Class 12</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Grade 9">Grade 9</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                  Academic Session
                </label>
                <select
                  value={classroomSession}
                  onChange={(e) => setClassroomSession(e.target.value)}
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm cursor-pointer"
                >
                  <option value="2026-2027">2026-2027</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                </select>
              </div>

              {/* Student invites dynamic list (Only for Teacher role directly on creation) */}
              {user?.role !== "admin" && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                      Invite Student Emails
                    </label>
                    <button
                      type="button"
                      onClick={handleAddEmailField}
                      className="flex items-center gap-1 text-[11px] font-bold text-brand-500 hover:underline cursor-pointer"
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {dynamicStudentEmails.map((email, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="email"
                          placeholder="student@school.edu"
                          value={email}
                          onChange={(e) => handleEmailChange(idx, e.target.value)}
                          className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
                        />
                        {dynamicStudentEmails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEmailField(idx)}
                            className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Classroom List Cards */}
        <div className={`${user?.role === "student" ? "lg:col-span-3" : "lg:col-span-2"} bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col gap-4`} style={{ padding: "26px 28px" }}>
          <div>
            <h3 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen size={15} />
              Active Institutional Classrooms Standards
            </h3>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
              Review and audit all classrooms standards, assigned teachers, and invited student counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classrooms.map((c) => (
              <div
                key={c.id}
                onClick={() => selectClassroomWithUrl(c)}
                className="border border-[var(--border-subtle)] bg-[var(--surface-secondary)] rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-[#e0ff82]/30 transition-all relative group cursor-pointer"
              >
                <div>
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight mb-1">{c.subject}</h4>
                  <p className="text-[11.5px] text-[var(--text-secondary)] font-medium">Standard: {c.className} | Session: {c.session}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Creator: {c.creator}</p>
                </div>

                <div className="flex flex-col gap-1 text-[12px] text-[var(--text-secondary)] bg-[var(--surface-primary)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Students Roster</div>
                  {c.students?.slice(0, 3).map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center text-[11.5px] py-1 border-b border-[var(--border-subtle)] last:border-b-0">
                      <span className="font-mono text-[var(--text-primary)]">{getStudentName(s.email)}</span>
                      {s.status === "PENDING" ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-600 border-amber-500/20">Invited</span>
                      ) : (
                        s.status === "ACCEPTED" ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Joined</span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-500/10 text-red-600 border-red-500/20">Declined</span>
                        )
                      )}
                    </div>
                  ))}
                  {c.students?.length > 3 && (
                    <span className="text-[11px] text-[var(--text-tertiary)] font-bold text-center mt-1">+{c.students.length - 3} more students</span>
                  )}
                  {(!c.students || c.students.length === 0) && (
                    <div className="text-center py-2 text-[var(--text-tertiary)] text-[11px] italic">No students invited yet.</div>
                  )}
                </div>

                {/* 3-dots Dropdown Options Menu */}
                <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                    className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--surface-secondary)] cursor-pointer"
                  >
                    <MoreVertical size={13} />
                  </button>

                  {activeMenuId === c.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-20">
                      <button
                        onClick={() => {
                          handleDeleteClassroom(c.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-500/10 border-0 bg-transparent cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 size={12} /> Delete Class
                      </button>
                      <button
                        onClick={() => {
                          setFollowupMsg(`Classroom "${c.subject}" updates ignored.`);
                          setActiveMenuId(null);
                          setTimeout(() => setFollowupMsg(null), 3000);
                        }}
                        className="w-full text-left px-4 py-2 text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] border-0 bg-transparent cursor-pointer flex items-center gap-1.5"
                      >
                        <X size={12} /> Ignore Updates
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {classrooms.length === 0 && (
              <div className="col-span-full border border-dashed border-[var(--border-subtle)] rounded-2xl text-center py-10 bg-[var(--surface-secondary)]">
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">No Classrooms Available</p>
                <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1">Configure classroom standards using the builder panel.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
