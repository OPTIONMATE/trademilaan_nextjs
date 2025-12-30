"use client";

export default function GoogleLoginBtn() {
  return (
    <button
      onClick={() => (window.location.href = "/api/auth/google")}
      className="w-full border-2 border-purple-600/60 rounded-full py-2  flex justify-center gap-2 hover:bg-purple-600/60 hover:text-white  cursor-pointer transition duration-300"
    >
      Continue with Google
    </button>
  );
}
