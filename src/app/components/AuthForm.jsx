"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import GoogleLoginBtn from "./GoogleLoginBtn";

export default function AuthForm({ type }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, fetchMe } = useAuth();

  // If already logged in, redirect away
  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/auth/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center capitalize">
          {type}
        </h2>

        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-black text-white py-2 rounded">
            {type === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="my-4">
          <GoogleLoginBtn />
        </div>

        {/* Switch links */}
        <div className="text-center text-sm">
          {type === "login" ? (
            <p>
              Don’t have an account?{" "}
              <Link href="/register" className="text-blue-600 underline">
                Register here
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 underline">
                Login here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
