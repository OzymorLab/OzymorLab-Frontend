"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard, Users, Settings, BookOpen, LogOut,
  Bell, Search, Shield, GraduationCap, BarChart3, ShieldCheck,
  MessageSquare, ChevronDown, Sun, Moon
} from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Link from "next/link";

/* ── Diamond logo matching the landing page ── */
const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1f2223" />
    <path d="M8 14L14 8L20 14L14 20L8 14Z" fill="#e0ff82" stroke="#e0ff82" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="3" fill="#1f2223" />
  </svg>
);

const navItems = [
  { label: "Exams Setup", href: "/dashboard/exams", icon: GraduationCap },
  { label: "Submissions", href: "/dashboard/submissions", icon: BookOpen },
  { label: "Classroom", href: "/dashboard/students", icon: Users },
  { label: "Reviews", href: "/dashboard/reviews", icon: Shield },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];


function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);

  /* ── Prevent search indexing for app pages ── */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
  }, []);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  /* ── Restore theme from localStorage ── */
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const active = saved || (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(active as "light" | "dark");
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  /* ── Close menus on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        mobileBtnRef.current &&
        !mobileBtnRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const isAdmin = user?.role === "admin" || user?.role === "principal";
  const isHOD = user?.role === "hod";

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-page)" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #e0ff82", borderTopColor: "#1f2223", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const activeNavItems = user?.role === "student"
    ? [
        { label: "New Submission", href: "/dashboard/exams", icon: GraduationCap },
        { label: "Submissions", href: "/dashboard/submissions", icon: BookOpen },
        { label: "Classroom", href: "/dashboard/students", icon: Users },
        { label: "Reviews", href: "/dashboard/reviews", icon: Shield },
        { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      ]
    : navItems;

  return (
    <div className="dash-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page)", fontFamily: "'Onest', system-ui, -apple-system, sans-serif" }}>

      {/* ══════════════════════════════════════════
          TOP NAVIGATION BAR
      ══════════════════════════════════════════ */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#1f2223",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: 32, flexShrink: 0 }}>
            <LogoIcon />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>OzymorLab</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }} className="dash-nav-desktop">
            {activeNavItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (pathname === item.href) {
                      window.dispatchEvent(new CustomEvent("reset-exams-setup"));
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  <item.icon size={14} strokeWidth={active ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}

            {/* Admin link — only for admin/principal */}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: pathname.startsWith("/dashboard/admin") ? 600 : 400,
                  color: pathname.startsWith("/dashboard/admin") ? "#ffffff" : "rgba(255,255,255,0.55)",
                  background: pathname.startsWith("/dashboard/admin") ? "rgba(255,255,255,0.12)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <ShieldCheck size={14} />
                Admin
              </Link>
            )}
          </nav>

          {/* Right side: Search + Theme + User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>

            {/* Search */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "5px 12px",
              width: 220,
              transition: "all 0.2s",
            }}
              className="dash-search-box"
            >
              <Search size={13} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "#ffffff",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* User menu */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 6px 3px 3px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#e0ff82",
                  color: "#1f2223",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  letterSpacing: "-0.02em",
                }}>
                  {initials}
                </div>
                <ChevronDown size={10} style={{ color: "rgba(255,255,255,0.4)", transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  minWidth: 180,
                  background: "var(--surface-primary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  zIndex: 200,
                }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{user.full_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{user.email}</div>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 14px",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <Settings size={13} />
                    Settings
                  </Link>
                  <button
                    onClick={() => { logout(); router.push("/login"); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 14px",
                      fontSize: 13,
                      color: "#E24B4A",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "background 0.1s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              ref={mobileBtnRef}
              className="dash-nav-mobile-btn"
              onClick={e => { e.stopPropagation(); setMobileMenuOpen(v => !v); }}
              style={{
                display: "none",
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-secondary)",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="dash-nav-mobile-menu"
            style={{
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--surface-primary)",
              padding: "8px 16px 12px",
            }}
            onClick={e => e.stopPropagation()}
          >
            {activeNavItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (pathname === item.href) {
                      window.dispatchEvent(new CustomEvent("reset-exams-setup"));
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    background: active ? "var(--surface-secondary)" : "transparent",
                    textDecoration: "none",
                    marginBottom: 2,
                  }}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════════ */}
      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "28px 24px", boxSizing: "border-box" }}>
        {children}
      </main>

      {/* Responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap');

        /* Apply Onest font to entire dashboard */
        body, .dash-shell * {
          font-family: 'Onest', system-ui, -apple-system, sans-serif !important;
        }

        .dash-nav-desktop { display: flex !important; }
        .dash-nav-mobile-btn { display: none !important; }
        .dash-nav-mobile-menu { display: none; }

        @media (max-width: 900px) {
          .dash-nav-desktop { display: none !important; }
          .dash-nav-mobile-btn { display: flex !important; }
          .dash-nav-mobile-menu { display: block !important; }
          .dash-search-box { display: none !important; }
        }

        .dash-search-box:focus-within {
          border-color: #1f2223 !important;
          box-shadow: 0 0 0 3px rgba(31,34,35,0.06);
        }

        /* Landing-style button variants for dashboard */
        .btn-lp-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 500;
          background: #1f2223; color: #ffffff; border: none; cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap; text-decoration: none;
          font-family: 'Onest', system-ui, sans-serif;
        }
        .btn-lp-primary:hover { background: #333; color: #ffffff; text-decoration: none; }

        .btn-lp-outline {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 500;
          background: transparent; color: var(--text-primary); border: 1px solid var(--border-subtle); cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap; text-decoration: none;
          font-family: 'Onest', system-ui, sans-serif;
        }
        .btn-lp-outline:hover { background: var(--surface-secondary); text-decoration: none; }

        .btn-lp-accent {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 500;
          background: rgb(224,255,130); color: #1f2223; border: none; cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap; text-decoration: none;
          font-family: 'Onest', system-ui, sans-serif;
        }
        .btn-lp-accent:hover { background: rgb(231,255,161); text-decoration: none; }

        /* Landing-style card */
        .card-lp {
          background: var(--surface-primary); border: 1px solid var(--border-subtle);
          border-radius: 12px; transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-lp:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

        @media (max-width: 1024px) {
          main {
            max-width: 90% !important;
          }
        }
        @media (max-width: 600px) {
          main {
            max-width: 100% !important;
            padding: 16px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
