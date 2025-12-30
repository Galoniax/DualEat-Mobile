import { isAxiosError } from "axios";

import type { User } from "../interface/global";

import axiosInterceptor from "../api/client";
import Toast from 'react-native-toast-message';

export interface AuthResponse {
  success: boolean;
  message: string;
  temp_token?: string;
  next_step?: string;
  user?: User;
}



export const login = async (
  email: string,
  password: string,
  rememberMe: boolean,
  recaptchaToken: string | null
): Promise<AuthResponse | null> => {
  try {
    const response = await axiosInterceptor.post(
      "/auth/login",
      {
        email,
        password,
        rememberMe,
        recaptchaToken,
      },
      { withCredentials: true }
    );

    if (response.data?.success === false) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: response.data.message,
        position: 'top',
      });
      return null;
    } else {
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: response.data.message,
        position: 'top',
      });
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || "Error al iniciar sesión",
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Error desconocido",
        position: 'top',
      });
    }
    return null;
  }
};

export const register = async (
  email: string,
  password: string
): Promise<AuthResponse | null> => {
  try {
    const response = await axiosInterceptor.post("/auth/register", {
      email,
      password,
    });

    if (response.data?.success === false) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: response.data.message,
        position: 'top',
      });
      return null;
    } else {
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: response.data.message,
        position: 'top',
      });
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || "Error al registrar",
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Error desconocido",
        position: 'top',
      });
    }
    return null;
  }
};

export const completeProfile = async (
  name: string,
  foodPreferences: number[],
  communityPreferences: number[],
  tempToken: string
) => {
  try {
    const response = await axiosInterceptor.post(
      "/auth/complete-profile",
      {
        name,
        foodPreferences,
        communityPreferences,
        tempToken,
      },
      { withCredentials: true }
    );
    
    if (response.data?.success === false) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: response.data.message,
        position: 'top',
      });
      return null;
    } else {
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: response.data.message,
        position: 'top',
      });
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || "Error al completar perfil",
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Error desconocido",
        position: 'top',
      });
    }
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInterceptor.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );

    if (response.data?.success === false) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: response.data.message,
        position: 'top',
      });
      return null;
    } else {
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: response.data.message,
        position: 'top',
      });
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || "Error al cerrar sesión",
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Error desconocido",
        position: 'top',
      });
    }
    return null;
  }
};

export const getMe = async () => {
  try {
    const response = await axiosInterceptor.get("/auth/me", {
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.error(err.response?.data?.message);
    } else {
      console.error("Error desconocido");
    
    }
    throw err;
  }
};