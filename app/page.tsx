import Link from "next/link";
import { BookOpen, ShieldCheck, Sparkles, Users } from "lucide-react";

const features = [
  {
    title: "Admin-led student management",
    description: "Create learners, manage access, reset credentials, and control assessment visibility.",
  },
  {
    title: "Formal and practice assessments",
    description: "Support MCQ and theory workflows with configurable timers, attempts, and result release modes.",
  },
  {
    title: "Production-ready architecture",
    description: "MongoDB-backed data model, reusable UI, and a scalable structure for future expansions.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" />
              STEM tutorial assessment platform
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                Deliver polished assessments for every learner.
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                Built for a STEM tutorial center, this platform combines secure admin workflows,
                question management, assignment controls, and result publishing in one modern dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
                Open portal
              </Link>
              <Link href="/seed" className="rounded-full border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:bg-slate-900">
                Seed demo data
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20">
            <div className="flex items-center gap-3 text-cyan-300">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">Admin-managed access</span>
            </div>
            <div className="mt-4 flex items-center gap-3 text-slate-300">
              <Users className="h-5 w-5" />
              <span>Students only see assessments assigned to them.</span>
            </div>
            <div className="mt-4 flex items-center gap-3 text-slate-300">
              <BookOpen className="h-5 w-5" />
              <span>Question bank, MCQ grading, theory uploads, and results release included.</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
