import axiosInterceptor from "@/api/client";
import {
  LocalReview,
  Response,
  ResponseWithPagination,
} from "@/interface/global";
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
      String(cat),
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
      message: response.data.message,
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
export const getLocalById = async (id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/local/discovery/${id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. OBTENER RESEÑAS DEL LOCAL ---
// ===================================
export const getLocalReviews = async (
  local_id: string,
  page: number,
): Promise<
  ResponseWithPagination<{ reviews: LocalReview[]; total: number }>
> => {
  try {
    const response = await axiosInterceptor.get(
      `/local/discovery/${local_id}/reviews`,
      {
        params: {
          page,
        },
      },
    );
    return {
      success: response.data.success,
      status: response.status,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 5. OBTENER LOCAL HOME ---
// ===================================
export const getHomeDiscovery = async (
  lat: number,
  lng: number,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get("/local/discovery/home", {
      params: {
        lat,
        lng,
      },
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
