import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Animated,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "@/context/extension/LocationContext";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomBottomSheet from "@/components/ui/BottomSheetModal";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import { useIsFocused } from "@react-navigation/native";

import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import FilterComponent, {
  FilterViewMode,
  initialFilters,
} from "@/components/ui/FilterComponent";

import { getLocalInBounds } from "@/services/discovery.api";
import { Local } from "@/interface/global";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import PinMarker from "@/components/ui/Marker";
import { useFocusEffect } from "expo-router";

import { mapStyle } from "@/constants/constants";

export default function MapScreen() {
  const { location, address } = useLocation();
  const isFocused = useIsFocused();

  // --- UBICACIÓN --
  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const [bounds, setBounds] = useState<{
    minLat: number | null;
    maxLat: number | null;
    minLng: number | null;
    maxLng: number | null;
  } | null>(null);

  const [locales, setLocales] = useState<Local[]>([]);
  const [query, setQuery] = useState("");

  const [pinImages, setPinImages] = useState<Record<string, string>>({});

  // --- REF ---
  const inputRef = useRef<TextInput | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const bottomSheet = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const translateX = useRef(new Animated.Value(-300)).current;

  // --- ESTADOS ---
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  const [modal, setModal] = useState<FilterViewMode>("all");
  const [loading, setLoading] = useState(true);

  const filterSheet = (mode: FilterViewMode, open: boolean) => {
    setModal(mode);
    if (open) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  };

  const handlePinCaptured = (id: string, uri: string) => {
    setPinImages((prev) => ({ ...prev, [id]: uri }));
  };

  useEffect(() => {
    const fetchLocals = async () => {
      try {
        setLoading(true);
        if (!bounds || !isFocused) return;

        if (bounds.minLat && bounds.maxLat && bounds.minLng && bounds.maxLng) {
          const response = await getLocalInBounds(
            bounds.minLat,
            bounds.maxLat,
            bounds.minLng,
            bounds.maxLng,
            filters,
            query,
          );

          if (response && response.success) {
            const locales = response.data as Local[];

            setPinImages((prevImages) => {
              const imagenesValidas: { [key: string]: string } = {};
              locales.forEach((loc) => {
                if (prevImages[loc.id]) {
                  imagenesValidas[loc.id] = prevImages[loc.id];
                }
              });
              return imagenesValidas;
            });

            setLocales(locales);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchLocals, 500);
    return () => clearTimeout(timeoutId);
  }, [bounds, filters, query, isFocused]);

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

  useFocusEffect(
    useCallback(() => {
      bottomSheetRef.current?.expand();
      return () => {
        bottomSheetRef.current?.close();
      };
    }, []),
  );

  const handleRegionChangeComplete = (region: any) => {
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

  console.log("Locales:", JSON.stringify(locales, null, 2));

  const focusInput = () => {
    inputRef.current?.focus();
  };

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
        minZoomLevel={14}
        maxZoomLevel={20}
        initialRegion={{
          latitude: Number(lat),
          longitude: Number(lng),
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {locales.map((loc) => {
          const uri = pinImages[loc.id];

          if (!uri) return null;

          return (
            <Marker
              key={`marker-${loc.id}`}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              image={{ uri: uri }}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 1 }}
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
              }}
            />
          );
        })}
      </MapView>

      <View style={{ position: "absolute", top: -10000, left: -10000 }}>
        {locales.map((loc) => {
          if (pinImages[loc.id]) return null;

          return (
            <PinMarker
              key={`generator-${loc.id}`}
              loc={loc}
              onCaptured={handlePinCaptured}
            />
          );
        })}
      </View>

      {/* CAPA DE UI */}
      <SafeAreaView
        pointerEvents="box-none"
        className="flex-col justify-between relative h-full"
      >
        {/* Barra de busqueda */}
        <View className="flex gap-3 items-center flex-row justify-evenly pt-4 px-6 mx-auto w-full">
          <View
            onTouchStart={focusInput}
            className="flex-[1] border overflow-hidden relative border-gray-400 justify-start w-full bg-bg-gray rounded-full flex-row items-center gap-2"
            pointerEvents="box-none"
          >
            <Feather name="search" className="ps-4" size={20} color="#707070" />

            <TextInput
              ref={inputRef}
              className="rounded-[40px] font-dosis-medium placeholder:text-text-5"
              placeholder={`Buscá en ${
                address?.region?.split("Provincia de ")[1] || "tu zona"
              }`}
              placeholderTextColor="#6B7280"
            />
            {loading && (
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
            onPress={() => filterSheet("all", true)}
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
        <View className="px-4 items-end mb-[15%]">
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

      {/* --- FILTROS --- */}
      <CustomBottomSheet
        ref={bottomSheetRef}
        modal={true}
        type={2}
        scrollable={true}
      >
        <View style={{ flex: 1 }} className="px-1">
          {/* --- Header del filtro --- */}
          <View className="flex-row relative justify-center items-center pb-5 gap-4 border-b border-dashed border-gray-200">
            <TouchableOpacity
              className="absolute left-4 top-0 z-10"
              onPress={() => filterSheet("all", false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-[18px] font-dosis-bold text-text-3">
              Filtros
            </Text>
          </View>

          {/* Este componente ahora maneja su propio scroll */}
          <FilterComponent
            filters={tempFilters}
            setPending={setTempFilters}
            viewMode={modal}
          />

          {/* --- Botones inferiores fijos --- */}
          <View className="flex-row gap-4 p-4 border-t border-gray-200 bg-white">
            <TouchableOpacity
              className="flex-1 py-3 rounded-full border border-gray-300 items-center justify-center"
              onPress={() => {
                setTempFilters(initialFilters);
                setFilters(initialFilters);
              }}
            >
              <Text className="font-dosis-bold text-gray-700">Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-full bg-bg-red items-center justify-center shadow-sm"
              onPress={() => {
                setFilters(tempFilters);
                filterSheet("all", false);
              }}
            >
              <Text className="text-white font-dosis-bold text-base">
                Aplicar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>

      {/* --- BOTTOM SHEET DE LOCALES CERCANOS --- */}
      <BottomSheet
        ref={bottomSheet}
        index={0}
        snapPoints={["10%", "20%"]}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        enableOverDrag={false}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        handleIndicatorStyle={{
          backgroundColor: "#2F2F2F",
          width: 35,
          height: 5,
          borderRadius: 9999,
          marginBottom: 10,
        }}
      >
        <BottomSheetView style={{ flex: 1, paddingBottom: 30 }}>
          {!loading && locales.length === 0 ? (
            <View className="flex-row justify-center py-2 border-y border-dashed border-gray-300">
              <Text className="text-text-3 text-[14px] font-dosis-regular">
                No hay locales cerca
              </Text>
            </View>
          ) : (
            <View className="flex-row justify-center pb-4 border-b border-dashed border-gray-300">
              <Ionicons name="qr-code-sharp" size={30} color="#fff" />
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}