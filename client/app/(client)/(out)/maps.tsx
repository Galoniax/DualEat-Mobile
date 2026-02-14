import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocation } from "@/context/extension/LocationContext";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomBottomSheet from "@/components/ui/BottomSheetModal";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FilterComponent, {
  FilterViewMode,
  initialFilters,
} from "@/components/ui/FilterComponent";
import { leafletHTML } from "@/constants/constants";

import { getLocalInBounds } from "@/services/discovery.api";

export default function MapScreen() {
  const { location, address } = useLocation();

  // --- UBICACIÓN --
  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const [bounds, setBounds] = useState({
    minLat: 0 || null,
    maxLat: 0 || null,
    minLng: 0 || null,
    maxLng: 0 || null,
  });

  // --- REF ---
  const inputRef = useRef<TextInput | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const webViewRef = useRef<WebView>(null);

  // --- ESTADOS ---
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  const [modal, setModal] = useState<FilterViewMode>("all");
  const [loading, setLoading] = useState(true);

  const filterSheet = (mode: FilterViewMode, open: boolean) => {
    setModal(mode);
    if (open) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  };

  // --- ACTUALIZAR UBICACIÓN EN EL MAPA ---
  useEffect(() => {
    if (location && webViewRef.current) {
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      webViewRef.current.injectJavaScript(
        `updateUserLocation(${lat}, ${lng}); true;`,
      );
    }
  }, [location]);

  useEffect(() => {
    setTimeout(async () => {
      try {
        setLoading(true);

        if (bounds.minLat && bounds.maxLat && bounds.minLng && bounds.maxLng) {
          const response = await getLocalInBounds(
            bounds.minLat!,
            bounds.maxLat!,
            bounds.minLng!,
            bounds.maxLng!,
            filters,
          );

          if (response && response.success) {
            //console.log("Locales obtenidos:", locales);
            //console.log("Locales por response:", response.data);
            webViewRef.current?.injectJavaScript(
              `updateLocales(${JSON.stringify(response.data)}); true;`,
            );
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds, filters]);

  // --- MENSAJES DESDE EL MAPA (DISPARADOR) ---
  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "click") alert("Abrir local ID: " + data.id);

      if (data.type === "bounds") {
        console.log("Bounds:", data.bounds);
        setBounds(data.bounds);
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, fontFamily: "Dosis-Regular" }}>
          Obteniendo ubicación...
        </Text>
      </View>
    );
  }

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        mixedContentMode="always"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={{ html: leafletHTML(Number(lat), Number(lng), []) }}
        onMessage={handleMapMessage}
      />

      {/* CAPA DE UI */}
      <SafeAreaView
        pointerEvents="box-none"
        className="absolute inset-0 z-50 flex-col justify-between"
      >
        <View className="flex gap-3 items-center flex-row justify-evenly pt-4 px-6 mx-auto w-full">
          <View
            onTouchStart={focusInput}
            className="flex-[1] justify-start w-full bg-bg-gray rounded-full flex-row items-center gap-2"
            pointerEvents="box-none"
          >
            <Feather name="search" className="ps-4" size={22} color="#707070" />

            <TextInput
              ref={inputRef}
              className="rounded-[40px] placeholder:text-text-5"
              placeholder={`Buscá en ${
                address?.region?.split("Provincia de ")[1] || "tu zona"
              }`}
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Botón de filtro */}
          <TouchableOpacity
            onPress={() => filterSheet("all", true)}
            style={{
              backgroundColor: "#f5f5f5",
              padding: 11,
              borderRadius: 999,
            }}
          >
            <Ionicons name="options-sharp" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View
          className="px-4 pb-6 items-center"
          pointerEvents="box-none"
        ></View>
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
    </View>
  );
}

// Estilos básicos para el mapa y la pantalla
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
});
