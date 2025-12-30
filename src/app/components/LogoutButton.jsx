"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuth();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <button
      onClick={logout}
      className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
