// src/context/AuthContext.tsx
import {
    getMe,
    sendPhoneOtp,
    verifyPhoneOtp,
    type VerifyOtpResponse,
} from "@/src/api/auth";
import { setApiAuthToken } from "@/src/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

const AUTH_STORAGE_KEY = "@sangam/auth_session";
const OTP_MAX_ATTEMPTS = 5;
const OTP_LOCKOUT_SECONDS = 30;
const RESEND_COOLDOWN_SECONDS = 60;

export interface AuthUser {
  id?: string;
  phone: string;
  countryCode: string;
  name: string;
  address: string;
  email?: string;
  imageUri?: string;
  createdAt?: string;
}

interface StoredSession {
  user: AuthUser;
  token: string | null;
}

interface AuthContextType {
  // Session state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  authToken: string | null;

  // Pending auth data (shared between screens)
  pendingPhone: string;
  pendingCountryCode: string;
  pendingEmail: string;

  setPendingPhone: (phone: string) => void;
  setPendingCountryCode: (code: string) => void;
  setPendingEmail: (email: string) => void;

  // OTP state
  otpAttempts: number;
  isOtpLocked: boolean;
  lockoutSecondsLeft: number;
  resendSecondsLeft: number;
  resetOtpState: () => void;
  incrementOtpAttempt: () => void;
  startResendCooldown: () => void;
  requestPhoneOtp: (
    phone: string,
  ) => Promise<{ message: string; otp?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<VerifyOtpResponse>;

  // Auth actions
  completeAuth: (user: AuthUser, token?: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Pending auth flow state
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingCountryCode, setPendingCountryCode] = useState("+91");
  const [pendingEmail, setPendingEmail] = useState("");

  // OTP rate limiting state
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isOtpLocked, setIsOtpLocked] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser | StoredSession;
          if (parsed && typeof parsed === "object" && "user" in parsed) {
            setUser(parsed.user);
            setAuthToken(parsed.token ?? null);
          } else {
            // Backward compatibility with old storage shape.
            setUser(parsed as AuthUser);
            setAuthToken(null);
          }
          setIsAuthenticated(true);
        }
      } catch {
        // Ignore storage errors — treat as logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  // Keep API client in sync with auth token.
  useEffect(() => {
    setApiAuthToken(authToken);
  }, [authToken]);

  // Refresh server user profile once authenticated.
  useEffect(() => {
    (async () => {
      if (!authToken) return;
      try {
        const { user: serverUser } = await getMe(authToken);
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            id: serverUser.id,
            name: serverUser.name || prev.name,
            email: serverUser.email || prev.email,
            phone: serverUser.phone || prev.phone,
            imageUri: serverUser.profile_image || prev.imageUri,
            address: serverUser.location || prev.address,
            createdAt: serverUser.created_at || prev.createdAt,
          };
        });
      } catch {
        // Ignore profile refresh failures; session remains usable.
      }
    })();
  }, [authToken]);

  const resetOtpState = useCallback(() => {
    setOtpAttempts(0);
    setIsOtpLocked(false);
    setLockoutSecondsLeft(0);
    if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
  }, []);

  const incrementOtpAttempt = useCallback(() => {
    setOtpAttempts((prev) => {
      const next = prev + 1;
      if (next >= OTP_MAX_ATTEMPTS) {
        // Lock out
        setIsOtpLocked(true);
        let seconds = OTP_LOCKOUT_SECONDS;
        setLockoutSecondsLeft(seconds);
        if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
        lockoutTimerRef.current = setInterval(() => {
          seconds -= 1;
          setLockoutSecondsLeft(seconds);
          if (seconds <= 0) {
            clearInterval(lockoutTimerRef.current!);
            setIsOtpLocked(false);
            setOtpAttempts(0);
          }
        }, 1000);
      }
      return next;
    });
  }, []);

  const startResendCooldown = useCallback(() => {
    let seconds = RESEND_COOLDOWN_SECONDS;
    setResendSecondsLeft(seconds);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      seconds -= 1;
      setResendSecondsLeft(seconds);
      if (seconds <= 0) {
        clearInterval(resendTimerRef.current!);
      }
    }, 1000);
  }, []);

  const requestPhoneOtp = useCallback(async (phone: string) => {
    return sendPhoneOtp(phone);
  }, []);

  const verifyPhoneOtpFromApi = useCallback(
    async (phone: string, otp: string) => {
      return verifyPhoneOtp(phone, otp);
    },
    [],
  );

  const completeAuth = useCallback(
    async (authUser: AuthUser, token?: string | null) => {
      try {
        const payload: StoredSession = { user: authUser, token: token ?? null };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
        setUser(authUser);
        setAuthToken(token ?? null);
        setIsAuthenticated(true);
      } catch {
        // If storage fails, still authenticate in-memory
        setUser(authUser);
        setAuthToken(token ?? null);
        setIsAuthenticated(true);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setUser(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      setPendingPhone("");
      setPendingEmail("");
      resetOtpState();
    }
  }, [resetOtpState]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        authToken,
        pendingPhone,
        pendingCountryCode,
        pendingEmail,
        setPendingPhone,
        setPendingCountryCode,
        setPendingEmail,
        otpAttempts,
        isOtpLocked,
        lockoutSecondsLeft,
        resendSecondsLeft,
        resetOtpState,
        incrementOtpAttempt,
        startResendCooldown,
        requestPhoneOtp,
        verifyPhoneOtp: verifyPhoneOtpFromApi,
        completeAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
