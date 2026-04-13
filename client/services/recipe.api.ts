import axiosInterceptor from "@/api/client";
import { Response } from "@/interface/global";
import axios, { isAxiosError } from "axios";

// --- 1. OBTENER TODOS LOS INGREDIENTES ---
// ===================================
export const getAllIngredients = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/ingredients`);

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

// --- 2. OBTENER RECETA POR ID ---
// ===================================
export const getRecipeById = async (recipeId: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/${recipeId}`);

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

// --- 2. OBTENER NUTRICIÓN DE UN INGREDIENTE ---
// ===================================
export async function getIngredientNutrition(ingredient: string) {
  try {
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      ingredient,
    )}&search_simple=1&action=process&json=1&page_size=1`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "DualEatMobileApp - Android/iOS - Version 1.0",
      },
    });

    if (!data.products || data.products.length === 0) {
      return { ingredient, found: false };
    }

    const nutriments = data.products[0].nutriments || {};

    return {
      ingredient,
      found: true,
      energy_kcal: nutriments["energy-kcal_100g"] ?? 0,
      proteins: nutriments.proteins_100g ?? 0,
      carbohydrates: nutriments.carbohydrates_100g ?? 0,
      fat: nutriments.fat_100g ?? 0,
    };
  } catch (e) {
    console.log("Error al obtener la nutrición del ingrediente:", e);
    return { ingredient, found: false };
  }
}

// --- 3. OBTENER NUTRICIÓN DE UNA RECETA ---
// ===================================
export async function getRecipeNutrition(ingredients: string[]) {
  const valid: any[] = [];
  
  // Fetch sequentially to prevent triggering rate-limits or bot protection from Open Food Facts
  for (const ing of ingredients) {
    const result = await getIngredientNutrition(ing);
    if (result.found) {
      valid.push(result);
    }
    // Pequeño retraso entre peticiones
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  if (valid.length === 0) {
    return {
      total_ingredients: 0,
      avg_calories: 0,
      avg_proteins: 0,
      avg_carbs: 0,
      avg_fat: 0,
      details: [],
    };
  }

  const avg = (key: keyof (typeof valid)[0]) =>
    (
      valid.reduce((sum, r) => {
        const value =
          typeof r[key] === "string"
            ? parseFloat(r[key] as string)
            : (r[key] as number);
        return sum + (isNaN(value) ? 0 : value);
      }, 0) / valid.length
    ).toFixed(2);

  return {
    total_ingredients: valid.length,
    avg_calories: avg("energy_kcal"),
    avg_proteins: avg("proteins"),
    avg_carbs: avg("carbohydrates"),
    avg_fat: avg("fat"),
    details: valid,
  };
}
