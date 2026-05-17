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
        platform: 'mobile',
      },
      { withCredentials: true },
    );

    return response.data as AuthResponse;
  } catch (err: unknown) {
    console.log("Login API Error:", JSON.stringify(err, null, 2));
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al iniciar sesión",
        "Error",
      );
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

    return response.data as AuthResponse;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al registrar",
        "Error",
      );
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
    const response = await axiosInterceptor.post(
      "/auth/complete-profile",
      {
        name: n,
        foodPreferences: fPreferences,
        communityPreferences: cPreferences,
        tempToken: tt,
      },
      { withCredentials: true },
    );

    return response.data as AuthResponse;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al completar el perfil",
        "Error",
      );
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

    return response.data as AuthResponse;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast(
        "error",
        err.response?.data?.message || "Error al cerrar sesión",
        "Error",
      );
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
    }
    throw err;
  }
};

// --- 6. ACTUALIZAR PERFIL DE USUARIO ---
// ===================================
export const updateUserProfile = async (
  name?: string,
  currentPassword?: string,
  newPassword?: string
) => {
  try {
    const response = await axiosInterceptor.put("/auth/me", {
      name,
      currentPassword,
      newPassword,
    });
    return {
      success: response.data.success ?? true,
      message: response.data.message || "Perfil actualizado correctamente.",
      data: response.data.data
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      return {
        success: false,
        message: err.response?.data?.message || "Error al actualizar perfil.",
      };
    }
    return {
      success: false,
      message: "Error inesperado al actualizar perfil.",
    };
  }
};
