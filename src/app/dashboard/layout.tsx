"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard, Users, Settings, BookOpen, LogOut, Key,
  Bell, Search, Shield, GraduationCap, FileText
} from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Link from "next/link";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="auth-page">
        <div className="auth-loading"><div className="auth-spinner" /></div>
      </div>
    );
  }

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">Ex</div>
          <div>
            <div className="logo-name">Edexia AIOS</div>
            <div className="logo-tagline">Assessment Engine</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">EVALUATION</div>
          <Link href="/dashboard" className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}>
            <LayoutDashboard className="nav-item-icon" />
            Dashboard
          </Link>
          <Link href="/dashboard/exams" className={`nav-item ${pathname === "/dashboard/exams" ? "active" : ""}`}>
            <GraduationCap className="nav-item-icon" />
            Exams Setup
          </Link>
          <Link href="/dashboard" className="nav-item">
            <BookOpen className="nav-item-icon" />
            Submissions
          </Link>
          <Link href="/dashboard" className="nav-item">
            <Users className="nav-item-icon" />
            Students
          </Link>
          <Link href="/dashboard" className="nav-item">
            <Shield className="nav-item-icon" />
            Reviews
          </Link>

          <div className="divider"></div>

          <div className="nav-section-label">ACCOUNT</div>
          <Link href="/dashboard/settings" className="nav-item">
            <Key className="nav-item-icon" />
            API Keys
          </Link>
          <Link href="/dashboard/settings" className="nav-item">
            <Settings className="nav-item-icon" />
            Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="nav-item-icon ml-auto text-gray-400 cursor-pointer"
              title="Logout"
              style={{ background: "none", border: "none" }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <header className="topbar">
          <div className="flex-center gap-2 text-text-tertiary">
            <Search size={16} />
            <span className="text-[13px]">Search student ID or batch...</span>
          </div>
          <div className="flex-center gap-4">
            <div className="relative cursor-pointer">
              <Bell size={18} className="text-text-secondary" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-brand-600 rounded-full border border-surface-primary"></div>
            </div>
            <span className="text-[12px] text-text-tertiary">{user.email}</span>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
