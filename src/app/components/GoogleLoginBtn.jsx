"use client";

export default function GoogleLoginBtn() {
  return (
    <button
      onClick={() => (window.location.href = "/api/auth/google")}
      className="w-full border py-2 rounded flex justify-center gap-2 hover:bg-gray-50"
    >
      Continue with Google
    </button>
  );
}
