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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getBySlug } from "@/services/community.api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Community, Post, ResponseWithPagination } from "@/interface/global";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PostCard from "@/components/features/post/PostCard";
import { useJoinLeave } from "@/hooks/api/useMyCommunities";
import { getCommunityPosts } from "@/services/post.api";
import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BellOff, BellRing } from "lucide-react-native";
import { changeStatus } from "@/services/notification.api";

import { globalToast as toast } from "@/utils/toast";
import { useAuth } from "@/context/auth/AuthContext";
import { ROUTES } from "@/constants/constants";

export default function CommunityScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { community_slug } = useLocalSearchParams();
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const { mutate: joinLeave } = useJoinLeave();

  const [isExpanded, setIsExpanded] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const ref = useRef<BottomSheetModal>(null);

  const {
    data: community,
    isLoading,
    isFetching,
    error,
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
    isLoading: postsLoading,
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

  const { mutate: mutateNotification } = useMutation({
    mutationFn: async (type: "ALWAYS" | "NONE") => {
      if (!community) {
        return;
      }
      if (community.receives_notifications === type) {
        return;
      }
      const response = await changeStatus(community?.id, "member", type);

      if (!response.success || !response.data) {
        throw new Error("Error al cambiar estado de las notificaciones");
      }
      return response.data;
    },
    onMutate: async (type: "ALWAYS" | "NONE") => {
      const previous = queryClient.getQueryData(["community", community_slug]);
      queryClient.setQueryData(
        ["community", community_slug],
        (oldData: Community) => {
          return {
            ...oldData,
            receives_notifications: type,
          };
        },
      );
      return { previous };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["community", community?.id], data);
    },
    onError: (e: any, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["community", community?.id],
          context.previous,
        );
      }
      toast.error("Error", e.message || "Error al actualizar perfil");
    },
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

  const isMember = community?.isMember || false;
  const isModerator =
    community?.creator_id === user?.id || community?.is_moderator;

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

              <View className="flex-row items-center gap-x-4 justify-center">
                {isMember && (
                  <TouchableOpacity
                    onPress={() => {
                      ref.current?.present();
                    }}
                    className="rounded-full border border-dashed cursor-pointer border-gray-400 p-2.5 flex items-center justify-center"
                  >
                    {community?.receives_notifications === "NONE" ? (
                      <BellOff size={18} className="text-gray-800" />
                    ) : (
                      <BellRing size={18} className="text-gray-800" />
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    if (!community || community?.creator_id === user?.id)
                      return;
                    joinLeave({
                      community,
                      join: !isMember,
                    });
                  }}
                  className={`rounded-full cursor-pointer px-4 py-2 ${
                    isModerator
                      ? "bg-bg-red"
                      : isMember
                        ? "bg-white hover:bg-gray-100 border border-gray-400"
                        : "bg-bg-blue hover:bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-outfit-bold ${
                      isModerator
                        ? "text-white"
                        : isMember
                          ? "text-text-5"
                          : "text-white"
                    }`}
                  >
                    {isModerator
                      ? "Moderador"
                      : isMember
                        ? "Te uniste"
                        : "Unirse"}
                  </Text>
                </TouchableOpacity>
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

  useFocusEffect(
    useCallback(() => {
      return () => {
        ref.current?.forceClose();
      };
    }, [ref]),
  );
  
  useEffect(() => {
    if (error) {
      toast.error("Esta comunidad ya no existe");
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(ROUTES.USER.DASHBOARD("in"));
      }
    }
  }, [error, router]);

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
            ListEmptyComponent={
              postsLoading ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator size="large" color="#e5a657" />
                </View>
              ) : (
                <View className="py-12 items-center justify-center">
                  <Text className="text-base font-outfit-light text-text-4">
                    No hay publicaciones aún.
                  </Text>
                </View>
              )
            }
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

      <BottomSheetModal
        ref={ref}
        enablePanDownToClose
        enableOverDrag={false}
        enableDynamicSizing={true}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.7}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={{
          display: "none",
        }}
      >
        <BottomSheetView
          style={{ paddingBottom: insets.bottom + 16 }}
          className="flex-1 flex-col gap-y-4 p-4 items-center"
        >
          <Text className="text-sm font-outfit-light text-text-4">
            Elige si quieres recibir notificaciones sobre esta comunidad.
          </Text>

          {[
            {
              id: "ALWAYS",
              label: "Activadas",
              sublabel: "Recibirás las notificaciones de esta comunidad",
              icon: BellRing,
            },
            {
              id: "NONE",
              label: "Desactivadas",
              sublabel: "Desactiva las notificaciones de esta comunidad",
              icon: BellOff,
              hasDivider: true,
            },
          ].map((button) => {
            const isSelected = community?.receives_notifications === button.id;

            return (
              <TouchableOpacity
                key={button.id}
                onPress={() => {
                  if (!isSelected) {
                    mutateNotification(button.id as "ALWAYS" | "NONE");
                  }
                }}
                className={`w-full flex-row items-center gap-3.5 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-left`}
              >
                <button.icon size={20} color={"#4A4947"} />
                <View className="flex-col">
                  <Text className="text-sm font-medium text-text-3 leading-tight">
                    {button.label}
                  </Text>
                  <Text className="text-xs text-text-6 leading-tight">
                    {button.sublabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
