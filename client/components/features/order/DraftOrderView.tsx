import { useQuery } from "@tanstack/react-query";
import { getCartInfo } from "@/services/order.api";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { useLoader } from "@/context/app/LoadingContext";
import { Local, QROrderPayload } from "@/interface/global";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { ErrorType, ErrorView } from "../../ui/feedback/ErrorView";
import { ROUTES } from "@/constants/constants";
import { formatPrice } from "@/utils/distance";
import { MenuFood } from "../menu/MenuScreen";
import { EdgeInsets } from "react-native-safe-area-context";
import { usePermissions } from "@/hooks/usePermissions";

interface Props {
  tempOrder: QROrderPayload;
  insets: EdgeInsets;
}

interface CartPayload {
  items: MenuFood[];
  local: Local;
}

export default function DraftOrderView({ tempOrder, insets }: Props) {
  const { setType } = useLoader();

  const itemsIDs = tempOrder.i.map((item) => item.id) || [];
  const localId = tempOrder.l;

  const { isStaff } = usePermissions(localId);

  const {
    data: order,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart", localId, itemsIDs],

    queryFn: async () => {
      if (!localId || !itemsIDs.length)
        throw new Error("Datos no proporcionados", { cause: 400 });

      const response = await getCartInfo(itemsIDs, localId);

      console.log(response?.data);

      if (!response || !response.success) {
        throw new Error(response?.message || "Error del servidor", {
          cause: response?.status || 500,
        });
      }

      return response.data;
    },

    enabled: itemsIDs.length > 0 && !!localId,

    refetchOnReconnect: true,
    refetchInterval: 2 * 60 * 1000,
  });

  const errorCode = (() => {
    if (!isStaff) return 403;
    if (!tempOrder) return 404;
    if (isError) return error.cause || 500;
    return null;
  })();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (isLoading || isFetching) {
      setType("minimal");
    } else {
      setType(null);
    }
    return () => setType(null);
  }, [isLoading, setType, isFetching]);

  const getQuantity = useMemo(() => {
    const map: Record<string, number> = {};

    if (tempOrder?.i) {
      tempOrder.i.forEach((item) => {
        map[item.id] = item.q;
      });
    }

    return map;
  }, [tempOrder?.i]);

  const renderItem = useCallback(
    ({ item }: { item: CartPayload["items"][0] }) => (
      <View className="flex-row justify-between gap-3 mb-4">
        <Image
          source={{ uri: item.image_url }}
          style={{
            width: 35,
            height: "100%",
            resizeMode: "cover",
            borderRadius: 3,
          }}
        />
        <View className="flex-col flex-1 justify-between">
          <Text className="text-text-3 text-[14.5px] font-dosis-semibold">
            {item.name}
          </Text>

          <Text className="text-text-3 text-[16px] font-dosis-bold mb-1">
            {formatPrice(item.price)}
          </Text>
          <Text
            className="text-text-4 text-[13px] font-dosis-regular"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item.description}
          </Text>
        </View>

        <Text className="text-text-3 text-[16px] font-dosis-bold">
          {getQuantity[item.id]}x
        </Text>
      </View>
    ),
    [getQuantity],
  );

  if (errorCode) {
    return (
      <ErrorView type={errorCode as ErrorType} onAction={() => router.back()} />
    );
  }

  return (
    <View
      style={{
        paddingTop: 20,
        paddingHorizontal: insets.left + insets.right + 20,
        height: "100%",
        marginTop: 150,
      }}
      className="bg-bg-semi-white  w-full rounded-t-3xl"
    >
      {/** Header */}
      <View className="flex-row items-center w-full justify-between border-b border-dashed border-gray-300 pb-6">
        <View className="flex-row items-start gap-4 flex-1">
          <Image
            source={{ uri: order?.local.image_url }}
            style={{
              width: 40,
              height: 40,
              resizeMode: "cover",
              borderRadius: 5,
            }}
          />

          {/*
          <View className="flex-col flex-1">
            <View className="flex-row items-end gap-2">
              

              <Text className="text-text-3 text-[11px] font-dosis-medium">
                {format(
                  new Date(order?.delivery_date || order.created_at),
                  "EEE d MMM '•' HH:mm'hs'",
                  { locale: es },
                )}
              </Text>

              {order.short_code && order.status === "PAID" && (
                <Text className="text-text-3 text-[11px] font-dosis-bold">
                  Código: {order.short_code || "N/A"}
                </Text>
              )}
            </View>

            <Text
              style={{ fontSize: 20 }}
              className="font-dosis-bold text-text-3 mt-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {order.local?.name || "Local desconocido"}
              {order.local?.address ? ` - ${order.local.address}` : ""}
            </Text>
          </View>
          */}
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: ROUTES.USER.LOCAL,
              params: { local_id: order.local.id, local_slug: order.local.slug},
            });
          }}
        >
          <Text className="font-dosis-bold">Ir al local</Text>
        </TouchableOpacity>
      </View>

      {/** Order Items */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-dosis-bold text-text-3 text-[20px]">
            Previsualización del pedido
          </Text>
        </View>

        <FlatList
          data={order?.items}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          className="mt-6"
        />
      </View>

      {/** Order Info */}
      <View className="mt-8 border-t border-gray-300 pt-4 flex-row items-center justify-between">
        <Text className="font-dosis-bold text-text-3 text-[15px]">Total</Text>

        <Text className="font-dosis-bold text-text-3 text-[15px]">
          {formatPrice(order?.items.reduce((acc, item) => acc + item.price, 0))}
        </Text>
      </View>
    </View>
  );
}
