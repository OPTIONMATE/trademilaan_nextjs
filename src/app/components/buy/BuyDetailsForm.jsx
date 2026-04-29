"use client";
import { useState } from "react";

export default function BuyDetailsForm({ onSuccess, planData }) {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    state: "",
    email: "",
    phone: "",
    panNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    const { name, value } = e.target;
    const normalizedValue =
      name === "panNumber"
        ? value.toUpperCase().replace(/\s+/g, "").slice(0, 10)
        : name === "phone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : value;

    setForm({ ...form, [name]: normalizedValue });
  };

  const submit = async () => {
    setLoading(true);
    setError("");

    // Validate DOB - user must be at least 18 years old
    if (!form.dob) {
      setError("Date of Birth is required");
      setLoading(false);
      return;
    }

    const dob = new Date(form.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("You must be at least 18 years old to proceed");
      setLoading(false);
      return;
    }

    // Validate phone presence and digits
    if (!form.phone || String(form.phone).trim() === "") {
      setError("Phone number is required");
      setLoading(false);
      return;
    }

    if (String(form.phone).replace(/\D/g, "").length < 10) {
      setError("Phone number must be at least 10 digits");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/buy/start", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message);
      return;
    }

    // Pass form data up to parent
    onSuccess(form);
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Complete Your Details</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <input
        name="fullName"
        placeholder="Full Name"
        className="border p-2 w-full mb-3"
        onChange={update}
      />

      <input
        name="dob"
        type="date"
        placeholder="DOB"
        className="border p-2 w-full mb-3"
        onChange={update}
      />

      <select
        name="gender"
        className="border p-2 w-full mb-3"
        onChange={update}
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>

      <select name="state" className="border p-2 w-full mb-3" onChange={update}>
        <option value="">Select State</option>
        <option value="Andhra Pradesh">Andhra Pradesh</option>
        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
        <option value="Assam">Assam</option>
        <option value="Bihar">Bihar</option>
        <option value="Chhattisgarh">Chhattisgarh</option>
        <option value="Goa">Goa</option>
        <option value="Gujarat">Gujarat</option>
        <option value="Haryana">Haryana</option>
        <option value="Himachal Pradesh">Himachal Pradesh</option>
        <option value="Jharkhand">Jharkhand</option>
        <option value="Karnataka">Karnataka</option>
        <option value="Kerala">Kerala</option>
        <option value="Madhya Pradesh">Madhya Pradesh</option>
        <option value="Maharashtra">Maharashtra</option>
        <option value="Manipur">Manipur</option>
        <option value="Meghalaya">Meghalaya</option>
        <option value="Mizoram">Mizoram</option>
        <option value="Nagaland">Nagaland</option>
        <option value="Odisha">Odisha</option>
        <option value="Punjab">Punjab</option>
        <option value="Rajasthan">Rajasthan</option>
        <option value="Sikkim">Sikkim</option>
        <option value="Tamil Nadu">Tamil Nadu</option>
        <option value="Telangana">Telangana</option>
        <option value="Tripura">Tripura</option>
        <option value="Uttar Pradesh">Uttar Pradesh</option>
        <option value="Uttarakhand">Uttarakhand</option>
        <option value="West Bengal">West Bengal</option>

        {/* Union Territories */}
        <option value="Andaman and Nicobar Islands">
          Andaman and Nicobar Islands
        </option>
        <option value="Chandigarh">Chandigarh</option>
        <option value="Dadra and Nagar Haveli and Daman and Diu">
          Dadra and Nagar Haveli and Daman and Diu
        </option>
        <option value="Delhi">Delhi</option>
        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
        <option value="Ladakh">Ladakh</option>
        <option value="Lakshadweep">Lakshadweep</option>
        <option value="Puducherry">Puducherry</option>
      </select>

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-3"
        onChange={update}
      />

      <input
        name="phone"
        type="tel"
        placeholder="Phone Number (10 digits)"
        className="border p-2 w-full mb-3"
        onChange={update}
        value={form.phone}
        maxLength={10}
      />

      <input
        name="panNumber"
        placeholder="PAN Number"
        className="border p-2 w-full mb-4 uppercase"
        value={form.panNumber}
        maxLength={10}
        autoCapitalize="characters"
        onChange={update}
      />
      <p className="text-xs text-neutral-500 -mt-2 mb-4">
        PAN format: AAAAA9999A 
      </p>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded"
      >
        {loading ? "Sending OTP..." : "Update & Verify"}
      </button>
    </>
  );
}
