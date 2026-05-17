import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

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
    return handleApiError(err);
  }
};
