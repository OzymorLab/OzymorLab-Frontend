"use client";

import { useState } from "react";
import { Key, Shield, AlertCircle, CheckCircle2, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
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
      setMessage({ type: "success", text: "Gemini API key securely saved." });
      setApiKeyValue(""); // Clear input after save
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save API key." });
    }
    
    setIsSaving(false);
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your API key? The system default key will be used instead.")) return;
    
    setIsRemoving(true);
    setMessage(null);
    
    const result = await removeGeminiKey();
    
    if (result.success) {
      setMessage({ type: "success", text: "API key removed successfully." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to remove API key." });
    }
    
    setIsRemoving(false);
  };

  if (!user) return null;

  return (
    <div className="settings-container">
      <div className="mb-8">
        <h1 className="text-[22px] font-medium text-text-primary">Settings</h1>
        <p className="text-[13px] text-text-tertiary mt-1">Manage your account preferences and API integrations.</p>
      </div>

      <div className="card">
        <div className="card-header border-b border-border-subtle pb-4 mb-4">
          <div className="card-title">
            <Key className="card-title-icon" />
            Bring Your Own Key (BYOK)
          </div>
        </div>
        
        <div className="card-body">
          <div className="settings-desc">
            <p className="mb-4">
              Edexia allows you to use your own Google Gemini API key for evaluating answer sheets. 
              This gives your institution full control over AI billing, rate limits, and data privacy.
            </p>
            
            <div className="bg-info-bg border border-info-border rounded-md p-3 flex gap-3 text-info-text mb-6">
              <Shield size={18} className="shrink-0 mt-0.5" />
              <div className="text-[13px]">
                <strong>Privacy Note:</strong> Your API key is stored securely in our database and is 
                only used during your active evaluation runs. It will never be shared or used for other users.
              </div>
            </div>
          </div>

          {message && (
            <div className={`auth-message mb-6 ${message.type === 'success' ? 'auth-success' : 'auth-error'}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          {user.has_gemini_key ? (
            <div className="bg-surface-secondary border border-border-subtle rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-success-text font-medium text-[14px]">
                  <CheckCircle2 size={16} /> Active Custom API Key
                </div>
              </div>
              <p className="text-[13px] text-text-secondary mb-4">
                You are currently using your own Gemini API key for grading runs. The system default key is bypassed.
              </p>
              <button 
                onClick={handleRemove} 
                disabled={isRemoving}
                className="btn btn-danger"
              >
                <Trash2 size={14} /> 
                {isRemoving ? "Removing..." : "Remove Custom Key"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label font-medium">Google Gemini API Key</label>
                <div className="form-input-wrapper">
                  <input
                    type={showKey ? "text" : "password"}
                    className="form-input"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKeyValue(e.target.value)}
                    required
                    minLength={20}
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowKey(!showKey)}
                    tabIndex={-1}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">
                  You can get an API key from Google AI Studio. Make sure it has access to the Gemini Pro models.
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving || !apiKey.trim()} 
                  className="btn btn-brand"
                >
                  <Save size={14} /> 
                  {isSaving ? "Saving securely..." : "Save Custom Key"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
