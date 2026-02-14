import React, { useState, useEffect, createContext, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

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
  register: (
    e: string, 
    p: string,
    d: string,
  ) => Promise<AuthResponse | null>;
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

  const { setType } = useLoader();

  // --- 1. CARGA DE SESIÓN ---
  // ===========================================
  useEffect(() => {
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
      } catch {
        await handleLogoutCleanup();
      } finally {
        setAuthReady(true);
        setType(null);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FUNCIONES DE AUTENTICACIÓN ---
  // ===========================================
  const setToken = async (isToken?: string) => {
    try {
      setType("global");

      let token = isToken || (await SecureStore.getItemAsync(TOKEN_KEY));

      if (isToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, isToken);
      }

      axiosInterceptor.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;

      const userData = await getMe();
      setUser(userData);

      console.log("Usuario cargado:", userData);

      return { success: true, message: "Token establecido correctamente" };
    } catch (e) {
      console.log("Error al establecer el token:", e);
      await handleLogoutCleanup();
      return { success: false, message: "Error al establecer el token" };
    } finally {
      setType(null);
    }
  };

  // --- 3. LOGIN (Email/Pass/RememberMe, RecaptchaToken, DeviceId) ---
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

      if (response?.success && response.token) {
        await setToken(response?.token);
      }
      return response;
    } catch (e) {
      console.log("Error al iniciar sesión:", e);
      throw e;
    } finally {
      setType(null);
    }
  };

  // --- 4. REGISTER (Email, Password, DeviceId) ---
  // ===========================================
  const register = async (e: string, p: string, d: string) => {
    try {
      setType("minimal");
      return await authRegister(e, p, d);
    } catch (e) {
      console.log("Error al registrarse:", e);
      throw e;
    } finally {
      setType(null);
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
      if (response?.success && response.token) {
        await setToken(response.token);
      }

      return response;
    } catch (e) {
      console.log("Error al completar el perfil:", e);
      throw e;
    } finally {
      setType(null);
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
    } catch (e) {
      console.log("Error al cerrar sesión:", e);
      throw e;
    } finally {
      setType(null);
    }
  };

  // --- Helper: Limpieza al cerrar sesión ---
  // ===========================================
  const handleLogoutCleanup = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axiosInterceptor.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        setToken,
        login,
        register,
        completeProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};