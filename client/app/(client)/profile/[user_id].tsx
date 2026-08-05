import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  TextInput,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useAuth } from "@/context/auth/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getUserById, getUserSearch } from "@/services/auth.api";

import {
  Post,
  PostComment,
  Recipe,
  ResponseWithPagination,
  User,
} from "@/interface/global";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PostCard from "@/components/features/post/PostCard";
import { ROUTES } from "@/constants/constants";
import { ScanQrCode } from "lucide-react-native";

type GlobalSearch = Post | Recipe | PostComment;

const TABS = ["posts", "recipes", "comments", "reviews"] as const;

type TabType = (typeof TABS)[number];

const TAB_LABELS: Record<TabType, string> = {
  posts: "Posts",
  recipes: "Recetas",
  comments: "Comentarios",
  reviews: "Reseñas",
} as const;

export default function ProfileScreen() {
  const router = useRouter();

  const { user } = useAuth();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabType>("posts");

  const {
    data: userData,
    isLoading: userLoading,
    refetch: userFetch,
  } = useQuery({
    queryKey: ["user", user_id],
    queryFn: async () => {
      if (!user_id) return null;
      const response = await getUserById(user_id);
      if (!response?.success || !response?.data) {
        throw new Error("Error al obtener perfil del usuario");
      }
      return response.data as User;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!user_id,
  });

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["user-search", user_id, tab, query],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getUserSearch(
        String(user_id),
        query,
        tab,
        pageParam as number,
      );
      if (!response?.success || !response?.data) {
        throw new Error("Error en la búsqueda");
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
    enabled: !!user_id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const items =
    data?.pages
      .flatMap((page) => page.data || [])
      .filter((item): item is GlobalSearch => Boolean(item)) || [];

  const formatJoinedDate = (dateString?: Date | string) => {
    if (!dateString) return "---";
    const formatted = format(new Date(dateString), "MMMM 'de' yyyy", {
      locale: es,
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const isOwner = user?.id === user_id || user?.id === userData?.id;

  const renderHeader = () => {
    return (
      <View className="flex-col gap-y-6 mb-6">
        <View className="flex-col sm:flex-row justify-between items-start gap-y-4">
          <View className="flex-col gap-y-3">
            <Image
              source={{
                uri:
                  userData?.avatar_url ||
                  "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
              }}
              className="w-20 h-20 rounded-full border border-dashed border-gray-200"
            />

            <View className="flex-col gap-y-1">
              <Text className="text-2xl font-outfit-bold text-text-3">
                {userData?.name || "Usuario"}
              </Text>
              <Text className="text-base font-outfit-light text-text-6">
                @{userData?.slug || "usuario"}
              </Text>

              <View className="flex-row items-center gap-x-1.5">
                <Feather name="calendar" size={12} className="text-text-4" />
                <Text className="text-sm font-outfit-light text-text-5">
                  Se unió en {formatJoinedDate(userData?.created_at)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs & Search */}
        <View className="flex-col gap-y-4">
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {TABS.map((t) => {
                const active = tab === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTab(t)}
                    activeOpacity={0.8}
                    className="relative px-4 py-3 items-center justify-center"
                  >
                    <View className="flex-row gap-x-2 items-center">
                      {active && (
                        <Feather
                          name={
                            t === "posts"
                              ? "message-circle"
                              : t === "recipes"
                                ? "book"
                                : t === "comments"
                                  ? "message-square"
                                  : "star"
                          }
                          size={16}
                          className="text-text-4"
                        />
                      )}

                      <Text
                        className={`font-outfit-bold text-sm ${
                          active ? "text-text-3" : "text-text-6"
                        }`}
                      >
                        {TAB_LABELS[t]}
                      </Text>
                    </View>
                    {active && (
                      <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-text-3 rounded-full" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View className="w-full border border-gray-200 rounded-full px-3 py-1 flex-row items-center bg-white">
            <Feather name="search" size={18} color="#2F2F2F" className="mr-2" />
            <TextInput
              className="flex-1 text-sm py-1.5 font-outfit-light text-text-3"
              placeholder="Buscar"
              placeholderTextColor="#A3A3A3"
              defaultValue={query}
              onSubmitEditing={(e) => setQuery(e.nativeEvent.text)}
              onChangeText={(text) => {
                if (!text) setQuery("");
              }}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isFetching && items.length === 0) return null;

    return (
      <View className="flex-col items-center justify-center py-16 px-4">
        <Text className="font-outfit-bold text-lg text-text-3 text-center">
          No hay nada aquí todavía
        </Text>
        <Text className="font-outfit-light text-text-4 text-base text-center mt-1">
          Este usuario no ha publicado{" "}
          {tab === "posts"
            ? "posts"
            : tab === "recipes"
              ? "recetas"
              : tab === "comments"
                ? "comentarios"
                : "reseñas"}{" "}
          en su perfil.
        </Text>
      </View>
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: GlobalSearch;
    index: number;
  }) => {
    if (tab === "posts") {
      return (
        <View className="mb-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <PostCard
            post={item as Post}
            padding="px-4 py-2"
            showActions={false}
            type="HOME"
          />
        </View>
      );
    }

    if (tab === "recipes") {
      const recipe = item as Recipe;
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: ROUTES.USER.RECIPE,
              params: {
                recipe_id: recipe.id,
                recipe_slug: recipe.slug,
              },
            })
          }
          activeOpacity={0.8}
          style={{
            borderBottomWidth: index < items.length - 1 ? 1 : 0,
            borderBottomColor: "#f0eeec",
          }}
          className="flex-row gap-3 pb-3 mb-3 items-center"
        >
          <Image
            source={{
              uri: recipe.main_image || "https://placehold.co/100x100/png",
            }}
            className="w-12 h-12 rounded-[5px] object-cover"
          />

          <View className="flex-col flex-1 justify-center">
            <Text
              className="text-text-3 text-base font-outfit-bold"
              numberOfLines={1}
            >
              {recipe.name}
            </Text>

            <Text
              className="text-text-5 text-sm font-outfit-light"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {recipe.description}
            </Text>
          </View>

          {/* Right section for stats or action buttons */}
          {/*<View className="flex-row items-center gap-x-2">
            {isOwner ? (
              <View className="flex-row items-center gap-x-1.5">
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: ROUTES.USER.CREATE_RECIPE,
                      params: {
                        recipe_id: recipe.id,
                        is_edit: "true",
                      },
                    });
                  }}
                  activeOpacity={0.7}
                  className="p-1.5 rounded-lg border border-orange-200 bg-orange-50/50 justify-center items-center"
                >
                  <Feather name="edit-2" size={11} color="#e5a657" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // Delete logic
                  }}
                  activeOpacity={0.7}
                  className="p-1.5 rounded-lg border border-red-200 bg-red-50/55 justify-center items-center"
                >
                  <Feather name="trash-2" size={11} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center gap-x-2.5">
                {recipe.total_time && (
                  <View className="flex-row items-center gap-x-0.5">
                    <Feather name="clock" size={10} color="#707070" />
                    <Text className="text-[11px] font-outfit-light text-text-6">
                      {recipe.total_time}m
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center gap-x-0.5">
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={10}
                    color="#707070"
                  />
                  <Text className="text-[11px] font-outfit-light text-text-6">
                    {recipe.ingredients?.length || 0}
                  </Text>
                </View>
              </View>
            )}
          </View>*/}
        </TouchableOpacity>
      );
    }

    if (tab === "comments") {
      const comment = item as PostComment;
      return (
        <View className="bg-white border border-gray-200 rounded-[20px] p-5 mb-4 shadow-sm">
          <View className="flex-row flex-wrap items-center gap-x-1.5 mb-2">
            <Text className="text-[12px] font-outfit-light text-text-6">
              Comentó en
            </Text>
            <TouchableOpacity
              onPress={() =>
                comment.post &&
                router.push({
                  pathname: ROUTES.USER.POST,
                  params: {
                    post_id: comment.post.id,
                    post_slug: comment.post.slug,
                  },
                })
              }
            >
              <Text className="text-[12px] font-outfit-bold text-bg-blue underline">
                {comment.post?.title || "Post"}
              </Text>
            </TouchableOpacity>
            <Text className="text-[12px] font-outfit-light text-text-6">•</Text>
            <Text className="text-[12px] font-outfit-light text-text-6">
              {formatJoinedDate(comment.created_at)}
            </Text>
          </View>
          <Text className="text-text-3 text-[15px] font-outfit-light leading-relaxed">
            {comment.content}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="w-full flex-row items-center py-4 justify-center">
          <ActivityIndicator size="small" color="#e5a657" />
        </View>
      );
    }
    if (!hasNextPage && items.length > 0) {
      return (
        <View className="w-full flex-row items-center py-6 justify-center">
          <Text className="text-sm font-outfit-light text-text-6">
            No hay más contenido para mostrar
          </Text>
        </View>
      );
    }
    return <View className="h-6" />;
  };

  if (userLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-semi-white justify-center items-center">
        <ActivityIndicator size="large" color="#e5a657" />
      </SafeAreaView>
    );
  }

  const handleRefetch = () => {
    userFetch();
    refetch();
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "right", "top"]}
      className="flex-1 bg-bg-semi-white px-4"
    >
      <View
        style={{
          paddingVertical: insets.top / 2,
        }}
        className="flex-row items-center justify-between px-2 py-2"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-full"
        >
          <Entypo name="chevron-small-left" size={28} color="#2F2F2F" />
        </TouchableOpacity>

        {isOwner && (
          <View className="flex-row gap-x-6">
            <TouchableOpacity
              onPress={() => router.push(ROUTES.SHARED.CONFIGURATION)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="rounded-full"
            >
              <Feather name="settings" size={16} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(ROUTES.USER.QR_SCREEN)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="rounded-full"
            >
              <ScanQrCode size={16} color="#555" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={isFetching && !isFetchingNextPage}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            colors={["#e5a657"]}
            onRefresh={handleRefetch}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
