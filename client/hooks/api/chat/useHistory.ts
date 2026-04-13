import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteChat, editTitle, getHistory } from "@/services/chat.api";
import { ChatSession } from "@/interface/global";

export type ChatHistory = Pick<
  ChatSession,
  "chat_id" | "title" | "createdAt" | "lastActivity"
>;

//==============================================
// useHistory (GET)
//==============================================
export const useHistory = (search?: string) => {
  return useQuery({
    queryKey: ["chat_history", search],
    queryFn: async () => {
      try {
        const response = await getHistory(search);

        if (!response.success || !response.data) {
          throw new Error("Error en la respuesta del post");
        }

        return response.data as ChatHistory[];
      } catch (e: any) {
        if (e.response.status === 404) {
          return [] as ChatHistory[];
        }
        throw e;
      }
    },

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};

//==============================================
// useRenameChat (PUT)
//==============================================
export const useRenameChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await editTitle(id, title);
      if (!response.success) {
        throw new Error(response.message || "Error al editar el chat");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_history"] });
    },
    onError: (e: any) => {
      console.log("Hubo un error al editar:", e);
    },
  });
};

//==============================================
// useDeleteChat (DELETE)
//==============================================
export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteChat(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar el chat");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_history"] });
    },
    onError: (e: any) => {
      console.log("Hubo un error al eliminar:", e);
    },
  });
};
