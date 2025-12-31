"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/app/lib/utils";

export default function LogoutButton({ className = "", label = "Logout", onLoggedOut }) {
  const router = useRouter();
  const { setUser } = useAuth();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (onLoggedOut) onLoggedOut();
    router.push("/login");
  };

  return (
    <button
      onClick={logout}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition",
        className
      )}
    >
      {label}
    </button>
  );
}
