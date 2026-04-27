import axiosInterceptor from "@/api/client";
import {
  Local,
  Order,
  Response,
  ResponseWithPagination,
} from "@/interface/global";
import { MenuFood } from "@/components/features/menu/MenuScreen";
import { handleApiError } from "@/utils/apiErrorHandler";

interface CartPayload {
  items: MenuFood[];
  local: Local;
}

// --- 1. OBTENER INFO DE CARRITO ---
// ===================================
export const getCartInfo = async (
  iIds: string[], // itemIds
  lId: string, // localId
): Promise<Response<CartPayload>> => {
  try {
    const response = await axiosInterceptor.post("/order/cart/validate", {
      food_ids: iIds,
      local_id: lId,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data as CartPayload,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. OBTENER ÓRDENES DEL USUARIO ---
// ===================================
export const getUserOrders = async (
  page: number,
): Promise<ResponseWithPagination<Order> | null> => {
  try {
    const response = await axiosInterceptor.get("/order/user/orders", {
      params: {
        page,
      },
    });

    if (!response.data.success) return null;
    else return response.data as ResponseWithPagination<Order>;
  } catch (err: unknown) {
    return handleApiError(err);
  }
};

// --- 3. OBTENER ORDEN POR ID ---
// ===================================
export const getOrderById = async (id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/order/user/orders/${id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};
