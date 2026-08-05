import { Community, Post, PostComment, Recipe, ResponseWithPagination } from "@/interface/global";
import axiosInterceptor from "@/api/client";
import { handleApiError } from "@/utils/apiErrorHandler";

type GlobalSearch = Post | Recipe | PostComment | Community;


// --- 1. REALIZAR BUSQUEDA GLOBAL ---
// ===================================
export const getGlobal = async (
  query: string,
  tab: "posts" | "recipes" | "comments" | "communities",
  page: number = 1,
  community_id?: string,
): Promise<ResponseWithPagination<GlobalSearch[]> | null> => {
  try {
    const response = await axiosInterceptor.get("/search/global", {
      params: {
        query,
        tab,
        page,
        community_id,
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
