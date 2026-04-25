import axiosInterceptor from "@/api/client";
import { Response, Community, CommunityMember } from "@/interface/global";

import { isAxiosError } from "axios";

// --- 1. OBTENER COMUNIDADES DEL USUARIO ---
// ===================================
export const getUserCommunities = async (): Promise<Response<CommunityMember[]>> => {
  try {
    const response = await axiosInterceptor.get("/community/user");

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.code === "ECONNABORTED") {
        return {
          success: false,
          status: 408,
          message: "La solicitud tardó demasiado en responder.",
        };
      }

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message:
            err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado procesando la solicitud.",
    };
  }
};

// --- 2. OBTENER COMUNIDAD POR NOMBRE ---
// ===================================
export const getByName = async (
  name: string,
): Promise<Response<Community[]>> => {
  try {
    const response = await axiosInterceptor.get(`/community/name`, {
      params: { name },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.code === "ECONNABORTED") {
        return {
          success: false,
          status: 408,
          message: "La solicitud tardó demasiado en responder.",
        };
      }

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message:
            err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado procesando la solicitud.",
    };
  }
};

// --- 3. OBTENER COMUNIDAD POR SLUG ---
// ===================================
export const getBySlug = async (slug: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/community/${slug}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.code === "ECONNABORTED") {
        return {
          success: false,
          status: 408,
          message: "La solicitud tardó demasiado en responder.",
        };
      }

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message:
            err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado procesando la solicitud.",
    };
  }
};

// --- 4. UNIRSE O ABANDONAR UNA COMUNIDAD ---
// ===================================
export const joinLeave = async (
  community_id: string,
  join: boolean,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post(`/community/join-leave`, {
      community_id,
      join,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.code === "ECONNABORTED") {
        return {
          success: false,
          status: 408,
          message: "La solicitud tardó demasiado en responder.",
        };
      }

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message:
            err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado procesando la solicitud.",
    };
  }
};