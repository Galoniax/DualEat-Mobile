import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  useWindowDimensions,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "@/context/extension/LocationContext";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { getHomeDiscovery } from "@/services/discovery.api";
import { WeatherWidget } from "@/components/features/weather/WeatherWidget";
import { Food, Local } from "@/interface/global";
import {
  calculateDistance,
  formatDistance,
  formatPrice,
} from "@/utils/distance";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth/AuthContext";
import { Stack, useRouter } from "expo-router";
import { ROUTES } from "@/constants/constants";

export interface MenuFood extends Food {
  original_price: number;
  discount_pct_applied: number | null;
  ends_at?: string;
  sales_count?: number;
}

interface LocalDiscovery {
  para_ti: MenuFood[];
  ofertas_hot: MenuFood[];
  mas_pedidos: MenuFood[];
  restaurantes_destacados: Local[];
}

export default function HomeScreen() {
  const { location } = useLocation();
  const headerHeight = useHeaderHeight();

  const { width } = useWindowDimensions();

  const { user } = useAuth();

  const router = useRouter();

  const latitude = location?.coords.latitude ?? 0;
  const longitude = location?.coords.longitude ?? 0;

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const response = await getHomeDiscovery(latitude, longitude);
      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as LocalDiscovery;
    },

    enabled: !!location && !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const getDistance = useCallback(
    (lat: number, lng: number) => {
      if (!location) return 0;

      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        lat,
        lng,
      );

      return formatDistance(distance);
    },
    [location],
  );

  const hasParaTi = !!data?.para_ti && data.para_ti.length > 0;
  const hasRestaurantes =
    !!data?.restaurantes_destacados && data.restaurantes_destacados.length > 0;

  const sections = [];
  if (hasParaTi) {
    sections.push({
      title: "Descubrí estas opciones",
      type: "foods",
      data: [data?.para_ti],
    });
  }
  if (hasRestaurantes) {
    sections.push({
      title: "Mejores restaurantes",
      type: "locals",
      data: [data?.restaurantes_destacados],
    });
  }

  const renderFoodItem = useCallback(
    ({ item }: { item: MenuFood }) => {
      return (
        <View
          style={{ width: width * 0.5 }}
          className="rounded-[10px] p-2.5 border border-dashed border-gray-300 flex-col gap-y-2"
        >
          <View className="relative overflow-hidden rounded-[14px]">
            {/* Descuento flotante si existe */}
            {item.discount_pct_applied !== null && (
              <View className="absolute top-2 right-2 bg-bg-red px-2 py-1 rounded-full z-10">
                <Text className="font-outfit-bold text-[10px] text-white">
                  -{item.discount_pct_applied}%
                </Text>
              </View>
            )}

            <Image
              source={{ uri: item.image_url }}
              style={{
                width: "100%",
                height: (width * 0.5) / 2,
              }}
              resizeMode="cover"
            />
          </View>

          <View className="px-1 flex-col gap-y-0.5">
            <Text
              numberOfLines={1}
              className="text-sm text-text-3 font-outfit-bold"
            >
              {item.name}
            </Text>
            <View className="flex-row gap-x-2 items-center">
              <Text className="font-outfit-bold text-sm text-text-3">
                {formatPrice(item.price)}
              </Text>
              {item.price !== item.original_price && (
                <Text className="line-through text-xs text-text-4">
                  {formatPrice(item.original_price)}
                </Text>
              )}
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-x-1 flex-1">
                <Ionicons name="storefront-outline" size={11} color="#707070" />
                <Text
                  className="text-text-4 text-[11px] font-outfit-medium truncate"
                  numberOfLines={1}
                >
                  {item.local.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="walk" size={11} color="#707070" />
                <Text className="text-text-4 text-[11px] font-outfit-medium">
                  {getDistance(item.local.latitude, item.local.longitude)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    },
    [width, getDistance],
  );

  const renderLocalItem = useCallback(
    ({ item }: { item: Local }) => {
      return (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: ROUTES.USER.LOCAL,
              params: {
                local_id: item.id,
              },
            });
          }}
          style={{ width: width * 0.7 }}
          className="rounded-[20px] overflow-hidden border border-gray-200 flex-col"
        >
          <View className="relative overflow-hidden">
            <View className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-full flex-row items-center gap-x-1 shadow-sm z-10">
              <Ionicons name="star" size={11} color="#E5A657" />
              <Text className="text-text-3 text-xs font-outfit-bold">
                {item.average_rating?.toFixed(1) || "N/A"}
              </Text>
            </View>

            <Image
              source={{ uri: item.image_url }}
              style={{ width: "100%", height: (width * 0.78) / 2.1 }}
              resizeMode="cover"
            />
          </View>

          <View className="p-3.5 flex-col gap-y-1">
            <Text
              numberOfLines={1}
              className="text-text-3 text-[16px] font-outfit-bold"
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-text-5 text-[11.5px] font-outfit-regular"
            >
              {item.description || "Sin descripción disponible"}
            </Text>

            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-bg-gray/40">
              <View className="flex-row items-center gap-x-1 flex-1 mr-2">
                <Ionicons name="location-outline" size={12} color="#707070" />
                <Text
                  className="text-text-4 text-[11px] font-outfit-medium truncate"
                  numberOfLines={1}
                >
                  {item.address}
                </Text>
              </View>

              <View className="flex-row items-center gap-x-1">
                <Ionicons name="walk" size={12} color="#707070" />
                <Text className="text-text-4 text-[11px] font-outfit-bold">
                  {getDistance(item.latitude, item.longitude)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [width, getDistance, router],
  );

  return (
    <SafeAreaView
      className="flex-1 bg-bg-semi-white px-4"
      edges={["bottom", "left", "right"]}
      style={{ paddingTop: headerHeight }}
    >
      <Stack.Screen
        options={{
          headerRight: () => <TouchableOpacity></TouchableOpacity>,
        }}
      />
      <SectionList
        sections={sections as any}
        keyExtractor={(item, idx) => idx.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#B53325"]}
          />
        }
        ListHeaderComponent={
          <View className="gap-y-5 mb-2">
            {/* HEADER */}
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-text-4 text-base font-outfit-light">
                  ¡Hola, {user?.name}!
                </Text>
                <Text className="text-text-3 text-xl font-outfit-extrabold">
                  ¿Qué quieres comer hoy?
                </Text>
              </View>
              {/*<Pressable
                onPress={async () => {
                  await triggerWeatherNotificationManually();
                }}
                className="bg-bg-red/10 border border-bg-red/20 h-10 w-10 rounded-full justify-center items-center active:bg-bg-red/20 active:scale-95"
              >
                <Ionicons name="flash" size={16} color="#B53325" />
              </Pressable>*/}
            </View>
            <WeatherWidget type="HOME" />
          </View>
        }
        contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
        renderSectionHeader={({ section: { title } }) => (
          <View className="flex-row justify-between items-center">
            <Text className="text-text-3 text-lg font-outfit-bold">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item, section }) => {
          if (section.type === "foods") {
            return (
              <FlatList
                data={item}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                contentContainerStyle={{ columnGap: 16 }}
                renderItem={renderFoodItem}
              />
            );
          }
          if (section.type === "locals") {
            return (
              <FlatList
                data={item}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                contentContainerStyle={{ columnGap: 16 }}
                renderItem={renderLocalItem}
              />
            );
          }
          return null;
        }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            {isLoading ? (
              <ActivityIndicator size="large" color="#B53325" />
            ) : (
              <Text className="text-text-3 text-base font-outfit-light">
                ¡Los locales estan todos cerrados!
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
