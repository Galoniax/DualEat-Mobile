import * as WebBrowser from "expo-web-browser";
import { useOrdering } from "@/context/cart/OrderingContext";
import { useOrderStore } from "@/context/store/useOrderStore";
import { Entypo, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { getCartInfo, prePurchase } from "@/services/order.api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Local, QROrderPayload } from "@/interface/global";
import { useFocusEffect, useRouter } from "expo-router";
import { ROUTES } from "@/constants/constants";
import { formatPrice } from "@/utils/distance";
import { ScrollView } from "react-native-gesture-handler";
import { isLocalOpen } from "@/utils/isLocalOpen";
import { useAuth } from "@/context/auth/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQRParser } from "@/utils/qr";
import { MenuFood } from "./local/[local_id]";
import AddButton from "@/components/ui/buttons/AddButton";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user } = useAuth();

  const { clear, items, addItem } = useOrdering();

  const { generateQR } = useQRParser();

  const itemsIDs = useMemo(() => {
    return items.map((item) => item.food_id);
  }, [items]);

  const localId = items.length > 0 ? items[0].local.id : "";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart", localId, itemsIDs],

    queryFn: async () => {
      const response = await getCartInfo(itemsIDs, localId);
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del carrito");
      }
      return response.data;
    },

    enabled: itemsIDs.length > 0 && !!localId,

    refetchInterval: 10 * 60 * 1000,
  });

  const local: Local | null = (data?.local as Local) || null;

  const [isOpen, setIsOpen] = useState(isLocalOpen(local?.schedules || []));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleOpenQR = () => {
    if (items.length === 0 || !localId || !user || user.is_business) return;

    if (user && user.is_business === false) {
      const payload: QROrderPayload = {
        t: "order",
        oi: "create",
        l: localId,
        u: user.id,
        i: items.map((item) => ({
          id: item.food_id,
          q: item.quantity,
        })),
      };

      //const qrValue = generateQR(payload);

      useOrderStore.getState().setTempOrder(payload);

      router.push(ROUTES.USER.QR);
    }
  };

  const { mutate: checkout, isPending } = useMutation({
    mutationFn: async () => {
      const checkoutItems = items.map((item) => ({
        food_id: item.food_id,
        quantity: item.quantity,
      }));
      return await prePurchase(localId, checkoutItems);
    },
    onSuccess: async (data) => {
      if (data.success && data.data?.checkoutUrl) {
        const url = data.data.checkoutUrl;

        // Extraer el pref_id de la url (ej: pref_id=3468655592-5596e5bd-...)
        const match = url.match(/pref_id=([^&]+)/);
        const prefId = match ? match[1] : null;

        const isSandbox = url.includes("sandbox.mercadopago");
        let openedNatively = false;

        console.log("URL", url);
        console.log("PREF ID", prefId);
        console.log("IS SANDBOX", isSandbox);

        // 1. Intentar abrir la app nativa de Mercado Pago SOLO en producción y si tenemos el prefId.
        // La app nativa no soporta compras en Sandbox ya que requiere iniciar sesión con usuarios de prueba.
        if (!isSandbox && prefId) {
          const deeplinkMP =
            Platform.OS === "ios"
              ? `mpago://hp/card/checkout?pref_id=${prefId}`
              : `mercadopago://checkout?pref_id=${prefId}`;

          console.log("DEEP LINK MP", deeplinkMP);
          try {
            await Linking.openURL(deeplinkMP);
            openedNatively = true;
          } catch (error) {
            console.log(
              "App de Mercado Pago no instalada o falló al abrir nativamente:",
              error,
            );
          }
        }

        // 2. Fallback: Si es sandbox o no se pudo abrir la app nativa, abrir con el navegador integrado
        if (!openedNatively) {
          try {
            // openAuthSessionAsync se cerrará automáticamente cuando redireccione a "dualeat://"
            const result = await WebBrowser.openAuthSessionAsync(
              url,
              "dualeat://",
              {
                preferEphemeralSession: true,
              },
            );

            console.log("RESULT", result);

            if (result.type === "success" && result.url) {
              console.log("Pago completado por web:", result.url);
              // 1. Extraer los parámetros de búsqueda de la URL
              const queryString = result.url.split("?")[1] || "";
              const searchParams = new URLSearchParams(queryString);
              const status = searchParams.get("status") || "";
              const type = searchParams.get("type") || "";
              const id = searchParams.get("id") || "";
              // 2. Comprobar si la URL del redirect es de tipo order_info o payment-result
              if (result.url.includes("order_info/")) {
                // Caso PRE_ORDER (pago normal): Extraemos el ID del path de la URL
                const pathPart = result.url
                  .split("?")[0]
                  .replace("dualeat://", "");
                const orderId = pathPart.split("/").pop(); // ej: "sSjsJoUxim"
                router.replace({
                  pathname: ROUTES.USER.ORDER_INFO,
                  params: { order_id: orderId as string },
                });
              } else {
                // Caso ORDER: Redirigimos a la pantalla de resultados pasándole los queries
                router.replace({
                  pathname: ROUTES.USER.PAYMENT,
                  params: {
                    status: status,
                    type: type,
                    order_id: id,
                  },
                });
              }
            }
          } catch (error) {
            console.log("Error abriendo el navegador integrado:", error);
            // Fallback final en navegador externo si algo falla con el Session
            await WebBrowser.openBrowserAsync(url);
          }
        }
      }
    },
    onError: (error) => {
      console.log("Error en prePurchaseMutate:", error);
    },
  });

  useEffect(() => {
    if (!local) return;

    setIsOpen(isLocalOpen(local.schedules || []));

    const intervalId = setInterval(() => {
      const currentlyOpen = isLocalOpen(local.schedules || []);

      setIsOpen((prevIsOpen) => {
        if (prevIsOpen !== currentlyOpen) {
          return currentlyOpen;
        }
        return prevIsOpen;
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [local]);

  useEffect(() => {
    if (items.length === 0) {
      router.back();
    }
  }, [items, router]);

  const itemsForCart = useMemo(() => {
    const fetchedItems = (data?.items as MenuFood[]) || [];

    return fetchedItems.map((item) => {
      const item_quantity =
        items.find((i) => i.food_id === item.id)?.quantity || 0;

      return {
        ...item,
        quantity: item_quantity,
        subtotal_price: item.price * item_quantity,
        subtotal_original_price: item.original_price * item_quantity,
      };
    });
  }, [items, data]);

  const finalTotal = itemsForCart.reduce(
    (total, item) => total + item.subtotal_price,
    0,
  );

  const originalTotal = itemsForCart.reduce(
    (total, item) => total + item.subtotal_original_price,
    0,
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-bg-semi-white"
    >
      <View
        style={{ paddingTop: insets.top }}
        className="w-full flex-row items-center justify-between px-4"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="justify-center items-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="text-base font-outfit-bold">Tu carrito</Text>
        <TouchableOpacity
          onPress={() => {
            clear();
          }}
        >
          <Text className="text-sm font-outfit-bold text-text-3">Vaciar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#B53325" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: insets.left + insets.right + 14,
            gap: 20,
            flexDirection: "column",
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {local && (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: ROUTES.USER.LOCAL,
                  params: { local_id: local.id },
                });
              }}
              style={{
                borderBottomWidth: 1,
                borderStyle: "dashed",
                borderBottomColor: "#878787",
              }}
              className="w-full pt-2 flex-row justify-between items-center gap-x-4 pb-6"
            >
              <View className="flex-row items-center gap-4">
                <Image
                  source={{ uri: local.image_url }}
                  className="w-12 h-12 rounded-full"
                />

                <View className="flex-col gap-1.5">
                  <Text className="text-[16px] font-outfit-bold text-text-3">
                    {local.name}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons
                      name="google-maps"
                      size={14}
                      color="#2F2F2F"
                    />
                    <Text className="text-[13px] font-outfit-light text-text-5 text-ellipsis">
                      {local.address}
                    </Text>
                  </View>
                </View>
              </View>
              <Entypo name="chevron-thin-right" size={16} color="#2F2F2F" />
            </TouchableOpacity>
          )}

          {/** PRODUCTOS */}
          <View>
            <Text className="text-lg font-outfit-bold text-text-3 mb-4">
              Productos
            </Text>
            {itemsForCart.map((item) => (
              <View
                key={item.id}
                className="w-full flex-row items-center gap-x-4"
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={{ borderRadius: 15, height: 46, width: 46 }}
                  className="object-cover"
                />

                <View className="flex-col gap-1">
                  <Text className="text-[14px] font-outfit-regular text-text-3">
                    {item.name}
                  </Text>

                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-outfit-bold text-[15.5px] text-text-3">
                      {formatPrice(item.subtotal_price)}
                    </Text>

                    {item.discount_pct_applied !== null && (
                      <Text className="line-through text-[11px] text-text-4 tracking-[-0.5px]">
                        {formatPrice(item.subtotal_original_price)}
                      </Text>
                    )}
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
                    <Text className="text-[#B53325] text-[11px] font-outfit-bold">
                      {item.discount_pct_applied}% OFF
                    </Text>
                  </View>
                )}

                <AddButton
                  onAdd={() => {
                    addItem({
                      food_id: item.id,
                      local: {
                        id: item.local_id,
                        name: local.name,
                      },
                      name: item.name,
                      unit_price: item.price,
                      quantity: 1,
                    });
                  }}
                  item_id={item.id}
                />
              </View>
            ))}
          </View>

          {/** RESUMEN */}
          <View>
            <Text className="text-[18px] font-outfit-bold text-text-3 mb-4">
              Resumen
            </Text>
            <View className="flex-col items-center">
              {["Productos", "Descuento"].map((label, index) => (
                <View
                  key={index}
                  className="w-full pb-2.5 flex-row justify-between items-center"
                >
                  <Text className="text-[14.5px] font-outfit-light text-text-3">
                    {label}
                  </Text>
                  <Text className="text-[15px] font-outfit-bold text-text-3">
                    {label === "Productos"
                      ? formatPrice(originalTotal)
                      : "-" + formatPrice(originalTotal - finalTotal)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {items.length > 0 && items[0].local.id === local?.id && (
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: "#dbdbdb",
          }}
          className="bg-bg-semi-white flex-col gap-y-2"
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-text-3 text-[18px] font-outfit-bold">
              Subtotal
            </Text>
            <View style={{ alignItems: "flex-end" }} className="flex-col gap-1">
              {finalTotal < originalTotal && (
                <Text className="line-through text-[12px] text-text-4 tracking-[-0.5px]">
                  {formatPrice(originalTotal)}
                </Text>
              )}
              <Text className="text-text-3 text-[16px] font-outfit-bold">
                {formatPrice(finalTotal)}
              </Text>
            </View>
          </View>

          {/* ** TOCHANGE !isOpen disabled 
          style={{ backgroundColor: !isOpen ? "#BEBEBE" : undefined }}
          */}
          <View className="w-full flex-row items-center justify-center mt-2 gap-2">
            <TouchableOpacity
              onPress={() => checkout()}
              disabled={isPending}
              style={{ flex: 3 }}
              className={`bg-bg-red py-2.5 rounded-[8px] items-center`}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-outfit-bold text-[14px]">
                  ¿Pagar ahora?
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenQR()}
              style={{ flex: 1 }}
              className={`bg-bg-semi-black py-2.5 rounded-[8px] items-center`}
            >
              <Ionicons name="qr-code-sharp" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
