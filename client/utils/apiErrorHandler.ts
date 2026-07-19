import { isAxiosError } from "axios";
export const handleApiError = (err: unknown) => {
  let message = "Error inesperado procesando la solicitud.";

  if (isAxiosError(err)) {
    console.log("Axios error:", err.response?.data || err.message);
    if (err.code === "ECONNABORTED") {
      message = "La solicitud tardó demasiado en responder.";
    } else if (err.response) {
      message = err.response.data?.message || "Error procesando la solicitud.";
    }
  }

  return {
    success: false,
    status: isAxiosError(err) ? err.response?.status || 500 : 500,
    message,
  };
};
