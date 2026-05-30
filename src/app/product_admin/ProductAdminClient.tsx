"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardCheck,
  Gift,
  KeyRound,
  Lock,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const stats = [
  { label: "Referral Partners", value: "42", caption: "Active school and coaching partners", icon: Gift },
  { label: "Pending Reviews", value: "18", caption: "Referral payouts and school verifications", icon: ClipboardCheck },
  { label: "Admin Events", value: "1.2k", caption: "Tracked this month", icon: Activity },
  { label: "Access Requests", value: "7", caption: "Awaiting product owner approval", icon: KeyRound },
];

const referralRows = [
  { code: "BOARD-AI-DELHI", owner: "North India schools cohort", status: "Live", leads: 118, conversion: "31%" },
  { code: "CBSE-EVAL-2026", owner: "CBSE evaluator network", status: "Review", leads: 64, conversion: "24%" },
  { code: "STATEBOARD-LABS", owner: "Partner labs pilot", status: "Paused", leads: 39, conversion: "18%" },
];

const activityRows = [
  "Principal onboarding approved for OzymorLab Academic Academy",
  "Referral payout hold added for duplicate lead audit",
  "Bulk invite threshold reviewed for school admins",
  "Evaluation usage anomaly flagged for manual review",
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: 20,
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 750, color: "#111827" }}>{title}</h2>
      {children}
    </section>
  );
}

export default function ProductAdminClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isProductAdmin = user?.role === "admin" || user?.role === "principal";

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f8fb", color: "#111827", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700 }}>
          <Lock size={16} />
          Checking access
        </div>
      </main>
    );
  }

  if (!isProductAdmin) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f8fb", color: "#111827", fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
        <section style={{ maxWidth: 420, background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, textAlign: "center" }}>
          <ShieldCheck size={28} color="#4f46e5" style={{ margin: "0 auto 12px" }} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Product admin access required</h1>
          <p style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.6 }}>This OzymorLab control surface is limited to admin and principal accounts.</p>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f7f8fb", color: "#111827", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ background: "#111827", color: "#ffffff", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#c7d2fe", fontWeight: 700 }}>
              <Lock size={15} />
              Internal OzymorLab Control Surface
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, lineHeight: 1.1, letterSpacing: 0, fontWeight: 800 }}>
              Product Admin
            </h1>
            <p style={{ margin: "8px 0 0", maxWidth: 760, color: "rgba(255,255,255,0.72)", fontSize: 14 }}>
              Control referral programs, product-owner approvals, admin activity, platform notices, and school onboarding operations from one private console.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "9px 12px", fontSize: 12, fontWeight: 700 }}>
            <ShieldCheck size={16} />
            Noindex
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 48px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 18, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{item.caption}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "#eef2ff", color: "#3730a3", display: "grid", placeItems: "center" }}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)", gap: 20 }}>
          <Panel title="Referral Program Control">
            <div style={{ overflowX: "auto", marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "#6b7280", textAlign: "left" }}>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>Code</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>Owner</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>Leads</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {referralRows.map((row) => (
                    <tr key={row.code}>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f1f5f9", fontWeight: 750 }}>{row.code}</td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f1f5f9" }}>{row.owner}</td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f1f5f9" }}>{row.status}</td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f1f5f9" }}>{row.leads}</td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f1f5f9" }}>{row.conversion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Admin Activity Feed">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {activityRows.map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                  <Bell size={15} color="#4f46e5" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <Panel title="Admin Controls">
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              {[
                ["Referral approvals", Gift],
                ["User and school access", Users],
                ["Broadcasts and notices", Megaphone],
                ["Usage analytics", BarChart3],
              ].map(([label, Icon]: any) => (
                <button key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#111827", fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Governance">
            <p style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.6, margin: "14px 0 0" }}>
              This route is intentionally excluded from search indexing and public navigation. Product owners can use it as the front door for referral governance, audit checks, and school-level operations.
            </p>
          </Panel>
        </div>
      </div>
    </main>
  );
}
