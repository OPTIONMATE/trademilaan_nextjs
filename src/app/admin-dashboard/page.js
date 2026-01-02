import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/app/lib/db";
import { verifyToken } from "@/app/lib/jwt";
import User from "@/app/lib/models/User";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    redirect("/login");
  }

  await connectDB();
  const user = await User.findById(decoded.id).select("username email role");

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return user;
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/40 px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Welcome back, {admin.username || admin.email}. This space is reserved for administrators.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Email</p>
            <p className="text-base font-semibold text-neutral-900">{admin.email}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Role</p>
            <p className="text-base font-semibold text-neutral-900">{admin.role}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-6 text-neutral-700">
          <p className="text-sm font-semibold text-neutral-900">Admin-only area</p>
          <p className="text-sm mt-2 text-neutral-600">
            Build your management tools here. Non-admin users are redirected away before reaching this page.
          </p>
        </div>
      </div>
    </main>
  );
}
