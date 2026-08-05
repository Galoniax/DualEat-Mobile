import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. CREAR CHECKOUT DE USUARIO ---
// ===================================
export const createUserCheckout = async (
  plan: "COMMUNITY_USER_MONTHLY" | "COMMUNITY_USER_ANNUAL",
): Promise<Response<{ url: string }>> => {
  try {
    const response = await axiosInterceptor.post(
      "/subscription/user-checkout",
      { plan, redirect_url: "dualeat://payment-result" },
    );
    return response.data;
  } catch (err: any) {
    throw handleApiError(err);
  }
};
