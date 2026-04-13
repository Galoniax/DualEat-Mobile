import axiosInterceptor from "@/api/client";
import { Post, Response, ResponseWithPagination } from "@/interface/global";
import { isAxiosError } from "axios";

// --- 1. OBTENER POSTS ---
// ===================================
export const getAll = async (
  page: number,
): Promise<ResponseWithPagination<Post> | null> => {
  try {
    const response = await axiosInterceptor.get("/post/", {
      params: {
        page,
      },
    });

    return {
      success: response.data.success,
      status: response.status,
      data: response.data.data,
      pagination: response.data.pagination,
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


// --- 2. OBTENER POST POR ID ---
// ===================================
export const getPostById = async (postId: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/post/${postId}`);

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
