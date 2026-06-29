import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

import axiosInterceptor from "@/api/client";

import {
  getMe,
  login as authLogin,
  register as authRegister,
  completeProfile as authCompleteProfile,
  logout as authLogout,
  logoutAll as authLogoutAll,
} from "@/services/auth.api";

import type { NotificationFrequency, Role, User, Workplace } from "@/interface/global";

import { useLoader } from "../app/LoadingContext";
import { ROUTES } from "@/constants/constants";

import { globalToast as toast } from "@/utils/toast";

const TOKEN_KEY = process.env.TOKEN_KEY || "dualeat_session_token";

export interface UserSessionData {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: Role;
  provider: string;
  is_business: boolean;
  active: boolean;
  subscription_status: string;
  trial_ends_at: Date | null;
  avatar_url: string;
  verified: boolean;
  notificationsPref: NotificationFrequency;
  workplaces?: Workplace[]; 

  loginAt?: Date;
  lastActivity?: Date;
  deviceId?: string;
}


// INTERFAZ
interface AuthContextType {
  user: UserSessionData | null;
  authReady: boolean;
  setToken: (token: string | null) => Promise<void>;
  login: (
    e: string,
    p: string,
    r: boolean,
    rt: string | null,
    d: string,
  ) => Promise<void>;
  register: (e: string, p: string, d: string) => Promise<void>;
  completeProfile: (
    n: string,
    fPreferences: string[],
    cPreferences: string[],
    tt: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const router = useRouter();
  const { setType } = useLoader();

  const init = async () => {
    try {
      setType("global");

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        axiosInterceptor.defaults.headers.Authorization = `Bearer ${token}`;
        const userData = await getMe();

        setUser(userData);
      }
    } catch (error: any) {
      console.log("Error en init auth:");
      let status: number | undefined;
      if (error && error.response) {
        status = error.response.status;
      }
      let errMsg: string = error.message;
      let logValue: number | string = errMsg;
      if (status !== undefined) {
        logValue = status;
      }
      console.log("Error en init auth:", logValue);
      await handleLogoutCleanup();
      if (status === 401) {
        await handleLogoutCleanup();
      } else {
        console.log("Error de red o servidor");
      }
    }
    setAuthReady(true);
    setType(null);
  };

  // TODO: TOAST

  // --- 1. CARGA DE SESIÓN ---
  // ===========================================
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helper: Limpieza al cerrar sesión ---
  // ===========================================
  const handleLogoutCleanup = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axiosInterceptor.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  // --- 2. FUNCIONES DE AUTENTICACIÓN ---
  // ===========================================
  const setToken = useCallback(
    async (isToken: string | null) => {
      try {
        let token: string | null;
        if (isToken) {
          token = isToken;
          await SecureStore.setItemAsync(TOKEN_KEY, isToken);
        } else {
          token = await SecureStore.getItemAsync(TOKEN_KEY);
        }

        axiosInterceptor.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;

        const userData = await getMe();
        
        setUser(userData);
      } catch (e: any) {
        console.log(e);
        await handleLogoutCleanup();
      }
    },
    [handleLogoutCleanup],
  );

  // --- 3. LOGIN (Email, Password, RememberMe, RecaptchaToken, DeviceId) ---
  // ===========================================
  const login = useCallback(
    async (e: string, p: string, r: boolean, t: string | null, d: string) => {
      try {
        setType("minimal");
        const response = await authLogin(e, p, r, t, d);

        if (response && response.token) {
          await setToken(response.token);
        }
      } catch (e: any) {
        throw e;
      } finally {
        setType(null);
      }
    },
    [setType, setToken],
  );

  // --- 4. REGISTER (Email, Password, DeviceId) ---
  // ===========================================
  const register = useCallback(
    async (e: string, p: string, d: string) => {
      try {
        setType("minimal");
        const response = await authRegister(e, p, d);

        if (response && response.token) {
          router.push({
            pathname: ROUTES.AUTH.ONBOARDING,
            params: { tempToken: response.token },
          });
        }
      } catch (e: any) {
        console.log(e);
      } finally {
        setType(null);
      }
    },
    [setType, router],
  );

  // --- 5. COMPLETE PROFILE (Name, FoodPreferences, CommunityPreferences, TempToken) ---
  // ===========================================
  const completeProfile = useCallback(
    async (n: string, f: string[], c: string[], t: string) => {
      try {
        setType("minimal");
        const response = await authCompleteProfile(n, f, c, t);
        if (response && response.token) {
          await setToken(response.token);
        }
      } catch (e: any) {
        throw e;
      } finally {
        setType(null);
      }
    },
    [setType, setToken],
  );

  // --- 6. LOGOUT ---
  // ===========================================
  const logout = useCallback(async () => {
    try {
      setType("global");
      await authLogout();
      await handleLogoutCleanup();
      router.replace(ROUTES.PUBLIC.HOME);
    } catch (e: any) {
      toast.error("Error al cerrar sesión", e.message || "Error de red");
      throw e;
    } finally {
      setType(null);
    }
  }, [setType, handleLogoutCleanup, router]);

  const logoutAll = useCallback(async () => {
    try {
      setType("global");
      await authLogoutAll();
      await handleLogoutCleanup();
      router.replace(ROUTES.PUBLIC.HOME);
    } catch (e: any) {
      toast.error("Error al cerrar todas las sesiones", e.message || "Error de red");
      throw e;
    } finally {
      setType(null);
    }
  }, [setType, handleLogoutCleanup, router]);

  
  const contextValue = useMemo(
    () => ({
      user,
      authReady,
      setToken,
      login,
      register,
      completeProfile,
      logout,
      logoutAll,
    }),
    [user, authReady, setToken, login, register, completeProfile, logout, logoutAll],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
