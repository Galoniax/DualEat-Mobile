import {
  ORDER_STATUS_DICT,
  ROUTES,
  STATUS_COLORS,
} from "@/constants/constants";
import { Order, OrderStatus, ResponseWithPagination } from "@/interface/global";
import { getUserOrders } from "@/services/order.api";
import { formatPrice } from "@/utils/distance";

import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { globalToast as toast } from "@/utils/toast";

type FilterKey = OrderStatus | "REVIEW";

export default function OrdersView() {
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  const [type, setType] = useState<FilterKey | undefined>(undefined);

  const FILTER_OPTIONS: { name: string; key: FilterKey }[] = [
    { name: "Pendientes", key: "PENDING" },
    { name: "Aún no retirados", key: "PAID" },
    { name: "Completados", key: "COMPLETED" },
    { name: "Sin reseña", key: "REVIEW" },
  ];

  const toggleFilter = (key: FilterKey) => {
    setType((prev) => (prev === key ? undefined : key));
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    refetch,
    isLoading,
  } = useInfiniteQuery<ResponseWithPagination<Order>>({
    queryKey: ["userOrders", type],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getUserOrders(
        pageParam as number,
        type as FilterKey,
      );

      if (!response) throw new Error("Error obteniendo las órdenes");
      return response as ResponseWithPagination<Order>;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const orders =
    data?.pages
      .flatMap((page) => page?.data || [])
      .filter((order): order is Order => Boolean(order)) || [];

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
    ({ item }: { item: Order }) => {
      return (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: ROUTES.USER.ORDER_INFO,
              params: {
                order_id: item.id,
              },
            });
          }}
          className="px-2 py-4 flex-row gap-x-4 border border-dashed border-gray-400 rounded-lg"
        >
          <Image
            source={{ uri: item.local?.image_url || undefined }}
            className="w-8 h-full rounded-[5px]"
            resizeMode="cover"
          />

          <View className="flex-1 flex-col gap-y-1">
            <View className="flex-row items-end gap-2">
              <Text
                style={{
                  color: STATUS_COLORS[item.status],
                }}
                className={`text-xs font-outfit-bold`}
              >
                {ORDER_STATUS_DICT[item.status] || "Desconocido"}
              </Text>

              <Text className="text-text-3 text-xs font-outfit-regular">
                {format(
                  new Date(item?.delivery_date || item.created_at),
                  "EEE d MMM '•' HH:mm'hs'",
                  {
                    locale: es,
                  },
                )}
              </Text>
              {item.short_code && item.status === "PAID" && (
                <Text className="text-text-3 text-xs font-outfit-bold">
                  Código: {item.short_code || "N/A"}
                </Text>
              )}
            </View>
            <Text
              className="text-lg font-outfit-bold text-text-3 text-ellipsis overflow-hidden"
              numberOfLines={1}
            >
              {item.local?.name || "Local desconocido"}
              {item.local?.address ? ` - ${item.local.address}` : ""}
            </Text>

            <Text
              className="text-sm font-outfit-light text-text-3"
              numberOfLines={1}
            >
              {item._count?.order_items} artículos
            </Text>

            <View className="flex-row items-center gap-1">
              <FontAwesome name="star" size={10} color="#2F2F2F" />
              <Text
                className="text-xs font-outfit-bold text-text-3"
                numberOfLines={1}
              >
                {item.review?.rating || "Sin calificar"}
              </Text>
            </View>
          </View>
          <Text className="text-lg absolute right-4 top-1/2 -translate-y-1/2 font-outfit-bold text-text-3">
            {formatPrice(item.total)}
          </Text>
        </TouchableOpacity>
      );
    },
    [router],
  );

  if (isError) {
    toast.error("Error obteniendo las órdenes");
  }

  return (
    <SafeAreaView
      style={{ paddingTop: headerHeight }}
      edges={["left", "right"]}
      className="flex-1 flex-col bg-bg-semi-white gap-y-2"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
        className="px-4 py-2 flex-grow-0"
      >
        <View className="flex-row items-center gap-x-3">
          <Ionicons name="options-sharp" size={16} color="black" />
          <Text className="text-xs font-outfit-bold text-text-3">Filtros</Text>
        </View>

        {FILTER_OPTIONS.map((option) => {
          const isActive = type === option.key;

          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => toggleFilter(option.key)}
              className={`py-1 px-4 rounded-full ${
                isActive ? "bg-bg-semi-black border-white border" : " "
              }`}
            >
              <Text
                className={`text-xs font-outfit-bold ${
                  isActive ? "text-white" : "text-text-5"
                }`}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={30} color="#B53325" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={["#B53325"]}
            />
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            gap: 10,
            flex: 1,
            flexGrow: 1,
          }}
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
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text className="text-text-3 text-base font-outfit-light">
                {type === "REVIEW"
                  ? "No hay órdenes pendientes de calificación."
                  : "Aún no tienes órdenes."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
