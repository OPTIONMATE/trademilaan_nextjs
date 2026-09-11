import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function PaymentForm({
  onPaymentComplete,
  onBack,
  planData,
  userDetails,
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const selectedPlanName = planData?.planName || "Selected Plan";
  const selectedAmount =
    Number(String(planData?.price ?? "").replace(/[^\d.]/g, "")) || 0;

  const kycFullName = userDetails?.fullName?.trim() || "";

  // ✅ Auto-fill form with user data
  useEffect(() => {
    if (user) {
      const preferredName =
        user.fullName ||
        user.name ||
        user.username ||
        (user.email ? String(user.email).split("@")[0] : "");

      setForm((prevForm) => ({
        ...prevForm,
        name: preferredName,
        email: user.email || "",
      }));
    }
  }, [user]);

  // Prefer KYC name from Buy Details step when present (matches invoice / verify)
  useEffect(() => {
    if (kycFullName) {
      setForm((prev) => ({ ...prev, name: kycFullName }));
    }
  }, [kycFullName]);

  // ✅ Load Razorpay SDK
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getActiveSubscriptionMessage = (payload, fallbackPlanName) => {
    const until = formatDateLabel(payload?.activeUntil);
    const safePlanName = payload?.planName || fallbackPlanName || "this plan";
    return `You already have an active subscription for ${safePlanName} till ${until}. Please renew after expiry.`;
  };

  // ✅ Coupon Verification Handler
  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);

    try {
      const response = await fetch("/api/coupons");
      const result = await response.json();

      if (result.success) {
        const coupon = result.data.find(
          (c) => c.code === couponCode.toUpperCase() && c.isActive,
        );

        if (!coupon) {
          setCouponError("Invalid or inactive coupon code");
          return;
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          setCouponError("This coupon has expired");
          return;
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          setCouponError("This coupon has reached its usage limit");
          return;
        }

        setAppliedCoupon(coupon);
        setCouponError("");
      } else {
        setCouponError("Could not verify coupon. Please try again.");
      }
    } catch (err) {
      console.error("Coupon verification error:", err);
      setCouponError("Error verifying coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // ✅ Calculate Discount
  let discountAmount = 0;
  let finalAmount = selectedAmount;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (selectedAmount * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    finalAmount = Math.max(0, selectedAmount - discountAmount);
  }

  // ✅ Payment Handler
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!planData?.planId || !selectedAmount) {
      setError("Selected plan is invalid. Please choose a plan again.");
      return;
    }

    if (!window.Razorpay) {
      setError(
        "Payment gateway is still loading. Please try again in a moment.",
      );
      return;
    }

    setLoading(true);
    setIsVerifyingPayment(false);
    setError("");
    setErrorCode("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/payment/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planData.planId,
          email: form.email,
          ...(appliedCoupon && { couponCode: appliedCoupon.code }),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        if (res.status === 409 && data?.code === "ACTIVE_SUBSCRIPTION_EXISTS") {
          setErrorCode("ACTIVE_SUBSCRIPTION_EXISTS");
          setError(getActiveSubscriptionMessage(data, selectedPlanName));
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Order creation failed");
      }

      const serverPricing = data.pricing || {
        finalAmount,
        planName: selectedPlanName,
        planType: planData?.type || "",
      };

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: selectedPlanName,
        description: `Subscription - ${selectedPlanName}`,
        order_id: data.order.id,
        prefill: {
          name: kycFullName || form.name,
          email: form.email,
          contact: form.phone,
        },

        handler: async function (response) {
          try {
            setIsVerifyingPayment(true);
            const billingName = kycFullName || form.name;
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                ...form,
                name: billingName,
                amount: serverPricing.finalAmount,
                planId: planData.planId,
                planName: serverPricing.planName || selectedPlanName,
                planType: serverPricing.planType || planData?.type || "",
                state: userDetails?.state,
                panNumber: userDetails?.panNumber,
                ...(appliedCoupon && { couponCode: appliedCoupon.code }),
              }),
            });

            const vData = await verifyRes.json();

            if (vData.success) {
              setSuccess(true);
              setErrorCode("");
              setVerifyData({ ...response, ...vData });
              setIsVerifyingPayment(false);

              if (onPaymentComplete) {
                onPaymentComplete({
                  ...vData,
                  expiry: vData?.expiresAt || null,
                });
              }
            } else {
              if (
                verifyRes.status === 409 &&
                vData?.code === "ACTIVE_SUBSCRIPTION_EXISTS"
              ) {
                setErrorCode("ACTIVE_SUBSCRIPTION_EXISTS");
                setError(getActiveSubscriptionMessage(vData, selectedPlanName));
              } else {
                setErrorCode("");
                setError(vData.error || "Verification failed");
              }
              setIsVerifyingPayment(false);
            }
          } catch (err) {
            setErrorCode("");
            setError(err?.message || "Payment verification failed");
            setIsVerifyingPayment(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setErrorCode("");
        setError(response?.error?.description || "Payment failed");
        setIsVerifyingPayment(false);
      });

      rzp.open();
    } catch (err) {
      setErrorCode("");
      setError(err?.message || "Payment initialization failed");
      setIsVerifyingPayment(false);
    }

    setLoading(false);
  };

  if (isVerifyingPayment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-linear-to-br from-indigo-100 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-600 animate-spin"></div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Received
            </h2>
            <p className="text-gray-600 mb-1">
              Verifying payment and preparing your invoice...
            </p>
            <p className="text-sm text-gray-500">Please do not close this window.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Success / Failure Screen
  if (success || error) {
    // Show loader while invoice is being generated
    if (success && !verifyData) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-linear-to-br from-indigo-100 via-white to-indigo-50">
          <div className="flex flex-col items-center gap-6">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-600 animate-spin"></div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600 mb-1">Generating and sending invoice...</p>
              <p className="text-sm text-gray-500">This may take a few seconds</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen">
        {success ? (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h2>
            <p>Thank you for your payment.</p>

            <button
              disabled={!verifyData}
              className={`mt-4 px-6 py-2 rounded-lg ${
                verifyData
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
              onClick={async () => {
                const invoiceName = kycFullName || form.name;
                const params = new URLSearchParams({
                  payment_id: verifyData.razorpay_payment_id,
                  name: invoiceName,
                  email: form.email,
                  phone: form.phone,
                  amount: String(verifyData?.amount || Math.round(finalAmount)),
                  service: selectedPlanName,
                  planName: selectedPlanName,
                  state: userDetails?.state ?? "",
                  pan: userDetails?.panNumber ?? "",
                  qty: "1",
                });

                const res = await fetch(
                  `/api/payment/invoice?${params.toString()}`,
                );

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `invoice-${verifyData.razorpay_payment_id}.pdf`;
                link.click();
              }}
            >
              Download Invoice
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Failed
            </h2>
            <p>{error}</p>
            {errorCode === "ACTIVE_SUBSCRIPTION_EXISTS" && (
              <button
                onClick={() => router.push("/my-subscriptions")}
                className="mt-4 px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition"
              >
                Go to My Subscriptions
              </button>
            )}
          </>
        )}

        <button onClick={onBack} className="mt-6 px-6 py-2 border rounded">
          Back
        </button>
      </div>
    );
  }

  // ✅ Main Form
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-100 via-white to-indigo-50 px-4">
      <form
        onSubmit={handlePayment}
        className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Secure Payment
        </h2>

        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span className="font-medium">Plan</span>
            <span className="font-semibold">{selectedPlanName}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
            <span className="font-medium">Amount</span>
            <span className="font-semibold">Rs. {selectedAmount}</span>
          </div>
          {discountAmount > 0 && (
            <div className="mt-2 flex items-center justify-between text-sm text-green-700">
              <span className="font-medium">Coupon Discount</span>
              <span className="font-semibold">
                - Rs. {Math.round(discountAmount)}
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-base text-gray-900">
            <span className="font-semibold">Payable</span>
            <span className="font-bold">Rs. {Math.round(finalAmount)}</span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
            />
          </div>

          {/* Phone */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
            />
          </div>
        </div>

        {/* Coupon Section */}
        <div className="mt-8">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Have a Coupon Code? (Optional)
          </label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-300 rounded-lg">
              <div>
                <p className="font-semibold text-green-900">✓ Coupon Applied</p>
                <p className="text-sm text-green-700 mt-1">
                  Code:{" "}
                  <span className="font-mono font-bold">
                    {appliedCoupon.code}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode("");
                  setCouponError("");
                }}
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition font-mono uppercase"
                disabled={couponLoading}
              />
              <button
                type="button"
                onClick={handleVerifyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-6 py-2 bg-lime-500 text-white font-semibold rounded-lg hover:bg-lime-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {couponLoading ? "Checking..." : "Apply"}
              </button>
            </div>
          )}
          {couponError && (
            <p className="mt-2 text-sm text-red-600 font-medium">
              {couponError}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 text-red-500 text-center font-medium">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading || !planData?.planId || !selectedAmount}
            className="w-2/3 py-2 rounded-lg text-white font-semibold bg-linear-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition shadow-md"
          >
            {loading ? "Processing..." : "Continue with Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
