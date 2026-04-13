import { Order, OrderItem, QROrderItem } from "@/interface/global";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/services/order.api";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatPrice } from "@/utils/distance";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EdgeInsets } from "react-native-safe-area-context";
import {
  ORDER_STATUS_DICT,
  ROUTES,
  STATUS_COLORS,
} from "@/constants/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { useLoader } from "@/context/app/LoadingContext";
import { ErrorType, ErrorView } from "../../ui/feedback/ErrorView";
import { usePermissions } from "@/hooks/usePermissions";
import { getFoods } from "@/services/menu.api";
import { MenuFood, MenuLocal } from "../menu/MenuScreen";

interface Props {
  order_id: string;
  insets: EdgeInsets;
  selected: QROrderItem[];
  setSelected: React.Dispatch<React.SetStateAction<QROrderItem[]>>;
}

export default function OrderView({
  order_id,
  insets,
  selected,
  setSelected,
}: Props) {
  const { setType } = useLoader();
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({
    tuPedido: true,
    menuAdicional: true,
  });

  const [addFoods, setAddFoods] = useState(false);

  console.log(isExpanded);

  const toggleList = (listName: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [listName]: !prev[listName],
    }));
  };

  const {
    data: order,
    isLoading,
    error,
    refetch,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["order-id", order_id],

    enabled: !!order_id,
    queryFn: async () => {
      if (!order_id)
        throw new Error("No se proporciono un id de orden", { cause: 400 });

      const response = await getOrderById(order_id);

      //console.log("Order Data:", JSON.stringify(response, null, 2));

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

  const {
    data: foods,
    isLoading: isLoadingFoods,
    error: errorFoods,
    isError: isErrorFoods,
  } = useQuery({
    queryKey: ["local", "by-id", order?.local_id],
    enabled: !!order?.local_id && addFoods,

    queryFn: async () => {
      const response = await getFoods(order?.local_id || "");

      if (!response || !response.success) {
        throw new Error(response?.message || "Error al obtener la orden", {
          cause: response?.status,
        });
      }

      return response.data as MenuLocal;
    },

    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  //console.log("Foods", JSON.stringify(foods, null, 2));

  const { isStaff, isCustomer } = usePermissions(
    order?.local?.id,
    order?.user_id,
  );

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

  const handleAddFood = (food: MenuFood, isDelete: boolean) => {
    setSelected((prev) => {
      if (isDelete) {
        return prev.filter((f) => f.id !== food.id);
      }

      const index = prev.findIndex((f) => f.id === food.id);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], q: updated[index].q + 1 };
        return updated;
      }

      return [...prev, { id: food.id, q: 1 }];
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: OrderItem }) => (
      <View className="flex-row justify-between gap-3 mb-4">
        <Image
          source={{ uri: item.food.image_url }}
          style={{
            width: 30,
            height: "60%",
            resizeMode: "cover",
            borderRadius: 3,
          }}
        />
        <View className="flex-col flex-1 justify-between">
          <Text className="text-text-3 text-[14.5px] font-dosis-semibold">
            {item.food.name}
          </Text>

          <Text className="text-text-3 text-[15.5px] font-dosis-bold mb-1">
            {formatPrice(item.unit_price)}
          </Text>
          <Text
            className="text-text-4 text-[12.5px] font-dosis-regular"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item.food.description}
          </Text>
        </View>

        <Text className="text-text-3 text-[16px] font-dosis-bold">
          {item.quantity}x
        </Text>
      </View>
    ),
    [],
  );

  const renderFoodItem = useCallback(
    ({ item }: { item: MenuFood }) => {
      if (!item.available) return null;

      const selectedItem = selected.find((f) => f.id === item.id);

      return (
        <View className="flex-row items-center w-full mb-2 gap-2">
          <TouchableOpacity
            onPress={() => handleAddFood(item, false)}
            style={{ gap: 10 }}
            className={`my-2 rounded-[2px] px-3 flex-row items-center flex-1`}
          >
            <View className="flex-col flex-1">
              <Text className={`font-dosis-bold text-[14px] text-text-3`}>
                {item.name}
              </Text>

              <Text
                style={{ fontSize: 12 }}
                className={`font-dosis-regular text-text-6`}
              >
                {item.description}
              </Text>
            </View>

            <View className="flex-row items-center justify-end gap-3">
              {selectedItem ? (
                <>
                  <Text className="font-dosis-bold text-[14px] text-text-3">
                    (x{selectedItem.q})
                  </Text>
                  <Text
                    style={{ fontSize: 14 }}
                    className="tracking-[-0.5px] font-dosis-bold text-text-3"
                  >
                    {formatPrice(item.price * selectedItem?.q)}
                  </Text>
                </>
              ) : (
                <Text
                  style={{ fontSize: 14 }}
                  className={`tracking-[-0.5px] font-dosis-bold text-text-3`}
                >
                  {formatPrice(item.price)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {selectedItem && (
            <TouchableOpacity
              onPress={() => handleAddFood(item, true)}
              className="p-2 bg-bg-red rounded-[5px] justify-center items-center"
            >
              <Feather name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  );

  const flatFoods = useMemo(() => {
    if (!foods?.categories) return [];

    return foods.categories
      .flatMap((category) => category.foods)
      .filter((food) => food.available !== false);
  }, [foods?.categories]);

  const errorCode = (() => {
    if (!order) return 404;
    if (!isStaff && !isCustomer) return 403;
    if (isError) return error.cause || 500;
    return null;
  })();

  if (errorCode || !order) {
    return (
      <ErrorView type={errorCode as ErrorType} onAction={() => router.back()} />
    );
  }

  /** Actions (User) */
  const toReview =
    isCustomer && order.review?.rating === null && order.status === "COMPLETED";
  const toShowQR = isCustomer && order.short_code && order.status === "PAID";

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
      <View className="flex-row items-center w-full justify-between border-b border-dashed border-gray-300 pb-6">
        <View className="flex-row items-start gap-4 flex-1">
          <Image
            source={{ uri: order.local.image_url }}
            style={{
              width: 40,
              height: 40,
              resizeMode: "cover",
              borderRadius: 5,
            }}
          />

          <View className="flex-col flex-1">
            <View className="flex-row items-end gap-2">
              <Text
                className={`text-[12px] font-dosis-bold ${STATUS_COLORS[order.status]}`}
              >
                {ORDER_STATUS_DICT[order.status] || "Desconocido"}
              </Text>

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
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: ROUTES.USER.LOCAL,
              params: {
                slug: order.local?.slug,
              },
            });
          }}
        >
          <Text className="font-dosis-bold">Ir al local</Text>
        </TouchableOpacity>
      </View>

      <View className="my-4 border-b border-dashed border-gray-300 pb-4">
        {toShowQR && (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: ROUTES.USER.QR,
              });
            }}
            className="bg-bg-semi-black py-3 rounded-[5px] justify-center items-center flex-row gap-2"
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text className="text-white font-dosis-bold">Mostrar QR</Text>
          </TouchableOpacity>
        )}

        {!toShowQR && toReview && (
          <TouchableOpacity className="bg-bg-yellow py-3 rounded-[5px] justify-center items-center flex-row gap-2">
            <Text className="text-white font-dosis-bold">Escribir reseña</Text>
          </TouchableOpacity>
        )}

        {!toShowQR &&
          !toReview &&
          isCustomer &&
          (order.status === "PENDING" || order.status === "READY") && (
            <TouchableOpacity
              disabled={addFoods}
              onPress={() => setAddFoods(true)}
              className={`flex-row items-center justify-center  ${addFoods ? "bg-[#33333380]" : "bg-bg-semi-black"} gap-x-2 py-3 rounded-[5px]`}
            >
              <MaterialCommunityIcons
                name="invoice-plus-outline"
                size={16}
                color="#fff"
              />
              {isLoadingFoods ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-text-1 font-dosis-bold text-[13px]">
                  Agregar más items
                </Text>
              )}
            </TouchableOpacity>
          )}
      </View>

      <View style={{ gap: 20 }} className="mt-4 flex-col">
        <View>
          <Pressable
            onPress={() => {
              toggleList("tuPedido");
            }}
            className="flex-row items-center justify-between"
          >
            <Text className="font-dosis-bold text-text-3 text-[20px]">
              Tu pedido
            </Text>

            <Ionicons
              name={isExpanded["tuPedido"] ? "chevron-up" : "chevron-down"}
              size={18}
              color="#2F2F2F"
            />
          </Pressable>

          {isExpanded["tuPedido"] && (
            <FlatList
              data={order.order_items}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              className="mt-6"
            />
          )}
        </View>

        <View>
          {addFoods && (
            <View className="mb-6">
              <Pressable
                onPress={() => {
                  toggleList("menuAdicional");
                }}
                className="flex-row items-center justify-between py-2"
              >
                <Text className="font-dosis-bold text-text-3 text-[20px]">
                  Menú
                </Text>

                <Ionicons
                  name={
                    isExpanded["menuAdicional"] ? "chevron-up" : "chevron-down"
                  }
                  size={18}
                  color="#2F2F2F"
                />
              </Pressable>
              {foods && isExpanded["menuAdicional"] && (
                <FlatList
                  data={flatFoods}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id?.toString()}
                  renderItem={renderFoodItem}
                />
              )}
            </View>
          )}
        </View>
      </View>

      <View className="mt-8 border-t border-gray-300 pt-4 flex-row items-center justify-between">
        <Text className="font-dosis-bold text-text-3 text-[15px]">Total</Text>

        <Text className="font-dosis-bold text-text-3 text-[15px]">
          {formatPrice(order.total)}
        </Text>
      </View>
    </View>
  );
}
