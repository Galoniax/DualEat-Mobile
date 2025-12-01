import React, { useState, useEffect, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getMe,
  login as authLogin,
  register as authRegister,
  completeProfile as authCompleteProfile,
  logout as authLogout,
} from "@/services/auth.api";
import type { AuthResponse } from "@/services/auth.api";
import type { User } from "@/interface/global";
import { router } from "expo-router";
//import { withMinimumDelay } from "@utils/timeUtils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        console.log("No user session found.", error);
        setUser(null);
        await AsyncStorage.removeItem("rememberMe");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  const login = async (
    email: string,
    password: string,
    rememberMe: boolean,
    recaptchaToken: string | null
  ) => {
    setLoading(true);
    try {
      const response = await authLogin(
        email,
        password,
        rememberMe,
        recaptchaToken
      );
      if (response?.success && response.user) {
        setUser(response.user);
        if (rememberMe) {
          // CAMBIO: Usamos AsyncStorage y es async
          await AsyncStorage.setItem("rememberMe", "true");
        }
      }
      return response;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<AuthResponse | null> => {
    // ... (Tu lógica de register es igual)
    setLoading(true);
    try {
      const response = await authRegister(email, password);
      return response;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (
    name: string,
    foodPreferences: number[],
    communityPreferences: number[],
    tempToken: string
  ): Promise<AuthResponse | null> => {
    // ... (Tu lógica de completeProfile es igual)
    setLoading(true);
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const [responseData] = await Promise.all([
        authCompleteProfile(
          name,
          foodPreferences,
          communityPreferences,
          tempToken
        ),
        minimumDelay,
      ]);
      if (responseData?.success && responseData.user) {
        setUser(responseData.user);
      } else {
        setUser(null);
      }
      return responseData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const response = await authLogout();
    if (response?.success) {
      // CAMBIO: Usamos AsyncStorage y es async
      await AsyncStorage.removeItem("rememberMe");
      setUser(null);
    }
  };

  const value = { user, loading, login, logout, register, completeProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
