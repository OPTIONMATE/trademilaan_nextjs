"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import UsersSection from "../components/admin/UsersSection";
import SignedAgreementsSection from "../components/admin/SignedAgreementsSection";
import SignedUsersSection from "../components/admin/SignedUsersSection";
import InvoiceSection from "../components/admin/InvoiceSection";
import RiskProfilesSection from "../components/admin/RiskProfilesSection";
import AnalyticsSection from "../components/admin/AnalyticsSection";
import PlansSection from "../components/admin/PlansSection";
import SubscriptionsSection from "../components/admin/SubscriptionsSection";
import PaymentAuditSection from "../components/admin/PaymentAuditSection";
import CouponSection from "../components/admin/CouponSection";
import ContactMessagesSection from "../components/admin/ContactMessagesSection";
import ComplaintStatsSection from "../components/admin/ComplaintStatsSection";

const COLLECTIONS = [
  { key: "users", label: "Users", icon: "👥" },
  { key: "signedAgreements", label: "Signed Agreements", icon: "✍️" },
  { key: "signedUsers", label: "Signed Users", icon: "📋" },
  { key: "riskprofiles", label: "Risk Profiles", icon: "📊" },
  { key: "invoices", label: "Invoices", icon: "📄" },
  { key: "complaintStats", label: "Complaint Table", icon: "🧾" },
  { key: "analytics", label: "Admin Analytics", icon: "📈" },
  { key: "plans", label: "Create Plan", icon: "🎯" },
  { key: "coupons", label: "Coupons", icon: "🎟️" },
  { key: "contactMessages", label: "Contact Messages", icon: "📬" },
  { key: "subscriptions", label: "My Subscriptions", icon: "🔄" },
  { key: "paymentAudit", label: "Admin Audit History", icon: "🔍" },
];

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Initialize all state hooks at the top (before any conditional returns)
  const [activeTab, setActiveTab] = useState("users");
  const [loadingData, setLoadingData] = useState(false);
  const [contactUnreadCount, setContactUnreadCount] = useState(0);

  const [data, setData] = useState({
    users: [],
    signedAgreements: [],
    signedUsers: [],
    riskprofiles: [],
    invoices: [],
    complaintStats: null,
  });

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const safeFetchJson = async (url, fallback = {}) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`Request failed: ${url} (${res.status})`);
          }
          return await res.json();
        } catch (error) {
          console.error(`Error fetching ${url}:`, error);
          return fallback;
        }
      };

      const [
        usersRes,
        signedAgreementsRes,
        signedUsersRes,
        riskProfilesRes,
        invoicesRes,
        contactMessagesRes,
        complaintStatsRes,
      ] = await Promise.all([
        safeFetchJson("/api/admin/users", { users: [] }),
        safeFetchJson("/api/admin/signed-agreements", { signedAgreements: [] }),
        safeFetchJson("/api/admin/signed-users", { signedUsers: [] }),
        safeFetchJson("/api/admin/riskprofiles", { riskprofiles: [] }),
        safeFetchJson("/api/admin/invoices", { invoices: [] }),
        safeFetchJson("/api/admin/contact-messages?limit=1", {
          stats: { unreadCount: 0 },
        }),
        safeFetchJson("/api/admin/complaint-stats", null),
      ]);
      setData({
        users: usersRes?.users || [],
        signedAgreements: signedAgreementsRes?.signedAgreements || [],
        signedUsers: signedUsersRes?.signedUsers || [],
        riskprofiles: riskProfilesRes?.riskprofiles || [],
        invoices: invoicesRes?.invoices || [],
        complaintStats: complaintStatsRes || null,
      });
      setContactUnreadCount(contactMessagesRes?.stats?.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoadingData(false);
  };

  // All hooks must be declared before any conditional returns
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch data only if user is authenticated and is admin
    if (!loading && user && user.role === "admin") {
      fetchAllData();
    }
  }, [loading, user]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!user || user.role !== "admin") {
    return null;
  }

  const currentCollection = COLLECTIONS.find((c) => c.key === activeTab);

  return (
    <main className="p-6 mt-24">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border rounded-lg p-4 bg-white sticky top-28 h-fit">
          <h2 className="font-bold text-lg mb-4 text-neutral-900">
            Admin Menu
          </h2>
          <nav className="flex flex-col gap-1">
            {COLLECTIONS.map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => setActiveTab(col.key)}
                className={`text-left p-3 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer ${
                  activeTab === col.key
                    ? "bg-[#9BE749] text-black"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                }`}
              >
                <span>{col.label}</span>
                {col.key === "contactMessages" && contactUnreadCount > 0 && (
                  <span className="ml-auto inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
                    {contactUnreadCount > 99 ? "99+" : contactUnreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{currentCollection?.label}</h1>
            {loadingData &&
              activeTab !== "analytics" &&
              activeTab !== "plans" &&
              activeTab !== "subscriptions" &&
              activeTab !== "paymentAudit" &&
              activeTab !== "contactMessages" && (
                <div className="text-sm text-neutral-500">Loading...</div>
              )}
          </div>

          {/* Conditional rendering of sections */}
          {activeTab === "users" &&
            (loadingData ? (
              <p className="text-sm text-neutral-500">Loading data...</p>
            ) : (
              <UsersSection data={data.users} onRefresh={fetchAllData} />
            ))}

          {activeTab === "signedAgreements" &&
            (loadingData ? (
              <p className="text-sm text-neutral-500">Loading data...</p>
            ) : (
              <SignedAgreementsSection data={data.signedAgreements} />
            ))}

          {activeTab === "signedUsers" &&
            (loadingData ? (
              <p className="text-sm text-neutral-500">Loading data...</p>
            ) : (
              <SignedUsersSection
                data={data.signedUsers}
                onRefresh={fetchAllData}
              />
            ))}

          {activeTab === "riskprofiles" &&
            (loadingData ? (
              <p className="text-sm text-neutral-500">Loading data...</p>
            ) : (
              <RiskProfilesSection data={data.riskprofiles} />
            ))}

          {activeTab === "invoices" &&
            (loadingData ? (
              <p className="text-sm text-neutral-500">Loading data...</p>
            ) : (
              <InvoiceSection data={data.invoices} />
            ))}

          {activeTab === "analytics" && <AnalyticsSection />}

          {activeTab === "plans" && <PlansSection />}

          {activeTab === "coupons" && <CouponSection />}

          {activeTab === "contactMessages" && (
            <ContactMessagesSection
              onUnreadCountChange={setContactUnreadCount}
            />
          )}

          {activeTab === "subscriptions" && <SubscriptionsSection />}

          {activeTab === "paymentAudit" && <PaymentAuditSection />}
          {activeTab === "complaintStats" && <ComplaintStatsSection />}
        </section>
      </div>
    </main>
  );
}
