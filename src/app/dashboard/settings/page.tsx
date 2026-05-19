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
    <div className="settings-container max-w-[800px] mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
          <Settings className="text-brand-600 animate-spin-slow" size={22} />
          Account Settings
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">Configure your personal profile preferences, institutional role, and notification targets.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="card shadow-sm border border-border-subtle rounded-lg overflow-hidden">
          <div className="card-header border-b border-border-subtle bg-surface-secondary px-6 py-4">
            <div className="card-title font-medium text-[14px] flex items-center gap-2">
              <User size={16} className="text-text-secondary" />
              Evaluator Profile
            </div>
          </div>
          
          <div className="card-body p-6">
            {savedSuccess && (
              <div className="mb-6 p-3 rounded-md flex items-center gap-2 text-[13px] bg-success-bg text-success-text border border-success-border">
                <CheckCircle2 size={16} /> Profile updates saved successfully.
              </div>
            )}

            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label className="form-label text-[12.5px] font-medium text-text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-input p-2.5 rounded-md border border-border-default bg-surface-primary text-[13px] focus:border-brand-600 focus:outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group flex flex-col gap-1.5">
                  <label className="form-label text-[12.5px] font-medium text-text-secondary">Institutional Role</label>
                  <input
                    type="text"
                    className="form-input p-2.5 rounded-md border border-border-default bg-surface-secondary text-[13px] opacity-75 cursor-not-allowed"
                    value={user.role.toUpperCase()}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="form-label text-[12.5px] font-medium text-text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-input p-2.5 rounded-md border border-border-default bg-surface-secondary text-[13px] opacity-75 cursor-not-allowed"
                  value={user.email}
                  disabled
                />
                <span className="text-[11px] text-text-tertiary">To change your institutional email, contact your system administrator.</span>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="btn btn-brand text-[13px] px-5 py-2.5 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Save size={14} /> 
                  {isSaving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Access */}
        <div className="card shadow-sm border border-border-subtle rounded-lg overflow-hidden">
          <div className="card-header border-b border-border-subtle bg-surface-secondary px-6 py-4">
            <div className="card-title font-medium text-[14px] flex items-center gap-2">
              <Shield size={16} className="text-text-secondary" />
              Security Settings
            </div>
          </div>
          <div className="card-body p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface-secondary p-4 rounded-lg border border-border-subtle">
              <div>
                <h4 className="text-[13px] font-medium text-text-primary flex items-center gap-1.5">
                  <Lock size={13} className="text-text-secondary" /> Authentication Provider
                </h4>
                <p className="text-[12px] text-text-tertiary mt-1">Managed via secure Supabase integration.</p>
              </div>
              <span className="pill pill-info text-[11px] font-medium px-3 py-1">Active Client</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card shadow-sm border border-border-subtle rounded-lg overflow-hidden">
          <div className="card-header border-b border-border-subtle bg-surface-secondary px-6 py-4">
            <div className="card-title font-medium text-[14px] flex items-center gap-2">
              <Bell size={16} className="text-text-secondary" />
              System Alerts
            </div>
          </div>
          <div className="card-body p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-medium text-text-primary">Asynchronous Evaluation Completion</h4>
                <p className="text-[12px] text-text-tertiary mt-0.5">Receive immediate dashboard toast popups when grading is completed.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-brand-600 cursor-pointer"
              />
            </div>
            
            <div className="divider my-0"></div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-medium text-text-primary">Daily Assessment Digest</h4>
                <p className="text-[12px] text-text-tertiary mt-0.5">Receive a compiled summary email showing total metrics and detected grading anomalies.</p>
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
