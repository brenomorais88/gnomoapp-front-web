"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getMe,
  login as loginRequest,
  register as registerRequest,
} from "@/features/auth/api";
import { buildAuthSession, withActiveFamilyId } from "@/features/auth/session";
import {
  AuthCredentialsInput,
  RegisterInput,
} from "@/features/auth/types";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/lib/auth/token-storage";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/auth/permissions";
import { setApiAccessTokenResolver } from "@/lib/api/client";
import { subscribeToApiClientEvents } from "@/lib/api/events";
import { AuthSession, AuthStateStatus } from "@/types/domain/auth";
import { PermissionCode } from "@/types/domain/permissions";

type AuthContextValue = {
  status: AuthStateStatus;
  session: AuthSession | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  login: (payload: AuthCredentialsInput) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  hydrateSession: () => Promise<void>;
  logout: () => void;
  setActiveFamilyId: (familyId: string | null) => void;
  clearAuthState: () => void;
  hasPermission: (permission: PermissionCode) => boolean;
  hasAnyPermission: (permissions: PermissionCode[]) => boolean;
  hasAllPermissions: (permissions: PermissionCode[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AuthStateStatus>("idle");
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const setSession = useCallback((nextSession: AuthSession | null) => {
    setSessionState(nextSession);
    setStatus(nextSession ? "authenticated" : "unauthenticated");
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[auth] setAccessToken", {
        hasToken: Boolean(token),
        tokenLength: token?.length ?? 0,
      });
    }

    if (token) {
      setStoredAccessToken(token);
      // Keep API client resolver in sync immediately after login/register
      // to avoid requests without Authorization during the same render cycle.
      setApiAccessTokenResolver(() => token);
    } else {
      clearStoredAccessToken();
      setApiAccessTokenResolver(null);
    }

    setAccessTokenState(token);
  }, []);

  const clearAuthState = useCallback(() => {
    setSession(null);
    setAccessToken(null);
    setIsHydrating(false);
    setIsLoggingIn(false);
    setIsRegistering(false);
  }, [setAccessToken, setSession]);

  const logout = useCallback(() => {
    clearAuthState();
    router.replace("/auth/login");
  }, [clearAuthState, router]);

  const setActiveFamilyId = useCallback((familyId: string | null) => {
    setSessionState((current) => withActiveFamilyId(current, familyId));
  }, []);

  const hydrateSession = useCallback(async () => {
    const token = getStoredAccessToken();

    if (!token) {
      clearAuthState();
      return;
    }

    setIsHydrating(true);
    setStatus("loading");
    setAccessToken(token);

    try {
      const user = await getMe();
      setSession(buildAuthSession(user));
    } catch (error) {
      clearAuthState();
      throw error;
    } finally {
      setIsHydrating(false);
    }
  }, [clearAuthState, setAccessToken, setSession]);

  const login = useCallback(
    async (payload: AuthCredentialsInput) => {
      setIsLoggingIn(true);
      try {
        const response = await loginRequest(payload);
        setAccessToken(response.accessToken);
        setSession(buildAuthSession(response.user));
      } finally {
        setIsLoggingIn(false);
      }
    },
    [setAccessToken, setSession],
  );

  const register = useCallback(
    async (payload: RegisterInput) => {
      setIsRegistering(true);
      try {
        const response = await registerRequest(payload);
        setAccessToken(response.accessToken);
        setSession(buildAuthSession(response.user));
      } finally {
        setIsRegistering(false);
      }
    },
    [setAccessToken, setSession],
  );

  useEffect(() => {
    hydrateSession().catch(() => undefined);
  }, [hydrateSession]);

  useEffect(() => {
    setApiAccessTokenResolver(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    return () => {
      setApiAccessTokenResolver(null);
    };
  }, []);

  useEffect(() => {
    return subscribeToApiClientEvents((event) => {
      if (event.type === "unauthorized") {
        clearAuthState();
        if (!pathname.startsWith("/auth")) {
          router.replace("/auth/login");
        }
      }
    });
  }, [clearAuthState, pathname, router]);

  const grantedPermissions = session?.permissions ?? session?.user.permissions ?? [];
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      accessToken,
      isAuthenticated: status === "authenticated",
      isHydrating,
      isLoggingIn,
      isRegistering,
      login,
      register,
      hydrateSession,
      logout,
      setActiveFamilyId,
      clearAuthState,
      hasPermission: (permission) => hasPermission(grantedPermissions, permission),
      hasAnyPermission: (permissions) =>
        hasAnyPermission(grantedPermissions, permissions),
      hasAllPermissions: (permissions) =>
        hasAllPermissions(grantedPermissions, permissions),
    }),
    [
      accessToken,
      clearAuthState,
      grantedPermissions,
      hydrateSession,
      isHydrating,
      isLoggingIn,
      isRegistering,
      login,
      logout,
      register,
      session,
      setActiveFamilyId,
      status,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
