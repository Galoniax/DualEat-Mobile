import { ChatSession, Recipe } from "@/interface/global";
import { capitalize } from "@/utils/normalize";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetSectionList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { EvilIcons, FontAwesome } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useChat } from "@/hooks/api/chat/useChat";
import { useMemo, useState } from "react";
import { getRecipeById, searchRecipes } from "@/services/recipe.api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateRecipe } from "@/services/chat.api";

interface RecipesModalProps {
  chat_id: string | null;
  recipeRef: React.RefObject<BottomSheetModal | null>;
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  query: string | null;
  setQuery: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function RecipesModal({
  chat_id,
  recipeRef,
  recipes,
  setRecipes,
  query,
  setQuery,
}: RecipesModalProps) {
  const insets = useSafeAreaInsets();

  const queryClient = useQueryClient();

  const {
    data: recipesSearch,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["recipes_search", query],

    queryFn: async ({ pageParam = 1 }) => {
      console.log(
        "Iniciando búsqueda en la API. Query:",
        query,
        "| Página:",
        pageParam,
      );
      try {
        const response = await searchRecipes(
          query as string,
          pageParam as number,
        );
        console.log(
          "Respuesta de la API de búsqueda:",
          JSON.stringify(response.data, null, 2),
        );

        if (!response?.success || !response?.data) {
          throw new Error(
            response.message || "No se encontraron recetas con ese nombre",
          );
        }

        return response;
      } catch (error) {
        console.error("Error dentro de queryFn al buscar recetas:", error);
        throw error;
      }
    },

    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled: !!query,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 3,
  });

  const { data: chat } = useChat(chat_id as string);

  const dataFlatMap = useMemo(() => {
    return (
      recipesSearch?.pages
        .flatMap((page) => page?.data ?? [])
        .filter((recipe) => recipe.id !== chat?.recipe_id) || []
    );
  }, [recipesSearch, chat]);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [localQuery, setLocalQuery] = useState(query || "");

  const { data: recipePinned, isLoading } = useQuery({
    queryKey: ["recipe", chat?.recipe_id],
    queryFn: async () => {
      const response = await getRecipeById(chat?.recipe_id as string);
      if (!response.success || !response.data) {
        throw new Error("No se pudo obtener la receta vinculada");
      }
      return response.data as Recipe;
    },
    enabled: !!chat?.recipe_id,
  });

  const handleSelectRecipe = (item: Recipe) => {
    setSelectedRecipe(item);
  };

