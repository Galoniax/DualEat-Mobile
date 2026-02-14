import { isAxiosError } from "axios";
import axiosInterceptor from "@/api/client";
import { showToast } from "@/utils/toast";
import { AuthResponse } from "@/interface/global";

// --- 1. INICIO DE SESIÓN ---
// ===================================
export const login = async (
  e: string, // email
  p: string, // password
  r: boolean, // rememberMe
  rt: string | null, // recaptchaToken
  d: string, // deviceId
): Promise<AuthResponse | null> => {
  try {
    const response = await axiosInterceptor.post(
      "/auth/login",
      {
        email: e,
        password: p,
        remember: r,
        recaptcha: rt,
        deviceId: d,
      },
      { withCredentials: true },
    );

    if (response.data?.success === false) {
      showToast("error", response.data.message, "Error");

      return null;
    } else {
      showToast("success", response.data.message, "Éxito");
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al iniciar sesión",
        "Error",
      );
    } else {
      showToast("error", "Error desconocido", "Error");
    }
    return null;
  }
};

// --- 2. REGISTRO ---
// ===================================
export const register = async (
  e: string, // email
  p: string, // password
  d: string, // deviceId
): Promise<AuthResponse | null> => {
  try {
    const response = await axiosInterceptor.post("/auth/register", {
      email: e,
      password: p,
      deviceId: d,
    });

    if (response.data?.success === false) {
      showToast("error", response.data.message, "Error");
      return null;
    } else {
      showToast("success", response.data.message, "Éxito");
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al registrar",
        "Error",
      );
    } else {
      showToast("error", "Error desconocido", "Error");
    }
    return null;
  }
};

// --- 3. COMPLETAR PERFIL ---
// ===================================
export const completeProfile = async (
  n: string, // name
  fPreferences: number[], // foodPreferences
  cPreferences: number[], // communityPreferences
  tt: string, // tempToken
): Promise<AuthResponse | null> => {
  try {
    const response: AuthResponse = await axiosInterceptor.post(
      "/auth/complete-profile",
      {
        name: n,
        foodPreferences: fPreferences,
        communityPreferences: cPreferences,
        tempToken: tt,
      },
      { withCredentials: true },
    );

    if (response.success) {
      showToast("success", response.message, "Éxito");
      return response;
    } else {
      showToast("error", response.message, "Error");
      return null;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al completar el perfil",
        "Error",
      );
    } else {
      showToast("error", "Error desconocido", "Error");
    }
    return null;
  }
};

// --- 4. CERRAR SESIÓN ---
// ===================================
export const logout = async () => {
  try {
    const response = await axiosInterceptor.post(
      "/auth/logout",
      {},
      { withCredentials: true },
    );

    if (response.data?.success === false) {
      showToast("error", response.data.message, "Error");
      return null;
    } else {
      showToast("success", response.data.message, "Éxito");
      return response.data as AuthResponse;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al cerrar sesión",
        "Error",
      );
    } else {
      showToast("error", "Error desconocido", "Error");
    }
    return null;
  }
};

// --- 5. OBTENER DATOS DEL USUARIO ---
// ===================================
export const getMe = async () => {
  try {
    const response = await axiosInterceptor.get("/auth/me", {
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log(err.response?.data?.message);
    } else {
      console.log("Error desconocido");
    }
    throw err;
  }
};
