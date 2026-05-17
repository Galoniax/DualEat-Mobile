import axiosInterceptor from "@/api/client";
import { AuthResponse } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

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
      }
    );

    return response.data as AuthResponse;
  } catch (err: unknown) {
    return handleApiError(err);
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
    return handleApiError(err);
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
      }
    );

    return response.data as AuthResponse;
  } catch (err: unknown) {
    return handleApiError(err);
  }
};

// --- 4. CERRAR SESIÓN ---
// ===================================
export const logout = async () => {
  try {
    const response = await axiosInterceptor.post("/auth/logout", {});

    return response.data as AuthResponse;
  } catch (err: unknown) {
    return handleApiError(err);
  }
};

// --- 5. OBTENER DATOS DEL USUARIO ---
// ===================================
export const getMe = async () => {
  try {
    const response = await axiosInterceptor.get("/auth/me");
    return response.data;
  } catch (err: unknown) {
    console.log("Error al obtener datos del usuario", err);
    return handleApiError(err);
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
