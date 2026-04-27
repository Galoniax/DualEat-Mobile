import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import { preferencesDTO } from "@/interface/global.dto";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. OBTENER LOCALES EN RANGO ---
// ===================================
export const getLocalInBounds = async (
  lM: number, // latitudeMin
  lMX: number, // latitudeMax
  lN: number, // longitudeMin
  lNX: number, // longitudeMax
  preferencesDTO: preferencesDTO,
  q: string,
): Promise<Response> => {
  try {
    preferencesDTO.categorias = preferencesDTO.categorias.map((cat) =>
      Number(cat),
    );
    const response = await axiosInterceptor.post("/local/discovery/bounds", {
      minLat: lM,
      maxLat: lMX,
      minLng: lN,
      maxLng: lNX,
      preferencesDTO: preferencesDTO,
      query: q,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. OBTENER LOCALES EN CERCANÍA ---
// ===================================
export const getLocalByNearby = async (
  lat: number, // latitud
  lng: number, // longitud
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.post("/local/discovery/nearby", {
      lat,
      lng,
    });

    if (response.data.success === false) return null;
    else return response.data as Response;
  } catch (err: unknown) {
    return handleApiError(err);
  }
};

// --- 3. OBTENER LOCAL ---
// ===================================
export const getLocalBySlug = async (
  slug: string,
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get(
      `/local/discovery/local/${slug}`,
    );

    if (response.data.success === false) return null;
    else return response.data as Response;
  } catch (err: unknown) {
    return handleApiError(err);
  }
};

// --- 4. OBTENER RESEÑAS DEL LOCAL ---
// ===================================
export const getLocalReviews = async (
  slug: string,
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get(
      `/local/discovery/${slug}/reviews`,
    );
    if (response.data.success === false) return null;
    else return response.data as Response;
  } catch (err: unknown) {
    return handleApiError(err);
  }
};
