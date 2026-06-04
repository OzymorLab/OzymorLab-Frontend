"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  BrainCircuit,
  History,
  AlertTriangle,
  BarChart2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

export default function SettingsPage() {
  const { user, fetchWithAuth } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedAISuccess, setSavedAISuccess] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(
    (user as any)?.confidence_threshold ?? 0.75
  );

  // Sync from fetched user profile
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setConfidenceThreshold((user as any).confidence_threshold ?? 0.75);
    }
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 800);
  };

  const handleAISave = async () => {
    setIsSavingAI(true);
    setSavedAISuccess(false);
    try {
      await fetchWithAuth(`${API_BASE}/auth/me/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confidence_threshold: confidenceThreshold,
          full_name: fullName || undefined,
        }),
      });
      setSavedAISuccess(true);
      setTimeout(() => setSavedAISuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save AI preferences:", err);
    } finally {
      setIsSavingAI(false);
    }
  };

  if (!user) return null;

  const thresholdPct = Math.round(confidenceThreshold * 100);
  const thresholdColor =
    thresholdPct >= 85
      ? "text-emerald-500"
      : thresholdPct >= 65
      ? "text-amber-400"
      : "text-red-400";

  const thresholdLabel =
    thresholdPct >= 85
      ? "High Confidence"
      : thresholdPct >= 65
      ? "Medium Confidence"
      : "Low Confidence";

  return (
    <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto animate-fade-in relative z-10">
      {/* Title */}
      <div className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-brand-600 uppercase bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded-full w-max">
            <Settings size={11} className="animate-spin" />
            Control Center
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] mt-2">
            Account &amp; Portal Settings
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Configure your personal profile, AI grading behaviour, and notification targets.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Profile Card ── */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <User size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">
              Evaluator Profile
            </h2>
          </div>

          <div className="p-6">
            {savedSuccess && (
              <div className="mb-5 p-3 rounded-xl flex items-center gap-2 text-[12px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                <CheckCircle2 size={16} /> Profile updates saved successfully.
              </div>
            )}

            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                    Institutional Role
                  </label>
                  <input
                    type="text"
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] opacity-70 cursor-not-allowed font-bold"
                    value={user.role.toUpperCase()}
                    disabled
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] opacity-70 cursor-not-allowed"
                  value={user.email}
                  disabled
                />
                <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  To change your institutional email, contact your system administrator.
                </span>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl text-[12.5px] font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all cursor-pointer shadow-sm"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── AI Grading Settings ── */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <BrainCircuit size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">
              My AI Settings
            </h2>
            <span className="ml-auto text-[10px] font-mono font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800 px-2 py-0.5 rounded-full">
              Control how AI adapts to your grading style
            </span>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {savedAISuccess && (
              <div className="p-3 rounded-xl flex items-center gap-2 text-[12px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                <CheckCircle2 size={16} /> AI preferences saved.
              </div>
            )}

            {/* Confidence Threshold Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-[var(--text-secondary)]" />
                  <h4 className="text-[13px] font-bold text-[var(--text-primary)]">
                    Confidence Threshold
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[18px] font-mono font-black ${thresholdColor}`}>
                    {thresholdPct}%
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    thresholdPct >= 85
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : thresholdPct >= 65
                      ? "bg-amber-500/10 text-amber-500 border-amber-400/20"
                      : "bg-red-500/10 text-red-500 border-red-400/20"
                  }`}>
                    {thresholdLabel}
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-[var(--text-tertiary)]">
                Any AI grading run where confidence falls below this percentage will be automatically
                flagged for your manual review instead of auto-grading. Set higher for more oversight,
                lower to let the AI grade more autonomously.
              </p>

              <div className="relative py-2">
                <input
                  id="confidence-threshold-slider"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={thresholdPct}
                  onChange={(e) =>
                    setConfidenceThreshold(Number(e.target.value) / 100)
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-500"
                  style={{
                    background: `linear-gradient(to right, var(--brand-500) 0%, var(--brand-500) ${thresholdPct}%, var(--surface-secondary) ${thresholdPct}%, var(--surface-secondary) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-tertiary)] mt-1">
                  <span>0% (Full AI)</span>
                  <span>50%</span>
                  <span>100% (Full Review)</span>
                </div>
              </div>

              {/* Tick marks for reference */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { pct: "≤ 60%", label: "Auto-grade everything", color: "text-red-400 border-red-400/20 bg-red-500/5" },
                  { pct: "65–85%", label: "Flag uncertain grades", color: "text-amber-400 border-amber-400/20 bg-amber-500/5" },
                  { pct: "≥ 85%", label: "Maximum human oversight", color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" },
                ].map((tier) => (
                  <div
                    key={tier.pct}
                    className={`border rounded-xl p-3 text-center ${tier.color}`}
                  >
                    <div className="text-[11px] font-mono font-black">{tier.pct}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{tier.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adaptation Curve Info */}
            <div className="flex items-start gap-3 bg-[var(--surface-secondary)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <BarChart2 size={18} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12.5px] font-bold text-[var(--text-primary)]">
                  Adaptation Curve
                </h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                  As you override AI grades, the system learns your marking style. Your override
                  history is recorded on the Reviews page — the more corrections you provide,
                  the more aligned the AI becomes to your judgement.
                </p>
              </div>
            </div>

            {/* Corrections History Link */}
            <div className="flex items-start gap-3 bg-[var(--surface-secondary)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <History size={18} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-[12.5px] font-bold text-[var(--text-primary)]">
                  All My Corrections
                </h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                  Every override you have made — criterion, AI score, your score, reason — is
                  stored as your full correction history in the Moderation tab.
                </p>
              </div>
              <a
                href="/dashboard/reviews"
                className="text-[11px] font-bold text-brand-600 hover:underline shrink-0 mt-0.5"
              >
                View →
              </a>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAISave}
                disabled={isSavingAI}
                className="flex items-center gap-1.5 py-2 px-5 rounded-xl text-[12.5px] font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all cursor-pointer shadow-sm"
              >
                <Save size={14} />
                {isSavingAI ? "Saving..." : "Save AI Preferences"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Security & Access ── */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <Shield size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">
              Security Settings
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-[var(--surface-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
              <div>
                <h4 className="text-[12.5px] font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono uppercase">
                  <Lock size={13} className="text-[var(--text-secondary)]" /> Authentication Provider
                </h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                  Managed via secure cloud integration.
                </p>
              </div>
              <span className="bg-brand-500/10 text-brand-600 border border-brand-500/20 text-[11px] font-bold px-3 py-1 rounded-lg">
                Active Session
              </span>
            </div>

            <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-400/20 rounded-xl p-4">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-[var(--text-secondary)]">
                To change your password or revoke access tokens, contact your system administrator
                or use the Supabase Auth management dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* ── System Alerts ── */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <Bell size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">System Alerts</h2>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-[var(--text-primary)]">
                  Asynchronous Evaluation Completion
                </h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                  Receive immediate dashboard toast popups when grading is completed.
                </p>
              </div>
              <input
                type="checkbox"
                id="notify-completion"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-brand-600 cursor-pointer"
              />
            </div>

            <div className="h-[0.5px] bg-[var(--border-subtle)]" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-[var(--text-primary)]">
                  Daily Assessment Digest
                </h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                  Receive a compiled summary email showing total metrics and detected grading anomalies.
                </p>
              </div>
              <input
                type="checkbox"
                id="notify-digest"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 accent-brand-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
