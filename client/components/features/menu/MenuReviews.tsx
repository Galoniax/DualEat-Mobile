import { MenuLocal } from "@/app/(client)/(out)/l/[local_id]/[local_slug]";
import { LocalReview, ResponseWithPagination } from "@/interface/global";
import { getLocalReviews } from "@/services/discovery.api";
import { getShortTimeAgo } from "@/utils/date";
import { useInfiniteQuery } from "@tanstack/react-query";
import { JSX, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { EdgeInsets, SafeAreaView } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";

export default function MenuReviews({
  local,
  insets,
}: {
  local: MenuLocal;
  insets: EdgeInsets;
}) {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["local_reviews", local.id],

      queryFn: async ({ pageParam = 1 }) => {
        const response = await getLocalReviews(
          local.id as string,
          pageParam as number,
        );

        if (!response?.success || !response?.data) {
          throw new Error("Error en la respuesta de los posts");
        }

        return response as ResponseWithPagination<{
          reviews: LocalReview[];
          total: number;
        }>;
      },

      getNextPageParam: (lastPage) => {
        if (lastPage?.pagination?.hasMore) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,

      enabled: !!local.id,
      refetchOnMount: true,
      refetchOnWindowFocus: true,

      staleTime: 1000 * 60 * 20,
      gcTime: 1000 * 60 * 60,
      retry: 3,
    });

  const reviews = data?.pages.flatMap((page) => page.data?.reviews ?? []) ?? [];
  const total = data?.pages[0].data?.total ?? 0;

  const stars = (rating: number, size = 20): JSX.Element[] => {
    return Array.from({ length: 5 }, (_, index) => {
      if (rating >= index + 1) {
        return (
          <Svg key={index} height={size} width={size} viewBox="0 0 640 640">
            <Path
              fill="#4A4947"
              d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"
            />
          </Svg>
        );
      } else if (rating >= index + 0.5) {
        return (
          <Svg key={index} height={size} width={size} viewBox="0 0 640 640">
            <Path
              fill="#4A4947"
              d="M320.1 417.6C330.1 417.6 340 419.9 349.1 424.6L423.5 462.5L410.5 380C407.3 359.8 414 339.3 428.4 324.8L487.4 265.7L404.9 252.6C384.7 249.4 367.2 236.7 357.9 218.5L319.9 144.1L319.9 417.7zM489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32C329.2 32 337.5 37.1 341.6 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553z"
            />
          </Svg>
        );
      } else {
        return (
          <Svg key={index} height={size} width={size} viewBox="0 0 640 640">
            <Path
              fill="#4A4947"
              d="M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"
            />
          </Svg>
        );
      }
    });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = useCallback(({ item }: { item: LocalReview }) => {
    return (
      <View key={item.id} className="flex-col gap-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2">
            <Image
              source={{ uri: item?.user?.avatar_url }}
              className="w-6 h-6 rounded-full"
            />
            <Text className="text-text-3 text-[14px] font-dosis-bold">
              {item?.user?.name}
            </Text>
          </View>
          <Text className="text-text-5 text-[14px] font-dosis-regular">
            {getShortTimeAgo(item?.created_at || "N/A", true)}
          </Text>
        </View>
        <View className="flex-row items-center gap-x-1">
          {stars(item.rating, 16)}
        </View>

        {item.order?.order_items && item.order.order_items.length > 0 && (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{
              gap: 8,
              alignItems: "center",
            }}
          >
            {item.order.order_items.map((orderItem, index) => {
              const isLast =
                item.order?.order_items?.length === index + 1 ?? true;

              return (
                <View
                  key={orderItem.food.id}
                  className="flex-row items-center gap-x-2 rounded-full"
                >
                  <Image
                    source={{ uri: orderItem.food.image_url }}
                    className="w-5 h-5 rounded-full"
                    resizeMode="cover"
                  />
                  <Text className="text-text-5 text-[12px] font-dosis-regular">
                    {orderItem.food.name}
                  </Text>
                  {!isLast && (
                    <Text className="font-dosis-regular text-text-5">|</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        <Text
          ellipsizeMode="tail"
          numberOfLines={2}
          className="text-text-6 text-[14px] font-dosis-medium leading-6"
        >
          {item?.comment}
        </Text>
      </View>
    );
  }, []);

  const ListHeaderComponent = () => {
    return (
      <View className="flex-col gap-y-0.5 my-4">
        <View className="flex-row items-center justify-start gap-x-2">
          <Text className="text-text-3 text-[26px] font-dosis-bold">
            {local?.average_rating?.toFixed(2) || 0}
          </Text>
          <View className="flex-row items-center gap-x-1">
            {stars(local?.average_rating || 0, 22)}
          </View>
        </View>

        <Text className="text-text-5 text-[14px] font-dosis-bold mb-4">
          {total} opiniones
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={["bottom", "right", "left"]}
      className="flex-1 bg-bg-semi-white"
    >
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#B53325" />
        </View>
      ) : (
        reviews && (
          <FlatList
            data={reviews}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={
              <View className="flex-col items-center justify-center h-full">
                <Text className="text-text-3 text-[15px] font-dosis-bold">
                  No hay reseñas
                </Text>
              </View>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="flex-row justify-center py-4">
                  <ActivityIndicator size="small" color="#B53325" />
                </View>
              ) : null
            }
            contentContainerStyle={{
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: insets.right + insets.left + 12,
            }}
          />
        )
      )}
    </SafeAreaView>
  );
}
