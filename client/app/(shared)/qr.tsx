import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import QRCode from "react-native-qrcode-svg";

import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { useLocation } from "@/context/extension/LocationContext";

import { getLocalByNearby } from "@/services/discovery.api";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { Local } from "@/interface/global";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ROUTES } from "@/constants/constants";
import { useAuth } from "@/context/auth/AuthContext";
import { useQRParser } from "@/utils/qr";
import { showToast } from "@/utils/toast";
import ScannerView from "@/components/qr/ScannerView";
import { useRedirect } from "@/hooks/router/useRedirect";

export default function QrScreen() {
  // =========================================================
  // 1. HOOKS DE NAVEGACIÓN Y CONTEXTO
  // =========================================================
  const router = useRouter();
  const { location } = useLocation();
  const { user } = useAuth();
  const { redirect } = useRedirect();

  const { qrValue } = useLocalSearchParams<{ qrValue: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // =========================================================
  // 2. ESTADOS LOCALES
  // =========================================================
  const [nearbyLocals, setNearbyLocals] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanned, setScanned] = useState(false);

  const { parseQR } = useQRParser();

  const bottomSheetRef = useRef<BottomSheet>(null);

  // =========================================================
  // 4. CONSTANTES Y VARIABLES DERIVADAS
  // =========================================================
  const CARD_WIDTH = width * 0.85;

  // Fetch de locales basado en ubicación
  useEffect(() => {
    if (!location?.coords) return;
    if (nearbyLocals.length === 0) {
      fetchLocals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, nearbyLocals.length]);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      bottomSheetRef.current?.expand();
      return () => {
        bottomSheetRef.current?.close();
      };
    }, []),
  );

  const fetchLocals = async () => {
    setIsLoading(true);
    try {
      const response = await getLocalByNearby(
        location?.coords.latitude || 0,
        location?.coords.longitude || 0,
      );

      if (response?.success && response.data) {
        setNearbyLocals(response.data as Local[]);
      }
    } catch (e) {
      console.log("Error consiguiendo los locales cercanos: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // 6. FUNCIONES Y RENDERIZADORES AUXILIARES
  // =========================================================
  const renderLocalCard = ({ item }: { item: Local }) => {
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
        style={{ width: CARD_WIDTH }}
        key={item.id}
        onPress={(e) => {
          e.stopPropagation();
          router.push({
            pathname: ROUTES.USER.LOCAL,
            params: { slug: item.slug },
          });
        }}
        className=" rounded-full flex-row items-center py-2 mr-4 border border-gray-200 justify-between px-4 border-opacity-50"
      >
        <Image
          source={{ uri: item.image_url }}
          className="w-8 h-8 rounded-full border border-gray-200 mr-4"
        />

        <Text
          className="text-white font-dosis-bold text-[14px]"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <View className="flex-row items-center">
          <Text className="text-white text-[12px]  font-dosis-bold">
            {displayDistance}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // TODO
  const handleQRRead = (data: string) => {
    if (scanned) return;
    setScanned(true);

    const result = parseQR(data);

    if (!result.success) {
      showToast("error", result.error || "Error al leer el código QR.");

      setTimeout(() => setScanned(false), 2000);
      return;
    }

    if (result.data?.t === "order") {
    } else if (result.data?.t === "user") {
    }
  };

  console.log("QR DATA", qrValue);

  return (
    <ScannerView
      onScan={handleQRRead}
      onClose={() => redirect()}
      isScanningEnabled={!scanned}
    >
      {/* Panel Inferior (USER) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={["28%", "65%"]}
        enableDynamicSizing={false}
        enableOverDrag={false}
        enablePanDownToClose={false}
        enableHandlePanningGesture={true}
        enableContentPanningGesture={true}
        backgroundStyle={{ borderRadius: 30, backgroundColor: "#1a1a1a" }}
        handleIndicatorStyle={{
          backgroundColor: "#aaa",
          width: 35,
          height: 5,
          borderRadius: 9999,
          marginBottom: 2,
        }}
      >
        <BottomSheetView style={{ flex: 1, paddingBottom: insets.bottom + 30 }}>
          <View className="flex-row justify-center pb-4 border-b border-dashed border-gray-300">
            <Ionicons name="qr-code-sharp" size={30} color="#fff" />
          </View>

          <Text className="text-white text-center text-[13px] font-dosis-regular mt-4">
            -- Locales cercanos --
          </Text>

          {/* CARRUSEL DE LOCALES */}
          <View className="flex-1 mt-4">
            {isLoading ? (
              <ActivityIndicator size={24} color="#3578e4" className="mt-6" />
            ) : nearbyLocals.length > 0 ? (
              <FlatList
                data={nearbyLocals}
                keyExtractor={(item: Local) => item.id}
                renderItem={(e: { item: Local }) => renderLocalCard(e)}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                snapToAlignment="center"
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            ) : (
              <View className="items-center justify-center mt-4">
                <Text className="text-text-6 font-dosis-regular max-w-[80%] text-[14.5px] text-center px-4">
                  No detectamos locales a menos de 500 metros. Acércate a uno
                  para escanear.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    fetchLocals();
                  }}
                  className="py-2 px-4 w-fit bg-bg-blue rounded-full flex-row items-center justify-center mt-4"
                >
                  <Ionicons name="reload" size={18} color="#fff" />
                  <Text className="text-white text-[13px] font-dosis-bold ml-2">
                    Actualizar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* QR para escanear */}
          <View
            style={{ marginTop: 30, paddingTop: 30 }}
            className="flex-col w-full border-t border-dashed border-gray-300 justify-center items-center mb-2"
          >
            <QRCode
              value={
                qrValue || JSON.stringify({ t: "user", s: user?.slug || null })
              }
              size={230}
              color="#fff"
              logoSize={30}
              logoMargin={-1}
              logoBackgroundColor="#000"
              backgroundColor="transparent"
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </ScannerView>
  );
}
