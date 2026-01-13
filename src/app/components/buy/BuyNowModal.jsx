"use client";
import { useState } from "react";
import BuyDetailsForm from "./BuyDetailsForm";
import BuyOtpForm from "./BuyOtpForm";
import AgreementModal from "./AgreementModal";

export default function BuyNowModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {/* STEP 1: TERMS */}
      {step === 1 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-slate-500 hover:text-slate-700"
            >
              ×
            </button>

            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Terms & Conditions</h2>

              <div className="h-48 overflow-y-auto border border-slate-200 rounded-lg p-4 text-sm text-slate-700 bg-slate-50">
                <p>
                  This is a dummy Terms & Conditions content. Investments are subject to market risk. No assured
                  returns. Please review carefully before proceeding.
                </p>
              </div>

              <label className="flex items-center gap-3 mt-4 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                I agree to the Terms & Conditions
              </label>

              <button
                disabled={!agreed}
                onClick={() => setStep(2)}
                className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${
                  agreed
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-slate-500 hover:text-slate-700"
            >
              ×
            </button>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <BuyDetailsForm onSuccess={() => setStep(3)} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: OTP */}
      {step === 3 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-slate-500 hover:text-slate-700"
            >
              ×
            </button>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <BuyOtpForm onSuccess={() => setStep(4)} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: AGREEMENT & E-SIGN */}
      {step === 4 && (
        <AgreementModal 
          onClose={onClose} 
          onSuccess={onClose} 
        />
      )}
    </>
  );
}
