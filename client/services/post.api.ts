import axiosInterceptor from "@/api/client";
import {
  Post,
  PostComment,
  Response,
  ResponseWithPagination,
} from "@/interface/global";
import {
  PostCommentDTO,
  PostDTO,
  RecipeDTO,
  UploadPayload,
} from "@/interface/global.dto";
import { handleApiError } from "@/utils/apiErrorHandler";

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
    return handleApiError(err);
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
    return handleApiError(err);
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
    return handleApiError(err);
  }
};

// --- 4. CREAR COMENTARIO ---
// ===================================
export const createComment = async (
  comment: PostCommentDTO,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post("/post/comment", { comment });

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

// --- 5. ACTUALIZAR COMENTARIO ---
// ===================================
export const updateComment = async (
  comment_id: string,
  content: string,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.patch(
      `/post/comment/${comment_id}`,
      {
        content: content.trim(),
      },
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 6. ELIMINAR COMENTARIO ---
// ===================================
export const deleteComment = async (comment_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.delete(
      `/post/comment/${comment_id}`,
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 7. OBTENER RESPUESTAS DE UN COMENTARIO ---
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
    return handleApiError(err);
  }
};

// --- 8. OBTENER POSTS DE UNA COMUNIDAD ---
// ===================================
export const getCommunityPosts = async (
  community_id: string,
  page: number = 1,
): Promise<ResponseWithPagination<Post[] | null>> => {
  try {
    const response = await axiosInterceptor.get(`/post/${community_id}/posts`, {
      params: { page },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 9. CREAR POST (Opcional con Receta) ---
// ===================================
export const createPost = async (
  post: PostDTO,
  recipe?: RecipeDTO,
): Promise<Response<Post>> => {
  try {
    const response = await axiosInterceptor.post("/post/create", {
      post: {
        title: post.title,
        content: post.content,
        image_urls: post.image_urls,
        community_id: post.community?.id,
      },
      recipe,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};


// --- 10. ELIMINAR POST ---
// ===================================
export const deletePost = async (post_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.patch(`/post/${post_id}`);

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


// --- 11. SUBIR IMÁGENES ---
// ===================================
export const upload = async (
  payload: UploadPayload,
): Promise<
  Response<{
    post_images?: string[];
    main_image?: string;
  }>
> => {
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

    if (payload.main_image) {
      formData.append("main_image", {
        uri: payload.main_image.uri,
        type: payload.main_image.type,
        name: payload.main_image.name,
      } as any);
    }

    const response = await axiosInterceptor.post("/post/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.urls,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};
