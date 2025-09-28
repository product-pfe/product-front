import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id?: string;       // uid/sub from token
  email?: string;
  roles?: string[];  // e.g. ["USER", "ADMIN"]
};

export type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  setTokens: () => {},
  logout: () => {},
  hasRole: () => false,
});

/* ---------- helpers to parse JWT payload (browser) ---------- */
function base64UrlDecode(input: string): string {
  // base64 url -> base64
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  while (b64.length % 4) b64 += "=";
  try {
    return decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

function parseJwtPayload(token: string | null): any | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = base64UrlDecode(parts[1]);
    return payload ? JSON.parse(payload) : null;
  } catch {
    return null;
  }
}

/* Map token payload to AuthUser - adapt field names to your token */
function userFromToken(token: string | null): AuthUser | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  // Example payload shape you showed:
  // { "uid": "...", "roles": ["USER"], "email": "...", "sub": "..." }
  const id = payload.uid ?? payload.sub ?? null;
  const email = payload.email ?? payload.sub ?? null;
  const roles: string[] = Array.isArray(payload.roles)
    ? payload.roles.map((r: any) => String(r)) // ensure strings
    : payload.authorities ?? [];

  return {
    id: id ? String(id) : undefined,
    email: email ? String(email) : undefined,
    roles: roles.length ? roles : undefined,
  };
}

/* ---------- Provider ---------- */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = localStorage.getItem("accessToken");
    return t ? userFromToken(t) : null;
  });

  // Keep localStorage in sync
  useEffect(() => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");

    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");
  }, [accessToken, refreshToken]);

  // If accessToken changes, update parsed user
  useEffect(() => {
    setUser(userFromToken(accessToken));
  }, [accessToken]);

  const setTokens = useCallback((newAccess: string | null, newRefresh: string | null) => {
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    // userFromToken will be called by effect above
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser"); // if used
  }, []);

  const hasRole = useCallback((role: string) => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  const isAuthenticated = Boolean(accessToken);

  const value = useMemo(
    () => ({ accessToken, refreshToken, user, isAuthenticated, setTokens, logout, hasRole }),
    [accessToken, refreshToken, user, isAuthenticated, setTokens, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};