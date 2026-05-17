import DraftOrderView from "@/components/features/order/DraftOrderView";
import OrderView from "@/components/features/order/OrderView";
import { ErrorType, ErrorView } from "@/components/ui/feedback/ErrorView";

import { useOrderStore } from "@/context/store/useOrderStore";
import { usePermissions } from "@/hooks/usePermissions";
import { Order, QROrderItem } from "@/interface/global";
import { getOrderById } from "@/services/order.api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ImageBackground,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function OrderInfoScreen() {
  const { order_id } = useLocalSearchParams<{ order_id: string }>();
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<QROrderItem[]>([]);

  const isNew = order_id === "create";

  const tempOrder = useOrderStore((state) => state.tempOrder);

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order-id", order_id],

    enabled: !!order_id,
    queryFn: async () => {
      if (!order_id)
        throw new Error("No se proporciono un id de orden", { cause: 400 });

      const response = await getOrderById(order_id);

      console.log("Order Data:", JSON.stringify(response.data, null, 2));

      if (!response || !response.success) {
        throw new Error(response?.message || "Error al obtener la orden", {
          cause: response?.status,
        });
      }

      return response.data as Order;
    },

    retry: 2,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const { isStaff, isCustomer } = usePermissions(
    order?.local?.id,
    order?.user_id,
  );

  const errorCode = (() => {
    if (!order) return 404;
    if (!isStaff && !isCustomer) return 403;
    if (isError) return error.cause || 500;
    return null;
  })();

  if (errorCode && !isLoading) {
    return (
      <ErrorView type={errorCode as ErrorType} onAction={() => router.back()} />
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#B53325"]}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ImageBackground
          source={{
            uri: "https://hawksrestaurant.com/wp-content/uploads/2025/03/7B70150F-DAA9-4E5B-B40F-1F58BFC71E13.jpg",
          }}
          resizeMode="cover"
          className="flex-1 relative"
        >
          <View
            style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
            className="absolute inset-0"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ left: insets.left + 15, top: 40 }}
            className="absolute z-10 rounded-full p-2"
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>



          {isNew && tempOrder ? (
            <DraftOrderView tempOrder={tempOrder} insets={insets} />
          ) : (
            order && (
              <OrderView
                order={order}
                insets={insets}
                selected={selected}
                setSelected={setSelected}
                isStaff={isStaff}
                isCustomer={isCustomer}
              />
            )
          )}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}
// isLoading para order &&
