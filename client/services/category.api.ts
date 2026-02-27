import { isAxiosError } from "axios";
import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";

// --- 1. OBTENER CATEGORIAS (FOOD)---
// ===================================
export const getFoodCategories = async (): Promise<Response | null> => {
  try {
    const response = (await axiosInterceptor.get(
      "/food-categories/categories",
    ));
    return response.data as Response;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};

// --- 2. OBTENER CATEGORIAS (TAGS)---
// ===================================
export const getTagCategories = async (): Promise<Response | null> => {
  try {
    const response = (await axiosInterceptor.get(
      "/community-tags/tags",
    ));

    return response.data as Response;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};
