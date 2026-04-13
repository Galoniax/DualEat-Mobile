import axiosInterceptor from "@/api/client";
import {
  ChatSessionData,
  ChatSessionResponse,
  Response,
} from "@/interface/global";
import { isAxiosError } from "axios";

// --- 1. CONSULTAS AL CHAT ---
// ===================================
export const ask = async (
  question: string,
  chat_id: string | null,
  conversation: ChatSessionData[],
): Promise<Response<ChatSessionResponse>> => {
  try {
    const response = await axiosInterceptor.post(`/chat/ask`, {
      question,
      chat_id,
      conversation,
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

// --- 2. OBTENER CHAT POR ID ---
// ===================================
export const getById = async (chat_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/chat/${chat_id}`);

    console.log("Chat Data", response.data);

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

// --- 3. OBTENER HISTORIAL DEL USUARIO ---
// ===================================
export const getHistory = async (search?: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/chat/`, {
      params: { search },
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

// --- 4. ELIMINAR CHAT ---
// ===================================
export const deleteChat = async (chat_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.delete(`/chat/${chat_id}`);

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


// --- 4. EDITAR TÍTULO DEL CHAT ---
// ===================================
export const editTitle = async (chat_id: string, title: string): Promise<Response> => {
  try {
    const normalize = title.trim();

    const response = await axiosInterceptor.put(`/chat/${chat_id}/title`, { title: normalize });

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
