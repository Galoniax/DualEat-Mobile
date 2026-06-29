import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Image,
  Keyboard,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "@/context/extension/LocationContext";
import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import { useIsFocused } from "@react-navigation/native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import FilterComponent, {
  FilterModalRef,
} from "@/components/features/map/FilterComponent";

import { getLocalInBounds } from "@/services/discovery.api";
import { Local } from "@/interface/global";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import PinMarker from "@/components/features/map/Marker";
import { useRouter } from "expo-router";

import { ROUTES, mapStyle } from "@/constants/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { initial, preferencesDTO } from "@/interface/global.dto";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";

export default function MapScreen() {
  const { location, address } = useLocation();
  const router = useRouter();

  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  // --- UBICACIÓN --
  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const CARD_WIDTH = width * 0.95;

  const [bounds, setBounds] = useState<{
    minLat: number | null;
    maxLat: number | null;
    minLng: number | null;
    maxLng: number | null;
  } | null>(null);

  const [query, setQuery] = useState("");
  const [localQuery, setLocalQuery] = useState("");

  const [pinImages, setPinImages] = useState<Record<string, string>>({});

  // --- REF ---
  const filterModalRef = useRef<FilterModalRef>(null);
  const bottomSheet = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const isScrolling = useRef(false);

  const flatListRef = useRef<FlatList>(null);

  const translateX = useRef(new Animated.Value(-300)).current;

  // --- ESTADOS ---
  const [filters, setFilters] = useState(initial);

  const handlePinCaptured = (id: string, uri: string) => {
    setPinImages((prev) => ({ ...prev, [id]: uri }));
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (isScrolling.current && viewableItems.length > 0) {
        const visible = viewableItems[0].item as Local;

        mapRef.current?.animateToRegion(
          {
            latitude: visible.latitude - 0.0006,
            longitude: visible.longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          },
          800,
        );
      }
    },
  ).current;

  const { data: locales = [], isLoading } = useQuery({
    queryKey: ["locals", bounds, filters, query],

    enabled: !!bounds && isFocused,

    queryFn: async () => {
      const response = await getLocalInBounds(
        bounds!.minLat!,
        bounds!.maxLat!,
        bounds!.minLng!,
        bounds!.maxLng!,
        filters,
        query,
      );

      if (response && response.success && response.status === 200) {
        return response.data as Local[];
      } else {
        return [];
      }
    },
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });

  const sortedLocales = useMemo(() => {
    if (!lat || !lng || !locales || locales.length === 0) return locales;

    return [...locales].sort((a, b) => {
      const A = calculateDistance(lat, lng, a.latitude, a.longitude);
      const B = calculateDistance(lat, lng, b.latitude, b.longitude);
      return A - B;
    });
  }, [locales, lat, lng]);

  const mapMarkers = useMemo(() => {
    return sortedLocales.map((loc) => {
      const uri = pinImages[loc.id];
      if (!uri) return null;

      return (
        <Marker
          key={`marker-${loc.id}`}
          coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
          image={{ uri: uri }}
          tracksViewChanges={false}
          anchor={{ x: 0.5, y: 1 }}
          zIndex={1}
          onPress={(e) => {
            e.stopPropagation();

            mapRef.current?.animateToRegion(
              {
                latitude: loc.latitude - 0.0006,
                longitude: loc.longitude,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
              },
              800,
            );
            const index = sortedLocales.findIndex((item) => item.id === loc.id);
            if (index !== -1 && flatListRef.current) {
              const offset = index * (CARD_WIDTH + 16);
              flatListRef.current.scrollToOffset({
                offset: offset,
                animated: true,
              });
            }
          }}
        />
      );
    });
  }, [sortedLocales, pinImages, CARD_WIDTH]);

  const hiddenPinGenerators = useMemo(() => {
    return sortedLocales.map((loc) => {
      if (pinImages[loc.id]) return null;
      return (
        <PinMarker
          key={`generator-${loc.id}`}
          loc={loc}
          onCaptured={handlePinCaptured}
        />
      );
    });
  }, [sortedLocales, pinImages]);

  const renderLocalItem = useCallback(
    ({ item }: { item: Local }) => {
      const distance = location?.coords
        ? calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            item.latitude,
            item.longitude,
          )
        : 0;

      const displayDistance = formatDistance(distance);

      return (
        <TouchableOpacity
          key={item.id}
          style={{ width: CARD_WIDTH, paddingHorizontal: 16 }}
          className="justify-center"
          onPress={() => {
            router.push({
              pathname: ROUTES.USER.LOCAL,
              params: { local_id: item.id },
            });
          }}
        >
          <Image
            source={{
              uri: item.image_url
                ? item.image_url
                : "https://placehold.co/300x100",
            }}
            className="w-full h-[100px] object-cover rounded-[14px]"
          />
          <View className="flex-row items-center mt-2 px-2">
            <View className="flex-1 flex-row items-center gap-2">
              <Text className="text-text-3 text-[13.5px] font-outfit-bold">
                {item.name}
              </Text>
              <Text className="text-text-4 text-[13.5px] font-outfit-light">
                <Text className="text-text-6">-</Text> {item.address}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <FontAwesome5 name="walking" size={14} color="#2F2F2F" />
              <Text className="text-text-3 text-[12px]  font-outfit-bold">
                {displayDistance}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-x-1 mt-1 px-2">
            <FontAwesome name="star" size={12} color="#2F2F2F" />
            <Text className="text-[12px] font-outfit-bold text-text-5">
              {item.average_rating === 0
                ? "Sin reseñas"
                : item.average_rating.toFixed(1) +
                  " " +
                  "(" +
                  item._count?.reviews +
                  ")"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [location?.coords, CARD_WIDTH, router],
  );

  const onSubmit = () => {
    setQuery(localQuery);
    Keyboard.dismiss();

    mapRef.current?.animateToRegion(
      {
        latitude: Number(lat),
        longitude: Number(lng),
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      },
      800,
    );
  };

  useEffect(() => {
    if (locales.length === 0) return;

    setPinImages((prevImages) => {
      const imagenesValidas: { [key: string]: string } = {};
      locales.forEach((loc) => {
        if (prevImages[loc.id]) {
          imagenesValidas[loc.id] = prevImages[loc.id];
        }
      });
      return imagenesValidas;
    });
  }, [locales]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 300,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [translateX]);

  const handleRegionChangeComplete = (region: any, details: any) => {
    if (details && details.isGesture === false) {
      return;
    }

    setBounds({
      minLat: region.latitude - region.latitudeDelta / 2,
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLng: region.longitude - region.longitudeDelta / 2,
      maxLng: region.longitude + region.longitudeDelta / 2,
    });
  };

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={mapStyle}
        minZoomLevel={12}
        maxZoomLevel={20}
        initialRegion={{
          latitude: Number(lat),
          longitude: Number(lng),
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={() => {
          setTimeout(() => {
            mapRef.current?.animateToRegion(
              {
                latitude: Number(lat),
                longitude: Number(lng),
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              },
              800,
            );
          }, 100);
        }}
      >
        {mapMarkers}
      </MapView>

      <View style={{ position: "absolute", top: -10000, left: -10000 }}>
        {hiddenPinGenerators}
      </View>

      {/* CAPA DE UI */}
      <SafeAreaView
        pointerEvents="box-none"
        className="flex-col justify-between relative h-full"
      >
        {/* Barra de busqueda */}
        <View className="flex gap-3 items-center flex-row justify-evenly pt-4 px-6 mx-auto w-full">
          <View
            className="flex-[1] border overflow-hidden relative border-gray-400 justify-start w-full bg-bg-gray rounded-full flex-row items-center gap-2"
            pointerEvents="box-none"
          >
            <View className="absolute left-4 z-10" pointerEvents="none">
              <Feather name="search" size={20} color="#707070" />
            </View>

            <TextInput
              className="flex-[1] ps-14 h-full rounded-[40px] font-outfit-regular placeholder:text-text-5"
              placeholder={`Buscá en ${
                address?.region?.split("Provincia de ")[1] || "tu zona"
              }`}
              placeholderTextColor="#6B7280"
              value={localQuery}
              onChangeText={setLocalQuery}
              onSubmitEditing={onSubmit}
              returnKeyType="search"
            />
            {isLoading && (
              <Animated.View
                className={"absolute bottom-[-1px] bg-bg-red"}
                style={{
                  width: 100,
                  height: 3.5,
                  borderRadius: 999,
                  transform: [{ translateX }],
                }}
              />
            )}
          </View>

          {/* Botón de filtro */}
          <TouchableOpacity
            onPress={() => filterModalRef.current?.open()}
            className="border border-gray-400"
            style={{
              backgroundColor: "#f5f5f5",
              padding: 11,
              borderRadius: 999,
            }}
          >
            <Ionicons name="options-sharp" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Botón de ubicación */}
        <View className="px-4 items-end mb-[18%]">
          <TouchableOpacity
            onPress={() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: Number(lat),
                  longitude: Number(lng),
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                },
                1000,
              );
            }}
            className="bg-white w-[56px] h-[56px] rounded-full justify-center items-center shadow-md border border-gray-200"
          >
            <MaterialIcons name="my-location" size={24} color="#444" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- BOTTOM MODAL DE FILTROS --- */}
      <FilterComponent
        ref={filterModalRef}
        filters={filters}
        onApply={(nuevosFiltros: preferencesDTO) => {
          setFilters(nuevosFiltros);
          filterModalRef.current?.close();
        }}
        onCancel={() => filterModalRef.current?.close()}
      />

      {/* --- BOTTOM SHEET DE LOCALES CERCANOS --- */}
      {isFocused && (
        <BottomSheet
          ref={bottomSheet}
          index={0}
          snapPoints={["13%", "25%"]}
          enablePanDownToClose={false}
          enableDynamicSizing={false}
          enableOverDrag={false}
          enableContentPanningGesture={true}
          enableHandlePanningGesture={true}
          handleIndicatorStyle={{
            backgroundColor: "#B53325",
            width: 35,
            height: 5,
            borderRadius: 9999,
            marginBottom: 6,
            marginTop: 5,
          }}
          backgroundStyle={{
            borderRadius: 20,
            borderColor: "#B53325",
            borderWidth: 0.5,
          }}
        >
          <BottomSheetView
            style={{ flex: 1, paddingBottom: 30, width: "100%" }}
          >
            {!isLoading && locales.length === 0 ? (
              <View className="flex-row justify-center items-center py-2 gap-2 border-y border-dashed border-gray-300">
                <Ionicons name="restaurant" size={16} color="#B53325" />
                <Text className="text-text-3 text-[14px] font-outfit-light">
                  No hay locales cerca
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={sortedLocales}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 10}
                decelerationRate="fast"
                snapToAlignment="center"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={renderLocalItem}
                onScrollBeginDrag={() => {
                  isScrolling.current = true;
                }}
                onMomentumScrollEnd={() => {
                  isScrolling.current = false;
                }}
              />
            )}
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}
