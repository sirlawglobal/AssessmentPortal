"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileQuestion,
  ClipboardList,
  Plus,
  Upload,
  CheckCircle,
  X,
  FileText,
  Award,
  RefreshCw,
  Trash2,
  Pencil,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "subjects" | "questions" | "assessments">("students");

  // State data
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals & forms
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ fullName: "", username: "", email: "", phoneNumber: "", password: "Password123!" });

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", description: "" });

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    type: "MCQ",
    subject: "Mathematics",
    topic: "General",
    difficulty: "Medium",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: 0,
    marks: 5,
    explanation: "",
  });
  const [csvInput, setCsvInput] = useState("");

  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    subject: "Mathematics",
    duration: 30,
    passingScore: 50,
    assessmentType: "FORMAL",
    maxAttempts: 1,
    theoryEnabled: false,
    resultReleaseMode: "IMMEDIATE",
    showCorrectAnswers: true,
    selectedQuestionIds: [] as string[],
  });
  const [assessmentTopicFilter, setAssessmentTopicFilter] = useState("All");
  const [randomPickCount, setRandomPickCount] = useState(20);

  const [assignModalAssessment, setAssignModalAssessment] = useState<any | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [gradeModalAssessment, setGradeModalAssessment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(0);
  const [theoryGrades, setTheoryGrades] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("stem-user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== "ADMIN") {
      router.replace("/student");
      return;
    }
    setReady(true);
    fetchAllData();
  }, [router]);

  async function fetchAllData() {
    setLoading(true);
    try {
      const [stuRes, subRes, qRes, aRes] = await Promise.all([
        fetch("/api/students").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
        fetch("/api/questions").then((r) => r.json()),
        fetch("/api/assessments").then((r) => r.json()),
      ]);
      if (stuRes.students) setStudents(stuRes.students);
      if (subRes.subjects) setSubjects(subRes.subjects);
      if (qRes.questions) setQuestions(qRes.questions);
      if (aRes.assessments) setAssessments(aRes.assessments);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle student creation
  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentForm),
    });
    if (res.ok) {
      setShowAddStudent(false);
      setStudentForm({ fullName: "", username: "", email: "", phoneNumber: "", password: "Password123!" });
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Failed to create student");
    }
  }

  // Handle subject creation
  async function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectForm),
    });
    if (res.ok) {
      setShowAddSubject(false);
      setSubjectForm({ name: "", description: "" });
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Failed to create subject");
    }
  }

  // Handle question creation & update
  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    const options = questionForm.type === "MCQ"
      ? [questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4].filter((o) => o?.trim())
      : [];
    const url = editQuestionId ? `/api/questions/${editQuestionId}` : "/api/questions";
    const method = editQuestionId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...questionForm,
        options,
      }),
    });
    if (res.ok) {
      setShowAddQuestion(false);
      setEditQuestionId(null);
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Failed to save question");
    }
  }

  // Handle question deletion
  async function handleDeleteQuestion(id: string) {
    if (!confirm("Are you sure you want to delete this question from the bank?")) return;
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Failed to delete question");
    }
  }

  // Handle assessment deletion
  async function handleDeleteAssessment(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete assessment "${title}" along with all student submissions/assignments?`)) return;
    const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Failed to delete assessment");
    }
  }

  // Handle bulk import
  async function handleBulkImport() {
    if (!csvInput.trim()) return alert("Paste CSV data first");
    const res = await fetch("/api/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", data: csvInput }),
    });
    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      setShowBulkImport(false);
      setCsvInput("");
      fetchAllData();
    } else {
      alert(result.message || "Bulk import failed");
    }
  }

  // Handle assessment creation
  async function handleCreateAssessment(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...assessmentForm,
        questionIds: assessmentForm.selectedQuestionIds,
      }),
    });
    if (res.ok) {
      setShowAddAssessment(false);
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Failed to create assessment");
    }
  }

  // Handle assignment
  async function handleAssignAssessment() {
    if (!assignModalAssessment || selectedStudentIds.length === 0) return;
    const res = await fetch(`/api/assessments/${assignModalAssessment.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: selectedStudentIds }),
    });
    if (res.ok) {
      alert("Assessment assigned successfully!");
      setAssignModalAssessment(null);
      setSelectedStudentIds([]);
      fetchAllData();
    } else {
      const err = await res.json();
      alert(err.message || "Assignment failed");
    }
  }

  // Load submissions for grading
  async function openGradingModal(assessment: any) {
    setGradeModalAssessment(assessment);
    setSelectedSubmission(null);
    const res = await fetch(`/api/assessments/${assessment.id}/submissions`);
    const data = await res.json();
    setSubmissions(data.submissions || []);
  }

  // Save grading
  async function handleSaveGrade(status: string = "RESULT_PUBLISHED") {
    if (!gradeModalAssessment || !selectedSubmission) return;
    const gradesArray = Object.entries(theoryGrades).map(([qId, val]: any) => ({
      questionId: qId,
      marksAwarded: Number(val.marks || 0),
      feedback: val.feedback || "",
    }));

    const res = await fetch(`/api/assessments/${gradeModalAssessment.id}/submissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: selectedSubmission.id,
        attemptNumber: selectedSubmission.attemptsHistory?.[selectedAttemptIndex]?.attemptNumber,
        theoryGrades: gradesArray,
        status,
      }),
    });
    if (res.ok) {
      alert("Grades and feedback saved successfully!");
      openGradingModal(gradeModalAssessment);
    } else {
      const err = await res.json();
      alert(err.message || "Failed to save grade");
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-slate-950 p-3 sm:p-6 text-slate-50 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 sm:pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Admin Management Portal</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">Assessment Center Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link href="/" className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800">
              Exit Portal
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto sm:flex-wrap gap-2 border-b border-slate-800 pb-4 py-1 scrollbar-none">
          {[
            { id: "students", label: "Students", icon: Users, count: students.length },
            { id: "subjects", label: "Subjects", icon: BookOpen, count: subjects.length },
            { id: "questions", label: "Question Bank", icon: FileQuestion, count: questions.length },
            { id: "assessments", label: "Assessments & Grading", icon: ClipboardList, count: assessments.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: STUDENTS */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Enrolled Learners</h2>
                <p className="text-sm text-slate-400">Manage accounts and credentials for students who can take assessments.</p>
              </div>
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus className="h-4 w-4" /> Add Student
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-900 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((stu) => (
                    <tr key={stu._id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-medium text-white">{stu.fullName}</td>
                      <td className="px-6 py-4 text-cyan-400">@{stu.username}</td>
                      <td className="px-6 py-4">{stu.email}</td>
                      <td className="px-6 py-4">{stu.phoneNumber || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">STUDENT</span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No students found. Click "Add Student" or seed demo data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SUBJECTS */}
        {activeTab === "subjects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Subject Categories</h2>
                <p className="text-sm text-slate-400">Organize question banks and formal assessments across STEM disciplines.</p>
              </div>
              <button
                onClick={() => setShowAddSubject(true)}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus className="h-4 w-4" /> Add Subject
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {subjects.map((sub) => (
                <div key={sub._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-lg font-bold text-white">{sub.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{sub.description || "Active STEM tutorial category"}</p>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="col-span-full rounded-2xl border border-slate-800 p-8 text-center text-slate-500">No subjects listed yet.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: QUESTIONS */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Curated Question Bank</h2>
                <p className="text-sm text-slate-400">MCQ choices and Theory prompts ready for practice or formal exams.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  <Upload className="h-4 w-4" /> Bulk Import (CSV)
                </button>
                <button
                  onClick={() => {
                    setEditQuestionId(null);
                    setQuestionForm({
                      type: "MCQ",
                      subject: "Mathematics",
                      topic: "General",
                      difficulty: "Medium",
                      question: "",
                      option1: "",
                      option2: "",
                      option3: "",
                      option4: "",
                      correctAnswer: 0,
                      marks: 5,
                      explanation: "",
                    });
                    setShowAddQuestion(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Plus className="h-4 w-4" /> Create Question
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                      <span className={`rounded-md px-2.5 py-1 ${q.type === "THEORY" ? "bg-purple-500/20 text-purple-300" : "bg-cyan-500/20 text-cyan-300"}`}>
                        {q.type}
                      </span>
                      <span className="rounded-md bg-slate-800 px-2.5 py-1 text-slate-300">{q.subject} • {q.topic}</span>
                      <span className="rounded-md bg-slate-800 px-2.5 py-1 text-amber-300">{q.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-cyan-400">{q.marks} Marks</span>
                      <button
                        onClick={() => {
                          setEditQuestionId(q._id);
                          setQuestionForm({
                            type: q.type || "MCQ",
                            subject: q.subject || "Mathematics",
                            topic: q.topic || "General",
                            difficulty: q.difficulty || "Medium",
                            question: q.question || "",
                            option1: q.options?.[0] || "",
                            option2: q.options?.[1] || "",
                            option3: q.options?.[2] || "",
                            option4: q.options?.[3] || "",
                            correctAnswer: Number(q.correctAnswer) || 0,
                            marks: Number(q.marks) || 5,
                            explanation: q.explanation || "",
                          });
                          setShowAddQuestion(true);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-base font-medium text-white">{q.question}</p>
                  {q.type === "MCQ" && q.options?.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx} className={`rounded-lg border px-3 py-2 text-sm ${idx === Number(q.correctAnswer) ? "border-cyan-500/60 bg-cyan-500/10 font-semibold text-cyan-300" : "border-slate-800 text-slate-300"}`}>
                          {idx + 1}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && <p className="mt-3 text-xs italic text-slate-400">💡 Explanation: {q.explanation}</p>}
                </div>
              ))}
              {questions.length === 0 && (
                <div className="rounded-2xl border border-slate-800 p-12 text-center text-slate-500">No questions in the bank yet.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ASSESSMENTS & GRADING */}
        {activeTab === "assessments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Assessments & Grading Control</h2>
                <p className="text-sm text-slate-400">Create timed assessments, assign them to students, and grade submitted theory papers.</p>
              </div>
              <button
                onClick={() => setShowAddAssessment(true)}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus className="h-4 w-4" /> Create Assessment
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {assessments.map((a) => (
                <div key={a.id || a._id} className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{a.subject}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{a.status}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{a.title}</h3>
                    <p className="text-sm text-slate-400">{a.description || `Timed ${a.duration}-minute assessment with ${a.questionCount || a.questionIds?.length || 0} questions.`}</p>
                    <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-300">
                      <div>⏱ Duration: <strong className="text-white">{a.duration} min</strong></div>
                      <div>🎯 Passing: <strong className="text-white">{a.passingScore}%</strong></div>
                      <div>📝 Theory: <strong className="text-white">{a.theoryEnabled ? "Enabled" : "Disabled"}</strong></div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800/80 pt-4">
                    <button
                      onClick={() => setAssignModalAssessment(a)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      <Users className="h-4 w-4 text-cyan-400" /> Assign ({a.assignmentCount || 0})
                    </button>
                    <button
                      onClick={() => openGradingModal(a)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-500/20 px-4 py-2.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/30"
                    >
                      <Award className="h-4 w-4" /> Grade & Review
                    </button>
                    <button
                      onClick={() => handleDeleteAssessment(a.id || a._id, a.title)}
                      className="flex items-center justify-center rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-rose-400 transition hover:bg-rose-500/20"
                      title="Delete Assessment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {assessments.length === 0 && (
                <div className="col-span-full rounded-2xl border border-slate-800 p-12 text-center text-slate-500">No assessments created yet.</div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD STUDENT */}
        {showAddStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Add New Student Account</h3>
                <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Full Name</label>
                  <input required value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Akanji Lawrence" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Username</label>
                  <input required value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="lawrence009" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Email Address</label>
                  <input required type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="lawrence@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Initial Password</label>
                  <input required value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">Create Account</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD SUBJECT */}
        {showAddSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Add Subject Category</h3>
                <button onClick={() => setShowAddSubject(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateSubject} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Subject Name</label>
                  <input required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Computer Science" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Description</label>
                  <textarea rows={3} value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Algorithms, Data Structures, and Theory" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">Save Subject</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD QUESTION */}
        {showAddQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">{editQuestionId ? "Edit Question" : "Create New Question"}</h3>
                <button onClick={() => { setShowAddQuestion(false); setEditQuestionId(null); }} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateQuestion} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Type</label>
                    <select value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500">
                      <option value="MCQ">MCQ</option>
                      <option value="THEORY">THEORY</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Subject</label>
                    <select value={questionForm.subject} onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500">
                      {subjects.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Difficulty</label>
                    <select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Topic / Sub-topic</label>
                  <input required value={questionForm.topic} onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Calculus / Integration" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Question Text</label>
                  <textarea required rows={3} value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="What is the derivative of x^2?" />
                </div>
                {questionForm.type === "MCQ" && (
                  <div className="space-y-3 border-t border-slate-800/80 pt-3">
                    <p className="text-xs font-semibold uppercase text-cyan-400">MCQ Options & Correct Choice</p>
                    {["option1", "option2", "option3", "option4"].map((key, idx) => (
                      <div key={key} className="flex items-center gap-3">
                        <input type="radio" name="correctAnswer" checked={Number(questionForm.correctAnswer) === idx} onChange={() => setQuestionForm({ ...questionForm, correctAnswer: idx })} />
                        <span className="w-6 text-sm font-bold text-slate-400">{idx + 1}.</span>
                        <input value={(questionForm as any)[key]} onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })} className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder={`Option ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Marks</label>
                    <input type="number" required value={questionForm.marks} onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Explanation (Optional)</label>
                    <input value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Brief rationale..." />
                  </div>
                </div>
                <button type="submit" className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">{editQuestionId ? "Save Changes" : "Add to Bank"}</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: BULK IMPORT */}
        {showBulkImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Bulk Import Questions (CSV)</h3>
                <button onClick={() => setShowBulkImport(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <p>Paste CSV rows below. Expected header format:</p>
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-cyan-300">
                  type,subject,topic,difficulty,question,options,correctanswer,marks,explanation<br />
                  MCQ,Mathematics,Algebra,Easy,"What is 2+2?","2|3|4|5",2,5,"Basic arithmetic"
                </div>
                <textarea rows={8} value={csvInput} onChange={(e) => setCsvInput(e.target.value)} className="w-full font-mono rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white outline-none focus:border-cyan-500" placeholder={`type,subject,topic,difficulty,question,options,correctanswer,marks,explanation\nMCQ,Physics,Optics,Medium,"Speed of light in vacuum?","3x10^8 m/s|3x10^6 m/s|330 m/s",0,5,"Exact physical constant"`} />
                <button onClick={handleBulkImport} className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">Import CSV Questions</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE ASSESSMENT */}
        {showAddAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Create Timed Assessment</h3>
                <button onClick={() => setShowAddAssessment(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateAssessment} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Title</label>
                  <input required value={assessmentForm.title} onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Midterm Physics Examination" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Subject</label>
                    <select value={assessmentForm.subject} onChange={(e) => setAssessmentForm({ ...assessmentForm, subject: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500">
                      {subjects.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Duration (Minutes)</label>
                    <input type="number" required value={assessmentForm.duration} onChange={(e) => setAssessmentForm({ ...assessmentForm, duration: Number(e.target.value) })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Passing Score (%)</label>
                    <input type="number" required value={assessmentForm.passingScore} onChange={(e) => setAssessmentForm({ ...assessmentForm, passingScore: Number(e.target.value) })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Assessment Mode</label>
                    <select value={assessmentForm.assessmentType} onChange={(e) => setAssessmentForm({ ...assessmentForm, assessmentType: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500">
                      <option value="FORMAL">Formal / Mock Test (Strict & Timed)</option>
                      <option value="PRACTICE">Practice Test (Revision & Self-Study)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Max Attempts Allowed</label>
                    <select value={assessmentForm.maxAttempts} onChange={(e) => setAssessmentForm({ ...assessmentForm, maxAttempts: Number(e.target.value) })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500">
                      <option value={1}>1 Attempt Only (Standard Exam)</option>
                      <option value={3}>3 Attempts</option>
                      <option value={5}>5 Attempts</option>
                      <option value={999}>Unlimited Attempts (Practice Mode)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="showCorrectAnswers" checked={assessmentForm.showCorrectAnswers} onChange={(e) => setAssessmentForm({ ...assessmentForm, showCorrectAnswers: e.target.checked })} className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500" />
                    <label htmlFor="showCorrectAnswers" className="text-sm font-medium text-slate-300">
                      Show Correct Answers & Explanations to student right after submitting
                    </label>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-800/80 pt-3">
                    <input type="checkbox" id="theoryEnabled" checked={assessmentForm.theoryEnabled} onChange={(e) => setAssessmentForm({ ...assessmentForm, theoryEnabled: e.target.checked })} className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500" />
                    <label htmlFor="theoryEnabled" className="text-sm font-medium text-slate-300">
                      Enable Theory / Diagram File Uploads for this assessment
                    </label>
                  </div>
                </div>
                <div className="space-y-3 border-t border-slate-800/80 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-cyan-400">Select Questions from Bank ({assessmentForm.selectedQuestionIds.length} selected)</p>
                    <div className="flex items-center gap-2">
                      <select
                        value={assessmentTopicFilter}
                        onChange={(e) => setAssessmentTopicFilter(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white outline-none focus:border-cyan-500"
                      >
                        <option value="All">All Topics</option>
                        {Array.from(
                          new Set(
                            questions
                              .filter((q) => assessmentForm.subject === "All" || q.subject === assessmentForm.subject)
                              .map((q) => q.topic)
                          )
                        ).map((top) => (
                          <option key={top} value={top}>
                            {top}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bulk & Smart Selection Bar */}
                  {(() => {
                    const matchingQuestions = questions.filter(
                      (q) =>
                        (assessmentForm.subject === "All" || q.subject === assessmentForm.subject) &&
                        (assessmentTopicFilter === "All" || q.topic === assessmentTopicFilter)
                    );
                    return (
                      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-400">Quick Select:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const ids = new Set([
                                ...assessmentForm.selectedQuestionIds,
                                ...matchingQuestions.map((q) => q._id),
                              ]);
                              setAssessmentForm({ ...assessmentForm, selectedQuestionIds: Array.from(ids) });
                            }}
                            className="rounded-lg bg-cyan-500/20 px-2.5 py-1 font-bold text-cyan-300 transition hover:bg-cyan-500/30"
                          >
                            ⚡ Select All Filtered ({matchingQuestions.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const matchIds = new Set(matchingQuestions.map((q) => q._id));
                              const filteredIds = assessmentForm.selectedQuestionIds.filter((id) => !matchIds.has(id));
                              setAssessmentForm({ ...assessmentForm, selectedQuestionIds: filteredIds });
                            }}
                            className="rounded-lg bg-red-500/10 px-2.5 py-1 font-bold text-red-400 transition hover:bg-red-500/20"
                          >
                            🗑️ Deselect Filtered
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssessmentForm({ ...assessmentForm, selectedQuestionIds: [] })}
                            className="rounded-lg bg-slate-800 px-2.5 py-1 font-semibold text-slate-300 hover:bg-slate-700"
                          >
                            Clear All
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/60 pt-2 text-xs">
                          <span className="font-semibold text-slate-400">Smart Generator:</span>
                          <span className="text-slate-400">Auto-Pick</span>
                          <input
                            type="number"
                            min={1}
                            max={matchingQuestions.length || 1}
                            value={randomPickCount}
                            onChange={(e) => setRandomPickCount(Number(e.target.value))}
                            className="w-16 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-center font-bold text-white outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const matchIds = new Set(matchingQuestions.map((q) => q._id));
                              const otherIds = assessmentForm.selectedQuestionIds.filter((id) => !matchIds.has(id));
                              const shuffled = [...matchingQuestions].sort(() => 0.5 - Math.random());
                              const picked = shuffled.slice(0, randomPickCount).map((q) => q._id);
                              setAssessmentForm({ ...assessmentForm, selectedQuestionIds: [...otherIds, ...picked] });
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1 font-bold text-amber-300 transition hover:bg-amber-500/30"
                          >
                            🎲 Pick Random
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const matchIds = new Set(matchingQuestions.map((q) => q._id));
                              const otherIds = assessmentForm.selectedQuestionIds.filter((id) => !matchIds.has(id));
                              const topics = Array.from(new Set(matchingQuestions.map((q) => q.topic)));
                              if (topics.length === 0) return;
                              const baseCount = Math.floor(randomPickCount / topics.length);
                              const remainder = randomPickCount % topics.length;
                              let pickedIds: string[] = [];
                              topics.forEach((top, idx) => {
                                const topicQs = matchingQuestions.filter((q) => q.topic === top);
                                const count = baseCount + (idx < remainder ? 1 : 0);
                                const shuffled = [...topicQs].sort(() => 0.5 - Math.random());
                                pickedIds.push(...shuffled.slice(0, count).map((q) => q._id));
                              });
                              setAssessmentForm({ ...assessmentForm, selectedQuestionIds: [...otherIds, ...pickedIds] });
                            }}
                            title="Distributes the total number evenly across every topic available in this subject"
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 font-bold text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            ⚖️ Balanced Pick Across All Topics
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1.5">
                          {matchingQuestions.map((q) => {
                            const isSelected = assessmentForm.selectedQuestionIds.includes(q._id);
                            return (
                              <div
                                key={q._id}
                                onClick={() => {
                                  const next = isSelected
                                    ? assessmentForm.selectedQuestionIds.filter((id) => id !== q._id)
                                    : [...assessmentForm.selectedQuestionIds, q._id];
                                  setAssessmentForm({ ...assessmentForm, selectedQuestionIds: next });
                                }}
                                className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition ${
                                  isSelected
                                    ? "bg-cyan-500/20 border border-cyan-500/50 text-white"
                                    : "hover:bg-slate-900 text-slate-400"
                                }`}
                              >
                                <span className="truncate pr-2">
                                  <strong className="text-cyan-400">[{q.type}]</strong>{" "}
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 mr-1.5">
                                    {q.topic}
                                  </span>
                                  {q.question.substring(0, 65)}...
                                </span>
                                <span className="shrink-0 font-bold text-slate-300">{q.marks}m</span>
                              </div>
                            );
                          })}
                          {matchingQuestions.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-500">No questions found for this subject/topic filter.</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <button type="submit" className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">Publish Assessment</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ASSIGN TO STUDENTS */}
        {assignModalAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Assign Assessment</h3>
                  <p className="text-xs text-cyan-400">{assignModalAssessment.title}</p>
                </div>
                <button onClick={() => setAssignModalAssessment(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-400">Select students to assign ({selectedStudentIds.length} selected):</p>
                <div className="max-h-60 overflow-y-auto space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  {students.map((stu) => {
                    const isChecked = selectedStudentIds.includes(stu._id);
                    return (
                      <div key={stu._id} onClick={() => {
                        const next = isChecked
                          ? selectedStudentIds.filter((id) => id !== stu._id)
                          : [...selectedStudentIds, stu._id];
                        setSelectedStudentIds(next);
                      }} className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 text-sm transition ${isChecked ? "bg-cyan-500/20 text-white border border-cyan-500/40" : "text-slate-400 hover:bg-slate-900"}`}>
                        <span>{stu.fullName} (@{stu.username})</span>
                        {isChecked && <CheckCircle className="h-4 w-4 text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setSelectedStudentIds(students.map((s) => s._id))} className="flex-1 rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">Select All</button>
                  <button onClick={() => setSelectedStudentIds([])} className="flex-1 rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">Clear</button>
                </div>
                <button onClick={handleAssignAssessment} disabled={selectedStudentIds.length === 0} className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">Confirm Assignment</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: GRADE & REVIEW SUBMISSIONS */}
        {gradeModalAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Submissions Review & Grading</h3>
                  <p className="text-xs text-cyan-400">{gradeModalAssessment.title}</p>
                </div>
                <button onClick={() => { setGradeModalAssessment(null); setSelectedSubmission(null); }} className="text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
              </div>

              {!selectedSubmission ? (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Student Submissions ({submissions.length})</h4>
                  <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950">
                    {submissions.map((sub) => (
                      <div key={sub.id || sub._id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                        <div>
                          <p className="font-bold text-white">{sub.student?.fullName || "Student Account"} (@{sub.student?.username || "student"})</p>
                          <p className="text-xs text-slate-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${sub.status === "RESULT_PUBLISHED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                              {sub.status} • Score: {sub.totalScore} / {sub.maxScore}
                            </span>
                            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300">
                              Attempts: {sub.attemptsHistory?.length || sub.attemptNumber || 1}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            const lastIdx = (sub.attemptsHistory?.length || 1) - 1;
                            setSelectedAttemptIndex(lastIdx);
                            const activeAnswers = sub.attemptsHistory?.[lastIdx]?.answers || sub.answers || [];
                            const init: any = {};
                            activeAnswers.forEach((ans: any) => {
                              init[ans.questionId] = { marks: ans.marksAwarded || 0, feedback: ans.feedback || "" };
                            });
                            setTheoryGrades(init);
                          }}
                          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Review & Grade
                        </button>
                      </div>
                    ))}
                    {submissions.length === 0 && (
                      <p className="p-8 text-center text-sm text-slate-500">No student submissions submitted yet for this assessment.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                    <div>
                      <p className="text-base font-bold text-white">{selectedSubmission.student?.fullName} (@{selectedSubmission.student?.username})</p>
                      <p className="text-xs text-slate-400">Status: {selectedSubmission.status} | Best/Latest Total Score: <strong className="text-cyan-400">{selectedSubmission.totalScore} / {selectedSubmission.maxScore}</strong></p>
                    </div>
                    <button onClick={() => setSelectedSubmission(null)} className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800">Back to List</button>
                  </div>

                  {selectedSubmission.attemptsHistory && selectedSubmission.attemptsHistory.length > 1 && (
                    <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Attempt History ({selectedSubmission.attemptsHistory.length} Attempts)</span>
                        <span className="text-xs text-slate-400">Click any attempt to inspect student answers & scores</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedSubmission.attemptsHistory.map((att: any, idx: number) => {
                          const isCurrent = idx === selectedAttemptIndex;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedAttemptIndex(idx);
                                const activeAnswers = att.answers || [];
                                const init: any = {};
                                activeAnswers.forEach((ans: any) => {
                                  init[ans.questionId] = { marks: ans.marksAwarded || 0, feedback: ans.feedback || "" };
                                });
                                setTheoryGrades(init);
                              }}
                              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 border ${
                                isCurrent
                                  ? "bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20"
                                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              <span>Attempt #{att.attemptNumber || idx + 1}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] ${isCurrent ? "bg-purple-950/60 text-purple-200" : "bg-slate-800 text-cyan-400"}`}>
                                {att.totalScore}/{att.maxScore}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                        Questions & Answers {selectedSubmission.attemptsHistory?.length ? `(Showing Attempt #${selectedSubmission.attemptsHistory[selectedAttemptIndex]?.attemptNumber || selectedAttemptIndex + 1})` : ""}
                      </h5>
                      {selectedSubmission.attemptsHistory?.[selectedAttemptIndex] && (
                        <span className="text-xs font-semibold text-slate-400">
                          Attempt Submitted: {new Date(selectedSubmission.attemptsHistory[selectedAttemptIndex].submittedAt || selectedSubmission.submittedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {(selectedSubmission.attemptsHistory?.[selectedAttemptIndex]?.answers || selectedSubmission.answers)?.map((ans: any, idx: number) => {
                      const q = ans.questionDetails || {};
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                          <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span>Q{idx + 1} • <strong className="text-purple-400">{q.type}</strong> • {q.subject} ({q.difficulty})</span>
                            <span>Max: <strong className="text-white">{q.marks}m</strong></span>
                          </div>
                          <p className="text-sm font-bold text-white">{q.question || "Question prompt"}</p>

                          {q.type === "MCQ" ? (
                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
                              <span className="text-slate-400">Student Choice:</span> <strong className="text-cyan-300">{ans.mcqChoice !== undefined && ans.mcqChoice !== null ? `${ans.mcqChoice + 1}. ${q.options?.[ans.mcqChoice] || ""}` : "No choice"}</strong><br />
                              <span className="text-slate-400">Auto-graded Marks:</span> <strong className="text-emerald-400">{ans.marksAwarded} / {q.marks}</strong>
                            </div>
                          ) : (
                            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-400">Student Theory Answer:</p>
                                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-sm text-slate-200">{ans.theoryAnswerText || "No text written"}</p>
                              </div>
                              {ans.theoryFileUrl && (
                                <div className="flex items-center justify-between rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm">
                                  <span className="flex items-center gap-2 font-medium text-cyan-300"><FileText className="h-4 w-4" /> Attached Diagram/Working File</span>
                                  <a href={ans.theoryFileUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">Open / Download File</a>
                                </div>
                              )}
                              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                                <div>
                                  <label className="block text-xs font-semibold text-cyan-300">Award Theory Marks (0 - {q.marks})</label>
                                  <input
                                    type="number"
                                    max={q.marks}
                                    min={0}
                                    value={theoryGrades[ans.questionId]?.marks || 0}
                                    onChange={(e) => setTheoryGrades({
                                      ...theoryGrades,
                                      [ans.questionId]: { ...(theoryGrades[ans.questionId] || {}), marks: Number(e.target.value) }
                                    })}
                                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-300">Tutor Feedback / Notes</label>
                                  <input
                                    type="text"
                                    value={theoryGrades[ans.questionId]?.feedback || ""}
                                    onChange={(e) => setTheoryGrades({
                                      ...theoryGrades,
                                      [ans.questionId]: { ...(theoryGrades[ans.questionId] || {}), feedback: e.target.value }
                                    })}
                                    placeholder="Good derivation, check signs..."
                                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 border-t border-slate-800 pt-4">
                    <button onClick={() => handleSaveGrade("MARKED")} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-3 font-bold text-white transition hover:bg-slate-700">Save Grades (Keep Marked Status)</button>
                    <button onClick={() => handleSaveGrade("RESULT_PUBLISHED")} className="flex-1 rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">Publish Graded Result to Student</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
