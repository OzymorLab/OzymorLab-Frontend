"use client";

import { useState } from "react";
import { Settings, User, Bell, Shield, Save, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    
    // Simulate API update
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 800);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto animate-fade-in relative z-10">
      {/* Title area */}
      <div className="relative overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-brand-600 uppercase bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded-full w-max">
            <Settings size={11} className="animate-spin" />
            Control Center
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] mt-2">Account & Portal Settings</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Configure your personal profile preferences, institutional role, and notification targets.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <User size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">Evaluator Profile</h2>
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
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Full Name</label>
                  <input
                    type="text"
                    className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-brand-500 shadow-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Institutional Role</label>
                  <input
                    type="text"
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] opacity-70 cursor-not-allowed font-bold"
                    value={user.role.toUpperCase()}
                    disabled
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase font-mono">Email Address</label>
                <input
                  type="email"
                  className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl py-2 px-3 text-[12.5px] text-[var(--text-primary)] opacity-70 cursor-not-allowed"
                  value={user.email}
                  disabled
                />
                <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5">To change your institutional email, contact your system administrator.</span>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl text-[12.5px] font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all cursor-pointer shadow-sm"
                >
                  <Save size={14} /> 
                  {isSaving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <Shield size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">Security Settings</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center bg-[var(--surface-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
              <div>
                <h4 className="text-[12.5px] font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono uppercase">
                  <Lock size={13} className="text-[var(--text-secondary)]" /> Authentication Provider
                </h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Managed via secure Supabase integration.</p>
              </div>
              <span className="bg-brand-500/10 text-brand-600 border border-brand-500/20 text-[11px] font-bold px-3 py-1 rounded-lg">Active Session Client</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm backdrop-blur-md bg-opacity-80 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 flex items-center gap-2 bg-opacity-50">
            <Bell size={16} className="text-[var(--text-secondary)]" />
            <h2 className="font-bold text-[13.5px] text-[var(--text-primary)]">System Alerts</h2>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-[var(--text-primary)]">Asynchronous Evaluation Completion</h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Receive immediate dashboard toast popups when grading is completed.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-brand-600 cursor-pointer"
              />
            </div>
            
            <div className="h-[0.5px] bg-[var(--border-subtle)] my-1" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-[var(--text-primary)]">Daily Assessment Digest</h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Receive a compiled summary email showing total metrics and detected grading anomalies.</p>
              </div>
              <input 
                type="checkbox" 
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
