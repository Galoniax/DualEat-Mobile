import { useOrdering } from "@/context/cart/OrderingContext";
import { Entypo, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { getCartInfo } from "@/services/order.api";
import { useEffect, useMemo, useState } from "react";
import { Local, QROrderPayload } from "@/interface/global";
import { MenuFood } from "@/components/menu/MenuScreen";
import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/constants";
import { formatPrice } from "@/utils/distance";
import { ScrollView } from "react-native-gesture-handler";
import { isLocalOpen } from "@/utils/isLocalOpen";
import { useLoader } from "@/context/app/LoadingContext";
import { useAuth } from "@/context/auth/AuthContext";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { clear, items } = useOrdering();
  const { setType } = useLoader();
  const { user } = useAuth();

  const [local, setLocal] = useState<Local | null>(null);
  const [foods, setFoods] = useState<MenuFood[]>([]);

  const itemsIDs = useMemo(() => {
    return items.map((item) => item.food_id);
  }, [items]);

  const localId = items.length > 0 ? items[0].local.id : "";

  // ** OBTENER INFO **/
  useEffect(() => {
    if (itemsIDs.length === 0 || !localId) return;

    const fetchCartData = async () => {
      try {
        setType("minimal");
        const cartData = await getCartInfo(itemsIDs, localId);

        if (cartData && cartData.success && cartData.data) {
          setLocal(cartData.data.local);
          setFoods(cartData.data.items);
        }
      } catch (e) {
        console.log("Error al obtener datos del carrito", e);
      } finally {
        setType(null);
      }
    };

    fetchCartData();
  }, [itemsIDs, localId, setType]);

  // ** RECARGA **/
  useEffect(() => {
    if (itemsIDs.length === 0 || !localId) return;

    const intervalo = 2 * 60 * 1000;

    const fetch = async () => {
      try {
        const cartData = await getCartInfo(itemsIDs, localId);

        if (cartData && cartData.success && cartData.data) {
          setLocal(cartData.data.local);
          setFoods(cartData.data.items);
        }
      } catch (e) {
        console.log("Error en la recarga", e);
      }
    };

    const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
      fetch();
    }, intervalo);

    return () => clearInterval(intervalId);
  }, [itemsIDs, localId]);

  const handleOpenQR = () => {
    if (items.length === 0 || !localId) return;

    if (user && user.isBusiness === false) {
      const payload: QROrderPayload = {
        t: "order",
        l: localId,
        u: user.id,
        i: items.map((item) => ({
          id: item.food_id,
          q: item.quantity,
        })),
      };

      if (payload.i.length === 0) return;

      router.push({
        pathname: ROUTES.USER.QR,
        params: {
          qrValue: JSON.stringify(payload),
        },
      });
    }
  };

  const isOpen = isLocalOpen(local?.schedules || []);

  const originalTotal = foods.reduce(
    (total, item) => total + item.original_price,
    0,
  );
  const finalTotal = foods.reduce((total, item) => total + item.price, 0);

  const hasDiscount = finalTotal < originalTotal;

  useEffect(() => {
    if (items.length === 0) {
      router.back();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <SafeAreaView className="flex-1 bg-white h-full">
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="w-full flex-row items-center justify-around py-4"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[40px] h-[40px] justify-center items-center "
        >
          <Entypo name="chevron-thin-left" size={18} color="#333333" />
        </TouchableOpacity>
        <Text className="text-[16px] font-dosis-bold">Tu carrito</Text>
        <TouchableOpacity
          className="w-[40px] h-[40px] justify-center items-center "
          onPress={() => {
            clear();
            setFoods([]);
            setLocal(null);
          }}
        >
          <Text className="text-[13px] font-dosis-bold">Vaciar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {local && (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: ROUTES.USER.LOCAL,
                params: { slug: local.slug },
              });
            }}
            style={{
              borderBottomWidth: 1,
              borderStyle: "dashed",
              borderBottomColor: "#878787",
            }}
            className="w-full pt-2 px-6 flex-row justify-between items-center gap-4 pb-6"
          >
            <View className="flex-row items-center gap-4">
              <Image
                source={{ uri: local.image_url }}
                className="w-12 h-12 rounded-full"
              />

              <View className="flex-col gap-1.5">
                <Text className="text-[16px] font-dosis-bold text-text-3">
                  {local.name}
                </Text>
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons
                    name="google-maps"
                    size={14}
                    color="#2F2F2F"
                  />
                  <Text className="text-[13px] font-dosis-regular text-text-5 text-ellipsis">
                    {local.address}
                  </Text>
                </View>
              </View>
            </View>
            <Entypo name="chevron-thin-right" size={16} color="#2F2F2F" />
          </TouchableOpacity>
          
        )}

        <View style={{ paddingHorizontal: insets.left + insets.right + 18 }}>
          {/** PRODUCTOS */}
          <View className="w-full mt-8">
            <Text className="text-[18px] font-dosis-bold text-text-3 mb-2">
              Productos
            </Text>
            {foods.map((item) => (
              <View
                key={item.id}
                className="w-full px-6 py-3 flex-row items-start gap-4"
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={{ borderRadius: 12, height: 48, width: 48 }}
                  className="object-cover mt-2"
                />

                <View className="flex-col gap-1">
                  <Text className="text-[14px] font-dosis-medium text-text-3">
                    {item.name}
                  </Text>

                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-dosis-bold text-[15.5px] text-text-3">
                      {formatPrice(item.price)}
                    </Text>
                    {item.price !== item.original_price ? (
                      <Text className="line-through text-[11px] text-text-4 tracking-[-0.5px]">
                        {formatPrice(item.original_price)}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {item.discount_pct_applied && item.discount_pct_applied > 0 && (
                  <View
                    style={{
                      maxWidth: 80,
                      borderColor: "#B53325",
                      borderTopStartRadius: 0,
                      borderBottomStartRadius: 10,
                      borderRadius: 18,
                    }}
                    className="py-[3px] px-2 border border-[#B53325] bg-bg-semi-white"
                  >
                    <Text className="text-[#B53325] text-[11px] font-dosis-bold">
                      {item.discount_pct_applied}% OFF
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/** RESUMEN */}
          <View className="mt-12">
            <Text className="text-[20px] font-dosis-bold text-text-3">
              Resumen
            </Text>
            <View className="w-full px-6 py-3 flex-col items-center">
              {["Productos", "Descuento"].map((label, index) => (
                <View
                  key={index}
                  className="w-full py-1.5 flex-row justify-between items-center"
                >
                  <Text className="text-[14.5px] font-dosis-regular text-text-3">
                    {label}
                  </Text>
                  <Text className="text-[15px] font-dosis-bold text-text-3">
                    {label === "Productos"
                      ? formatPrice(originalTotal)
                      : "-" + formatPrice(originalTotal - finalTotal)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ** TOCHANGE isOpen && */}
      {items.length > 0 && items[0].local.id === local?.id && (
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom - 16,
            borderTopWidth: 0.5,
            borderTopColor: "#333333",
            width: "100%",
            gap: 10,
          }}
          className="bg-bg-semi-white flex-col "
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-text-5 text-[18px] font-dosis-bold">
              Subtotal
            </Text>
            <View style={{ alignItems: "flex-end" }} className="flex-col gap-1">
              {hasDiscount && (
                <Text className="line-through text-[12px] text-text-4 tracking-[-0.5px]">
                  {formatPrice(originalTotal)}
                </Text>
              )}
              <Text className="text-text-3 text-[18px] font-dosis-bold">
                {formatPrice(finalTotal)}
              </Text>
            </View>
          </View>

          {/* ** TOCHANGE !isOpen disabled 
          style={{ backgroundColor: !isOpen ? "#BEBEBE" : undefined }}
          */}
          <View className="w-full flex-row items-center justify-center mt-2 gap-2">
            <TouchableOpacity
              onPress={() => console.log("Continuar con el pago")}
              className={`bg-bg-red py-3 rounded-full items-center flex-[3]`}
            >
              <Text className="text-white font-dosis-bold text-[14px]">
                ¿Pagar ahora?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenQR()}
              className={`bg-bg-semi-black py-3 rounded-full items-center flex-[1]`}
            >
              <Ionicons name="qr-code-sharp" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
