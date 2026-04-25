import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllIngredients } from "@/services/recipe.api";
import {
  ChatSession,
  ChatSessionData,
  Ingredient,
  Recipe,
} from "@/interface/global";
import { ask } from "@/services/chat.api";

import Markdown from "react-native-markdown-display";
import MessageInput from "@/components/features/chat/MessageInput";
import IngredientsModal from "@/components/features/chat/IngredientsModal";
import { useChat } from "@/hooks/api/chat/useChat";

const rules = {
  strong: (node: any, children: any, parent: any, styles: any) => (
    <Text key={node.key} style={[styles.strong, { fontFamily: "Dosis-Bold" }]}>
      {children}
    </Text>
  ),
};

export default function ChatScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { chat_id } = useLocalSearchParams<{ chat_id: string }>();

  const { data: chat, isLoading, isFetching } = useChat(chat_id as string);

  const ingredientsRef = useRef<BottomSheetModal>(null);
  const flatListRef = useRef<FlatList>(null);

  const [open, setOpen] = useState(false);
  const [ingredientsIDs, setIngredientsIDs] = useState<string[]>([]);

  const [message, setMessage] = useState("");

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const {
    data: ingredients,
    isLoading: isLoadingIngredients,
    isFetching: isFetchingIngredients,
  } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const response = await getAllIngredients();
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as Ingredient[];
    },
    enabled: !!open,

    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        ingredientsRef.current?.dismiss();
      };
    }, [ingredientsRef]),
  );

  const handleSubmit = async () => {
    if (!message) return;
    const text = message.trim();

    setMessage("");

    const user = {
      role: "USER",
      text,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(
      ["chat", chat_id],
      (old: ChatSession | undefined) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, user],
        };
      },
    );

    try {
      const validId = (chat_id as string) || null;
      const response = await ask(
        text,
        validId,
        chat?.messages as ChatSessionData[],
      );

      console.log("RESPONSE: ", JSON.stringify(response.data, null, 2));

      if (response.success && response.data) {
        const { chat: updated, recipes, search_query } = response.data;

        console.log("DATA: ", updated);

        const iaMessage = updated.messages.findLast(
          (m: any) => m.role === "IA",
        );

        if (recipes && recipes.length > 0) {
          setRecipes((prev) => [...prev, ...recipes]);
        }

        const targetId = chat_id || updated.chat_id;

        queryClient.setQueryData(
          ["chat", targetId],
          (old: ChatSession | undefined) => {
            if (!old) return updated;

            return {
              ...old,
              messages: [...old.messages, ...(iaMessage ? [iaMessage] : [])],
            };
          },
        );

        if (!validId) {
          router.setParams({ chat_id: updated.chat_id });
        }
      }
    } catch (e) {
      console.log("Error al enviar mensaje:", e);
    }
  };

  const renderMessage = useCallback(({ item }: { item: ChatSessionData }) => {
    return (
      <View
        className={`mb-6 ${item.role === "USER" ? "items-end" : "items-start"} `}
      >
        <Markdown style={markdownStyles(item.role === "USER")} rules={rules}>
          {item.text}
        </Markdown>
      </View>
    );
  }, []);

  console.log("RECIPES: ", JSON.stringify(recipes, null, 2));

  const reverted = [...(chat?.messages || [])].reverse() as ChatSessionData[];

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ paddingTop: headerHeight }}
      className="flex-1 bg-bg-semi-white"
    >
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
        behavior="padding"
        style={{ flex: 1 }}
      >
        {isLoading || isFetching ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={30} color="#3578e4" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={reverted}
            inverted={true}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: insets.top + 40,
              paddingHorizontal: (insets.left + insets.right) / 2 + 16,
            }}
          />
        )}

        {recipes.length > 0 && (
          <FlatList
            data={recipes}
            renderItem={({ item }: { item: Recipe }) => (
              <View className="flex-row items-center justify-center gap-x-2">
                <Image
                  source={{ uri: item.main_image }}
                  className="w-10 h-10 rounded-full"
                />
                <Text className="text-text-3 font-dosis-bold text-[18px]">
                  {item.name}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            contentContainerStyle={{
              paddingHorizontal: (insets.left + insets.right) / 2 + 16,
            }}
          />
        )}

        {/** INPUT */}
        <MessageInput
          insets={insets}
          message={message}
          setMessage={setMessage}
          handleSubmit={handleSubmit}
          setOpenIngredients={setOpen}
          ingredientsRef={ingredientsRef}
        />
      </KeyboardAvoidingView>

      <IngredientsModal
        ingredientsIDs={ingredientsIDs}
        setIngredientsIDs={setIngredientsIDs}
        ingredients={ingredients || []}
        isLoading={isLoadingIngredients || isFetchingIngredients}
        ingredientsRef={ingredientsRef}
      />
    </SafeAreaView>
  );
}

const markdownStyles = (isUser: boolean) => ({
  body: {
    fontFamily: "Dosis-Regular",
    fontSize: 16,
    color: "#4A4947",
    maxWidth: isUser ? "60%" : ("95%" as any),
    backgroundColor: isUser ? "#f5f5f5" : "",
    paddingHorizontal: isUser ? 16 : 0,
    paddingVertical: isUser ? 8 : 0,
    lineHeight: 28,
    borderRadius: 24,
  },
  strong: {
    fontFamily: "Dosis-Bold",
    fontWeight: "normal" as "normal",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
});
