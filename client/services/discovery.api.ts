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
  q: string,
): Promise<Response | null> => {
  try {

    preferencesDTO.categorias = preferencesDTO.categorias.map((cat) => Number(cat));
    const response: Response = await axiosInterceptor.post(
      "/local/discovery/bounds",
      {
        minLat: lM,
        maxLat: lMX,
        minLng: lN,
        maxLng: lNX,
        preferencesDTO: preferencesDTO,
        query: q,
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
  lng: number, // longitud
): Promise<Response | null> => {
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
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};

// --- 3. OBTENER LOCAL ---
// ===================================
export const getLocalBySlug = async (
  slug: string,
): Promise<Response | null> => {
  try {
    const response: Response = await axiosInterceptor.get(
      `/local/discovery/local/${slug}`,
    );

    if (response.success === false) {
      return null;
    } else {
      return response.data as Response;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast("error", "No se pudo obtener el local");
    }
    return null;
  }
};

// --- 4. OBTENER RESEÑAS DEL LOCAL ---
// ===================================
export const getLocalReviews = async (
  slug: string,
): Promise<Response | null> => {
  try {
    const response: Response = await axiosInterceptor.get(
      `/local/discovery/${slug}/reviews`,
    );
    if (response.success === false) {
      return null;
    } else {
      return response.data as Response;
    }
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      showToast("error", "No se pudo obtener las reseñas del local");
    }
    return null;
  }
};
