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
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getBySlug } from "@/services/community.api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Community, Post, ResponseWithPagination } from "@/interface/global";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { StatusBar } from "expo-status-bar";
import PostCard from "@/components/features/post/PostCard";
import { useJoinLeave } from "@/hooks/api/useMyCommunities";
import { getCommunityPosts } from "@/services/post.api";
import { Entypo, Feather } from "@expo/vector-icons";

export default function CommunityScreen() {
  const headerHeight = useHeaderHeight();
  const { community_slug } = useLocalSearchParams();
  const router = useRouter();

  const { mutate: joinLeave } = useJoinLeave();

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
        "",
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

  const CommunityHeader = ({ scrollY }: { scrollY: Animated.Value }) => {
    if (!community) return null;

    const blurOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const titleOpacity = scrollY.interpolate({
      inputRange: [50, 120],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <View className="mb-4 flex-col gap-y-4 pb-4">
        <View className="relative overflow-hidden" style={{ height: 120 }}>
          {/* 1. Imagen Base (Nítida) */}
          <Animated.Image
            source={{ uri: community.image_url }}
            style={[{ height: 120, width: "100%", position: "absolute" }]}
            resizeMode="cover"
          />

          {/* 2. Imagen Borrosa */}
          <Animated.Image
            source={{ uri: community.image_url }}
            blurRadius={20}
            style={[
              { height: 120, width: "100%", position: "absolute" },
              { opacity: blurOpacity },
            ]}
            resizeMode="cover"
          />

          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
                zIndex: 5,
              },
              { opacity: titleOpacity },
            ]}
          >
            <Text className="text-[22px] font-dosis-bold text-white tracking-wide">
              {community.name}
            </Text>
          </Animated.View>

          <View
            className="absolute top-1/2 bottom-0 px-4 w-full flex-row justify-between items-center z-10"
            style={{ transform: [{ translateY: -20 }] }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ height: 40, width: 40 }}
              className="bg-black/60 rounded-full items-center justify-center"
            >
              <Entypo name="chevron-small-left" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ height: 40, width: 40 }}
              className="bg-black/60 rounded-full items-center justify-center"
            >
              <Feather name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row px-4 gap-x-2 items-center justify-between">
          <View className="flex-row gap-x-2 items-center">
            <Image
              source={{
                uri: community.image_url,
              }}
              style={{ width: 50, height: 50 }}
              className="rounded-full"
              resizeMode="cover"
            />

            <View className="flex-col">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-[18px] font-dosis-bold text-text-3 truncate"
              >
                {community.name}
              </Text>
              <Text className="text-[14px] text-text-4 font-dosis-regular">
                {community.total_members} miembros
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center">
            <TouchableOpacity
              style={{ borderRadius: 999 }}
              onPress={() =>
                joinLeave({
                  community: community as Community,
                  join: !isMember,
                })
              }
              disabled={isFetching || isLoading}
              className={`flex-row items-center px-3 py-1 justify-center gap-x-2 ${isMember ? "bg-bg-semi-white" : "bg-bg-blue-black"}`}
            >
              <Text
                className={`text-[14px]  font-dosis-semibold leading-6 ${isMember ? "text-text-5" : "text-text-1"}`}
              >
                {isMember ? "Te uniste" : "Unirse"}
              </Text>
            </TouchableOpacity>

            {isMember && (
              <TouchableOpacity className="flex-row items-center justify-center gap-x-2">
                <Text className="text-[14px] text-text-5 font-dosis-regular leading-6">
                  Notificaciones
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row px-8 gap-x-2"
        >
          <Text
            numberOfLines={isExpanded ? undefined : 1}
            className="text-[14px] text-text-5 font-dosis-regular leading-6"
          >
            {community.description}
          </Text>
        </Pressable>

        {community.tags.length > 0 && (
          <View className="flex-row px-8 gap-x-2">
            <Text className="text-[14px] text-text-5 font-dosis-regular leading-6">
              {community.tags.join(", ")}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView
        edges={["left", "right"]}
        style={{ paddingTop: headerHeight }}
        className="flex-1 bg-bg-semi-white"
      >
        {isLoading ? (
          <View className="flex-1 mt-10 items-center justify-center">
            <ActivityIndicator size={32} color="#3578e4" />
          </View>
        ) : (
          <FlashList
            data={posts}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, flexGrow: 1 }}
            scrollEnabled={true}
            horizontal={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[0]}
            ListHeaderComponent={<CommunityHeader scrollY={scrollY} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View className="flex-1 px-6">
                <PostCard post={item} type="COMMUNITY" />
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={handleRefetch}
                colors={["#e5a657"]}
              />
            }
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
        )}
      </SafeAreaView>
    </>
  );
}
