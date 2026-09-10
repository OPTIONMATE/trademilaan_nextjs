"use client";

const badgeTones = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  pending: "bg-sky-100 text-sky-800",
  info: "bg-sky-100 text-sky-800",
  error: "bg-red-100 text-red-800",
  neutral: "bg-neutral-100 text-neutral-700",
};

const dotTones = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  pending: "bg-sky-500",
  info: "bg-sky-500",
  error: "bg-red-500",
  neutral: "bg-neutral-400",
};

export default function AdminBadge({
  children,
  tone = "neutral",
  dot = false,
  className = "",
  ...rest
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTones[tone] || badgeTones.neutral} ${className}`}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${dotTones[tone] || dotTones.neutral}`}
        />
      )}
      {children}
    </span>
  );
}