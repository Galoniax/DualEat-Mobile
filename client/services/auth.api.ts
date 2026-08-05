import axiosInterceptor from "@/api/client";
import {
  AuthResponse,
  Post,
  PostComment,
  Recipe,
  Response,
  ResponseWithPagination,
  User,
} from "@/interface/global";
import { UploadableFile } from "@/interface/global.dto";
import { handleApiError } from "@/utils/apiErrorHandler";

type Tabs = "posts" | "recipes" | "comments" | "reviews";
type GlobalSearch = Post | Recipe | PostComment;

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
    const response = await axiosInterceptor.post("/auth/login", {
      email: e,
      password: p,
      remember: r,
      token: rt,
      deviceId: d,
      platform: "mobile"
    });

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
  fPreferences: string[], // foodPreferences
  cPreferences: string[], // communityPreferences
  tt: string, // tempToken
): Promise<AuthResponse | null> => {
  try {
    const response = await axiosInterceptor.post("/auth/complete-profile", {
      name: n,
      foodPreferences: fPreferences,
      communityPreferences: cPreferences,
      tempToken: tt,
    });

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

// --- 4.1. CERRAR SESIÓN EN TODOS LOS DISPOSITIVOS ---
// ===================================
export const logoutAll = async () => {
  try {
    const response = await axiosInterceptor.post("/auth/logout-all", {});

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
  } catch (err: any) {
    throw err;
  }
};

// --- 5. OBTENER USUARIO POR ID ---
// ===================================
export const getUserById = async (user_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/auth/${user_id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 6. OBTENER POSTS, RECETAS, COMMENTARIOS, RESEÑAS DE UN USUARIO ---
// ===================================
export const getUserSearch = async (
  user_id: string,
  query: string = "",
  tab: Tabs,
  page: number = 1,
): Promise<ResponseWithPagination<GlobalSearch[]>> => {
  try {
    const response = await axiosInterceptor.get(`/auth/${user_id}/search`, {
      params: {
        query,
        tab,
        page,
      },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (err: any) {
    throw handleApiError(err);
  }
};

// --- 8. ACTUALIZAR AVATAR ---
// ===================================
export const update = async ({
  name,
  avatar_url,
  currentPassword,
  newPassword,
  foodPreferences,
  communityPreferences,
}: {
  name?: string;
  avatar_url?: string;
  currentPassword?: string;
  newPassword?: string;
  foodPreferences?: string[];
  communityPreferences?: string[];
}): Promise<Response<Partial<User>>> => {
  try {
    const response = await axiosInterceptor.put(`/auth/me`, {
      name,
      avatar_url,
      currentPassword,
      newPassword,
      foodPreferences,
      communityPreferences,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (err: any) {
    throw handleApiError(err);
  }
};

// --- 9. SUBIR IMÁGENES ---
// ===================================
export const upload = async (
  payload: UploadableFile,
): Promise<Response<string>> => {
  try {
    const formData = new FormData();

    if (!payload) throw new Error("No se envió ningún archivo");

    formData.append("avatar_url", payload as any);

    const response = await axiosInterceptor.post("/auth/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.urls,
    };
  } catch (err: any) {
    throw handleApiError(err);
  }
};
