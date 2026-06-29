import OrderView from "@/components/features/order/OrderView";
import { ErrorView } from "@/components/ui/feedback/ErrorView";

import { usePermissions } from "@/hooks/usePermissions";
import { Order, QROrderItem } from "@/interface/global";
import { getOrderById } from "@/services/order.api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

interface QROrderItemExt extends QROrderItem {
  p: number;
}

export default function OrderInfoScreen() {
  const { order_id } = useLocalSearchParams<{ order_id: string }>();
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<QROrderItemExt[]>([]);

  const background = require("@/assets/images/order_bg.webp");

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
      <ErrorView type={errorCode} onAction={() => router.back()} />
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
          source={background}
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

          {order && (
            <OrderView
              order={order}
              insets={insets}
              selected={selected}
              setSelected={setSelected}
              isCustomer={isCustomer}
            />
          )}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}
