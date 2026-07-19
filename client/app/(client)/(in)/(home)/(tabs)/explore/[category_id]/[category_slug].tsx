import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { Community, TagCategory } from "@/interface/global";
import { getTagCategories } from "@/services/category.api";
import { ROUTES } from "@/constants/constants";
import { getByCategorySkeleton } from "@/services/community.api";
import { useJoinLeave, useMyCommunities } from "@/hooks/api/useMyCommunities";

const TODO_CATEGORY = { id: 0, slug: "todo", name: "Todos" } as TagCategory;

interface CommunityByTags {
  id: number;
  name: string;
  items: Community[];
}

export default function SearchScreen() {
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { data: myCommunities } = useMyCommunities();
  const { mutate: joinLeave } = useJoinLeave();

  const { category_id } = useLocalSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<TagCategory | null>(
    null,
  );

  const CARD_WIDTH = width * 0.85;

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getTagCategories();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener categorías");
      }
      return response.data as TagCategory[];
    },
    staleTime: 1000 * 60 * 30,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  console.log(data)

  const {
    data: communities,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["communities", category_id],
    queryFn: async () => {
      const response = await getByCategorySkeleton(Number(category_id));

      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener comunidades");
      }

      return response.data as CommunityByTags[];
    },
    staleTime: 1000 * 60 * 20,
  });

  const extendedData = useMemo(() => {
    if (!data) return [TODO_CATEGORY];
    return [TODO_CATEGORY, ...data];
  }, [data]);

  useEffect(() => {
    if (category_id && data) {
      const foundCategory = data.find((c) => c.id.toString() === category_id);
      if (foundCategory) setSelectedCategory(foundCategory);
    } else if (!category_id) {
      setSelectedCategory(TODO_CATEGORY);
    }
  }, [category_id, data]);

  const handlePressCategory = useCallback(
    (item: TagCategory) => {
      if (selectedCategory?.id === item.id) return;
      setSelectedCategory(item);
    },
    [selectedCategory],
  );

  useEffect(() => {
    if (selectedCategory?.id !== 0 && selectedCategory !== null) {
      router.setParams({
        category_id: selectedCategory.id.toString(),
        category_slug: selectedCategory.slug,
      });
    } else if (selectedCategory?.id === 0) {
      router.setParams({
        category_id: "",
        category_slug: "",
      });
    }
  }, [selectedCategory, router]);

  const categoriesWithCommunities = useMemo(() => {
    if (!communities) return [];

    const seenCommunityIds = new Set();

    return communities.reduce<CommunityByTags[]>((acc, category) => {
      const uniqueItems = category.items.filter((community) => {
        if (seenCommunityIds.has(community.id)) {
          return false;
        } else {
          seenCommunityIds.add(community.id);
          return true;
        }
      });

      if (uniqueItems.length > 0) {
        acc.push({
          ...category,
          items: uniqueItems,
        });
      }

      return acc;
    }, []);
  }, [communities]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ paddingTop: headerHeight }}
      className="flex-1 flex-col gap-y-2 bg-bg-semi-white px-4"
    >
      <FlatList
        data={categoriesWithCommunities}
        keyExtractor={(category) => `category-${category.id}`}
        contentContainerStyle={{ paddingBottom: 40, flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#e5a657"]}
          />
        }
        ListHeaderComponent={() => (
          <View className="flex-col gap-y-2.5 mt-4 mb-2">
            <Text className="text-text-3 font-outfit-bold text-base">
              Explora comunidades por tema
            </Text>
            <FlatList
              data={extendedData}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handlePressCategory(item as TagCategory)}
                  className={`flex-shrink items-center justify-center py-1.5 px-4 rounded-full border border-gray-300 ${
                    selectedCategory?.id === item.id
                      ? "bg-bg-semi-black "
                      : "bg-bg-semi-white"
                  }`}
                >
                  <Text
                    className={`font-outfit-light text-sm ${
                      selectedCategory?.id === item.id
                        ? "text-text-1"
                        : "text-text-5"
                    }`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        )}
        renderItem={({ item: category }) => (
          <View className="flex-col gap-y-3">
            <Text className="text-text-3 font-outfit-bold text-[15px]">
              {category.name}
            </Text>

            <FlatList
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={category.items}
              keyExtractor={(community) => `community-${community.id}`}
              contentContainerStyle={{ gap: 12 }}
              decelerationRate="fast"
              renderItem={({ item: community }) => {
                const isJoined = myCommunities?.some(
                  (c) => c.community.id === community.id,
                );
                return (
                  <TouchableOpacity
                    style={{ width: CARD_WIDTH }}
                    key={community.id}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => {
                      router.push({
                        pathname: ROUTES.USER.COMMUNITY,
                        params: {
                          community_slug: community.slug,
                        },
                      });
                    }}
                    className="border border-gray-300 px-3 py-2.5 flex-col rounded-[15px] gap-y-1.5"
                  >
                    <View className="flex-row items-center gap-x-2.5">
                      <Image
                        source={{ uri: community.image_url }}
                        className="w-11 h-11 rounded-full"
                      />
                      <View className="flex-col">
                        <Text className="text-[17px] font-outfit-bold text-text-3 tracking-tighter">
                          {community.name}
                        </Text>
                        <Text className="text-[13px] font-outfit-light text-text-5 tracking-tighter">
                          {community.total_members} miembros
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          joinLeave({
                            community,
                            join: !isJoined,
                          })
                        }
                        className="ml-auto"
                      >
                        <Text
                          className={`text-[13px] rounded-full px-2.5 py-1.5 tracking-tighter font-outfit-bold 
                            ${
                              isJoined
                                ? "bg-bg-gray text-text-3 border border-gray-600"
                                : "bg-bg-semi-black text-text-1"
                            }`}
                        >
                          {isJoined ? "Te uniste" : "Unirse"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="text-[13px] leading-5 font-outfit-light text-text-4 tracking-tighter truncate"
                    >
                      {community.description}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 flex-grow justify-center items-center">
            {isLoading ? (
              <ActivityIndicator
                className="items-center justify-center"
                size={"large"}
                color="#e5a657"
              />
            ) : (
              <Text className="text-center text-text-6 font-outfit-light">
                No hay comunidades disponibles por el momento.
              </Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
