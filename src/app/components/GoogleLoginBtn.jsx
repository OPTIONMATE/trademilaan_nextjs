"use client";

export default function GoogleLoginBtn() {
  const handleGoogleLogin = () => {
    // Passport backend handles everything
    window.location.href = "/api/auth/google";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full border py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
    >
      Continue with Google
    </button>
  );
}
