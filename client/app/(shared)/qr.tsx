import React, { useState, useRef, useCallback } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";

import { useLocation } from "@/context/extension/LocationContext";

import { getLocalByNearby } from "@/services/discovery.api";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { Local, QRData } from "@/interface/global";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ROUTES } from "@/constants/constants";
import { useAuth } from "@/context/auth/AuthContext";
import { useQRParser } from "@/utils/qr";
import { showToast } from "@/utils/toast";
import ScannerView from "@/components/features/qr/ScannerView";
import { useQuery } from "@tanstack/react-query";
import { FontAwesome5 } from "@expo/vector-icons";

import { useIsFocused } from "@react-navigation/native";
import { useRedirecter } from "@/hooks/router/useRedirecter";
import { useOrderStore } from "@/context/store/useOrderStore";
export default function QrScreen() {
  // =========================================================
  // 1. HOOKS DE NAVEGACIÓN Y CONTEXTO
  // =========================================================
  const router = useRouter();
  const { location } = useLocation();
  const { user } = useAuth();
  const { redirect } = useRedirecter();

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // =========================================================
  // 2. ESTADOS LOCALES
  // =========================================================
  const [scanned, setScanned] = useState(false);
  const { parseQR, generateQR } = useQRParser();

  const isFocused = useIsFocused();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // =========================================================
  // 4. CONSTANTES Y VARIABLES DERIVADAS
  // =========================================================
  const CARD_WIDTH = width * 0.85;

  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const order = useOrderStore((state) => state.tempOrder);

  console.log(JSON.stringify(order, null, 2));

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      bottomSheetRef.current?.snapToIndex(0);
    }, []),
  );

  const {
    data: nearbyLocals = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["qr-locals", lat, lng],
    enabled: !!lat && !!lng,

    queryFn: async () => {
      if (!lat || !lng) return;

      try {
        const response = await getLocalByNearby(lat, lng);

        if (response && response.success && response.data) {
          return response.data as Local[];
        }
        return [];
      } catch (e) {
        console.log("Error consiguiendo locales cercanos: ", e);
        return [];
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.length === 0) {
        return 5000;
      }
      return false;
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // =========================================================
  // 6. FUNCIONES Y RENDERIZADORES AUXILIARES
  // =========================================================
  const renderLocalCard = useCallback(
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
            className="text-text-1 font-dosis-bold text-[14px]"
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View className="flex-row items-center gap-2">
            <FontAwesome5 name="walking" size={12} color="#fff" />
            <Text className="text-text-1 text-[12px]  font-dosis-bold">
              {displayDistance}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [CARD_WIDTH, location, router],
  );

  // TODO: data: string
  const handleQRRead = (data: string) => {
    if (scanned) return;
    setScanned(true);

    console.log("QR Data: ", data);

   

    const result = parseQR(data);

    //console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      showToast("error", result.error || "Error al leer el código QR.");

      setTimeout(() => setScanned(false), 2000);
      return;
    }

    /*const payload: QROrderPayload = {
        t: "order",
        oi: "create",
        l: localId,
        u: user.id,
        i: items.map((item) => ({
          id: item.food_id,
          q: item.quantity,
        })),
      }; */

    

    if (result.data?.t === "order") {
      // TODO: result.data.oi params order_id

      const order_id = result.data.oi;

      useOrderStore.getState().setTempOrder(result.data);

      router.push({
        pathname: ROUTES.SHARED.ORDER_INFO,
        params: { order_id },
      });
    } else if (result.data?.t === "user") {
    }
  };

  if (!isFocused || !user) return null;

  return (
    <ScannerView
      onScan={handleQRRead}
      onClose={() => {
        useOrderStore.getState().clearTempOrder();
        if (router.canGoBack()) {
          router.back();
        } else {
          redirect();
        }
      }}
      isScanningEnabled={!scanned}
    >
      {/* Panel Inferior (USER) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={["30%", "65%"]}
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
            ) : nearbyLocals?.length > 0 ? (
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
                    refetch();
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
                order
                  ? generateQR(order)
                  : generateQR({
                      t: "user",
                      s: user.slug,
                    } as QRData)
              }
              size={230}
              color="#fff"
              logoSize={30}
              logoMargin={-1}
              logoBackgroundColor="#000"
              backgroundColor="transparent"
              ecl="M"
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </ScannerView>
  );
}
