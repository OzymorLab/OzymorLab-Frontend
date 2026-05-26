"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Settings, BookOpen, LogOut, Key,
  Bell, Search, Shield, GraduationCap, Sun, Moon, BarChart3, ShieldCheck, MessageSquare
} from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Link from "next/link";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Detect currently active theme from DOM
    const activeTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  const isAdmin = user?.role === "admin" || user?.role === "principal";
  const isHOD = user?.role === "hod";

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
          <div className="logo-mark">Oz</div>
          <div>
            <div className="logo-name">OzymorLab AIOS</div>
            <div className="logo-tagline">Assessment Engine</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">EVALUATION</div>
          <Link href="/dashboard" className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}>
            <LayoutDashboard className="nav-item-icon" />
            Dashboard
          </Link>
          <Link href="/dashboard/exams" className={`nav-item ${pathname.startsWith("/dashboard/exams") ? "active" : ""}`}>
            <GraduationCap className="nav-item-icon" />
            Exams Setup
          </Link>
          <Link href="/dashboard/submissions" className={`nav-item ${pathname.startsWith("/dashboard/submissions") ? "active" : ""}`}>
            <BookOpen className="nav-item-icon" />
            Submissions
          </Link>
          <Link href="/dashboard/students" className={`nav-item ${pathname.startsWith("/dashboard/students") ? "active" : ""}`}>
            <Users className="nav-item-icon" />
            Students
          </Link>
          <Link href="/dashboard/reviews" className={`nav-item ${pathname.startsWith("/dashboard/reviews") ? "active" : ""}`}>
            <Shield className="nav-item-icon" />
            Reviews
          </Link>
          <Link href="/dashboard/reports" className={`nav-item ${pathname.startsWith("/dashboard/reports") ? "active" : ""}`}>
            <BarChart3 className="nav-item-icon" />
            Reports
          </Link>
          <Link href="/analysis" className={`nav-item ${pathname.startsWith("/analysis") ? "active" : ""}`}>
            <MessageSquare className="nav-item-icon" />
            AI Copilot Chat
          </Link>

          {(isAdmin || isHOD) && (
            <>
              <div className="divider"></div>
              <div className="nav-section-label">ADMINISTRATION</div>
              {isAdmin && (
                <Link href="/dashboard/admin" className={`nav-item ${pathname.startsWith("/dashboard/admin") ? "active" : ""}`}>
                  <ShieldCheck className="nav-item-icon" />
                  School Admin
                </Link>
              )}
            </>
          )}

          <div className="divider"></div>

          <div className="nav-section-label">ACCOUNT</div>
          <Link href="/dashboard/settings" className={`nav-item ${pathname === "/dashboard/settings" ? "active" : ""}`}>
            <Settings className="nav-item-icon" />
            Settings
          </Link>
        </nav>

        {/* Sidebar Footer with Theme Toggle */}
        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            className="nav-item w-full"
            style={{ 
              background: "var(--surface-secondary)", 
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 12px",
              cursor: "pointer",
              borderRadius: "var(--radius-md)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {theme === "dark" ? <Moon size={14} className="text-brand-600" /> : <Sun size={14} className="text-warning-text" />}
              <span className="font-medium" style={{ fontSize: "11.5px" }}>
                {theme === "dark" ? "Dark Theme" : "Light Theme"}
              </span>
            </div>
            <span style={{ fontSize: "10px", opacity: 0.6 }}>Toggle</span>
          </button>

          <div className="user-row">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="nav-item-icon ml-auto text-gray-400 cursor-pointer hover:text-brand-600"
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
          <div className="topbar-search">
            <Search size={14} className="topbar-search-icon" />
            <input
              type="text"
              placeholder="Search student ID, batch, or submission..."
              className="topbar-search-input"
            />
            <div className="topbar-search-kbd">
              <kbd>⌘</kbd><kbd>K</kbd>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <span className="topbar-user-name">{user.full_name}</span>
              <span className="topbar-user-role">{user.role}</span>
            </div>
            <div className="topbar-notif">
              <Bell size={16} />
              <span className="topbar-notif-dot" />
            </div>
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

