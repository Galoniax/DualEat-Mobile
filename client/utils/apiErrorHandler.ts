import { isAxiosError } from "axios";

export interface ApiError {
  success: boolean;
  status: number;
  message: string;
}

export const handleApiError = (err: unknown): ApiError => {
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
        success: err.response.data?.success ?? false,
        status: err.response.status,
        message: err.response.data?.message || "Error procesando la solicitud.",
      };
    }
  }
  
  return {
    success: false,
    status: 500,
    message: "Error inesperado procesando la solicitud.",
  };
};