"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";

type RegisterInput = {
  username: string;
  email: string;
  password: string;
  user_type: "student" | "guest";
  phone: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await apiFetch<{ user: User }>("/auth/me/");
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  async function login(username: string, password: string) {
    const response = await apiFetch<{ user: User }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUser(response.user);
    return response.user;
  }

  async function register(input: RegisterInput) {
    const response = await apiFetch<{ user: User }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.user;
  }

  async function logout() {
    await apiFetch<null>("/auth/logout/", { method: "POST" });
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
