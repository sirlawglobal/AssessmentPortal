"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  HelpCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function StudentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;
  const userId = searchParams.get("userId");

  const [assessment, setAssessment] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }
    fetchResultData();
  }, [assessmentId, userId]);

  async function fetchResultData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/assessments/${assessmentId}?userId=${userId}`);
      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
        setQuestions(data.questions || []);
        setSubmission(data.submission || null);
      }
    } catch (err) {
      console.error("Failed to load result view:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3 text-lg"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /> Loading Graded Results...</div>
      </main>
    );
  }

  if (!assessment || !submission) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-400">
        <h1 className="text-2xl font-bold text-white">Results Not Available</h1>
        <p className="mt-2 text-sm">Either you have not submitted this assessment yet, or your tutor is still reviewing your paper.</p>
        <Link href="/student" className="mt-6 rounded-xl bg-cyan-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-cyan-400">Return to Dashboard</Link>
      </main>
    );
  }

  const score = submission.totalScore || 0;
  const maxScore = submission.maxScore || 100;
  const percent = Math.round((score / maxScore) * 100);
  const passed = percent >= (assessment.passingScore || 50);

  return (
    <main className="min-h-screen bg-slate-950 p-6 pb-20 text-slate-50 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/student" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <span className="rounded-full bg-slate-900 px-4 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 border border-slate-800">
            {assessment.subject}
          </span>
        </div>

        {/* Score Summary Card */}
        <section className={`rounded-3xl border p-8 text-center shadow-2xl ${passed ? "border-emerald-500/30 bg-slate-900/80 shadow-emerald-950/20" : "border-rose-500/30 bg-slate-900/80 shadow-rose-950/20"}`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 border border-slate-800">
            {passed ? <CheckCircle2 className="h-8 w-8 text-emerald-400" /> : <XCircle className="h-8 w-8 text-rose-400" />}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-4xl">{assessment.title}</h1>
          <p className="mt-1 text-sm text-slate-400">Graded on {new Date(submission.markedAt || submission.submittedAt).toLocaleDateString()}</p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <div className="text-5xl font-black tracking-tight text-white sm:text-6xl">
              {score} <span className="text-2xl font-normal text-slate-400">/ {maxScore} Marks</span>
            </div>
            <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-bold uppercase tracking-wider ${passed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"}`}>
              {passed ? "PASSED" : "NEEDS IMPROVEMENT"} ({percent}%)
            </div>
          </div>
        </section>

        {/* Question-by-Question Breakdown */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">Question Breakdown & Tutor Feedback</h2>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const qId = q.id || q._id;
              const ans = (submission.answers || []).find((item: any) => item.questionId === qId) || {};
              const marksAwarded = Number(ans.marksAwarded || 0);
              const isCorrect = marksAwarded === Number(q.marks);

              return (
                <article key={qId} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Question {idx + 1} • <strong className="text-purple-400">{q.type}</strong> • {q.topic}</span>
                    <span className={`rounded-md px-3 py-1 font-bold ${isCorrect ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                      Awarded: {marksAwarded} / {q.marks} Marks
                    </span>
                  </div>

                  <p className="text-base font-bold text-white leading-relaxed">{q.question}</p>

                  {q.type === "MCQ" ? (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm">
                        <span className="text-slate-400">Your Choice:</span> <strong className="text-white">{ans.mcqChoice !== undefined && ans.mcqChoice !== null ? `${ans.mcqChoice + 1}. ${q.options?.[ans.mcqChoice] || ""}` : "No answer selected"}</strong>
                      </div>
                      {assessment.showCorrectAnswers && q.correctAnswer !== undefined && (
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                          <strong>Correct Answer:</strong> {Number(q.correctAnswer) + 1}. {q.options?.[Number(q.correctAnswer)] || ""}
                          {q.explanation && <p className="mt-2 text-xs text-emerald-300/80 italic">💡 Explanation: {q.explanation}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm space-y-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Written Workings:</span>
                        <p className="whitespace-pre-wrap text-slate-200">{ans.theoryAnswerText || "No written notes submitted."}</p>
                      </div>

                      {ans.theoryFileUrl && (
                        <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs">
                          <span className="flex items-center gap-2 font-medium text-cyan-300"><FileText className="h-4 w-4" /> Attached Diagram/File</span>
                          <a href={ans.theoryFileUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline text-white">View Uploaded Sheet</a>
                        </div>
                      )}

                      {ans.feedback && (
                        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-4 text-sm">
                          <strong className="text-cyan-400">💬 Tutor Feedback:</strong>
                          <p className="mt-1 text-slate-300">{ans.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
