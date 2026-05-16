"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, user, isLoading } = useAuth();

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
            <div className="logo-mark" style={{ width: 36, height: 36, fontSize: 13 }}>Ex</div>
            <span className="logo-name" style={{ fontSize: 18 }}>Edexia AIOS</span>
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
            <div className="auth-message auth-error">
              <AlertCircle size={16} /> {error}
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
