import { Food, Order, QROrderItem, QROrderPayload } from "@/interface/global";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatPrice } from "@/utils/distance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EdgeInsets } from "react-native-safe-area-context";
import {
  ORDER_STATUS_DICT,
  ROUTES,
  STATUS_COLORS,
} from "@/constants/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCallback, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { getFoods } from "@/services/menu.api";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useOrderStore } from "@/context/store/useOrderStore";
import { useAuth } from "@/context/auth/AuthContext";
import { ErrorView } from "@/components/ui/feedback/ErrorView";

interface QROrderItemExt extends QROrderItem {
  p: number;
}

interface Props {
  order: Order;
  insets: EdgeInsets;
  selected: QROrderItemExt[];
  setSelected: React.Dispatch<React.SetStateAction<QROrderItemExt[]>>;
  isCustomer: boolean;
}

export default function OrderView({
  order,
  insets,
  selected,
  setSelected,
  isCustomer,
}: Props) {
  const modalRef = useRef<BottomSheetModal>(null);

  const [isExpanded, setIsExpanded] = useState(true);
  const [addFoods, setAddFoods] = useState(false);

  const { setTempOrder } = useOrderStore();

  const { user } = useAuth();

  const {
    data: foods,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["local_foods", order?.local_id],
    enabled: !!order?.local_id && addFoods,

    queryFn: async () => {
      const response = await getFoods(order?.local_id || "");

      if (!response || !response.success) {
        throw new Error(response?.message || "Error al obtener la orden", {
          cause: response?.status,
        });
      }

      return response.data as Food[];
    },

    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  useFocusEffect(
    useCallback(() => {
      if (modalRef.current?.present) {
        setAddFoods(true);
      }

      return () => {
        modalRef.current?.close();
      };
    }, []),
  );

  const handleAddFood = (food: Food, isDelete: boolean) => {
    setSelected((prev) => {
      if (isDelete) {
        return prev.filter((f) => f.id !== food.id);
      }

      const index = prev.findIndex((f) => f.id === food.id);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          q: updated[index].q + 1,
          p: food.price,
        };
        return updated;
      }

      return [...prev, { id: food.id, q: 1, p: food.price }];
    });
  };

  const renderFoodItem = useCallback(
    ({ item }: { item: Food }) => {
      if (!item.available) return null;

      const selectedItem = selected.find((f) => f.id === item.id);

      return (
        <View className="flex-row items-center w-full mb-2 gap-2">
          <TouchableOpacity
            onPress={() => handleAddFood(item, false)}
            style={{ gap: 10 }}
            className={`my-2 px-3 flex-row items-center flex-1`}
          >
            <View className="flex-col flex-1">
              <Text className={`font-outfit-bold text-base text-text-3`}>
                {item.name}
              </Text>

              <Text
                ellipsizeMode="tail"
                numberOfLines={3}
                className={`font-outfit-light text-text-6 text-sm`}
              >
                {item.description}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              {selectedItem ? (
                <>
                  <Text className="font-outfit-bold text-sm text-text-3">
                    (x{selectedItem.q})
                  </Text>
                  <Text className="font-outfit-bold text-text-3 text-base">
                    {formatPrice(item.price * selectedItem?.q)}
                  </Text>
                </>
              ) : (
                <Text className={`font-outfit-bold text-text-3 text-base`}>
                  {formatPrice(item.price)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  );

  // ESTADOS
  const toReview =
    isCustomer && order.review === null && order.status === "COMPLETED";

  const toEditReview =
    isCustomer && order.review !== null && order.status === "COMPLETED";

  const toShowQR = isCustomer && order.short_code && order.status === "PAID";

  // TOTAL
  const itemCount = useMemo(
    () => order.order_items.reduce((acc, item) => acc + item.quantity, 0),
    [order],
  );

  const itemCost = useMemo(
    () => selected.reduce((acc, item) => acc + item.p * item.q, 0),
    [selected],
  );

  if (order.user_id !== user?.id) {
    return (
      <ErrorView
        type={error?.cause || 403}
        title="No autorizado"
        message="No tienes permiso para ver esta orden. Asegúrate de estar en la cuenta correcta."
        actionLabel="Volver"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <View
      style={{
        paddingTop: 24,
        paddingHorizontal: insets.left + insets.right + 20,
        paddingBottom: insets.bottom + 16,
        flex: 1,
        marginTop: 120,
      }}
      className="bg-bg-semi-white w-full rounded-t-3xl flex-col gap-y-6"
    >
      {/* HEADER */}
      <View className="flex-col gap-y-4">
        <View className="flex-row gap-4 items-center w-full">
          <Image
            source={{ uri: order.local.image_url }}
            style={{
              width: 52,
              height: 52,
              resizeMode: "cover",
            }}
            className="rounded-[5px]"
          />

          <View className="flex-col flex-1 gap-y-1">
            <Text
              className="font-outfit-bold text-text-3 text-xl"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {order.local?.name || "Local desconocido"}
            </Text>

            {order.local?.address && (
              <Text
                className="text-text-5 text-xs font-outfit-regular"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {order.local.address}
              </Text>
            )}
          </View>

          {/* STATUS */}
          <View
            style={{
              backgroundColor: STATUS_COLORS[order.status] || "#888",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text className="text-white text-xs font-outfit-bold">
              {ORDER_STATUS_DICT[order.status] || "Desconocido"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-bg-gray rounded-[5px] px-2 py-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={14} color="#78716c" />
            <Text className="text-text-5 text-xs font-outfit-regular">
              {format(
                new Date(order?.delivery_date || order.created_at),
                "EEE d MMM '•' HH:mm'hs'",
                { locale: es },
              )}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Ionicons name="bag-outline" size={14} color="#78716c" />
            <Text className="text-text-5 text-xs font-outfit-regular">
              {itemCount} {itemCount === 1 ? "producto" : "productos"}
            </Text>
          </View>

          {order.short_code && order.status === "PAID" && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="key-outline" size={14} color="#78716c" />
              <Text className="text-text-3 text-xs font-outfit-bold">
                {order.short_code}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ACTIONS */}
      <View className="flex-row w-full gap-2">
        {toShowQR && (
          <TouchableOpacity
            onPress={() => {
              const payload: QROrderPayload = {
                t: "order",
                oi: order.id,
                l: order.local_id,
                u: order.user_id,
                i: order.order_items.map((item) => ({
                  id: item.food_id,
                  q: item.quantity,
                })),
                c: order.short_code,
              };

              console.log(JSON.stringify(payload, null, 2));

              setTempOrder(payload);

              router.push(ROUTES.USER.QR_SCREEN);
            }}
            className="bg-bg-semi-black flex-1 py-2.5 rounded-[5px] justify-center items-center flex-row gap-2"
          >
            <Ionicons name="qr-code" size={16} color="white" />
            <Text className="text-white text-sm font-outfit-bold">
              Mostrar QR
            </Text>
          </TouchableOpacity>
        )}

        {(toReview || toEditReview) && (
          <TouchableOpacity
            onPress={() => router.push(ROUTES.USER.CREATE_REVIEW(order.id))}
            className={`flex-1 py-2.5 rounded-[5px] justify-center items-center flex-row gap-2 ${toEditReview ? "bg-bg-red" : "bg-bg-blue"}`}
          >
            <Ionicons name="star" size={16} color={"#fff"} />
            <Text className={`text-sm font-outfit-bold text-text-1`}>
              {toEditReview ? "Editar reseña" : "Escribir reseña"}
            </Text>
          </TouchableOpacity>
        )}

        {order.status === "READY" && (
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => {
              modalRef.current?.present();
              setAddFoods(true);
            }}
            className={`flex-row items-center justify-center flex-1 ${isLoading ? "bg-[#33333380]" : "bg-bg-semi-black"} gap-x-2 py-2.5 rounded-[5px]`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-x-2">
                <MaterialCommunityIcons
                  name="invoice-plus-outline"
                  size={16}
                  color="#fff"
                />
                <Text className="text-text-1 font-outfit-bold text-sm">
                  Agregar más
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="py-2.5 rounded-[5px] flex-1 bg-bg-semi-black justify-center items-center flex-row gap-2"
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: ROUTES.USER.LOCAL,
              params: {
                local_id: order.local.id,
              },
            });
          }}
        >
          <Text className="text-white text-sm font-outfit-bold">
            Ir al local
          </Text>
        </TouchableOpacity>
      </View>

      {/* ITEMS */}
      <View className="flex-col flex-1">
        <Pressable
          onPress={() => {
            setIsExpanded(!isExpanded);
          }}
          className="flex-row items-center justify-between mb-4"
        >
          <Text className="font-outfit-bold text-text-3 text-base">
            Detalles del pedido
          </Text>

          <View className="flex-row items-center gap-2">
            <Text className="font-outfit-regular text-text-5 text-xs">
              {order.order_items.length}{" "}
              {order.order_items.length === 1 ? "item" : "items"}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#78716c"
            />
          </View>
        </Pressable>

        {isExpanded &&
          order.order_items.map((item, index) => (
            <View
              key={item.id}
              style={{
                borderBottomWidth: index < order.order_items.length - 1 ? 1 : 0,
                borderBottomColor: "#f0eeec",
              }}
              className="flex-row gap-3 pb-3 mb-3"
            >
              <Image
                source={{
                  uri:
                    item.food.image_url || "https://placehold.co/100x100/png",
                }}
                className="w-8 h-full rounded-[5px] object-cover"
              />

              <View className="flex-col flex-1 justify-center">
                <Text
                  className="text-text-3 text-base font-outfit-bold"
                  numberOfLines={1}
                >
                  {item.food.name}
                </Text>

                <Text
                  className="text-text-5 text-sm font-outfit-light"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {item.food.description}
                </Text>
              </View>

              <View className="items-end justify-center">
                <Text className="text-text-3 text-sm font-outfit-bold tracking-[-0.5px]">
                  {formatPrice(item.unit_price * item.quantity)}
                </Text>
                {item.quantity > 1 && (
                  <Text className="text-text-5 text-xs font-outfit-regular">
                    {item.quantity}x {formatPrice(item.unit_price)}
                  </Text>
                )}
              </View>
            </View>
          ))}
      </View>

      {/* TOTAL */}
      <View className="flex-col gap-y-2">
        <View className="flex-row items-center justify-between p-2">
          <Text className="font-outfit-bold text-text-3 text-base">Total</Text>

          <View className="flex-col gap-y-0.5 items-end">
            <Text className="font-outfit-bold text-text-3 text-base">
              {selected.length === 0
                ? formatPrice(order.total)
                : formatPrice(order.total + itemCost)}
            </Text>
            {selected.length > 0 && (
              <Text className="font-outfit-regular text-text-6 text-xs">
                {selected.length} item(s) agregado(s) por{" "}
                {formatPrice(itemCost)}
              </Text>
            )}
          </View>
        </View>

        {selected.length > 0 && (
          <View className="flex-row items-center justify-center p-2">
            <TouchableOpacity
              onPress={() => {
                const payload: QROrderPayload = {
                  t: "order",
                  oi: order.id,
                  l: order.local_id,
                  u: order.user_id,
                  i: selected.map((item) => ({
                    id: item.id,
                    q: item.q,
                  })),
                  c: order.short_code || undefined,
                };

                setTempOrder(payload);

                router.push(ROUTES.USER.QR_SCREEN);
              }}
              className="bg-bg-red flex-1 py-2.5 rounded-[5px] justify-center items-center flex-row gap-2"
            >
              <Ionicons name="qr-code" size={16} color="white" />
              <Text className="text-white text-sm font-outfit-bold">
                Mostrar QR
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BottomSheetModal
        ref={modalRef}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fefefe",
        }}
        enableOverDrag={false}
        enablePanDownToClose={true}
        enableDynamicSizing={true}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.4}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetFlatList
          data={foods}
          keyExtractor={(item: Food) => item.id}
          renderItem={renderFoodItem}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: insets.left + insets.right }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#B53325" />
            ) : null
          }
        />
      </BottomSheetModal>
    </View>
  );
}
