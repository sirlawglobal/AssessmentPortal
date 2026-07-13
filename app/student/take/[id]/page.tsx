"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  CheckCircle,
  Upload,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
} from "lucide-react";

export default function TakeAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;
  const userId = searchParams.get("userId");

  const [assessment, setAssessment] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFileFor, setUploadingFileFor] = useState<string | null>(null);

  // Timer in seconds
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Answers object keyed by questionId: { mcqChoice?: number, theoryAnswerText?: string, theoryFileUrl?: string }
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }
    fetchAssessmentDetails();
  }, [assessmentId, userId]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      alert("Time is up! Submitting your answers automatically.");
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  async function fetchAssessmentDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/assessments/${assessmentId}?userId=${userId}`);
      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
        setQuestions(data.questions || []);
        setTimeLeft((data.assessment.duration || 30) * 60);

        // Initialize empty answers
        const initAnswers: any = {};
        (data.questions || []).forEach((q: any) => {
          initAnswers[q.id || q._id] = { questionId: q.id || q._id };
        });
        setAnswers(initAnswers);
      }
    } catch (err) {
      console.error("Failed to load exam room:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(qId: string, file: File) {
    setUploadingFileFor(qId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAnswers((prev) => ({
          ...prev,
          [qId]: { ...prev[qId], theoryFileUrl: data.url },
        }));
      } else {
        alert(data.message || "File upload failed");
      }
    } catch (err) {
      alert("Failed to upload diagram/working file");
    } finally {
      setUploadingFileFor(null);
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/assessments/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          answers: Object.values(answers),
        }),
      });
      if (res.ok) {
        router.push("/student");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit assessment");
        setSubmitting(false);
      }
    } catch (err) {
      alert("Submission error occurred");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3 text-lg"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /> Preparing Exam Room...</div>
      </main>
    );
  }

  if (!assessment) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-400">
        <AlertTriangle className="mb-3 h-10 w-10 text-rose-500" />
        <h1 className="text-2xl font-bold text-white">Assessment Unavailable</h1>
        <p className="mt-2 text-sm">We could not load this assessment or you do not have permission to view it.</p>
      </main>
    );
  }

  const mins = Math.floor((timeLeft || 0) / 60);
  const secs = (timeLeft || 0) % 60;

  return (
    <main className="min-h-screen bg-slate-950 pb-20 text-slate-50">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">{assessment.subject}</p>
            <h1 className="text-lg font-bold text-white sm:text-xl">{assessment.title}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-base font-bold ${
              (timeLeft || 0) < 300 ? "bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/50" : "bg-slate-950 text-cyan-300 border border-slate-800"
            }`}>
              <Clock className="h-4 w-4" />
              <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to submit your final assessment now?")) {
                  handleSubmit();
                }
              }}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Paper
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Question List */}
      <div className="mx-auto mt-8 max-w-5xl space-y-8 px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
          <h2 className="font-bold text-white mb-1">Instructions</h2>
          <p>{assessment.instructions || "Answer all questions to the best of your ability. Keep track of the timer at the top right. For theory questions, you may type your response and/or upload a picture of your workings."}</p>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const qId = q.id || q._id;
            const currentAns = answers[qId] || {};
            return (
              <article key={qId} id={`question-${idx + 1}`} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Question {idx + 1} of {questions.length} • <strong className="text-purple-400">{q.type}</strong></span>
                  <span className="rounded-md bg-slate-950 px-3 py-1 font-bold text-cyan-300 border border-slate-800">{q.marks} Marks</span>
                </div>

                <p className="text-base font-bold text-white sm:text-lg leading-relaxed">{q.question}</p>

                {q.type === "MCQ" ? (
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    {(q.options || []).map((opt: string, optIdx: number) => {
                      const isChecked = currentAns.mcqChoice === optIdx;
                      return (
                        <label
                          key={optIdx}
                          onClick={() => setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], mcqChoice: optIdx } }))}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition ${
                            isChecked
                              ? "border-cyan-500 bg-cyan-500/10 font-semibold text-white shadow-md shadow-cyan-500/10"
                              : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <input type="radio" name={`mcq-${qId}`} checked={isChecked} onChange={() => {}} className="h-4 w-4 text-cyan-500" />
                          <span className="font-bold text-slate-400">{optIdx + 1}.</span>
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Written Response / Workings</label>
                      <textarea
                        rows={4}
                        value={currentAns.theoryAnswerText || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], theoryAnswerText: e.target.value } }))}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-white outline-none focus:border-cyan-500"
                        placeholder="Type derivation, theorem, or steps here..."
                      />
                    </div>

                    {assessment.theoryEnabled && (
                      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-5 space-y-3">
                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                          <div>
                            <p className="text-sm font-semibold text-white">Attach Diagram / Working Sheet</p>
                            <p className="text-xs text-slate-400">Upload an image (.jpg, .png) or PDF if required by tutor.</p>
                          </div>
                          <label className="cursor-pointer flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-slate-700">
                            {uploadingFileFor === qId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {uploadingFileFor === qId ? "Uploading..." : "Choose File"}
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(qId, f);
                              }}
                            />
                          </label>
                        </div>

                        {currentAns.theoryFileUrl && (
                          <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs">
                            <span className="flex items-center gap-2 font-medium text-cyan-300"><FileText className="h-4 w-4" /> Attached: {currentAns.theoryFileUrl.split("/").pop()}</span>
                            <a href={currentAns.theoryFileUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline text-white">Preview File</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom Submit Bar */}
        <div className="flex justify-end border-t border-slate-800 pt-6">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to submit your final assessment now?")) {
                handleSubmit();
              }
            }}
            disabled={submitting}
            className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-8 py-4 text-base font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50 shadow-xl shadow-cyan-500/20"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            Submit Final Assessment
          </button>
        </div>
      </div>
    </main>
  );
}
