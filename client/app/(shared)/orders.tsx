import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Feather from "@expo/vector-icons/Feather";
import { useCallback, useState } from "react";
import { getUserOrders } from "@/services/order.api";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Order, ResponseWithPagination } from "@/interface/global";
import { useFocusEffect, useRouter } from "expo-router";
import { FlatList } from "react-native-gesture-handler";
import { showToast } from "@/utils/toast";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatPrice } from "@/utils/distance";
import {
  ORDER_STATUS_DICT,
  ROUTES,
  STATUS_COLORS,
} from "@/constants/constants";

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const filter = {
    completados: false,
    cancelados: false,
  };

  type FilterKey = keyof typeof filter;

  const FILTER_OPTIONS: { name: string; key: FilterKey }[] = [
    { name: "Completados", key: "completados" },
    { name: "Cancelados", key: "cancelados" },
  ];

  const [filters, setFilters] = useState<typeof filter>(filter);

  const toggleFilter = (key: keyof typeof filter) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
    isLoading,
  } = useInfiniteQuery<ResponseWithPagination<Order>>({
    queryKey: ["userOrders"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getUserOrders(pageParam as number);

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

  let filtered = orders;

  if (filters.completados) {
    filtered = filtered.filter((order) => order.status === "COMPLETED");
  }

  if (filters.cancelados) {
    filtered = filtered.filter((order) => order.status === "CANCELED");
  }

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => {
      console.log(JSON.stringify(item.status, null, 2));

     
      return (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: ROUTES.SHARED.ORDER_INFO,
              params: {
                order_id: item.id,
              },
            });
          }}
          className="px-2 py-4 mb-2 flex-row gap-4 items-stretch border border-dashed border-gray-400 rounded-lg"
        >
          <View className="gap-2">
            <Image
              source={{ uri: item.local?.image_url || undefined }}
              className="w-12 h-12 rounded-[5px]"
            />
            {item.status === "PAID" && item.short_code && (
              <TouchableOpacity
                className={`bg-bg-semi-black py-3 rounded-[5px] items-center`}
              >
                <Ionicons name="qr-code-sharp" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-1 flex-col gap-0.5">
            <View className="flex-row items-end gap-2">
              <Text
                className={`text-[12px] font-dosis-bold 
                ${STATUS_COLORS[item.status]}`}
              >
                {ORDER_STATUS_DICT[item.status] || "Desconocido"}
              </Text>

              <Text className="text-text-3 text-[11px] font-dosis-medium">
                {format(
                  new Date(item?.delivery_date || item.created_at),
                  "EEE d MMM '•' HH:mm'hs'",
                  {
                    locale: es,
                  },
                )}
              </Text>
              {item.short_code && item.status === "PAID" && (
                <Text className="text-text-3 text-[11px] font-dosis-bold">
                  Código: {item.short_code || "N/A"}
                </Text>
              )}
            </View>
            <Text
              className="text-[16px] font-dosis-bold text-text-3 mt-1 max-w-[70%] text-ellipsis overflow-hidden"
              numberOfLines={2}
            >
              {item.local?.name || "Local desconocido"}
              {item.local?.address ? ` - ${item.local.address}` : ""}
            </Text>

            <Text
              className="text-[13px] font-dosis-regular text-text-3"
              numberOfLines={1}
            >
              {item._count?.order_items} artículos
            </Text>

            <View className="flex-row items-center gap-1 mt-1">
              <FontAwesome name="star" size={10} color="#2F2F2F" />
              <Text
                className="text-[11px] font-dosis-bold text-text-3"
                numberOfLines={1}
              >
                {item.review?.rating || "Sin calificar"}
              </Text>
            </View>
          </View>
          <Text className="text-[17px] absolute right-4 top-1/2 -translate-y-1/2 font-dosis-bold text-text-3">
            {formatPrice(item.total)}
          </Text>
        </TouchableOpacity>
      );
    },
    [router],
  );

  if (isError) {
    showToast(
      "error",
      error?.message || "Error obteniendo tus pedidos",
      "Error",
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-semi-white h-full">
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="w-full flex-row  items-center justify-around py-4"
      >
        <Text className="text-[16px] font-dosis-bold">Tus pedidos</Text>
        <TouchableOpacity
          className="w-[40px] h-[40px] absolute right-4"
          onPress={() => {}}
        >
          <Feather name="shopping-cart" size={18} color="#4A4947" />
        </TouchableOpacity>
      </View>

      {/** FILTROS */}
      <View className="w-full flex-row items-center justify-start gap-4 px-4 py-2 mb-2">
        <View className="flex-row items-center gap-x-3">
          <Ionicons name="options-sharp" size={16} color="black" />
          <Text className="text-[13px] font-dosis-bold text-text-3">
            Filtros
          </Text>
        </View>

        {FILTER_OPTIONS.map((option) => {
          const isActive = filters[option.key];

          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => toggleFilter(option.key)}
              className={`py-1 px-4 rounded-full ${
                isActive ? "bg-bg-semi-black border-white border" : " "
              }`}
            >
              <Text
                className={`text-[13px] font-dosis-bold ${
                  isActive ? "text-white" : "text-gray-700"
                }`}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/** LISTA DE ORDENES */}
      <View className="flex-1">
        {isLoading ? (
          <ActivityIndicator size={24} color="#3578e4" className="mt-10" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={renderOrderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
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
              <View className="flex-1 justify-center items-center flex-row gap-2 mt-10">
                <MaterialCommunityIcons
                  name="book-remove-multiple-outline"
                  size={20}
                  color="black"
                />
                <Text className="text-center text-text-3 text-[14.5px] font-dosis-medium">
                  Aún no tienes órdenes.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
