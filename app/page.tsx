import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-50">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-transparent blur-3xl" />

      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Sleek Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          STEM Tutorial Assessment Center
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
          Next-Generation <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Assessment & Testing</span> Portal
        </h1>

        {/* Minimal Subtitle */}
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Secure, timed formal examinations and self-paced practice quizzes with instant automated grading and tutor theory reviews.
        </p>

        {/* Call to Action Button */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/login"
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/30 active:scale-95"
          >
            <span>Open Portal</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="absolute bottom-6 text-xs text-slate-500">
        &copy; {new Date().getFullYear()} STEM Assessment Portal. All rights reserved.
      </footer>
    </main>
  );
}
