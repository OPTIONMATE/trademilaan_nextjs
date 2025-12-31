"use client";
import { useRouter } from "next/navigation";
import Protected from "../components/Protected";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const goHome = () => router.push("/");

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/40 px-4 py-24 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200/70 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-500">Signed in as</p>
              <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
                {user?.username || "User"}
              </h1>
              <p className="text-sm text-neutral-600">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goHome}
                className="hidden sm:inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition"
              >
                Back to home
              </button>
              <LogoutButton />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Name</p>
              <p className="text-base font-semibold text-neutral-900">{user?.username || "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Email</p>
              <p className="text-base font-semibold text-neutral-900">{user?.email || "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Disclaimer</p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.disclaimerAccepted ? "Accepted" : "Pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Member since</p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "--"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm text-neutral-600">
            <p>
              Manage your account details and session from here. Use the logout button to securely end your session.
            </p>
          </div>
        </div>
      </div>
    </Protected>
  );
}
