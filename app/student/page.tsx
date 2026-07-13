"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileSpreadsheet,
  Award,
  RefreshCw,
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("stem-user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "STUDENT") {
      router.replace("/admin");
      return;
    }

    setUser(parsedUser);
    setReady(true);
    fetchAssignments(parsedUser.id || parsedUser._id);
  }, [router]);

  async function fetchAssignments(userId: string) {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/assessments?userId=${userId}`);
      const data = await res.json();
      if (data.assignments) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      console.error("Failed to fetch student assessments:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return null;
  }

  const pendingAssignments = assignments.filter(
    (a) =>
      ["ASSIGNED", "STARTED", "PENDING"].includes(a.status) ||
      a.assessment?.assessmentType === "PRACTICE" ||
      (a.assessment?.maxAttempts && a.assessment.maxAttempts > 1)
  );
  const submittedAssignments = assignments.filter(
    (a) =>
      ["SUBMITTED", "MARKED"].includes(a.status) &&
      a.assessment?.assessmentType !== "PRACTICE" &&
      (!a.assessment?.maxAttempts || a.assessment.maxAttempts <= 1)
  );
  const publishedAssignments = assignments.filter(
    (a) => ["RESULT_PUBLISHED", "GRADED"].includes(a.status) || (a.submission && a.assessment?.assessmentType === "PRACTICE")
  );

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6 text-slate-50 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Student Portal</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">Welcome back, {user.fullName}</h1>
            <p className="text-xs sm:text-sm text-slate-400">Review your assigned assessments, submit answers, and check your published grades.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchAssignments(user.id || user._id)}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link href="/" className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800">
              Sign Out
            </Link>
          </div>
        </div>

        {/* SECTION 1: READY TO TAKE / IN PROGRESS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <PlayCircle className="h-5 w-5 text-cyan-400" />
            <h2>Assessments Ready to Take ({pendingAssignments.length})</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pendingAssignments.map((a) => {
              const assessment = a.assessment || {};
              return (
                <div key={a.id} className="flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{assessment.subject}</span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" /> {assessment.duration} Minutes
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{assessment.title}</h3>
                    <p className="text-sm text-slate-400">{assessment.description || `Timed assessment covering ${assessment.subject}.`}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300 pt-2">
                      <span>🎯 Passing: <strong className="text-white">{assessment.passingScore}%</strong></span>
                      <span>📝 Theory Uploads: <strong className={assessment.theoryEnabled ? "text-cyan-400" : "text-slate-400"}>{assessment.theoryEnabled ? "Enabled" : "Disabled"}</strong></span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-800 pt-4">
                    <Link
                      href={`/student/take/${assessment.id}?userId=${user.id || user._id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
                    >
                      {a.submission || ["GRADED", "RESULT_PUBLISHED", "SUBMITTED"].includes(a.status) ? (
                        <>
                          <span>🔄 Retake Assessment</span>
                          {a.submission && (
                            <span className="rounded-md bg-slate-950/40 px-2 py-0.5 text-xs font-semibold text-white">
                              Last: {Math.round((a.submission.totalScore / (a.submission.maxScore || 100)) * 100)}%
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" /> Start Assessment
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
            {pendingAssignments.length === 0 && (
              <div className="col-span-full rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                You have no pending assessments assigned to take right now.
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: SUBMITTED - UNDER REVIEW */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <h2>Submitted & Under Review ({submittedAssignments.length})</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {submittedAssignments.map((a) => {
              const assessment = a.assessment || {};
              return (
                <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-cyan-400">{assessment.subject}</span>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-amber-300">{a.status}</span>
                  </div>
                  <h3 className="font-bold text-white">{assessment.title}</h3>
                  <p className="text-xs text-slate-400">Your answers have been submitted. The tutor is currently grading theory papers or finalizing results.</p>
                </div>
              );
            })}
            {submittedAssignments.length === 0 && (
              <div className="col-span-full rounded-2xl border border-slate-800/60 p-6 text-center text-xs text-slate-500">
                No assessments currently awaiting tutor grade.
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: PUBLISHED RESULTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Award className="h-5 w-5 text-emerald-400" />
            <h2>Published Results & Feedback ({publishedAssignments.length})</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {publishedAssignments.map((a) => {
              const assessment = a.assessment || {};
              const submission = a.submission || {};
              const score = submission.totalScore || 0;
              const maxScore = submission.maxScore || 100;
              const percent = Math.round((score / maxScore) * 100);
              const passed = percent >= (assessment.passingScore || 50);

              return (
                <div key={a.id} className={`flex flex-col justify-between rounded-2xl border p-6 ${passed ? "border-emerald-500/30 bg-slate-900/80" : "border-rose-500/30 bg-slate-900/80"}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">{assessment.subject}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {passed ? "PASSED" : "NEEDS IMPROVEMENT"} ({percent}%)
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{assessment.title}</h3>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="text-3xl font-extrabold text-white">{score} <span className="text-base font-normal text-slate-400">/ {maxScore} Marks</span></div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:items-center">
                    <Link
                      href={`/student/result/${assessment.id}?userId=${user.id || user._id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-cyan-400" /> View Explanations
                    </Link>
                    {(assessment.assessmentType === "PRACTICE" || (assessment.maxAttempts && assessment.maxAttempts > 1)) && (
                      <Link
                        href={`/student/take/${assessment.id}?userId=${user.id || user._id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                      >
                        🔄 Retake Practice Test
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            {publishedAssignments.length === 0 && (
              <div className="col-span-full rounded-2xl border border-slate-800/60 p-6 text-center text-xs text-slate-500">
                No graded results published yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
