"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import { useAdminData } from "@/app/components/admin/ui/useAdminData";
import ReportsSection from "@/app/components/admin/ReportsSection";

const AUTO_REFRESH_MS = 60 * 1000;

export default function AdminReportsPage() {
  const { data, loading, error, load } = useAdminData("/api/admin/reports");

  // Keep history/status current while the page is open, so automatic runs
  // appear without a manual refresh. Paused while the tab is hidden.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load({ silent: true });
    }, AUTO_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Periodic email report to admins with client, plan, validity, agreement, invoice and complaint details (Excel attached). History refreshes automatically every minute."
        actions={
          <AdminButton variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />

      {loading && !data && <AdminSkeletonTable rows={6} columns={6} />}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load reports"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {data && !error && <ReportsSection history={data} onChanged={load} />}
    </div>
  );
}
