import { ROUTES } from "@/constants/constants";
import { useRecentsStore } from "@/context/store/useRecents";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Community,
  Post,
  PostComment,
  Recipe,
  ResponseWithPagination,
} from "@/interface/global";
import { getGlobal } from "@/services/search.api";
import { getShortTimeAgo } from "@/utils/date";
import { AntDesign, Fontisto, Ionicons, Octicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Recents {
  community?: Community;
  value: string;
}

type GlobalSearch = Post | Recipe | PostComment | Community;

const TABS = ["posts", "recipes", "comments", "communities"] as const;

type TabType = (typeof TABS)[number];

const TAB_LABELS: Record<TabType, string> = {
  posts: "Posts",
  recipes: "Recetas",
  comments: "Comentarios",
  communities: "Comunidades",
} as const;

export const SearchScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(true);

  const [tab, setTab] = useState<TabType>("posts");

  const inputRef = useRef<TextInput>(null);

  const { community, removeCommunity } = useRecentsStore();

  const [recents, setRecents] = useLocalStorage<Recents[]>("recentsIn", []);

  const removeRecents = (value: Recents) => {
    setRecents((prev) => prev.filter((recent) => recent.value !== value.value));
  };

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["search", query, tab, community?.id],

      queryFn: async ({ pageParam = 1 }) => {
        const response = await getGlobal(
          query,
          tab,
          pageParam as number,
          community?.id as string,
        );

        if (!response?.success || !response?.data) {
          throw new Error("Error en la respuesta");
        }

        return response as ResponseWithPagination<GlobalSearch[]>;
      },

      getNextPageParam: (lastPage) => {
        if (lastPage?.pagination?.hasMore) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,

      enabled: !isFocused && query.length > 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,

      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 30,
      retry: 3,
    });

  const dataFetch = data?.pages.flatMap((page) => page?.data ?? []) ?? [];

  console.log("dataFetch", JSON.stringify(dataFetch, null, 2));

  const handleSearch = () => {
    setRecents((prev) => [
      ...prev,
      { community: community || undefined, value: query },
    ]);
    setIsFocused(false);
    refetch();
  };

  const recentsData = useMemo(() => {
    if (community) {
      const communityRecents = recents.filter(
        (recent) => recent.community?.name === community.name,
      );

      return communityRecents;
    }
    return recents;
  }, [recents, community]);

  //console.log("recentsData", JSON.stringify(recentsData, null, 2));

  const renderItem = ({ item }: { item: GlobalSearch }) => {
    switch (tab) {
      case "posts": {
        const post = item as Post;

        return (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: ROUTES.USER.POST,
                params: {
                  post_id: post.id,
                  post_slug: post.slug,
                },
              });
            }}
            className="flex-row justify-between"
          >
            <View className="flex-col gap-y-1.5">
              <View className="flex-row items-center gap-x-2">
                <Image
                  className="w-10 h-10 rounded-full"
                  resizeMode="cover"
                  source={{ uri: post.community.image_url }}
                />
                <View className="flex-col">
                  <Text className="text-[14px] font-outfit-bold text-text-3">
                    c/{post.community?.name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[14px] font-outfit-light text-text-5">
                      {post.user?.name}
                    </Text>
                    <Text className="text-[14px] font-outfit-light text-text-4">
                      • {getShortTimeAgo(post?.created_at)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-[16px] font-outfit-bold text-text-3">
                {post.title}
              </Text>
              <View className="flex-row items-center gap-x-2">
                <Text className="text-[16px] font-outfit-light text-text-6">
                  {post.total_comments} comentarios
                </Text>
              </View>
            </View>
            {post.image_urls.length > 0 && (
              <View>
                <Image
                  className="w-20 h-20 rounded-[5px]"
                  resizeMode="cover"
                  source={{ uri: post.image_urls[0] }}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      }
      case "communities": {
        const community = item as Community;
        return (
          <View>
            {/* Asumo que Community tiene una propiedad "name" o "title" */}
            <Text>{community.name}</Text>
          </View>
        );
      }
      case "recipes": {
        const recipe = item as Recipe;
        return (
          <View>
            <Text>{recipe.id}</Text>
          </View>
        );
      }
      case "comments": {
        const comment = item as PostComment;
        return (
          <View>
            <Text>{comment.content}</Text>
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{ paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }}
      className="flex-1 bg-bg-semi-white flex-col gap-y-4"
    >
      {/** SECCION BUSCADOR */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row justify-between items-center gap-x-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#2F2F2F" />
        </TouchableOpacity>

        <Pressable
          onPress={() => inputRef.current?.focus()}
          className={`flex-1 flex-row items-center gap-x-2 rounded-full px-4 border bg-bg-gray ${
            isFocused ? "border-gray-600" : "border-gray-100"
          }`}
        >
          <Ionicons name="search" size={18} color="#878787" />

          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            className="text-text-5 font-outfit-light flex-1 tracking-wide"
            onSubmitEditing={() => {
              handleSearch();
            }}
            placeholder={
              community ? `Buscar en ${community.name}` : "Buscar en DualEat"
            }
            placeholderTextColor="#878787"
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#4A4947" />
            </TouchableOpacity>
          )}
        </Pressable>
      </View>

      {isFocused ? (
        <ScrollView
          style={{ gap: 50 }}
          className="flex-1 px-4 flex-col"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {community && (
            <View className="flex-row items-center gap-x-2">
              <Text className="text-text-5 font-outfit-light tracking-wide text-[12px]">
                Buscando en{" "}
              </Text>

              <View className="flex-row items-center gap-x-2 bg-bg-gray rounded-[5px] p-1.5 border border-gray-200">
                <Image
                  className="w-5 h-5 rounded-full"
                  source={{ uri: community.image_url }}
                />
                <Text
                  numberOfLines={1}
                  className="text-text-5 font-outfit-bold tracking-tight text-[12px]"
                >
                  {community.name}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    removeCommunity();
                  }}
                  hitSlop={{ bottom: 20, top: 20, left: 20, right: 20 }}
                >
                  <AntDesign name="close" size={10} color="#4A4947" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {recentsData.length > 0 && (
            <View className="flex-col gap-y-4">
              <Text className="text-text-5 font-outfit-bold tracking-wide text-[12px] mt-4">
                Recientes
              </Text>

              <View className="flex-col gap-y-4">
                {recentsData.map((recent: Recents, index: number) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-2"
                  >
                    <TouchableOpacity className="flex-row items-center flex-1 gap-x-3">
                      {recent.community ? (
                        <>
                          <Image
                            className="w-7 h-7 rounded-full"
                            source={{ uri: recent.community.image_url }}
                          />
                          <Text className="text-text-3 font-outfit-light tracking-tight text-[14px]">
                            {recent.community.name}
                          </Text>
                        </>
                      ) : (
                        <Octicons name="history" size={16} color="#212121" />
                      )}
                      <Text className="text-text-4 font-outfit-light tracking-tight text-[14px]">
                        {recent.value}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      hitSlop={{ bottom: 20, top: 20, left: 20, right: 20 }}
                      onPress={() => {
                        removeRecents(recent);
                      }}
                    >
                      <Fontisto name="close" size={14} color="#4A4947" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 flex-col gap-y-6">
          <ScrollView
            horizontal
            style={{ flexGrow: 0, flexShrink: 0 }}
            contentContainerStyle={{
              gap: 10,
            }}
            showsHorizontalScrollIndicator={false}
          >
            {TABS.map((t: TabType, index: number) => {
              if (t === "communities" && community) return null;

              return (
                <TouchableOpacity
                  key={index}
                  className={`px-4 py-2 rounded-full flex-col gap-y-0.5`}
                  onPress={() => {
                    setTab(t);
                    refetch();
                  }}
                >
                  <Text
                    className={`font-outfit-bold tracking-tight text-[16px]
                  ${tab === t ? "text-text-5" : "text-text-4"}`}
                  >
                    {TAB_LABELS[t]}
                  </Text>

                  {tab === t && (
                    <View
                      style={{ width: "100%", height: 3, borderRadius: 999 }}
                      className="bg-bg-semi-black"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <FlatList
            data={dataFetch}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-bg-black/10" />
            )}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="large" color="#4A4947" />
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};
