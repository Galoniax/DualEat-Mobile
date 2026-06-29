import { Post, Recipe, ResponseWithPagination } from "@/interface/global";
import { capitalize } from "@/utils/normalize";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { EvilIcons, FontAwesome } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getCommunityPosts } from "@/services/post.api";
import { useChat } from "@/hooks/api/chat/useChat";
import { useMemo } from "react";

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
  const {
    data: recipesSearch,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["recipes_search", query],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getCommunityPosts(
        query as string,
        pageParam as number,
      );

      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta de los posts");
      }

      return response as ResponseWithPagination<Post[]>;
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

  const data = [
    {
      id: "iVT_CCFQOP",
      slug: "Pollo",
      user_id: "PNACq4A93skrJq",
      name: "Papas con Cheddar Rellenas",
      description:
        "Una deliciosa receta de papas horneadas rellenas con una mezcla cremosa de queso cheddar, tocino crujiente y cebolla verde. Perfecta como acompañamiento o como plato principal ligero.",
      total_time: 45,
      main_image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5rhGQG2Fi6fH5aesgSHij9I2XIAHb_KhJQlabh2uIkw&s=10",
      created_at: "2026-05-08T19:06:04.876Z",
      updated_at: "2026-05-08T19:03:18.516Z",
      user: {
        id: "PNACq4A93skrJq",
        name: "Gaxton",
        avatar_url:
          "https://i.pinimg.com/736x/76/c0/38/76c03829cd297289c723d277c1325162.jpg",
        slug: "Gaxton",
      },
      _count: {
        ingredients: 7,
        steps: 9,
      },
      votes_up: 0,
      votes_down: 0,
    },
  ];

  const { data: chat, isLoading, isFetching } = useChat(chat_id as string);

  const dataFlatMap = useMemo(() => {
    return (
      recipesSearch?.pages
        .flatMap((page) => page?.data ?? [])
        .filter((recipe) => recipe.id !== chat?.recipe_id) || []
    );
  }, [recipesSearch, chat]);

  console.log("receta", JSON.stringify(chat, null, 2));

  const { data: recipePinned, isLoading: isLoadingRecipePinned } = useQuery({
    queryKey: ["recipe", chat?.recipe_id],
    queryFn: () => {
      console.log("receta", chat?.recipe_id);
    },
    enabled: !!chat?.recipe_id,
  });

  return (
    <BottomSheetModal
      ref={recipeRef}
      snapPoints={["80%"]}
      enablePanDownToClose={true}
      enableOverDrag={false}
      enableDynamicSizing={false}
      index={0}
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
      <BottomSheetFlatList
        data={[]}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: Recipe) => item.id}
        renderItem={({ item }: { item: Recipe }) => {
          let rating: number = 0;

          if (item && item.votes_up && item.votes_down) {
            const total_votes = item.votes_down + item.votes_up;
            rating = total_votes > 0 ? (item.votes_up / total_votes) * 5 : 0;
          }

          return (
            <TouchableOpacity className="flex-row gap-x-4 items-center">
              <Image
                source={{ uri: item.main_image }}
                style={{
                  width: 40,
                  height: "80%",
                  resizeMode: "cover",
                  borderRadius: 5,
                }}
              />

              <View className="flex-1 flex-col gap-y-0.5">
                <View className="flex-row justify-between">
                  <Text
                    style={{ flexShrink: 1 }}
                    numberOfLines={2}
                    className="font-outfit-bold text-[16px] text-text-3"
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
                    <Text className="font-outfit-light text-[12px] text-text-4">
                      {item.total_time || 0}min
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-x-1">
                    <EvilIcons name="cart" size={20} color="#707070" />
                    <Text className="font-outfit-light text-[12px] text-text-4">
                      {item._count?.ingredients || 0} ingredientes
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-x-1">
                    <EvilIcons name="chart" size={20} color="#707070" />
                    <Text className="font-outfit-light text-[12px] text-text-4">
                      {item._count?.steps || 0} pasos
                    </Text>
                  </View>
                </View>

                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="text-text-4 text-[14px] font-outfit-light"
                >
                  {capitalize(item.description)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{
          width: "100%",
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      />
    </BottomSheetModal>
  );
}
