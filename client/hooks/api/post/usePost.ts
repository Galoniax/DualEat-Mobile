import { Post, PostComment, ResponseWithPagination } from "@/interface/global";
import { getComments, getPostById, getReplies } from "@/services/post.api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

//==============================================
// usePostById (GET)
//==============================================
export const usePostById = (post_id: string) => {
  return useQuery({
    queryKey: ["post", post_id],
    queryFn: async () => {
      const response = await getPostById(post_id);
      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as Post;
    },
    enabled: !!post_id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};

//==============================================
// useComment (GET)
//==============================================
export const useComment = (post_id: string, enabled: boolean) => {
  return useInfiniteQuery<ResponseWithPagination<PostComment[]>>({
    queryKey: ["comments", post_id],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getComments(
        post_id as string,
        pageParam as number,
      );

      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta de los comentarios");
      }

      return response as ResponseWithPagination<PostComment[]>;
    },

    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled: !!post_id && enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,

    retry: 1,
  });
};

//==============================================
// useReplies (GET)
//==============================================
export const useReplies = (comment_id: string, enabled: boolean) => {
  return useInfiniteQuery<ResponseWithPagination<PostComment[]>>({
    queryKey: ["replies", comment_id],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getReplies(
        comment_id as string,
        pageParam as number,
      );

      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta de las respuestas");
      }

      return response as ResponseWithPagination<PostComment[]>;
    },

    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled: !!comment_id && enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,

    retry: false,
  });
};

