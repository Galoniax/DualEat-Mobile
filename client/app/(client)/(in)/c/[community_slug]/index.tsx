import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getBySlug } from "@/services/community.api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Community, Post, ResponseWithPagination } from "@/interface/global";
import { useCallback, useMemo, useRef, useState } from "react";
import PostCard from "@/components/features/post/PostCard";
import { useJoinLeave } from "@/hooks/api/useMyCommunities";
import { getCommunityPosts } from "@/services/post.api";
import { Feather } from "@expo/vector-icons";
import { ROUTES } from "@/constants/constants";
import { useRecentsStore } from "@/context/store/useRecents";

export default function CommunityScreen() {
  const { community_slug } = useLocalSearchParams();
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const { mutate: joinLeave } = useJoinLeave();
  const { setCommunity } = useRecentsStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    data: community,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["community", community_slug],
    queryFn: async () => {
      const response = await getBySlug(community_slug as string);
      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta de la comunidad");
      }
      return response.data as Community;
    },

    enabled: !!community_slug,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["posts", community?.id],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getCommunityPosts(
        community?.id as string,
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

    enabled: !!community?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 3,
  });

  const posts = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page?.data || [])
        .filter((post): post is Post => Boolean(post)) || []
    );
  }, [data]);

  const handleRefetch = useCallback(() => {
    refetch();
    refetchPosts();
  }, [refetch, refetchPosts]);

  const isMember = useMemo(() => {
    return community?.isMember || false;
  }, [community]);

  const Header = ({
    scrollY,
    type,
  }: {
    scrollY: Animated.Value;
    type: "Banner" | "Community";
  }) => {
    if (!community) return null;

    const blurOpacity = scrollY.interpolate({
      inputRange: [10, 50],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const buttonBgOpacity = scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: [0.5, 0],
      extrapolate: "clamp",
    });

    switch (type) {
      case "Banner":
        return (
          <View className="relative overflow-hidden" style={{ height: 100 }}>
            <Animated.Image
              source={{
                uri: community.banner_url || "https://placehold.co/100x100",
              }}
              style={[{ height: "100%", width: "100%", position: "absolute" }]}
              resizeMode="cover"
            />

            <Animated.Image
              source={{
                uri: community.banner_url || "https://placehold.co/100x100",
              }}
              blurRadius={20}
              style={[
                { height: "100%", width: "100%", position: "absolute" },
                { opacity: blurOpacity },
              ]}
              resizeMode="cover"
            />

            <View
              style={{
                paddingTop: insets.top / 2,
                paddingHorizontal: insets.left + insets.right + 12,
              }}
              className="flex-1 flex-row justify-between items-center z-10"
            >
              <View className="flex-row items-center gap-x-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="rounded-full p-1.5 items-center justify-center overflow-hidden"
                >
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "black",
                      opacity: buttonBgOpacity,
                    }}
                  />
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <Animated.View
                  pointerEvents="none"
                  style={[{ opacity: blurOpacity }]}
                >
                  <Text className="text-base font-outfit-bold text-text-1">
                    {community.name}
                  </Text>

                  <Text className="text-sm text-text-1 font-outfit-light">
                    {community.total_members} miembros
                  </Text>
                </Animated.View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setCommunity(community);
                  router.push(ROUTES.USER.COMMUNITY_SEARCH);
                }}
                className="rounded-full p-1.5 items-center justify-center overflow-hidden"
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "black",
                    opacity: buttonBgOpacity,
                  }}
                />
                <Feather name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case "Community":
        return (
          <View className="flex-col gap-y-4">
            <View className="flex-row gap-x-2 items-center justify-between">
              <View className="flex-row gap-x-3 items-center">
                <Image
                  source={{
                    uri: community.image_url,
                  }}
                  style={{ width: 46, height: 46 }}
                  className="rounded-full"
                  resizeMode="cover"
                />

                <View className="flex-col">
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-lg font-outfit-bold text-text-3"
                  >
                    {community.name}
                  </Text>
                  <Text className="text-sm text-text-4 font-outfit-light">
                    {community.total_members} miembros
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={() =>
                    joinLeave({
                      community,
                      join: !isMember,
                    })
                  }
                  className="ml-auto"
                >
                  <Text
                    className={`text-sm rounded-full px-2.5 py-1.5 font-outfit-bold ${
                      isMember
                        ? "bg-bg-semi-white text-text-3 border border-gray-600"
                        : "bg-bg-semi-black text-text-1"
                    }`}
                  >
                    {isMember ? "Te uniste" : "Unirse"}
                  </Text>
                </TouchableOpacity>

                {isMember && (
                  <TouchableOpacity className="flex-row items-center justify-center gap-x-2">
                    <Text className="text-[14px] text-text-5 font-outfit-light leading-6">
                      Notificaciones
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              className="flex-row gap-x-2"
            >
              <Text
                numberOfLines={isExpanded ? undefined : 2}
                className="text-sm text-text-5 font-outfit-light"
              >
                {community.description}
              </Text>
            </Pressable>

            {community.tags.length > 0 && (
              <View className="flex-row gap-x-2">
                {community.tags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    className="px-2 py-1 rounded-[5px] border border-gray-200"
                  >
                    <Text className="text-sm text-text-5 font-outfit-light">
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <View className="py-4">
        <PostCard post={item} type="COMMUNITY" />
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      className="flex-1 bg-bg-semi-white"
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e5a657" />
        </View>
      ) : (
        <>
          <Header scrollY={scrollY} type="Banner" />
          <Animated.FlatList
            data={posts}
            keyExtractor={(item: Post) => item.id}
            style={{
              flex: 1,
              paddingHorizontal: insets.left + insets.right + 12,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={handleRefetch}
                colors={["#e5a657"]}
              />
            }
            ListHeaderComponent={
              <View className="py-4">
                <Header scrollY={scrollY} type="Community" />
              </View>
            }
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <View className="border-t border-gray-200" />
            )}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-6 items-center justify-center">
                  <ActivityIndicator size="large" color="#e5a657" />
                </View>
              ) : null
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}
