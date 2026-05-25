"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, loginWithGoogle, user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("teacher");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    const result = await signup(email, password, fullName, role);
    if (result.success) {
      setSuccess("Account created! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setError(result.error || "Signup failed");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setError(result.error || "Google sign-in failed");
    }
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-loading">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left: Branding Panel */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="landing-logo" style={{ marginBottom: 32 }}>
            <div className="logo-mark" style={{ width: 36, height: 36, fontSize: 13 }}>Oz</div>
            <span className="logo-name" style={{ fontSize: 18 }}>OzymorLab AIOS</span>
          </div>
          <h2 className="auth-brand-title">
            AI-Powered Multimodal<br />Evaluation Infrastructure
          </h2>
          <p className="auth-brand-desc">
            Rubric-grounded, explainable, component-wise assessment for
            board examinations. Designed for millions of answer sheets.
          </p>
          <div className="auth-features-list">
            <div className="auth-feature-item">
              <CheckCircle2 size={16} />
              <span>4 Parallel Evaluation Pipelines</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={16} />
              <span>Human-in-the-Loop Moderation</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={16} />
              <span>Bring Your Own Gemini Key</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={16} />
              <span>Explainable Score Justification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => { setActiveTab("signup"); setError(""); setSuccess(""); }}
            >
              Create Account
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="auth-message auth-error" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "start", gap: "8px" }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span className="font-semibold" style={{ fontSize: "13px" }}>{error}</span>
              </div>
              
              {(error.includes("provider is not enabled") || error.includes("Unsupported provider")) && (
                <div style={{ 
                  marginTop: "8px", 
                  backgroundColor: "var(--surface-secondary)", 
                  border: "1px solid var(--border-subtle)", 
                  padding: "12px", 
                  borderRadius: "var(--radius-md)", 
                  color: "var(--text-secondary)", 
                  fontSize: "12px",
                  lineHeight: "1.6",
                  textAlign: "left"
                }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "12.5px", display: "block", borderBottom: "0.5px solid var(--border-subtle)", paddingBottom: "6px", marginBottom: "6px" }}>
                    ⚙️ Supabase Integration Configuration Required
                  </strong>
                  <p style={{ marginBottom: "8px" }}>
                    The Google OAuth provider is not yet enabled in your Supabase project. To configure it:
                  </p>
                  <ol style={{ paddingLeft: "14px", margin: "0", display: "flex", flexDirection: "column", gap: "6px", listStyleType: "decimal" }}>
                    <li>Open the <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: "var(--brand-600)", textDecoration: "underline", fontWeight: 500 }}>Supabase Console</a>.</li>
                    <li>Select your project and navigate to <strong>Authentication &gt; Providers</strong>.</li>
                    <li>Find <strong>Google</strong> in the provider list.</li>
                    <li>Toggle <strong>Enable Google Provider</strong> to enabled.</li>
                    <li>Paste your Google Developer Console <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
                    <li>Click <strong>Save</strong> and retry signing in.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="auth-message auth-success">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                id="login-submit"
                type="submit"
                className="btn btn-brand btn-full"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"} <ArrowRight size={14} />
              </button>
              
              <div className="auth-divider" style={{ textAlign: "center", margin: "16px 0", color: "var(--muted)", fontSize: "14px" }}>
                <span>or</span>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn btn-secondary btn-full btn-google"
                disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", gap: "8px" }}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign In with Google
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  placeholder="Dr. Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  id="signup-role"
                  className="form-input form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="teacher">Teacher</option>
                  <option value="evaluator">Evaluator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button
                id="signup-submit"
                type="submit"
                className="btn btn-brand btn-full"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={14} />
              </button>
              
              <div className="auth-divider" style={{ textAlign: "center", margin: "16px 0", color: "var(--muted)", fontSize: "14px" }}>
                <span>or</span>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn btn-secondary btn-full btn-google"
                disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", gap: "8px" }}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign Up with Google
              </button>
            </form>
          )}

          <p className="auth-footer-text">
            {activeTab === "login" ? (
              <>Don&apos;t have an account? <button className="auth-link" onClick={() => setActiveTab("signup")}>Create one</button></>
            ) : (
              <>Already have an account? <button className="auth-link" onClick={() => setActiveTab("login")}>Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="auth-page"><div className="auth-loading"><div className="auth-spinner" /></div></div>}>
        <LoginPageContent />
      </Suspense>
    </AuthProvider>
  );
}
