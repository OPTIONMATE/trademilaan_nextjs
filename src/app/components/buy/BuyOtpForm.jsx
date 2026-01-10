"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyOtpForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const verify = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/buy/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "OTP verification failed");
      return;
    }

    // 👇 redirect to agreement page here
    router.push("/agreement");
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Verify OTP</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <input
        placeholder="Enter OTP"
        className="border p-2 w-full mb-4"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        onClick={verify}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </>
  );
}
