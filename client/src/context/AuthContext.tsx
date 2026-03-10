// src/context/AuthContext.tsx
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
  phone: string;
  countryCode: string;
  name: string;
  address: string;
  email?: string;
  imageUri?: string;
}

interface AuthContextType {
  // Session state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;

  // Pending auth data (shared between screens)
  pendingPhone: string;
  pendingCountryCode: string;
  pendingEmail: string;
  mockOtp: string; // For frontend-only dev/testing

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
  generateNewOtp: () => string;

  // Auth actions
  completeAuth: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Pending auth flow state
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingCountryCode, setPendingCountryCode] = useState("+91");
  const [pendingEmail, setPendingEmail] = useState("");
  const [mockOtp, setMockOtp] = useState(() => generateOtp());

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
          const parsed: AuthUser = JSON.parse(stored);
          setUser(parsed);
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

  const generateNewOtp = useCallback((): string => {
    const otp = generateOtp();
    setMockOtp(otp);
    return otp;
  }, []);

  const completeAuth = useCallback(async (authUser: AuthUser) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      setIsAuthenticated(true);
    } catch {
      // If storage fails, still authenticate in-memory
      setUser(authUser);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPendingPhone("");
      setPendingEmail("");
      resetOtpState();
      setMockOtp(generateOtp());
    }
  }, [resetOtpState]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        pendingPhone,
        pendingCountryCode,
        pendingEmail,
        mockOtp,
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
        generateNewOtp,
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
