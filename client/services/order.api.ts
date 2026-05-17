import axiosInterceptor from "@/api/client";
import { MenuFood } from "@/app/(client)/(out)/l/[local_id]/[local_slug]";
import {
  Local,
  Order,
  Response,
  ResponseWithPagination,
} from "@/interface/global";

import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. OBTENER INFO DE CARRITO ---
// ===================================
export const getCartInfo = async (
  iIds: string[], // itemIds
  lId: string, // localId
): Promise<Response<{ items: MenuFood[]; local: Local }>> => {
  try {
    const response = await axiosInterceptor.post("/order/cart/validate", {
      food_ids: iIds,
      local_id: lId,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data as { items: MenuFood[]; local: Local },
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

// --- 4. CREAR ORDEN MANUAL (STAFF) ---
// ===================================
export const createManualOrder = async (
  local_id: string,
  items: { food_id: string; quantity: number }[],
  notes?: string
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post(`/order/locals/${local_id}/orders/manual`, {
      items,
      notes,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message: err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado creando la orden manual.",
    };
  }
};

// --- 5. OBTENER ÓRDENES DE UN LOCAL (STAFF) ---
// ===================================
export const getLocalOrders = async (
  local_id: string,
): Promise<Response<Order[]>> => {
  try {
    const response = await axiosInterceptor.get(`/order/locals/${local_id}/orders`);

    return {
      success: true,
      status: response.status,
      data: response.data as Order[],
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message: err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado obteniendo las órdenes.",
    };
  }
};

// --- 6. ACTUALIZAR ESTADO DE ORDEN (STAFF) ---
// ===================================
export const updateOrderStatus = async (
  local_id: string,
  order_id: string,
  status: string,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.patch(
      `/order/locals/${local_id}/orders/${order_id}/status`,
      { status }
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message: err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado actualizando el estado de la orden.",
    };
  }
};

// --- 7. ACTUALIZAR ITEMS DE ORDEN (STAFF) ---
// ===================================
export const updateOrderItems = async (
  local_id: string,
  order_id: string,
  items: { food_id: string; quantity: number }[],
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.put(
      `/order/locals/${local_id}/orders/${order_id}/items`,
      { items }
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);

      if (err.response) {
        return {
          success: err.response.data.success ?? false,
          status: err.response.status,
          message: err.response.data.message || "Error procesando la solicitud.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      message: "Error inesperado actualizando los items de la orden.",
    };
  }
};
