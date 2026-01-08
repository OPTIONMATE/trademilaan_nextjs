"use client";
import { useState } from "react";
import BuyDetailsForm from "./BuyDetailsForm";
import BuyOtpForm from "./BuyOtpForm";

export default function BuyNowModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl"
        >
          ×
        </button>

        {/* STEP 1: TERMS */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-3">
              Terms & Conditions
            </h2>

            <div className="h-40 overflow-y-auto border p-3 text-sm mb-4">
              <p>
                This is a dummy Terms & Conditions content.
                Investments are subject to market risk.
                No assured returns.
              </p>
            </div>

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the Terms & Conditions
            </label>

            <button
              disabled={!agreed}
              onClick={() => setStep(2)}
              className={`w-full py-2 rounded ${
                agreed ? "bg-green-600 text-white" : "bg-gray-300"
              }`}
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && <BuyDetailsForm onSuccess={() => setStep(3)} />}

        {/* STEP 3: OTP */}
        {step === 3 && <BuyOtpForm onSuccess={onClose} />}
      </div>
    </div>
  );
}
