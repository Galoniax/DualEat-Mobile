import axiosInterceptor from "@/api/client";
import {
  Post,
  PostComment,
  Response,
  ResponseWithPagination,
  UploadResponse,
} from "@/interface/global";
import { PostDTO, RecipeDTO, UploadPayload } from "@/interface/global.dto";
import { isAxiosError } from "axios";

// --- 1. OBTENER POSTS ---
// ===================================
export const getAll = async (
  page: number,
): Promise<ResponseWithPagination<Post> | null> => {
  try {
    const response = await axiosInterceptor.get("/post/", {
      params: {
        page,
      },
    });

    return {
      success: response.data.success,
      status: response.status,
      data: response.data.data,
      pagination: response.data.pagination,
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

// --- 2. OBTENER POST POR ID ---
// ===================================
export const getPostById = async (post_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/post/${post_id}`);

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

// --- 3. OBTENER COMENTARIOS DE UN POST ---
// ===================================
export const getComments = async (
  post_id: string,
  page: number = 1,
): Promise<ResponseWithPagination<PostComment[]> | null> => {
  try {
    const response = await axiosInterceptor.get(`/post/comments/${post_id}`, {
      params: {
        page,
      },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      pagination: response.data.pagination,
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

// --- 3. OBTENER COMENTARIOS DE UN POST ---
// ===================================
export const getReplies = async (
  comment_id: string,
  page: number = 1,
): Promise<ResponseWithPagination<PostComment[]> | null> => {
  try {
    const response = await axiosInterceptor.get(`/post/replies/${comment_id}`, {
      params: {
        page,
      },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      pagination: response.data.pagination,
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

// --- 4. OBTENER POSTS DE UNA COMUNIDAD ---
// ===================================
export const getCommunityPosts = async (
  community_id: string,
  title: string = "",
  page: number = 1,
): Promise<ResponseWithPagination<Post[] | null>> => {
  try {
    const response = await axiosInterceptor.get(`/post/${community_id}/posts`, {
      params: { title, page },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      pagination: response.data.pagination,
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

// --- 5. CREAR POST (Opcional con Receta) ---
// ===================================
export const createPost = async (
  post: PostDTO,
  recipe?: RecipeDTO,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post("/post/create", {
      post,
      recipe,
    });

    console.log("RESPONSE: ", JSON.stringify(response.data, null, 2));

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data,
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

// --- 6. SUBIR IMÁGENES ---
// ===================================
export const upload = async (
  payload: UploadPayload,
): Promise<Response<UploadResponse>> => {
  try {
    const formData = new FormData();

    if (payload.post_images) {
      payload.post_images.forEach((file) => {
        formData.append("post_images", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      });
    }

    if (payload.recipe_main_image) {
      formData.append("recipe_main_image", {
        uri: payload.recipe_main_image.uri,
        type: payload.recipe_main_image.type,
        name: payload.recipe_main_image.name,
      } as any);
    }

    if (payload.recipe_step_images) {
      payload.recipe_step_images.forEach((file) => {
        formData.append("recipe_step_images", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      });
    }

    const response = await axiosInterceptor.post("/post/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("RESPONSE: ", JSON.stringify(response.data, null, 2));

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.urls,
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
