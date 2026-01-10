"use client";
import { useState } from "react";

export default function BuyDetailsForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [pan, setPan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/buy/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username,
        panNumber: pan.toUpperCase(),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      return;
    }

    onSuccess();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Enter Details</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <input
        placeholder="Username"
        className="border p-2 w-full mb-3"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="PAN Number"
        className="border p-2 w-full mb-4 uppercase"
        value={pan}
        onChange={(e) => setPan(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>
    </>
  );
}
