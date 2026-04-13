import DraftOrderView from "@/components/features/order/DraftOrderView";
import OrderView from "@/components/features/order/OrderView";
import { ErrorView } from "@/components/ui/feedback/ErrorView";

import { useAuth } from "@/context/auth/AuthContext";
import { useOrderStore } from "@/context/store/useOrderStore";
import { QROrderItem } from "@/interface/global";
import { Ionicons } from "@expo/vector-icons";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
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
  const [isExpanded, setIsExpanded] = useState(false);

  const isNew = order_id === "create";

  const tempOrder = useOrderStore((state) => state.tempOrder);

  // Si existe pero no tiene permiso
  {
    /*if (isOwner === false) {
    return (
      <ErrorView
        type={403}
        onAction={() => redirect()}
        actionLabel="Ir al inicio"
      />
    );
  }*/
  }

  // Bloqueo de renderizado para evitar parpadeos de contenido prohibido
  {
    /*} if (!order) {
    return (
      <ErrorView
        type={error?.cause as ErrorType}
        onAction={() => (error?.cause === 408 ? refetch() : redirect())}
      />
    );
  }*/
  }

  if (!order_id) {
    return <ErrorView type={400} onAction={() => router.back()} />;
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
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
            <OrderView
              order_id={order_id}
              insets={insets}
              selected={selected}
              setSelected={setSelected}
            />
          )}

          {/*<View
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
                      className={`text-[12px] font-dosis-bold 
                        ${STATUS_COLORS[order.status]}
            `}
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

          
            <View className="mt-4">
              {toShowQR ? (
                <TouchableOpacity className="bg-bg-semi-black py-3 rounded-[5px] justify-center items-center flex-row gap-2">
                  <Ionicons name="qr-code" size={20} color="white" />
                  <Text className="text-white font-dosis-bold">Mostrar QR</Text>
                </TouchableOpacity>
              ) : (
                toReview && (
                  <TouchableOpacity className="bg-bg-yellow py-3 rounded-[5px] justify-center items-center flex-row gap-2">
                    <Text className="text-white font-dosis-bold">
                      Escribir reseña
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

         
            <View className="mt-4">
              <Pressable
                onPress={() => {
                  setIsExpanded(!isExpanded);
                }}
                className="flex-row items-center justify-between"
              >
                <Text className="font-dosis-bold text-text-3 text-[20px]">
                  Tu pedido
                </Text>

                {order.order_items.length > 3 && (
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#2F2F2F"
                  />
                )}
              </Pressable>

              <FlatList
                data={
                  isExpanded ? order.order_items : order.order_items.slice(0, 3)
                }
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                className="mt-6"
              />
            </View>

          
            <View className="mt-8 border-t border-gray-300 pt-4 flex-row items-center justify-between">
              <Text className="font-dosis-bold text-text-3 text-[15px]">
                Total
              </Text>

              <Text className="font-dosis-bold text-text-3 text-[15px]">
                {formatPrice(order.total)}
              </Text>
            </View>
          </View>
          */}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}
