"use client";

import { useState } from "react";

/**
 * Small client-side pagination helper for arrays returned by existing
 * admin APIs (which return full collections). Keeps table rendering light
 * by slicing to `pageSize` rows.
 */
export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pagedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
  };
}