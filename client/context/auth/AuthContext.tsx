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

import type { AuthResponse } from "@/services/auth.api";
import type { User } from "@/interface/global";
import { useAppMode } from "@/context/app/AppModeContext";

const TOKEN_KEY = "dualeat_session_token";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Función para Google / Deep Links
  setToken: (token: string) => Promise<void>;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
    recaptchaToken: string | null
  ) => Promise<AuthResponse | null>;
  register: (email: string, password: string) => Promise<AuthResponse | null>;
  completeProfile: (
    name: string,
    foodPreferences: number[],
    communityPreferences: number[],
    tempToken: string
  ) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  //const [loading, setLoading] = useState<boolean>(true);


  // --- 1. CARGA DE SESIÓN (AL ABRIR LA APP) ---
  /*useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (token) {
          const response = (axiosInterceptor.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`);

          console.log("✅ Token encontrado en SecureStore:", response);

          const userData = await getMe();
          setUser(userData);
        }
      } catch (error) {
        console.log("Token inválido o expirado. Limpiando...", error);
        await handleLogoutCleanup();
        router.replace("/(auth)/welcome");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);*/

  // --- Limpieza al cerrar sesión ---
  const handleLogoutCleanup = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axiosInterceptor.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // --- 1. SET TOKEN (Para Google / Deep Link) ---
  const setToken = async (token: string) => {
    try {
      console.log("Guardando token en SecureStore...");
      // Guardamos el token
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      const response = (axiosInterceptor.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`);

      console.log("Token guardado y Axios configurado:", response);
    } catch (error) {
      console.error("Error en setToken:", error);
      throw error; 
    }
  };

  // --- 2. LOGIN (Email/Pass/RememberMe, RecaptchaToken) ---
  const login = async (e: string, p: string, r: boolean, t: string | null) => {
    try {
      const response = await authLogin(e, p, r, t);

      console.log("Login response:", response);
      if (response?.success && response?.user) {
        // Usamos el helper para guardar todo
        //await saveSession(response.token, response.user);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // --- 3. REGISTER ---
  const register = async (email: string, password: string) => {
    return authRegister(email, password);
  };

  // --- 4. COMPLETE PROFILE ---
  const completeProfile = async (
    n: string,
    f: number[],
    c: number[],
    t: string
  ) => {
    const response = await authCompleteProfile(n, f, c, t);
    if (response?.success && response?.user) {
      //await saveSession(response.token, response.user);
    }
    return response;
  };

  // --- 5. LOGOUT ---
  const logout = async () => {
    await authLogout();
    await handleLogoutCleanup();
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
