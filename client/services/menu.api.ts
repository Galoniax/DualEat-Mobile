import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import { isAxiosError } from "axios";

// --- 1. OBTENER MENU DE LOCAL POR ID ---
// ===================================
export const getFoods = async (localId: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/menu/local/${localId}/foods`);

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
