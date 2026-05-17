import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "@/context/extension/LocationContext";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { getHomeDiscovery } from "@/services/discovery.api";
import { WeatherWidget } from "@/components/features/weather/WeatherWidget";
import { Food, Local } from "@/interface/global";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { useCallback, useMemo } from "react";

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

  //console.log(JSON.stringify(data?.para_ti, null, 2));


  
 const getDistance = useCallback(
  (item: MenuFood) => {
    if (!location) return 0; 

    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      item.local.latitude,
      item.local.longitude,
    );

    return formatDistance(distance);
  },
  [location]
);

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-bg-semi-white flex-col gap-y-4 px-4"
      style={{ paddingTop: headerHeight }}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        style={{
          flex: 1,
        }}
      >
        <View className="mt-4">
          <WeatherWidget type="home" />
        </View>

        <FlatList
          data={data?.para_ti}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            columnGap: 16,
            paddingHorizontal: 16,
          }}
          renderItem={({ item }: { item: MenuFood }) => {
            return (
              <View className="flex-col">
                <View className="relative w-[160px] h-[160px] overflow-hidden rounded-[10px]">
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text>{item.local.name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text>{getDistance(item)}</Text>
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
          <Text className="text-text-5 text-[16px] font-dosis-regular">
            Ubicación
          </Text>
          <Text className="text-text-3 text-[18px] font-dosis-bold">
            {address
              ? `${address.street ? address.street + ", " : ""}${
                  address.city ? address.city : ""
                }`
              : "Ubicación no disponible"}
          </Text>
        </View> */
