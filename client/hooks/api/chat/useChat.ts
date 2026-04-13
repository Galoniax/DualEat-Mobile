import { useQuery } from "@tanstack/react-query";

import { getById } from "@/services/chat.api";
import { ChatSession } from "@/interface/global";

export const useChat = (chat_id: string | undefined) => {
  return useQuery({
    queryKey: ["chat", chat_id],
    queryFn: async () => {
      if (!chat_id) {
        return {} as ChatSession;
      }

      try {
        const response = await getById(String(chat_id));

        if (!response.success || !response.data) {
          throw new Error("Error en la respuesta del post");
        }

        console.log("Chat Data", response.data)

        return response.data as ChatSession;
      } catch (e: any) {
        if (e.response.status === 404) {
          return {} as ChatSession;
        }
        throw e;
      }
    },
    enabled: !!chat_id,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};
