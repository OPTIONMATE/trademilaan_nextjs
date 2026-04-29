"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, RefreshCw, Search, Check, X } from "lucide-react";

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

const formatDateWithTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toSearchText = (user) =>
  [user?.name, user?.email, user?.mobile, user?.pan, user?.serviceName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const StatusBadge = ({ value, label }) => {
  return value ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 font-semibold text-sm">
      <Check className="w-4 h-4" /> {label || "Yes"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-red-700 font-semibold text-sm">
      <X className="w-4 h-4" /> No
    </span>
  );
};

const MailStatusText = ({ value }) => {
  return value ? (
    <span className="text-sm font-semibold text-emerald-700">Yes</span>
  ) : (
    <span className="text-sm font-semibold text-red-600">No</span>
  );
};

export default function SignedUsersSection({ data = [], onRefresh }) {
  const [localUsers, setLocalUsers] = useState(data || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateOfConsent");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [sendingAgreementId, setSendingAgreementId] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [confirmSendModal, setConfirmSendModal] = useState(null);
  const [kycDialog, setKycDialog] = useState(null);

  useEffect(() => {
    console.log("[SignedUsersSection] Data received:", data);
    console.log("[SignedUsersSection] Data length:", data?.length || 0);
    setLocalUsers(data || []);
  }, [data]);

  const updateUserStatus = async (userId, statusType, value) => {
    setUpdatingUserId(userId);
    try {
      const updatePayload = {};
      updatePayload[statusType] = value;

      const response = await fetch("/api/admin/signed-users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updatePayload }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update only the changed row locally to avoid table-wide re-render/flicker.
      setLocalUsers((prev) =>
        prev.map((u) =>
          u.userId === userId ? { ...u, [statusType]: value } : u
        )
      );

      setKycDialog(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleConfirmedSend = async () => {
    if (!confirmSendModal) return;
    const agreementId = confirmSendModal.agreementId;
    try {
      setSendingAgreementId(agreementId);
      const res = await fetch("/api/admin/signed-users/send-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreementId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to send");
      setLocalUsers((prev) =>
        prev.map((row) =>
          row._id === agreementId ? { ...row, agreementMailedToUser: true } : row
        )
      );
      setResultModal({
        type: "success",
        message: `Agreement mailed successfully to ${confirmSendModal.email}`,
      });
    } catch (err) {
      console.error("Send agreement failed:", err);
      setResultModal({
        type: "error",
        message: `Failed to send agreement: ${err.message}`,
      });
    } finally {
      setSendingAgreementId(null);
      setConfirmSendModal(null);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = normalizedSearch
      ? localUsers.filter((user) => toSearchText(user).includes(normalizedSearch))
      : [...localUsers];

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      }

      if (sortBy === "email") {
        return String(a?.email || "").localeCompare(String(b?.email || ""));
      }

      if (sortBy === "serviceName") {
        return String(a?.serviceName || "").localeCompare(String(b?.serviceName || ""));
      }

      // Default: newest consent date first
      const aDate = new Date(a?.dateOfConsent || 0).getTime();
      const bDate = new Date(b?.dateOfConsent || 0).getTime();
      return bDate - aDate;
    });

    return filtered;
  }, [localUsers, searchTerm, sortBy]);

  const exportSignedUsersCsv = () => {
    const headers = [
      "Name",
      "PAN",
      "DOB",
      "Date of Consent",
      "Email",
      "Mobile",
      "State",
      "Service Name",
      "Agreement Mailed To User",
      "MITC Mailed To User",
      "KYC Updated By Admin",
      "Valid From",
      "Valid Till",
      "Renewal Date",
      "Invoice Mailed To User",
    ];

    const rows = filteredAndSortedUsers.map((u) => [
      u?.name || "",
      u?.pan || "",
      u?.dob || "",
      formatDate(u?.dateOfConsent),
      u?.email || "",
      u?.mobile || "",
      u?.state || "",
      u?.serviceName || "",
      u?.agreementMailedToUser ? "Yes" : "No",
      u?.mitcMailedToUser ? "Yes" : "No",
      u?.kycUpdatedByAdmin ? "Yes" : "No",
      formatDate(u?.validFrom),
      formatDate(u?.validTill),
      formatDate(u?.renewalDate),
      u?.invoiceMailedToUser ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signed-users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border rounded-lg p-8 text-center text-neutral-500 bg-white">
          <p className="text-lg font-semibold">No signed users found</p>
          <p className="text-sm mt-2 text-gray-500">
            There are no signed agreements in the system yet.
          </p>
          <button
            type="button"
            onClick={() => (onRefresh ? onRefresh() : window.location.reload())}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-2 z-20 md:static rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/85 p-3 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-2">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-black/45 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, mobile, PAN, or service..."
              className="w-full rounded-lg border border-neutral-200 px-9 py-2 text-sm text-black/80 placeholder:text-black/45 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
            />
          </div>
          <button
            type="button"
            onClick={() => (onRefresh ? onRefresh() : window.location.reload())}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-white text-sm font-semibold hover:bg-emerald-600 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={exportSignedUsersCsv}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-semibold hover:bg-emerald-100 transition"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-black/65 text-sm font-medium mr-1">Sort:</span>
          <button
            type="button"
            onClick={() => setSortBy("dateOfConsent")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              sortBy === "dateOfConsent"
                ? "bg-black text-white"
                : "bg-neutral-100 text-black/75 hover:bg-neutral-200"
            }`}
          >
            Date
          </button>
          <button
            type="button"
            onClick={() => setSortBy("name")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              sortBy === "name"
                ? "bg-black text-white"
                : "bg-neutral-100 text-black/75 hover:bg-neutral-200"
            }`}
          >
            Name
          </button>
          <button
            type="button"
            onClick={() => setSortBy("email")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              sortBy === "email"
                ? "bg-black text-white"
                : "bg-neutral-100 text-black/75 hover:bg-neutral-200"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setSortBy("serviceName")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              sortBy === "serviceName"
                ? "bg-black text-white"
                : "bg-neutral-100 text-black/75 hover:bg-neutral-200"
            }`}
          >
            Service
          </button>
          <span className="ml-auto text-sm text-black/70 font-medium px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200">
            Total: <span className="font-bold text-black">{filteredAndSortedUsers.length}</span>
          </span>
        </div>
      </div>

      {/* Table Container with overflow-x-auto */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4 bg-neutral-50/70">
          {filteredAndSortedUsers.map((u) => (
            <div key={u._id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <p className="font-bold text-lg text-black/90">{u?.name}</p>
                <p className="text-sm text-black/55">{u?.email}</p>
              </div>

              <div className="space-y-2 text-sm text-black/75">
                <p>
                  <span className="font-semibold text-black/90">PAN:</span> {u?.pan}
                </p>
                <p>
                  <span className="font-semibold text-black/90">DOB:</span> {u?.dob}
                </p>
                <p>
                  <span className="font-semibold text-black/90">Mobile:</span> {u?.mobile}
                </p>
                <p>
                  <span className="font-semibold text-black/90">State:</span> {u?.state}
                </p>
                <p>
                  <span className="font-semibold text-black/90">Service:</span> {u?.serviceName}
                </p>
                <p>
                  <span className="font-semibold text-black/90">Consent Date:</span>{" "}
                  {formatDate(u?.dateOfConsent)}
                </p>
                <p>
                  <span className="font-semibold text-black/90">Valid From:</span>{" "}
                  {formatDate(u?.validFrom)}
                </p>
                <p>
                  <span className="font-semibold text-black/90">Valid Till:</span>{" "}
                  {formatDate(u?.validTill)}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-black/65 mb-1">Agreement Mailed To User</p>
                  {MailStatusText({ value: u?.agreementMailedToUser })}
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/65 mb-1">MITC Mailed To User</p>
                  {MailStatusText({ value: u?.mitcMailedToUser })}
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/65 mb-1">KYC Updated By Admin</p>
                  {StatusBadge({ value: u?.kycUpdatedByAdmin })}
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/65 mb-1">Invoice Mailed To User</p>
                  {StatusBadge({ value: u?.invoiceMailedToUser })}
                </div>
              </div>
              <div className="mt-3">
                <button
                  disabled={sendingAgreementId === u._id}
                  onClick={async () => {
                    setConfirmSendModal({ agreementId: u._id, email: u.email, name: u.name });
                  }}
                  className={`w-full px-3 py-2 rounded-lg font-medium ${sendingAgreementId === u._id ? "bg-gray-300 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {sendingAgreementId === u._id ? "Sending..." : "Send Agreement"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View with horizontal scroll container */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full min-w-[1900px] text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Name
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  PAN
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  DOB
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Consent Date
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Email
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Mobile
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  State
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Service
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Agreement Mailed
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  MITC Mailed
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  KYC Updated
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Valid From
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Valid Till
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Renewal
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Invoice Mailed
                </th>
                <th className="text-left px-3 py-2.5 text-black/80 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                  Send Agreement
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-neutral-100 hover:bg-neutral-50/70 transition"
                >
                  <td className="px-3 py-2.5 font-medium text-black/90 whitespace-nowrap">
                    {u?.name}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 font-mono text-sm whitespace-nowrap">
                    {u?.pan}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {u?.dob}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {formatDateWithTime(u?.dateOfConsent)}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap truncate">
                    {u?.email}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {u?.mobile}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {u?.state}
                  </td>
                  <td className="px-3 py-2.5 text-black/80 text-sm font-medium whitespace-nowrap">
                    {u?.serviceName}
                  </td>
                  <td className="px-3 py-2.5">
                    {MailStatusText({ value: u?.agreementMailedToUser })}
                  </td>
                  <td className="px-3 py-2.5">
                    {MailStatusText({ value: u?.mitcMailedToUser })}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setKycDialog({
                          userId: u.userId,
                          name: u?.name || "User",
                          currentValue: Boolean(u?.kycUpdatedByAdmin),
                          selectedValue: Boolean(u?.kycUpdatedByAdmin),
                        })
                      }
                      className="rounded-full"
                    >
                      {StatusBadge({ value: u?.kycUpdatedByAdmin })}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {formatDate(u?.validFrom)}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {formatDate(u?.validTill)}
                  </td>
                  <td className="px-3 py-2.5 text-black/75 text-sm whitespace-nowrap">
                    {formatDate(u?.renewalDate)}
                  </td>
                  <td className="px-3 py-2.5">
                    {StatusBadge({ value: u?.invoiceMailedToUser })}
                  </td>
                  <td className="px-3 py-2.5 text-sm whitespace-nowrap">
                    <button
                      disabled={sendingAgreementId === u._id}
                      onClick={async () => {
                        setConfirmSendModal({ agreementId: u._id, email: u.email, name: u.name });
                      }}
                      className={`px-3 py-1 rounded-lg font-medium ${sendingAgreementId === u._id ? "bg-gray-300 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      {sendingAgreementId === u._id ? "Sending..." : "Send"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {kycDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-black/90">Update KYC Status</h3>
            <p className="mt-1 text-sm text-black/65">User: {kycDialog.name}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={updatingUserId === kycDialog.userId}
                onClick={() =>
                  updateUserStatus(
                    kycDialog.userId,
                    "kycUpdatedByAdmin",
                    true
                  )
                }
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  kycDialog.selectedValue
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-neutral-200 bg-white text-black/75"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                disabled={updatingUserId === kycDialog.userId}
                onClick={() =>
                  updateUserStatus(
                    kycDialog.userId,
                    "kycUpdatedByAdmin",
                    false
                  )
                }
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  !kycDialog.selectedValue
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-neutral-200 bg-white text-black/75"
                }`}
              >
                No
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setKycDialog(null)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-black/75 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              {resultModal.type === "success" ? (
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              ) : (
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              )}
              <h3 className={`text-base font-semibold ${resultModal.type === "success" ? "text-emerald-900" : "text-red-900"}`}>
                {resultModal.type === "success" ? "Success" : "Error"}
              </h3>
            </div>
            <p className={`text-sm ${resultModal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
              {resultModal.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setResultModal(null)}
                className={`px-4 py-2 rounded-lg font-medium text-white transition ${resultModal.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-black/90 mb-2">Send Agreement Email</h3>
            <p className="text-sm text-black/65 mb-4">
              Are you sure you want to send the agreement to <span className="font-medium">{confirmSendModal.email}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmSendModal(null)}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-black/75 font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedSend}
                disabled={sendingAgreementId === confirmSendModal.agreementId}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {sendingAgreementId === confirmSendModal.agreementId ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
