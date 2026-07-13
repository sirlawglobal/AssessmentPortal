"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      setMessage(result.message || "Unable to sign in");
      return;
    }

    localStorage.setItem("stem-user", JSON.stringify(result.user));
    router.push(result.user.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">STEM portal</p>
          <h1 className="text-3xl font-semibold text-white">Sign in</h1>
          <p className="text-sm text-slate-400">Use your admin or student credentials to continue.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="usernameOrEmail">Username or Email</label>
            <input
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(event) => setUsernameOrEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
              placeholder="Password123!"
            />
          </div>
          {message ? <p className="text-sm text-rose-400">{message}</p> : null}
          <button className="w-full rounded-full bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400" type="submit">
            Continue
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="text-cyan-300 hover:text-cyan-200">
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
