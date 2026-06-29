import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
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
import { useCallback, useMemo } from "react";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";

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

  const latitude = location?.coords.latitude ?? 0;
  const longitude = location?.coords.longitude ?? 0;

  const { data, refetch, isFetching } = useQuery({
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

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-bg-semi-white px-4"
      style={{ paddingTop: headerHeight }}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          rowGap: 16,
        }}
      >
        <View className="mt-4">
          <WeatherWidget type="home" />
        </View>

        <View>
          <Text className="text-text-3 text-[18px] font-outfit-bold">
            Descubrí estas opciones
          </Text>
        </View>
        <FlatList
          data={data?.para_ti}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
          }}
          decelerationRate="fast"
          contentContainerStyle={{
            columnGap: 16,
          }}
          renderItem={({ item }: { item: MenuFood }) => {
            return (
              <View
                style={{ width: width * 0.55 }}
                className="flex-col gap-y-1"
              >
                <View className="relative overflow-hidden rounded-[15px]">
                  <Image
                    source={{ uri: item.image_url }}
                    style={{
                      width: width * 0.55,
                      height: (width * 0.55) / 1.8,
                    }}
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-x-1.5">
                    <MaterialIcons
                      name="storefront"
                      size={12}
                      color="#2F2F2F"
                    />
                    <Text className="text-text-3 text-[12px] font-outfit-medium">
                      {item.local.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-x-1.5">
                    <FontAwesome5 name="walking" size={12} color="#2F2F2F" />
                    <Text className="text-text-3 text-[12px] font-outfit-medium">
                      {getDistance(item.local.latitude, item.local.longitude)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-x-2">
                  <Text className="font-outfit-bold text-[16px] text-text-3">
                    {formatPrice(item.price)}
                  </Text>

                  {item.discount_pct_applied !== null && (
                    <Text className="line-through text-[13px] text-text-4 tracking-[-0.5px]">
                      {formatPrice(item.original_price)}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  className="text-[13px] text-text-3 font-outfit-regular"
                >
                  {item.name}
                </Text>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
        />

        <View>
          <Text className="text-text-3 text-[18px] font-outfit-bold">
            Mejores restaurantes
          </Text>
        </View>
        <FlatList
          data={data?.restaurantes_destacados}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
          }}
          decelerationRate="fast"
          contentContainerStyle={{
            columnGap: 16,
          }}
          renderItem={({ item }: { item: Local }) => {
            return (
              <View style={{ width: width * 0.8 }} className="flex-col gap-y-1">
                <View className="relative overflow-hidden rounded-[15px]">
                  <Image
                    source={{ uri: item.image_url }}
                    style={{ width: width * 0.8, height: (width * 0.8) / 2 }}
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-x-1.5">
                    <MaterialIcons
                      name="storefront"
                      size={16}
                      color="#2F2F2F"
                    />
                    <Text className="text-text-3 text-[18px] font-outfit-bold">
                      {item.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-x-1.5">
                    <MaterialIcons name="star" size={14} color="#2F2F2F" />
                    <Text className="text-text-3 text-[15px] font-outfit-bold">
                      {item.average_rating?.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-text-5 text-[13px] font-outfit-light truncate"
                >
                  {item.description}
                </Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-x-1.5">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#333333"
                    />
                    <Text className="text-text-3 text-[12px] font-outfit-bold">
                      {item.address}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-x-1.5">
                    <FontAwesome5 name="walking" size={12} color="#2F2F2F" />
                    <Text className="text-text-3 text-[12px] font-outfit-bold">
                      {getDistance(item.latitude, item.longitude)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/**  <View>
          <Text className="text-text-5 text-[16px] font-outfit-light">
            Ubicación
          </Text>
          <Text className="text-text-3 text-[18px] font-outfit-bold">
            {address
              ? `${address.street ? address.street + ", " : ""}${
                  address.city ? address.city : ""
                }`
              : "Ubicación no disponible"}
          </Text>
        </View> */