  const { mutate } = useMutation({
    mutationFn: async ({ recipe_id }: { recipe_id: string | null }) => {
      const response = await updateRecipe(
        chat_id as string,
        recipe_id as string,
      );

      console.log(
        "CHAT ACTUALIZADO DESDE API: ",
        JSON.stringify(response.data, null, 2),
      );
      return response;
    },
    onMutate: () => {
      queryClient.cancelQueries({ queryKey: ["chat", chat_id] });
      const previous = queryClient.getQueryData(["chat", chat_id]);

      queryClient.setQueryData(["chat", chat_id], (prev: ChatSession) => ({
        ...prev,
        recipe_id: selectedRecipe?.id,
      }));

      return {
        previous,
        selectedRecipe,
        chat_id,
      };
    },
    onSuccess: () => {
      setSelectedRecipe(null);
      console.log("CHAT ACTUALIZADO", chat);
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["chat", context.chat_id], context.previous);
      }
    },
  });

  console.log("CHAT ACTUAL", chat);

  const sections = useMemo(() => {
    const list = [];

    const mainData =
      dataFlatMap && dataFlatMap.length > 0 ? dataFlatMap : recipes || [];
    if (mainData && mainData.length > 0) {
      list.push({
        title: "Resultados de búsqueda",
        type: "search",
        data: mainData,
      });
    }

    return list;
  }, [dataFlatMap, recipes]);

  return (
    <BottomSheetModal
      ref={recipeRef}
      snapPoints={["80%"]}
      enablePanDownToClose={true}
      enableOverDrag={false}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{
        backgroundColor: "#2F2F2F",
        marginVertical: 10,
      }}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: "#dbdbdb",
        borderWidth: 1,
        backgroundColor: "#fefefe",
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      )}
    >
      <View style={{ flex: 1, paddingHorizontal: 12, gap: 12 }}>
        {/* STICKY SEARCH BAR */}
        <View className="flex-row items-center border border-gray-300 rounded-full bg-white gap-x-3 px-3 py-1">
          <EvilIcons name="search" size={20} color="#707070" />
          <BottomSheetTextInput
            value={localQuery}
            onChangeText={setLocalQuery}
            onSubmitEditing={() => {
              console.log("SE EJECUTO");
              setQuery(localQuery);
            }}
            placeholder={query || "Buscar receta..."}
            placeholderTextColor="#999"
            className="flex-1 font-outfit-light text-base text-text-4 py-1.5"
            clearButtonMode="while-editing"
          />
        </View>

        {/* STICKY PINNED RECIPE */}
        {chat?.recipe_id && recipePinned && (
          <View className="mb-2">
            <Text className="font-outfit-bold text-sm text-text-3 mb-2">
              Receta vinculada
            </Text>
            <View className="flex-row gap-x-4 items-center p-3 rounded-lg border border-[#e7f0fd] bg-[#f4f8fe]">
              <Image
                source={{ uri: recipePinned.main_image }}
                className="w-10 h-10 rounded-[5px] object-cover"
              />
              <View className="flex-1 flex-col gap-y-0.5">
                <Text
                  style={{ flexShrink: 1 }}
                  numberOfLines={2}
                  className="font-outfit-bold text-base text-text-3"
                >
                  {recipePinned.name}
                </Text>
                <View className="flex-row items-center gap-x-1">
                  <FontAwesome name="star" size={14} color="#e5a657" />
                  <Text className="font-outfit-bold text-[12px] text-text-3">
                    {(() => {
                      const total_votes =
                        (recipePinned.votes_down || 0) +
                        (recipePinned.votes_up || 0);
                      const rating =
                        total_votes > 0
                          ? ((recipePinned.votes_up || 0) / total_votes) * 5
                          : 0;
                      return rating === 0 ? "N/A" : `${rating.toFixed(1)}`;
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* RECIPES LIST */}
        <BottomSheetSectionList
          sections={sections}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: Recipe) => item.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }: { item: Recipe }) => {
            let rating: number = 0;

            if (item) {
              const total_votes = (item.votes_down || 0) + (item.votes_up || 0);
              rating =
                total_votes > 0 ? ((item.votes_up || 0) / total_votes) * 5 : 0;
            }

            const isSelected = selectedRecipe?.id === item.id;

            return (
              <TouchableOpacity
                onPress={() => handleSelectRecipe(item)}
                className={`flex-row gap-x-4 items-center p-3 rounded-lg mb-2 border ${
                  isSelected
                    ? "border-bg-blue bg-[#e7f0fd]"
                    : "border-transparent"
                }`}
              >
                <Image
                  source={{ uri: item.main_image }}
                  className="w-8 h-full rounded-[5px] object-cover"
                />

                <View className="flex-1 flex-col gap-y-0.5">
                  <View className="flex-row justify-between">
                    <Text
                      style={{ flexShrink: 1 }}
                      numberOfLines={2}
                      className="font-outfit-bold text-base text-text-3"
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-x-1">
                      <FontAwesome name="star" size={14} color="#e5a657" />
                      <Text className="font-outfit-bold text-[12px] text-text-3">
                        {rating === 0 ? "N/A" : `${rating.toFixed(1)}`}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-x-4">
                    <View className="flex-row items-center gap-x-1">
                      <EvilIcons name="clock" size={16} color="#707070" />
                      <Text className="font-outfit-light text-sm text-text-4">
                        {item.total_time || 0}min
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-x-1">
                      <EvilIcons name="cart" size={20} color="#707070" />
                      <Text className="font-outfit-light text-sm text-text-4">
                        {item._count?.ingredients || 0} ingredientes
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-x-1">
                      <EvilIcons name="chart" size={20} color="#707070" />
                      <Text className="font-outfit-light text-sm text-text-4">
                        {item._count?.steps || 0} pasos
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    className="text-text-4 text-sm font-outfit-light"
                  >
                    {capitalize(item.description)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-center text-text-4 text-sm font-outfit-light">
                No hay más recetas
              </Text>
            </View>
          }
          ListFooterComponent={() => (
            <View className="flex-col">
              {isFetchingNextPage && (
                <ActivityIndicator
                  size="small"
                  color="#3578e4"
                  className="my-3"
                />
              )}
            </View>
          )}
        />

        {/* STICKY FOOTER ACTION BUTTONS */}
        {chat && (
          <View
            style={{ paddingBottom: insets.bottom + 12 }}
            className="border-t border-gray-200 bg-white flex-row justify-around gap-x-2 pt-4 px-4"
          >
            <TouchableOpacity
              className="flex-1 bg-bg-blue py-3 rounded-full justify-center items-center"
              onPress={() => {
                mutate({ recipe_id: selectedRecipe?.id as string });
              }}
            >
              <Text className="text-white font-outfit-bold text-sm">
                Vincular Receta
              </Text>
            </TouchableOpacity>

            {chat?.recipe_id && (
              <TouchableOpacity
                className="flex-1 bg-bg-red py-3 rounded-full justify-center items-center"
                onPress={() => {
                  mutate({ recipe_id: null });
                }}
              >
                <Text className="text-white font-outfit-bold text-sm">
                  Desvincular
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}
