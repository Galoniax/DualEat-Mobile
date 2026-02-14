import { isAxiosError } from "axios";
import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import { preferencesDTO } from "@/interface/global.dto";
import { showToast } from "@/utils/toast";

// --- 1. OBTENER LOCALES EN RANGO ---
// ===================================
export const getLocalInBounds = async (
  lM: number, // latitudeMin
  lMX: number, // latitudeMax
  lN: number, // longitudeMin
  lNX: number, // longitudeMax
  preferencesDTO: preferencesDTO,
): Promise<Response | null> => {
  try {
    const response: Response = await axiosInterceptor.post(
      "/local/discovery/bounds",
      {
        minLat: lM,
        maxLat: lMX,
        minLng: lN,
        maxLng: lNX,
        preferencesDTO: preferencesDTO,
      },
    );

    if (response.success === false) {
      return null;
    } else {
      return response.data as Response;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};

// --- 2. OBTENER LOCALES EN CERCANÍA ---
// ===================================
export const getLocalByNearby = async (
  lat: number, // latitud 
  lng: number // longitud
) => {
  try {
    const response: Response = await axiosInterceptor.post(
      "/local/discovery/nearby",
      {
        lat,
        lng,
      },
    );

    if (response.success === false) {
      return null;
    } else {
      return response.data as Response;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast("info", "No se encontraron locales cercanos");
    }
    return null;
  }
};