import { View, ActivityIndicator, RefreshControl } from "react-native";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getAll } from "@/services/post.api";
import { Post, ResponseWithPagination } from "@/interface/global";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { FlatList } from "react-native-gesture-handler";
import PostCard from "@/components/features/post/PostCard";

import { useHeaderHeight } from "@react-navigation/elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
    isLoading,
  } = useInfiniteQuery<ResponseWithPagination<Post>>({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAll(pageParam as number);

      if (!response) throw new Error("Error obteniendo las órdenes");
      return response as ResponseWithPagination<Post>;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 3,
  });

  const posts =
    data?.pages
      .flatMap((page) => page?.data || [])
      .filter((post): post is Post => Boolean(post)) || [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <View className="flex-1 px-6">
        <PostCard post={item} />
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ paddingTop: headerHeight }}
      className="flex-1 bg-bg-semi-white"
    >
      {isLoading ? (
        <ActivityIndicator size={24} color="#3578e4" className="mt-10" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={["#e5a657"]}
            />
          }
          contentContainerStyle={{ paddingTop: insets.top - 10, paddingBottom: insets.bottom + 20 }}
          renderItem={({ item }) => renderItem({ item })}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color="#3578e4"
                className="my-4"
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
