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
    <div className="app-shell relative min-h-screen w-screen overflow-hidden flex bg-[var(--surface-page)] text-[var(--text-primary)] font-sans transition-all duration-300">
      
      {/* Dynamic Background Glow Rings for "Cloudy" Aesthetics */}
      <div className="absolute top-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-brand-600/10 to-brand-400/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-brand-500/5 to-cyan-500/10 blur-[100px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="sidebar w-[220px] shrink-0 bg-[var(--surface-primary)] border-r border-[var(--border-subtle)] flex flex-col z-10 backdrop-blur-md bg-opacity-90 relative">
        <div className="sidebar-logo px-6 py-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <div className="w-[30px] h-[30px] bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-brand-600/20">
            Oz
          </div>
          <div>
            <div className="logo-name font-semibold text-[13.5px] tracking-tight text-[var(--text-primary)]">OzymorLab HUD</div>
            <div className="logo-tagline text-[10.5px] text-[var(--text-tertiary)] block font-mono uppercase tracking-wider -mt-0.5">Multi-Modal</div>
          </div>
        </div>

        <nav className="sidebar-nav flex-1 py-4 px-3 flex flex-col gap-0.5">
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase font-semibold px-3 mb-2 tracking-wider">EVALUATION</div>
          
          <Link href="/dashboard" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname === "/dashboard" 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
          <Link href="/dashboard/exams" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname.startsWith("/dashboard/exams") 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <GraduationCap size={15} />
            Exams Setup
          </Link>
          <Link href="/dashboard/submissions" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname.startsWith("/dashboard/submissions") 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <BookOpen size={15} />
            Submissions
          </Link>
          <Link href="/dashboard/students" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname.startsWith("/dashboard/students") 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <Users size={15} />
            Students
          </Link>
          <Link href="/dashboard/reviews" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname.startsWith("/dashboard/reviews") 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <Shield size={15} />
            Reviews
          </Link>
          <Link href="/dashboard/reports" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname.startsWith("/dashboard/reports") 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <BarChart3 size={15} />
            Reports
          </Link>
          <Link href="/analysis" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname.startsWith("/analysis") 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <MessageSquare size={15} />
            AI Copilot Chat
          </Link>

          {(isAdmin || isHOD) && (
            <>
              <div className="h-[0.5px] bg-[var(--border-subtle)] my-3 mx-3" />
              <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase font-semibold px-3 mb-2 tracking-wider">ADMINISTRATION</div>
              {isAdmin && (
                <Link href="/dashboard/admin" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
                  pathname.startsWith("/dashboard/admin") 
                    ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
                }`}>
                  <ShieldCheck size={15} />
                  School Admin
                </Link>
              )}
            </>
          )}

          <div className="h-[0.5px] bg-[var(--border-subtle)] my-3 mx-3" />

          <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase font-semibold px-3 mb-2 tracking-wider">ACCOUNT</div>
          <Link href="/dashboard/settings" className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
            pathname === "/dashboard/settings" 
              ? "bg-[var(--surface-secondary)] text-brand-600 shadow-sm border border-[var(--border-subtle)] font-semibold" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-primary)]"
          }`}>
            <Settings size={15} />
            Settings
          </Link>
        </nav>

        {/* Sidebar Footer with Theme Toggle */}
        <div className="sidebar-footer p-4 border-t border-[var(--border-subtle)] flex flex-col gap-3">
          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-between px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg cursor-pointer hover:border-brand-500 transition-all w-full text-[11.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon size={13} className="text-brand-600 animate-pulse" /> : <Sun size={13} className="text-amber-500" />}
              <span>{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
            </div>
            <span className="text-[9px] font-mono opacity-60 uppercase">Mode</span>
          </button>

          <div className="flex items-center gap-2.5 px-1 py-0.5">
            <div className="w-[30px] h-[30px] rounded-full bg-brand-50 dark:bg-brand-950/20 text-brand-600 font-bold text-[11px] flex items-center justify-center border border-brand-500/20 shadow-sm select-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate leading-none">{user.full_name}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono mt-0.5 leading-none">{user.role}</div>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="text-[var(--text-tertiary)] hover:text-brand-600 transition-colors p-1"
              title="Logout"
              style={{ background: "none", border: "none" }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-[56px] px-6 bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 z-10 backdrop-blur-md bg-opacity-80">
          <div className="flex items-center gap-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg w-[280px] hover:border-brand-500/60 focus-within:border-brand-600 transition-all duration-300">
            <Search size={14} className="text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search student, batch, or key..."
              className="bg-transparent border-none outline-none text-[12px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] w-full font-mono"
            />
            <div className="hidden sm:flex items-center gap-0.5 shrink-0 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-primary)] border border-[var(--border-subtle)] px-1 py-0.2 rounded shadow-sm">
              <span>⌘K</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[12.5px] font-semibold text-[var(--text-primary)] leading-none">{user.full_name}</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider block mt-0.5">{user.role}</span>
            </div>
            <div className="w-[34px] h-[34px] border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center cursor-pointer hover:bg-[var(--surface-primary)] hover:border-brand-500 transition-all relative">
              <Bell size={15} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-600 rounded-full animate-ping" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-600 rounded-full" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 relative">
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

