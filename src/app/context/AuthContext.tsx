"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = "http://localhost:8000/api/v1";

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

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("edexia_token");
    const storedRefresh = localStorage.getItem("edexia_refresh");
    if (storedToken) {
      setToken(storedToken);
      setRefreshToken(storedRefresh);
      // Validate token by fetching profile
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Invalid token");
          return res.json();
        })
        .then((json) => {
          setUser(json.data);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("edexia_token");
          localStorage.removeItem("edexia_refresh");
          setToken(null);
          setRefreshToken(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.detail || "Login failed" };

      const tokens = json.data;
      setToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      localStorage.setItem("edexia_token", tokens.access_token);
      localStorage.setItem("edexia_refresh", tokens.refresh_token);

      // Fetch user profile
      const profileRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profileJson = await profileRes.json();
      setUser(profileJson.data);

      return { success: true };
    } catch {
      return { success: false, error: "Network error. Is the backend running?" };
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.detail || "Signup failed" };

      const { tokens, user: userData } = json.data;
      setToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      setUser(userData);
      localStorage.setItem("edexia_token", tokens.access_token);
      localStorage.setItem("edexia_refresh", tokens.refresh_token);

      return { success: true };
    } catch {
      return { success: false, error: "Network error. Is the backend running?" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("edexia_token");
    localStorage.removeItem("edexia_refresh");
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
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
    <AuthContext.Provider value={{ user, token, refreshToken, isLoading, login, signup, logout, fetchWithAuth, setGeminiKey, removeGeminiKey, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
