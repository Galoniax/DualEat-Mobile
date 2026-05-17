import { Food, Order, QROrderItem } from "@/interface/global";
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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

interface Props {
  order: Order;
  insets: EdgeInsets;
  selected: QROrderItem[];
  setSelected: React.Dispatch<React.SetStateAction<QROrderItem[]>>;
  isCustomer: boolean;
  isStaff: boolean;
}

export default function OrderView({
  order,
  insets,
  selected,
  setSelected,
  isCustomer,
  isStaff,
}: Props) {
  const modalRef = useRef<BottomSheetModal>(null);

  const [isExpanded, setIsExpanded] = useState(true);
  const [addFoods, setAddFoods] = useState(false);

  // && order.status === "READY"

  const {
    data: foods,
    isLoading,
    error,
    isError,
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

      console.log("Foods Data:", JSON.stringify(response.data, null, 2));

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

  //console.log("Foods", JSON.stringify(foods, null, 2));

  const handleAddFood = (food: Food, isDelete: boolean) => {
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

  const renderFoodItem = useCallback(
    ({ item }: { item: Food }) => {
      if (!item.available) return null;

      const selectedItem = selected.find((f) => f.id === item.id);

      return (
        <View className="flex-row items-center w-full mb-2 gap-2">
          <TouchableOpacity
            onPress={() => handleAddFood(item, false)}
            style={{ gap: 10 }}
            className={`my-2 rounded-[2px] px-3 flex-row items-center flex-1`}
          >
            <Image
              source={{ uri: item.image_url }}
              style={{ borderRadius: 15, height: 46, width: 46 }}
              className="object-cover"
            />

            <View className="flex-col flex-1">
              <Text className={`font-dosis-bold text-[14px] text-text-3`}>
                {item.name}
              </Text>

              <Text
                style={{ fontSize: 12 }}
                ellipsizeMode="tail"
                numberOfLines={2}
                className={`font-dosis-regular text-text-6`}
              >
                {item.description}
              </Text>

              <View className="flex-row items-center gap-3">
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

  /** Actions (User) */
  const toReview =
    isCustomer && order.review?.rating === null && order.status === "COMPLETED";
  const toShowQR = isCustomer && order.short_code && order.status === "PAID";

  const snapPoints = useMemo(() => ["60%"], []);

  return (
    <View
      style={{
        paddingTop: 20,
        paddingHorizontal: insets.left + insets.right + 20,
        paddingBottom: insets.bottom + 16,
        flex: 1,
        marginTop: 150,
      }}
      className="bg-bg-semi-white w-full rounded-t-3xl"
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
          //isCustomer &&
          (order.status === "PENDING" || order.status === "READY") && (
            <TouchableOpacity
              disabled={isLoading}
              onPress={() => {
                modalRef.current?.present();
                setAddFoods(true);
              }}
              className={`flex-row items-center justify-center  ${isLoading ? "bg-[#33333380]" : "bg-bg-semi-black"} gap-x-2 py-3 rounded-[5px]`}
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

                  <Text className="text-text-1 font-dosis-bold text-[13px]">
                    Agregar más items
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
      </View>

      <View className="mt-4 flex-col gap-y-4 flex-1">
        <Pressable
          onPress={() => {
            setIsExpanded(!isExpanded);
          }}
          className="flex-row items-center justify-between"
        >
          <Text className="font-dosis-bold text-text-3 text-[20px]">
            Tu pedido
          </Text>

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#2F2F2F"
          />
        </Pressable>

        {isExpanded &&
          order.order_items.map((item) => (
            <View key={item.id} className="flex-row justify-between gap-3 mb-4">
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
          ))}
      </View>

      <View className="border-t border-dashed border-gray-300 pt-4 flex-row items-center justify-between">
        <Text className="font-dosis-bold text-text-3 text-[15px]">Total</Text>

        <Text className="font-dosis-bold text-text-3 text-[15px]">
          {formatPrice(order.total)}
        </Text>
      </View>

      <BottomSheetModal
        ref={modalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fefefe",
        }}
        enableOverDrag={false}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
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
