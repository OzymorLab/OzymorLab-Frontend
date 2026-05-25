"use client";

import { useState } from "react";
import { Key, Shield, AlertCircle, CheckCircle2, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ApiKeysPage() {
  const { user, setGeminiKey, removeGeminiKey } = useAuth();
  
  const [apiKey, setApiKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setIsSaving(true);
    setMessage(null);
    
    const result = await setGeminiKey(apiKey.trim());
    
    if (result.success) {
      setMessage({ type: "success", text: "Gemini API key securely saved to your institutional database profile." });
      setApiKeyValue(""); // Clear input after save
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save API key." });
    }
    
    setIsSaving(false);
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your custom API key? The system default key will be used instead.")) return;
    
    setIsRemoving(true);
    setMessage(null);
    
    const result = await removeGeminiKey();
    
    if (result.success) {
      setMessage({ type: "success", text: "Custom API key removed. Falling back to default keys." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to remove API key." });
    }
    
    setIsRemoving(false);
  };

  if (!user) return null;

  return (
    <div className="settings-container max-w-[800px] mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-[22px] font-medium text-text-primary flex items-center gap-2">
          <Key className="text-brand-600" size={22} />
          API Integrations
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">Manage your custom model access keys and bypass global billing limits.</p>
      </div>

      <div className="card shadow-sm border border-border-subtle rounded-lg overflow-hidden">
        <div className="card-header border-b border-border-subtle bg-surface-secondary px-6 py-4">
          <div className="card-title font-medium text-[14px] flex items-center gap-2">
            <Key size={16} className="text-text-secondary" />
            Bring Your Own Key (BYOK)
          </div>
        </div>
        
        <div className="card-body p-6">
          <div className="settings-desc">
            <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
              OzymorLab allows you to provide your own Google Gemini API key for evaluating board examination answer sheets. 
              This gives your educational institution complete control over AI usage tiers, direct Google billing, and security credentials.
            </p>
            
            <div className="bg-info-bg border border-info-border rounded-lg p-4 flex gap-3 text-info-text mb-6">
              <Shield size={18} className="shrink-0 mt-0.5" />
              <div className="text-[12.5px] leading-relaxed">
                <strong>Secured Storage:</strong> Your key is stored in your secure Supabase profile and only injected server-side during grading runs. It is never exposed in the browser.
              </div>
            </div>
          </div>

          {message && (
            <div className={`auth-message mb-6 p-3 rounded-md flex items-center gap-2 text-[13px] ${message.type === 'success' ? 'bg-success-bg text-success-text border border-success-border' : 'bg-danger-bg text-danger-text border border-danger-border'}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          {user.has_gemini_key ? (
            <div className="bg-surface-secondary border border-border-subtle rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-success-text font-medium text-[13.5px]">
                  <CheckCircle2 size={16} className="text-color-success-border" /> Active Institutional Key Engaged
                </div>
              </div>
              <p className="text-[12.5px] text-text-secondary mb-4">
                Your account is currently using your custom Gemini API key. All grading runs utilize this configuration.
              </p>
              <button 
                onClick={handleRemove} 
                disabled={isRemoving}
                className="btn btn-danger text-[12.5px] px-4 py-2 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Trash2 size={13} /> 
                {isRemoving ? "Removing..." : "Remove Custom Key"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="form-group flex flex-col gap-2">
                <label className="form-label text-[13px] font-medium text-text-secondary">Google Gemini API Key</label>
                <div className="form-input-wrapper relative flex items-center">
                  <input
                    type={showKey ? "text" : "password"}
                    className="form-input w-full p-2.5 rounded-md border border-border-default bg-surface-primary text-[13px] pr-10 focus:border-brand-600 focus:outline-none"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKeyValue(e.target.value)}
                    required
                    minLength={20}
                  />
                  <button
                    type="button"
                    className="form-input-toggle absolute right-3 text-text-tertiary cursor-pointer hover:text-text-primary"
                    onClick={() => setShowKey(!showKey)}
                    tabIndex={-1}
                    style={{ background: "none", border: "none" }}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-[11.5px] text-text-tertiary leading-normal">
                  Retrieve your secure keys from Google AI Studio. Ensure permissions are set for Gemini Pro models.
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={isSaving || !apiKey.trim()} 
                  className="btn btn-brand text-[13px] px-5 py-2.5 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Save size={14} /> 
                  {isSaving ? "Saving key..." : "Save Custom Key"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
