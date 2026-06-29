import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import { ReviewDTO } from "@/interface/global.dto";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. CREAR RESEÑA DE UN LOCAL ---
// ===================================
export const createReview = async (review: ReviewDTO): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post(`/review/create`, {
      review,
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

// --- 2. EDITAR RESEÑA ---
// ===================================
export const updateReview = async (
  review_id: string,
  review: ReviewDTO,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.put(`/review/${review_id}`, {
      review,
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
