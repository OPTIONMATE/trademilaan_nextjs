"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageButtons = [];
  for (let p = 1; p <= totalPages; p++) {
    // Keep the window tight: current, neighbours, first and last.
    if (
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1)
    ) {
      pageButtons.push(p);
    } else if (
      pageButtons[pageButtons.length - 1] !== "ellipsis-start" &&
      pageButtons[pageButtons.length - 1] !== "ellipsis-end"
    ) {
      pageButtons.push(p < page ? "ellipsis-start" : "ellipsis-end");
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-neutral-500">
        Showing <span className="font-medium text-neutral-800">{start}</span>–
        <span className="font-medium text-neutral-800">{end}</span> of{" "}
        <span className="font-medium text-neutral-800">{totalItems}</span>
      </p>
      <nav
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageButtons.map((p) =>
          p === "ellipsis-start" || p === "ellipsis-end" ? (
            <span
              key={p}
              className="px-1 text-sm text-neutral-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                p === page
                  ? "bg-[#9BE749] text-black"
                  : "border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}