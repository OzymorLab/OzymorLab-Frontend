import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BookOpen, 
  LogOut,
  Bell,
  Search
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Edexia Assessment Intelligence OS",
  description: "AI-powered teacher dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
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
              <div className="nav-item active">
                <LayoutDashboard className="nav-item-icon" />
                Dashboard
              </div>
              <div className="nav-item">
                <BookOpen className="nav-item-icon" />
                Submissions
                <span className="nav-item-badge">12</span>
              </div>
              <div className="nav-item">
                <Users className="nav-item-icon" />
                Students
              </div>

              <div className="divider"></div>

              <div className="nav-section-label">SYSTEM</div>
              <div className="nav-item">
                <Settings className="nav-item-icon" />
                Rubrics & Rules
              </div>
            </nav>

            <div className="sidebar-footer">
              <div className="user-row">
                <div className="user-avatar">MT</div>
                <div>
                  <div className="user-name">Manish Tiwari</div>
                  <div className="user-role">Head Evaluator</div>
                </div>
                <LogOut className="nav-item-icon ml-auto text-gray-400 cursor-pointer" />
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
                <button className="btn btn-primary">Generate Report</button>
              </div>
            </header>

            <main className="content">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}
