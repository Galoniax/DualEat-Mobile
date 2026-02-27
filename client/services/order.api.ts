import { isAxiosError } from "axios";

import axiosInterceptor from "@/api/client";
import { Local, Order, Response, ResponseWithPagination } from "@/interface/global";
import { MenuFood } from "@/components/menu/MenuScreen";

interface CartPayload {
  items: MenuFood[];
  local: Local;
}

interface ExtendedOrder extends Order {
  _count?: {
    order_items: number;
  };
}


// --- 1. OBTENER INFO DE CARRITO ---
// ===================================
export const getCartInfo = async (
  iIds: string[], // itemIds
  lId: string, // localId
): Promise<Response<CartPayload> | null> => {
  try {
    const response = await axiosInterceptor.post(
      "/order/cart/validate",
      {
        food_ids: iIds,
        local_id: lId,
      },
    );

   return response.data as Response<CartPayload>;

  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};

// --- 2. OBTENER ÓRDENES DEL USUARIO ---
// ===================================
export const getUserOrders = async (
  page: number,
): Promise<ResponseWithPagination<ExtendedOrder> | null> => {
  try {
     const response = await axiosInterceptor.get("/order/users/orders", {
      params: {
        page,
      },
    });
   return response.data as ResponseWithPagination<ExtendedOrder>;

  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};
