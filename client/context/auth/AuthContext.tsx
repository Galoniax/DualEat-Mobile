import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import * as SecureStore from "expo-secure-store";
import { Route, useRouter } from "expo-router";

import axiosInterceptor from "@/api/client";

import {
  getMe,
  login as authLogin,
  register as authRegister,
  completeProfile as authCompleteProfile,
  logout as authLogout,
} from "@/services/auth.api";

import type { AuthResponse, User } from "@/interface/global";

import { useLoader } from "../app/LoadingContext";
import { ROUTES } from "@/constants/constants";
import { showToast } from "@/utils/toast";

const TOKEN_KEY = process.env.TOKEN_KEY || "dualeat_session_token";

// INTERFAZ
interface AuthContextType {
  user: User | null;
  authReady: boolean;
  setToken: (token: string) => Promise<AuthResponse | null>;
  login: (
    e: string,
    p: string,
    r: boolean,
    rt: string | null,
    d: string,
  ) => Promise<AuthResponse | null>;
  register: (e: string, p: string, d: string) => Promise<AuthResponse | null>;
  completeProfile: (
    n: string,
    fPreferences: number[],
    cPreferences: number[],
    tt: string,
  ) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const router = useRouter();
  const { setType } = useLoader();

  const init = async () => {
    try {
      setType("global");

      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      console.log("Token encontrado en SecureStore:", token);
      if (token) {
        axiosInterceptor.defaults.headers.Authorization = `Bearer ${token}`;
        const userData = await getMe();
        setUser(userData);
      }
    } catch (error: any) {
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

  // --- 1. CARGA DE SESIÓN ---
  // ===========================================
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FUNCIONES DE AUTENTICACIÓN ---
  // ===========================================
  const setToken = async (isToken?: string) => {
    try {
      setType("global");

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

      console.log("Usuario cargado:", userData);

      setType(null);

      return { success: true, message: "Token establecido correctamente" };
    } catch (e) {
      console.log("Error al establecer el token:", e);
      await handleLogoutCleanup();
      setType(null);
      return { success: false, message: "Error al establecer el token" };
    }
  };

  // --- 3. LOGIN (Email, Password, RememberMe, RecaptchaToken, DeviceId) ---
  // ===========================================
  const login = async (
    e: string,
    p: string,
    r: boolean,
    t: string | null,
    d: string,
  ) => {
    try {
      setType("minimal");
      const response = await authLogin(e, p, r, t, d);
      console.log(e, p, r, t, d);

      if (response && response.success && response.token) {
        let msg = response.message;
        if (!msg) {
          msg = "Inicio de sesión exitoso";
        }
        showToast("success", msg, "Éxito");
        await setToken(response.token);
      }

      setType(null);
      return response;
    } catch (e) {
      setType(null);
      showToast("error", "Error al iniciar sesión", "Error");
      throw e;
    }
  };

  // --- 4. REGISTER (Email, Password, DeviceId) ---
  // ===========================================
  const register = async (e: string, p: string, d: string) => {
    try {
      setType("minimal");
      const response = await authRegister(e, p, d);

      if (response && response.success && response.next_step) {
        let msg = response.message;
        if (!msg) {
          msg = "Registro exitoso";
        }
        showToast("success", msg, "Éxito");
        const url = `${ROUTES.AUTH.ONBOARDING}${response.next_step}`;
        router.push(url as Route);

        setType(null);
        return response;
      }

      setType(null);
      return null;
    } catch (e) {
      console.log(e);
      setType(null);
      showToast("error", "Error al registrarse", "Error");
      return null;
    }
  };

  // --- 5. COMPLETE PROFILE (Name, FoodPreferences, CommunityPreferences, TempToken) ---
  // ===========================================
  const completeProfile = async (
    n: string,
    f: number[],
    c: number[],
    t: string,
  ) => {
    try {
      setType("minimal");
      const response = await authCompleteProfile(n, f, c, t);
      if (response && response.success && response.token) {
        let msg = response.message;
        if (!msg) {
          msg = "Perfil completado";
        }
        showToast("success", msg, "Éxito");
        await setToken(response.token);
      }

      setType(null);
      return response;
    } catch (e) {
      setType(null);
      showToast("error", "Error al completar el perfil", "Error");
      throw e;
    }
  };

  // --- 6. LOGOUT ---
  // ===========================================
  const logout = async () => {
    try {
      setType("global");
      await authLogout();
      await handleLogoutCleanup();
      router.replace(ROUTES.PUBLIC.HOME);

      setType(null);
    } catch (e) {
      setType(null);
      showToast("error", "Error al cerrar sesión", "Error");
      throw e;
    }
  };

  // --- Helper: Limpieza al cerrar sesión ---
  // ===========================================
  const handleLogoutCleanup = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axiosInterceptor.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const contextValue = useMemo(() => ({
    user,
    authReady,
    setToken,
    login,
    register,
    completeProfile,
    logout,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, authReady]);

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};
