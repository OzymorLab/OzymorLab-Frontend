"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://edeziav2.onrender.com/api/v1";

const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

  const fetchOptions = {
    ...options,
    signal: controller.signal
  };

  try {
    if (url.includes(",")) {
      const parts = url.split(",");
      const firstBase = parts[0];
      const rest = parts.slice(1).join(",");
      
      // Resolve path from secondary base dynamically
    const secondBase = "https://edeziav2.onrender.com/api/v1";
      let path = "";
      if (rest.startsWith(secondBase)) {
        path = rest.substring(secondBase.length);
      } else {
        const idx = rest.indexOf("/api/v1");
        if (idx !== -1) {
          path = rest.substring(idx + "/api/v1".length);
        }
      }
      
      const url1 = `${firstBase}${path}`;
      const url2 = rest;
      
      try {
        const res = await fetch(url1, fetchOptions);
        clearTimeout(id);
        return res;
      } catch (err) {
        console.warn(`Local API offline at ${url1}, falling back to remote production at ${url2}`, err);
        
        // Reset timeout for fallback fetch
        const fallbackController = new AbortController();
        const fallbackId = setTimeout(() => fallbackController.abort(), 6000);
        try {
          const res = await fetch(url2, { ...options, signal: fallbackController.signal });
          clearTimeout(fallbackId);
          return res;
        } catch (fallbackErr) {
          clearTimeout(fallbackId);
          throw fallbackErr;
        }
      }
    }
    const res = await fetch(url, fetchOptions);
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_gemini_key: boolean;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  setGeminiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
  removeGeminiKey: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from Supabase on mount
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("ozymorlab_token") : null;
      if (storedToken) {
        setToken(storedToken);
        setRefreshToken(typeof window !== "undefined" ? localStorage.getItem("ozymorlab_refresh_token") : null);
        
        safeFetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Invalid local session");
            return res.json();
          })
          .then((json) => {
            setUser(json.data);
            setIsLoading(false);
          })
          .catch(() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("ozymorlab_token");
              localStorage.removeItem("ozymorlab_refresh_token");
            }
            setUser(null);
            setToken(null);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        setRefreshToken(session.refresh_token || null);
        
        // Validate token and sync profile with Edexia backend
        safeFetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Invalid session");
            return res.json();
          })
          .then((json) => {
            setUser(json.data);
            setIsLoading(false);
          })
          .catch(() => {
            // Fallback to local session metadata if backend is offline/unreachable
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              full_name: session.user.user_metadata?.full_name || "Supabase User",
              role: session.user.user_metadata?.role || "teacher",
              has_gemini_key: false,
              is_active: true,
            });
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setToken(session.access_token);
        setRefreshToken(session.refresh_token || null);
        
        try {
          const res = await safeFetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setUser(json.data);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              full_name: session.user.user_metadata?.full_name || "Supabase User",
              role: session.user.user_metadata?.role || "teacher",
              has_gemini_key: false,
              is_active: true,
            });
          }
        } catch { /* ignore */ }
      } else {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const res = await safeFetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { success: false, error: json.detail || "Invalid email or password" };
        }
        
        const { access_token, refresh_token } = json.data;
        setToken(access_token);
        setRefreshToken(refresh_token);
        if (typeof window !== "undefined") {
          localStorage.setItem("ozymorlab_token", access_token);
          localStorage.setItem("ozymorlab_refresh_token", refresh_token);
        }
        
        // Fetch profile
        const profileRes = await safeFetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const profileJson = await profileRes.json();
        if (profileRes.ok && profileJson.data) {
          setUser(profileJson.data);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to connect to local authentication backend" };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };

      const session = data.session;
      if (session) {
        setToken(session.access_token);
        setRefreshToken(session.refresh_token || null);

        // Fetch profile / trigger sync on backend
        try {
          const profileRes = await safeFetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const profileJson = await profileRes.json();
          if (profileRes.ok && profileJson.data) {
            setUser(profileJson.data);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              full_name: session.user.user_metadata?.full_name || "Supabase User",
              role: session.user.user_metadata?.role || "teacher",
              has_gemini_key: false,
              is_active: true,
            });
          }
        } catch {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name || "Supabase User",
            role: session.user.user_metadata?.role || "teacher",
            has_gemini_key: false,
            is_active: true,
          });
        }
      }
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Is Supabase configured correctly?" };
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const res = await safeFetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName, role: role.toLowerCase() }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { success: false, error: json.detail || "Account creation failed" };
        }
        
        const { tokens, user: userProfile } = json.data;
        setToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        setUser(userProfile);
        if (typeof window !== "undefined") {
          localStorage.setItem("ozymorlab_token", tokens.access_token);
          localStorage.setItem("ozymorlab_refresh_token", tokens.refresh_token);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to register local account" };
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role.toLowerCase(),
          },
        },
      });
      if (error) return { success: false, error: error.message };

      const session = data.session;
      if (session) {
        setToken(session.access_token);
        setRefreshToken(session.refresh_token || null);

        // Fetch profile / trigger sync on backend
        try {
          const profileRes = await safeFetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const profileJson = await profileRes.json();
          if (profileRes.ok && profileJson.data) {
            setUser(profileJson.data);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              full_name: fullName,
              role: role.toLowerCase(),
              has_gemini_key: false,
              is_active: true,
            });
          }
        } catch {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: fullName,
            role: role.toLowerCase(),
            has_gemini_key: false,
            is_active: true,
          });
        }
      }
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Is Supabase configured correctly?" };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Is Supabase configured correctly?" };
    }
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ozymorlab_token");
      localStorage.removeItem("ozymorlab_refresh_token");
    }
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    // Always load token from active Supabase session
    const activeToken = token;
    if (activeToken) headers.set("Authorization", `Bearer ${activeToken}`);
    return safeFetch(url, { ...options, headers });
  };

  const setGeminiKey = async (key: string) => {
    try {
      console.log("✏️ setGeminiKey triggered. Sending key to:", `${API_BASE}/auth/gemini-key`);
      const res = await fetchWithAuth(`${API_BASE}/auth/gemini-key`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_api_key: key }),
      });
      
      console.log("➡️ Response status code:", res.status, res.statusText);
      
      let responseBody = "";
      try {
        responseBody = await res.text();
        console.log("➡️ Raw response body:", responseBody);
      } catch (bodyErr) {
        console.error("❌ Failed to parse raw response body as text:", bodyErr);
      }

      if (!res.ok) {
        let detail = "Failed to save key";
        try {
          const parsed = JSON.parse(responseBody);
          detail = parsed.detail || detail;
        } catch {
          detail = `Server Error (Status ${res.status}): ${responseBody.slice(0, 150) || "Empty Response"}`;
        }
        console.error("❌ setGeminiKey API failure detail:", detail);
        return { success: false, error: detail };
      }

      setUser((prev) => prev ? { ...prev, has_gemini_key: true } : prev);
      console.log("✅ Gemini API key updated successfully in frontend state");
      return { success: true };
    } catch (err: any) {
      console.error("❌ hard network failure inside setGeminiKey fetch block:", err);
      return { 
        success: false, 
        error: `Network error: ${err.message || "Failed to reach backend"}. Please check your browser DevTools Console for CORS preflight blocks or connection drops.` 
      };
    }
  };

  const removeGeminiKey = async () => {
    try {
      console.log("🗑️ removeGeminiKey triggered. Sending DELETE to:", `${API_BASE}/auth/gemini-key`);
      const res = await fetchWithAuth(`${API_BASE}/auth/gemini-key`, {
        method: "DELETE",
      });
      
      console.log("➡️ Response status code:", res.status);
      let responseBody = "";
      try {
        responseBody = await res.text();
        console.log("➡️ Raw response body:", responseBody);
      } catch { /* ignore */ }

      if (!res.ok) {
        console.error("❌ Failed to remove Gemini key:", responseBody);
        return { success: false, error: "Failed to remove key" };
      }
      setUser((prev) => prev ? { ...prev, has_gemini_key: false } : prev);
      console.log("✅ Gemini API key deleted successfully in frontend state");
      return { success: true };
    } catch (err: any) {
      console.error("❌ hard network failure inside removeGeminiKey fetch block:", err);
      return { success: false, error: `Network error: ${err.message}` };
    }
  };

  const refreshUser = async () => {
    if (!token) {
      console.log("ℹ️ refreshUser skipped: No active token found in auth state");
      return;
    }
    try {
      console.log("🔄 refreshUser triggered. Fetching from:", `${API_BASE}/auth/me`);
      const res = await safeFetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("➡️ refreshUser response status:", res.status);
      const text = await res.text();
      console.log("➡️ refreshUser raw response:", text);
      
      if (res.ok) {
        const json = JSON.parse(text);
        setUser(json.data);
        console.log("✅ User profile synced successfully from local backend database:", json.data);
      } else {
        console.error("❌ refreshUser endpoint returned failure status code:", res.status, text);
      }
    } catch (err) {
      console.error("❌ hard network failure inside refreshUser fetch block:", err);
    }
  };


  return (
    <AuthContext.Provider value={{ user, token, refreshToken, isLoading, login, signup, loginWithGoogle, logout, fetchWithAuth, setGeminiKey, removeGeminiKey, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
