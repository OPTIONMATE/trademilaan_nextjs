"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ESignModal from "@/app/components/ESignModal";
import PaymentForm from "@/app/components/buy/PaymentForm";
import ServiceAgreement from "@/components/ServiceAgreement";

export default function AgreementModal({
  onClose,
  onSuccess,
  planData,
  userDetails,
}) {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [signedFileId, setSignedFileId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signingData, setSigningData] = useState(null);
  const [capturedAgreementHtml, setCapturedAgreementHtml] = useState("");

  // KYC from BuyDetailsForm (Buy flow) — prefer over profile-only user fields
  const kycClientName =
    userDetails?.fullName?.trim() ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Client Name";
  const kycPan = userDetails?.panNumber || user?.panNumber || user?.pan || "";
  const kycEmail = userDetails?.email?.trim() || user?.email || "";
  const kycDob = userDetails?.dob || "";
  const kycState = userDetails?.state || "";
  const kycGender = userDetails?.gender || "";

  // Capture agreement HTML when user submits for signing
  const captureAgreementHtml = () => {
    try {
      const agreementElement = document.querySelector(".agreement-text");
      if (agreementElement) {
        const clonedElement = agreementElement.cloneNode(true);
        const html = clonedElement.innerHTML || "";
        console.log("📄 Captured agreement HTML length:", html.length);
        console.log("📄 First 200 chars:", html.substring(0, 200));
        return html;
      } else {
        console.warn("⚠️ Agreement element not found in DOM");
        return "";
      }
    } catch (err) {
      console.error("Error capturing agreement HTML:", err);
      return "";
    }
  };

  // Submitting agreement acceptance
  const handleSubmit = async () => {
    try {
      // Capture the agreement HTML while it's still in the DOM
      const htmlContent = captureAgreementHtml();
      if (!htmlContent) {
        console.warn("⚠️ Warning: Agreement HTML was not captured");
      }
      setCapturedAgreementHtml(htmlContent);

      // Accept agreement
      const res = await fetch("/api/agreement/accept", { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept agreement");
      setShowSign(true);
    } catch (err) {
      console.error("ACCEPT ERROR:", err);
    }
  };

  // Called from ESignModal AFTER stamping
  const handleSigned = async (signedData) => {
    try {
      // Check if user is logged in
      if (!user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      // Use the pre-captured agreement HTML from state
      const agreementHtml = capturedAgreementHtml || "";

      if (!agreementHtml) {
        console.warn("⚠️ Warning: Agreement HTML is empty");
      }

      console.log(
        "📝 Using captured agreement HTML, length:",
        agreementHtml.length,
      );
      console.log("🔍 Signed data:", {
        signedName: signedData.signedName,
        signedTimestamp: signedData.signedTimestamp,
        hasSignatureData: !!signedData.signatureUrl,
      });

      // Debug: Log user object to verify email presence
      console.log("[DEBUG] User object before signing:", user);

      // Prepare secure signing data for backend
      // Use available user fields with fallbacks
      const clientName =
        userDetails?.fullName?.trim() ||
        user?.fullName ||
        user?.name ||
        user?.username ||
        user?.email?.split("@")[0] ||
        "Unknown";
      const clientPan =
        userDetails?.panNumber ||
        user?.panNumber ||
        user?.pan ||
        "NOT_PROVIDED";
      const clientPhone =
        userDetails?.phone ||
        user?.phone ||
        "";
      const clientDob =
        userDetails?.dob ||
        user?.dob ||
        "";
      const clientState =
        userDetails?.state ||
        user?.state ||
        "";

      const signingPayload = {
        agreementHtml, // Now using pre-captured HTML
        userId: user?._id || user?.id,
        clientName,
        clientPan,
        clientPhone,
        clientDob,
        clientState,
        signedPlanName: planData?.planName || planData?.name || "",
        signedPlanId: String(planData?._id || planData?.id || ""),
        signedPlanType: String(planData?.type || ""),
        signedPlanDuration: Number(planData?.duration || 0) || undefined,
        signatureData: signedData.signatureUrl,
        signedName: signedData.signedName,
        signedTimestamp: signedData.signedTimestamp,
        signatureTab: signedData.signatureTab,
        ipAddress: null, // Will be captured by backend
        clientEmail: user?.email || user?.primaryEmail || "",
      };

      console.log(
        "📤 Sending signing payload with HTML length:",
        agreementHtml.length,
      );

      setSigningData(signedData);

      // Send to backend for secure PDF generation and storage
      const res = await fetch("/api/agreement/sign-and-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signingPayload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to sign and store agreement");
      }

      console.log(
        "✅ Agreement successfully signed and stored. File ID:",
        result.fileId,
      );

      // Store the returned file ID for downloading
      setSignedFileId(result.fileId);
      setShowSign(false);
    } catch (err) {
      console.error("❌ SIGNING ERROR:", err);
      alert("Error signing agreement: " + err.message);
    }
  };

  // Called when payment is completed
  const [paymentResult, setPaymentResult] = useState(null);
  const handlePaymentComplete = (paymentData) => {
    setShowPayment(false);
    if (typeof paymentData === "string") {
      setPaymentResult({ success: false, error: paymentData });
    } else {
      setPaymentResult(paymentData);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
          >
            ✕
          </button>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* ======================= PAYMENT FORM ======================= */}
            {showPayment ? (
              <PaymentForm
                onPaymentComplete={handlePaymentComplete}
                onBack={() => setShowPayment(false)}
                planData={planData}
                userDetails={userDetails}
              />
            ) : paymentResult ? (
              <div className="flex flex-col items-center justify-center h-screen">
                {paymentResult.success ? (
                  <>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">
                      Payment Successful!
                    </h2>
                    <p className="text-lg">Thank you for your payment.</p>
                    {paymentResult.razorpay_payment_id ? (
                      <button
                        className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        onClick={async () => {
                          const planLabel =
                            paymentResult.planName ||
                            planData?.planName ||
                            "";
                          const invoiceName =
                            userDetails?.fullName?.trim() ||
                            paymentResult.name;
                          const params = new URLSearchParams({
                            payment_id: paymentResult.razorpay_payment_id,
                            name: invoiceName,
                            email: paymentResult.email,
                            phone: paymentResult.phone,
                            amount: paymentResult.amount?.toString() || "4399",
                            service: planLabel,
                            planName: planLabel,
                            state: userDetails?.state ?? "",
                            pan: userDetails?.panNumber ?? "",
                            qty: "1",
                          });
                          const response = await fetch(
                            `/api/payment/invoice?${params.toString()}`,
                          );
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `invoice-${paymentResult.razorpay_payment_id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        }}
                      >
                        Download Invoice
                      </button>

                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-green-600 mb-4">
                          Payment Successful!
                        </h2>
                        <p className="text-lg">Thank you for your payment.</p>
                        <button
                          className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                          onClick={async () => {
                            const params = new URLSearchParams({
                              payment_id: paymentResult.razorpay_payment_id,
                              name: paymentResult.name,
                              email: paymentResult.email,
                              phone: paymentResult.phone,
                              amount: paymentResult.amount?.toString() || "4399",
                            });
                            const response = await fetch(
                              `/api/payment/invoice?${params.toString()}`,
                            );
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `invoice-${paymentResult.razorpay_payment_id}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          }}
                        >
                          Download Invoice
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                      Payment Failed
                    </h2>
                    <p className="text-lg">
                      {paymentResult.error ||
                        "Payment was not successful. Please try again."}
                    </p>
                  </>
                )}
                <button
                  onClick={() => setShowPayment(false)}
                  className="mt-6 px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Back
                </button>
              </div>
            ) : (
              <>
                {/* ======================= SIGNED AGREEMENT REVIEW THEN PAYMENT THEN DOWNLOAD ======================= */}
                {showSign ? null : signedFileId ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4">
                      ✓ Agreement Successfully Signed
                    </h2>
                    <ServiceAgreement
                      clientName={kycClientName}
                      clientPan={kycPan}
                      clientEmail={kycEmail}
                      clientDob={kycDob}
                      clientState={kycState}
                      clientGender={kycGender}
                      planName={planData?.planName || planData?.name || ""}
                      planType={planData?.type || "monthly"}
                      planDuration={planData?.duration}
                      planStartDate={
                        signingData?.signedTimestamp
                          ? new Date(signingData.signedTimestamp)
                          : new Date()
                      }
                      signedDate={
                        signingData?.signedTimestamp
                          ? new Date(
                              signingData.signedTimestamp,
                            ).toLocaleDateString("en-IN")
                          : new Date().toLocaleDateString("en-IN")
                      }
                    />
                    <div className="flex flex-col gap-3 mt-6 border-t pt-4">
                      {/* Download Button - Direct PDF download */}
                      <a
                        href={`/api/agreement/download/${signedFileId}`}
                        download={`agreement-${signedFileId}.pdf`}
                        className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 text-center font-semibold flex items-center justify-center gap-2"
                      >
                        <span>📥</span> Download Signed Agreement (PDF)
                      </a>

                      {/* Payment Button */}
                      <button
                        onClick={() => setShowPayment(true)}
                        disabled={showPayment}
                        className={`px-6 py-3 rounded-lg font-semibold text-center ${
                          showPayment
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ======================= NORMAL AGREEMENT VIEW ======================= */}
                    <ServiceAgreement
                      clientName={kycClientName}
                      clientPan={kycPan}
                      clientEmail={kycEmail}
                      clientDob={kycDob}
                      clientState={kycState}
                      clientGender={kycGender}
                      planName={planData?.planName || planData?.name || ""}
                      planType={planData?.type || "monthly"}
                      planDuration={planData?.duration}
                      planStartDate={new Date()}
                      signedDate={new Date().toLocaleDateString("en-IN")}
                    />
                    <div className="mt-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setChecked(e.target.checked)}
                        />
                        I have read the Agreement and will proceed to E-Sign.
                      </label>
                      <button
                        onClick={handleSubmit}
                        disabled={!checked}
                        className={`mt-4 px-4 py-2 rounded-lg text-white ${
                          checked
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-gray-400"
                        }`}
                      >
                        Submit & Continue
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================= SIGN MODAL ======================= */}
      {showSign && (
        <ESignModal
          pdfUrl={pdfUrl}
          onClose={() => setShowSign(false)}
          onSaved={handleSigned}
        />
      )}
    </>
  );
}
