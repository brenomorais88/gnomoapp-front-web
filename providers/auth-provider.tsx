"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  clearStoredMyFamilyPermissions,
  getStoredMyFamilyPermissions,
  setStoredMyFamilyPermissions,
} from "@/lib/auth/family-permissions-storage";
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
import {
  defaultMyFamilyPermissions,
  getMyFamilyPermissions,
  MyFamilyPermissions,
} from "@/features/families/my-permissions";
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
  myFamilyPermissions: MyFamilyPermissions;
  isLoadingMyFamilyPermissions: boolean;
  myFamilyPermissionsError: string | null;
  refreshMyFamilyPermissions: (options?: { force?: boolean }) => Promise<void>;
  canEditFamilyAccounts: boolean;
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
  const [myFamilyPermissions, setMyFamilyPermissions] =
    useState<MyFamilyPermissions>(defaultMyFamilyPermissions);
  const [isLoadingMyFamilyPermissions, setIsLoadingMyFamilyPermissions] = useState(false);
  const [myFamilyPermissionsError, setMyFamilyPermissionsError] = useState<string | null>(null);
  const inFlightPermissionsRequestRef = useRef<Promise<void> | null>(null);
  const homeRefreshRanRef = useRef(false);

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
    setMyFamilyPermissions(defaultMyFamilyPermissions);
    setIsLoadingMyFamilyPermissions(false);
    setMyFamilyPermissionsError(null);
    inFlightPermissionsRequestRef.current = null;
    homeRefreshRanRef.current = false;
    clearStoredMyFamilyPermissions();
  }, [setAccessToken, setSession]);

  const refreshMyFamilyPermissions = useCallback(
    async (options?: { force?: boolean }) => {
      if (status !== "authenticated") {
        setMyFamilyPermissions(defaultMyFamilyPermissions);
        setMyFamilyPermissionsError(null);
        setIsLoadingMyFamilyPermissions(false);
        clearStoredMyFamilyPermissions();
        return;
      }

      if (!options?.force && inFlightPermissionsRequestRef.current) {
        return inFlightPermissionsRequestRef.current;
      }

      if (
        !options?.force &&
        myFamilyPermissions.canEditFamilyAccounts !==
          defaultMyFamilyPermissions.canEditFamilyAccounts
      ) {
        return;
      }

      const request = (async () => {
        setIsLoadingMyFamilyPermissions(true);
        setMyFamilyPermissionsError(null);

        try {
          const nextPermissions = await getMyFamilyPermissions();

          setMyFamilyPermissions(nextPermissions);
          setStoredMyFamilyPermissions(nextPermissions);
        } catch {
          setMyFamilyPermissions(defaultMyFamilyPermissions);
          setMyFamilyPermissionsError("permissions_load_failed");
        } finally {
          setIsLoadingMyFamilyPermissions(false);
          inFlightPermissionsRequestRef.current = null;
        }
      })();

      inFlightPermissionsRequestRef.current = request;
      return request;
    },
    [myFamilyPermissions, status],
  );

  const logout = useCallback(() => {
    clearAuthState();
    router.replace("/auth/login");
  }, [clearAuthState, router]);

  const syncMyFamilyPermissionsForSession = useCallback(
    async () => {
      setIsLoadingMyFamilyPermissions(true);
      try {
        const nextPermissions = await getMyFamilyPermissions();
        setMyFamilyPermissions(nextPermissions);
        setStoredMyFamilyPermissions(nextPermissions);
        setMyFamilyPermissionsError(null);
      } catch {
        setMyFamilyPermissions(defaultMyFamilyPermissions);
        setMyFamilyPermissionsError("permissions_load_failed");
      } finally {
        setIsLoadingMyFamilyPermissions(false);
      }
    },
    [],
  );

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
      const nextSession = buildAuthSession(user);
      setSession(nextSession);
      await syncMyFamilyPermissionsForSession();
    } catch (error) {
      clearAuthState();
      throw error;
    } finally {
      setIsHydrating(false);
    }
  }, [clearAuthState, setAccessToken, setSession, syncMyFamilyPermissionsForSession]);

  const login = useCallback(
    async (payload: AuthCredentialsInput) => {
      setIsLoggingIn(true);
      try {
        const response = await loginRequest(payload);
        const nextSession = buildAuthSession(response.user);
        setAccessToken(response.accessToken);
        setSession(nextSession);
        await syncMyFamilyPermissionsForSession();
      } finally {
        setIsLoggingIn(false);
      }
    },
    [setAccessToken, setSession, syncMyFamilyPermissionsForSession],
  );

  const register = useCallback(
    async (payload: RegisterInput) => {
      setIsRegistering(true);
      try {
        const response = await registerRequest(payload);
        const nextSession = buildAuthSession(response.user);
        setAccessToken(response.accessToken);
        setSession(nextSession);
        await syncMyFamilyPermissionsForSession();
      } finally {
        setIsRegistering(false);
      }
    },
    [setAccessToken, setSession, syncMyFamilyPermissionsForSession],
  );

  useEffect(() => {
    hydrateSession().catch(() => undefined);
  }, [hydrateSession]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const storedPermissions = getStoredMyFamilyPermissions();
    if (storedPermissions) {
      setMyFamilyPermissions(storedPermissions);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") {
      homeRefreshRanRef.current = false;
      return;
    }

    if (pathname === "/" && !homeRefreshRanRef.current && !isLoadingMyFamilyPermissions) {
      homeRefreshRanRef.current = true;
      refreshMyFamilyPermissions({ force: true }).catch(() => undefined);
      return;
    }

    if (pathname !== "/") {
      homeRefreshRanRef.current = false;
    }
  }, [isLoadingMyFamilyPermissions, pathname, refreshMyFamilyPermissions, status]);

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

  const grantedPermissions = useMemo(
    () => session?.permissions ?? session?.user.permissions ?? [],
    [session?.permissions, session?.user.permissions],
  );
  const canEditFamilyAccounts = myFamilyPermissions.canEditFamilyAccounts;
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      accessToken,
      isAuthenticated: status === "authenticated",
      isHydrating,
      isLoggingIn,
      isRegistering,
      myFamilyPermissions,
      isLoadingMyFamilyPermissions,
      myFamilyPermissionsError,
      refreshMyFamilyPermissions,
      canEditFamilyAccounts,
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
      canEditFamilyAccounts,
      clearAuthState,
      grantedPermissions,
      hydrateSession,
      isHydrating,
      isLoggingIn,
      isRegistering,
      isLoadingMyFamilyPermissions,
      login,
      logout,
      myFamilyPermissions,
      myFamilyPermissionsError,
      refreshMyFamilyPermissions,
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
