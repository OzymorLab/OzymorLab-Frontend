"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        setRefreshToken(session.refresh_token || null);
        
        // Validate token and sync profile with Edexia backend
        fetch(`${API_BASE}/auth/me`, {
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
          const res = await fetch(`${API_BASE}/auth/me`, {
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
          const profileRes = await fetch(`${API_BASE}/auth/me`, {
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
          const profileRes = await fetch(`${API_BASE}/auth/me`, {
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
    return fetch(url, { ...options, headers });
  };

  const setGeminiKey = async (key: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/gemini-key`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_api_key: key }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.detail || "Failed to save key" };
      setUser((prev) => prev ? { ...prev, has_gemini_key: true } : prev);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const removeGeminiKey = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/gemini-key`, {
        method: "DELETE",
      });
      if (!res.ok) return { success: false, error: "Failed to remove key" };
      setUser((prev) => prev ? { ...prev, has_gemini_key: false } : prev);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setUser(json.data);
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, isLoading, login, signup, loginWithGoogle, logout, fetchWithAuth, setGeminiKey, removeGeminiKey, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
