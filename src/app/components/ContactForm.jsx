"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const normalizedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 15) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Enter your email address, for example name@example.com.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email =
        "Enter a valid email address, for example name@example.com.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Enter your 10-digit phone number, for example 7702262206.";
    } else if (!/^\d{8,15}$/.test(formData.phone)) {
      newErrors.phone =
        "Enter a valid phone number using digits only (8 to 15 digits).";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please enter at least 10 characters in your message.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }
        setSubmitStatus({
          type: "error",
          message:
            result.message ||
            "Unable to send your message right now. Please try again.",
        });
        return;
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        website: "",
      });
      setErrors({});
      setSubmitStatus({
        type: "success",
        message:
          result.message ||
          "Thanks for reaching out. We will get back to you shortly.",
      });
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
          Send us a Message
        </h2>

        {submitStatus.message && (
          <div
            role={submitStatus.type === "error" ? "alert" : "status"}
            aria-live={submitStatus.type === "error" ? "assertive" : "polite"}
            aria-atomic="true"
            className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
              submitStatus.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors`}
              autoComplete="name"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors`}
              autoComplete="email"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="your.email@example.com"
              maxLength={120}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phone
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors`}
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              placeholder="7702262206"
              maxLength={15}
            />
            {errors.phone && (
              <p id="phone-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.message
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors resize-none`}
              maxLength={2000}
              aria-invalid={errors.message ? "true" : undefined}
              aria-describedby={errors.message ? "message-error message-count" : "message-count"}
            ></textarea>
            {errors.message && (
              <p id="message-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.message}
              </p>
            )}
            <p id="message-count" className="mt-1 text-xs text-neutral-500 text-right">
              {formData.message.length}/2000
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
