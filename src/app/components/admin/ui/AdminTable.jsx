"use client";

/**
 * Shared admin table chrome.
 *
 * columns: [{ key, header, align: "left"|"right"|"center", className, render(row) }]
 * rows:    raw rows passed to each column's `render`.
 * minWidth: minimum table width before horizontal scroll kicks in (default 640).
 */
export default function AdminTable({
  columns = [],
  rows = [],
  minWidth = 640,
  className = "",
  empty = null,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table
        className="w-full border-collapse text-left text-sm"
        style={{ minWidth }}
      >
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left"
                } ${col.headerClassName || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12">
                {empty || (
                  <div className="text-center text-sm text-neutral-500">
                    No data to display
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={row._id || row.id || rowIndex}
                className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50/70"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-middle ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left"
                    } ${col.cellClassName || ""}`}
                  >
                    {col.render ? col.render(row, rowIndex) : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}