"use client";

import { useState } from "react";
import { X, Download } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function InvoiceSection({ data }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Filter invoices by client name or amount
  const filteredData =
    !searchQuery || !data
      ? data
      : data.filter(
          (inv) =>
            (inv.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.amount?.toString().includes(searchQuery)
        );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadInvoice = async (invoiceId, clientName) => {
    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetchWithCsrf("/api/admin/invoices/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${clientName || "unknown"}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message);
    } finally {
      setDownloading(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-neutral-500 bg-white">
        <p className="text-lg">No invoices found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search Box */}
        <div className="border rounded-lg p-4 bg-white">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Search Invoices
          </label>
          <input
            type="text"
            placeholder="Search by client name or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900"
          />
          {searchQuery && (
            <p className="text-xs text-neutral-500 mt-2">
              Found {filteredData?.length || 0} invoice(s)
            </p>
          )}
        </div>

        {/* Invoices List */}
        {filteredData && filteredData.length > 0 ? (
          <div className="space-y-3">
            {filteredData.map((inv) => (
              <div
                key={inv._id}
                className="border rounded-lg p-4 bg-white hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold">{inv.clientName || "Unknown Client"}</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Amount: {formatCurrency(inv.amount)}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Generated: {formatDate(inv.createdAt)}
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Invoice
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    ID: {inv._id?.substring(0, 12)}...
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-neutral-500 bg-white">
            <p className="text-sm">No invoices match your search</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Invoice Details</h2>
                <p className="text-sm text-neutral-500 mt-1">{selectedInvoice.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
                aria-label="Close modal"
              >
                <X size={24} className="text-neutral-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Download Error Alert */}
              {downloadError && (
                <div className="border border-red-300 rounded-lg p-4 bg-red-50">
                  <p className="text-sm text-red-700">Error: {downloadError}</p>
                </div>
              )}

              {/* Invoice Info */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-4">Invoice Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Invoice ID</p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {selectedInvoice._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      Client Name
                    </p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {selectedInvoice.clientName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      Plan
                    </p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {selectedInvoice.planName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Amount</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      {formatCurrency(selectedInvoice.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      Generated Date
                    </p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {formatDate(selectedInvoice.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Start Date</p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {formatDate(selectedInvoice.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">End Date</p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {formatDate(selectedInvoice.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-neutral-900 mb-3">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Service Period</span>
                    <span className="font-medium text-neutral-900">
                      {formatDate(selectedInvoice.startDate)} to{" "}
                      {formatDate(selectedInvoice.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Purchased Validity</span>
                    <span className="font-medium text-neutral-900">
                      {Number(selectedInvoice?.planDuration) > 0
                        ? `${Number(selectedInvoice.planDuration)} days`
                        : "—"}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-neutral-900 font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedInvoice.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-neutral-50 border-t p-6 flex justify-end gap-2">
              <button
                onClick={() =>
                  handleDownloadInvoice(selectedInvoice._id, selectedInvoice.clientName)
                }
                disabled={downloading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Download size={16} />
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
