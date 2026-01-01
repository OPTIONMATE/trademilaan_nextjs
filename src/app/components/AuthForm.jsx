"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import GoogleLoginBtn from "./GoogleLoginBtn";

export default function AuthForm({ type }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, fetchMe } = useAuth();

  // If already logged in, redirect away
  useEffect(() => {
    if (user && type === "login") router.push("/");
  }, [user, type, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = type === "register" ? { email, password, username } : { email, password };

    const res = await fetch(`/api/auth/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Authentication failed");
      return;
    }

    await fetchMe();
    router.push("/disclaimer");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#9BE74933,transparent_30%),radial-gradient(circle_at_80%_0%,#c7ffc033,transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:px-8">
        <div className="grid items-center gap-8 rounded-3xl border border-neutral-200/70 bg-white/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur lg:grid-cols-2 lg:p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                  {type === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-sm text-neutral-600 md:text-base">
                  Access AI-powered market insights and personalized strategies. Sign in securely to continue to your dashboard.
                </p>
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "register" && (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-800">Name</span>
                  <input
                    type="text"
                    placeholder="Your full name"
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-neutral-800">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-neutral-800">Password</span>
                <input
                  type="password"
                  placeholder="Enter a strong password"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <button className="w-full rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition hover:translate-y-[-1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.18)] hover:ring-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 cursor-pointer">
                {type === "login" ? "Login securely" : "Create account"}
              </button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="h-px flex-1 bg-neutral-200" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>
              <GoogleLoginBtn />
            </div>

            <div className="text-sm text-neutral-700">
              {type === "login" ? (
                <p>
                  Don’t have an account?{" "}
                  <Link href="/register" className="font-semibold text-purple-600 underline cursor-pointer decoration-2 underline-offset-4">
                    Register here
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-neutral-900 underline decoration-lime-400 decoration-2 underline-offset-4">
                    Login here
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="relative hidden h-full min-h-[320px] overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black shadow-[0_30px_80px_rgba(0,0,0,0.22)] lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-lime-400/40 via-lime-200/10 to-transparent" />
            <Image
              src="/trademilaan.png"
              alt="Trading analytics dashboard"
              fill
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute left-6 bottom-6 flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg shadow-lime-200/60 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-lime-500" />
              Secure, SEBI-compliant access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
