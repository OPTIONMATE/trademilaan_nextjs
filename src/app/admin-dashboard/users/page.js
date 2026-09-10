"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  RefreshCw,
  UserRound,
  Mail,
  Phone,
  IdCard,
  Calendar,
  CircleCheck,
  Users,
} from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminBadge from "@/app/components/admin/ui/AdminBadge";
import AdminInput from "@/app/components/admin/ui/AdminInput";
import AdminSelect from "@/app/components/admin/ui/AdminSelect";
import AdminTable from "@/app/components/admin/ui/AdminTable";
import AdminPagination from "@/app/components/admin/ui/AdminPagination";
import AdminEmptyState from "@/app/components/admin/ui/AdminEmptyState";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import { usePagination } from "@/app/components/admin/ui/usePagination";

const PAGE_SIZE = 12;

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toSearchText = (user) =>
  [
    user?.fullName,
    user?.username,
    user?.email,
    user?.phone,
    user?.panNumber,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("joined");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setUsers(json.users || []);
    } catch (err) {
      console.error("Users load error:", err);
      setError(err.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
const filteredAndSortedUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? users.filter((user) => toSearchText(user).includes(normalizedSearch))
      : [...users];

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        const aName = String(a?.fullName || a?.username || "").toLowerCase();
        const bName = String(b?.fullName || b?.username || "").toLowerCase();
        return aName.localeCompare(bName);
      }
      if (sortBy === "email") {
        const aEmail = String(a?.email || "").toLowerCase();
        const bEmail = String(b?.email || "").toLowerCase();
        return aEmail.localeCompare(bEmail);
      }
      const aDate = new Date(a?.createdAt || 0).getTime();
      const bDate = new Date(b?.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return filtered;
  }, [users, searchTerm, sortBy]);

  const { page, pageSize, totalItems, totalPages, pagedItems, setPage } =
    usePagination(filteredAndSortedUsers, PAGE_SIZE);

  const exportUsersCsv = () => {
    const headers = [
      "Name",
      "Username",
      "Email",
      "Phone",
      "PAN Card",
      "Status",
      "Role",
      "Joined",
      "User ID",
    ];
    const rows = filteredAndSortedUsers.map((u) => [
      u?.fullName || "",
      u?.username || "",
      u?.email || "",
      u?.phone || "",
      u?.panNumber || "",
      u?.emailVerified ? "Verified" : "Pending",
      u?.role || "user",
      formatDate(u?.createdAt),
      u?._id || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("joined");
  };

  const hasFilters = searchTerm.trim().length > 0;

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="All registered user accounts on the platform."
        actions={
          <>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={exportUsersCsv}
              disabled={filteredAndSortedUsers.length === 0}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </AdminButton>
          </>
        }
      />

      {loading && <AdminSkeletonTable rows={8} columns={6} />}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load users"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Search / filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-xs">
              <AdminInput
                label="Search users"
                id="user-search"
                placeholder="Name, email, phone, PAN…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-52">
              <AdminSelect
                label="Sort by"
                id="user-sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="joined">Newest first</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </AdminSelect>
            </div>
          </div>

          {filteredAndSortedUsers.length === 0 ? (
            <AdminEmptyState
              title="No users found"
              description={
                hasFilters
                  ? "There are no users matching the current filters."
                  : "There are no user accounts yet."
              }
              actionLabel={hasFilters ? "Clear filters" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
              icon={Users}
            />
          ) : (
            <>
              <AdminTable
minWidth={880}
                columns={[
                  {
                    key: "user",
                    header: "User",
                    render: (u) => {
                      const displayName =
                        u?.fullName || u?.username || "Unnamed user";
                      return (
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                            <UserRound className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-900">
                              {displayName}
                            </p>
                            <span className="inline-flex rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
                              @{u?.username || String(u?._id || "").slice(-6)}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: "contact",
                    header: "Contact",
                    render: (u) => (
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-sm text-neutral-600">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          <span className="truncate">{u?.email || "N/A"}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-neutral-600">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          {u?.phone || "N/A"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "dob",
                    header: "Date of birth",
                    render: (u) => (
                      <span className="text-sm text-neutral-600">
                        {u?.dob || "N/A"}
                      </span>
                    ),
                  },
                  {
                    key: "pan",
                    header: "PAN",
                    render: (u) => (
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-neutral-700">
                          <IdCard className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          <span className="truncate">
                            {u?.panNumber || "Not provided"}
                          </span>
                        </p>
                        <AdminBadge
                          tone={u?.panVerified ? "success" : "pending"}
                          className="mt-1"
                        >
                          {u?.panVerified ? "Verified" : "Pending"}
                        </AdminBadge>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (u) =>
                      u?.emailVerified ? (
                        <AdminBadge tone="success" dot>
                          <CircleCheck className="h-3 w-3" aria-hidden="true" />
                          Verified
                        </AdminBadge>
                      ) : (
                        <AdminBadge tone="pending">Pending</AdminBadge>
                      ),
                  },
                  {
                    key: "joined",
                    header: "Joined",
                    render: (u) => (
                      <span className="flex items-center gap-1.5 text-sm text-neutral-600">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        {formatDate(u?.createdAt)}
                      </span>
                    ),
                  },
                ]}
                rows={pagedItems}
              />
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}