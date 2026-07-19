import React, { useState, useCallback, useMemo } from "react";
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

import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect, useRouter } from "expo-router";

import { useLocation } from "@/context/extension/LocationContext";

import { getLocalByNearby } from "@/services/discovery.api";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { Local } from "@/interface/global";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ROUTES } from "@/constants/constants";
import { useAuth } from "@/context/auth/AuthContext";
import { useQRParser } from "@/utils/qr";
import { globalToast as toast } from "@/utils/toast";
import ScannerView from "@/components/features/qr/ScannerView";
import { useQuery } from "@tanstack/react-query";
import { FontAwesome5 } from "@expo/vector-icons";

import { useIsFocused } from "@react-navigation/native";
import { useRedirecter } from "@/hooks/router/useRedirecter";
import { usePurchase } from "@/hooks/api/payment/usePayment";

export default function QrScreen() {
  const router = useRouter();
  const { location } = useLocation();

  const { user } = useAuth();
  const { redirect } = useRedirecter();

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [scanned, setScanned] = useState(false);
  const { parseQR } = useQRParser();

  const isFocused = useIsFocused();

  const CARD_WIDTH = width * 0.85;

  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const { mutate: processPayment } = usePurchase();

  useFocusEffect(
    useCallback(() => {
      setScanned(false);

      return () => {
        setScanned(false);
      };
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

  const locals = useMemo(() => {
    return [...nearbyLocals].sort((a, b) => {
      const distanceA = location?.coords
        ? calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            a.latitude,
            a.longitude,
          )
        : 0;

      const distanceB = location?.coords
        ? calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            b.latitude,
            b.longitude,
          )
        : 0;

      return distanceA - distanceB;
    });
  }, [nearbyLocals, location]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

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
              params: { local_id: item.id },
            });
          }}
          className="rounded-full flex-row items-center py-2 border border-gray-200 justify-between px-4 border-opacity-50"
        >
          <Image
            source={{ uri: item.image_url }}
            className="w-8 h-8 rounded-full border border-gray-200 mr-4"
          />

          <Text
            className="text-text-1 font-outfit-bold text-sm"
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View className="flex-row items-center gap-2">
            <FontAwesome5 name="walking" size={12} color="#fff" />
            <Text className="text-text-1 text-xs font-outfit-bold">
              {displayDistance}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [CARD_WIDTH, location, router],
  );

  const handleQRRead = (data: string) => {
    if (scanned) return;
    setScanned(true);

    let parsedData = data;
    // Si el QR escaneado es una URL completa (dualeat://... o https://...)
    if (data.startsWith("dualeat://") || data.startsWith("https://")) {
      try {
        // Reemplazamos temporalmente para usar el parser de URL estándar
        const cleanUrl = data.replace("dualeat://", "https://");
        const url = new URL(cleanUrl);
        const queryData =
          url.searchParams.get("data") || url.searchParams.get("qrPayload");

        if (queryData) {
          parsedData = decodeURIComponent(queryData);
        } else {
          // Si es una ruta limpia sin query param de datos comprimidos (ej: dualeat://profile/123)
          const path = url.pathname + url.search;
          router.push(path as any);
          return;
        }
      } catch (e) {
        console.log("Error al procesar la URL del QR:", e);
      }
    }

    const result = parseQR(parsedData);

    if (!result.success) {
      toast.error("Error", result.error || "Error al leer el código QR.");

      setTimeout(() => setScanned(false), 2000);
      return;
    }

    console.log("RESULTADO: ", result.data);

    const response = result.data;

    if (response?.t === "order") {
      router.push({
        pathname: "/(staff)/local/[local_id]/orders",
        params: {
          local_id: response?.l,
          tab: "new",
          qrPayload: JSON.stringify(result.data),
        },
      });
    } else if (response?.t === "user") {
      router.push(ROUTES.USER.PROFILE(response?.id));
    } else if (response?.t === "purchase") {
      processPayment(
        {
          order_id: response?.oi,
        },
        {
          onError: (err: any) => {
            toast.error("Error", err.message || "No se pudo procesar el pago. Intentá de nuevo.");
            setScanned(false);
          },
          onSettled: () => {
            setTimeout(() => setScanned(false), 2000);
          },
        },
      );
    }
  };

  if (!isFocused || !user) return null;

  return (
    <ScannerView
      onScan={handleQRRead}
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          redirect();
        }
      }}
      isScanningEnabled={!scanned}
    >
      {/* Panel Inferior (USER) */}
      {user.workplaces.length === 0 && (
        <BottomSheet
          index={0}
          enableDynamicSizing={true}
          enableOverDrag={false}
          enablePanDownToClose={false}
          enableHandlePanningGesture={true}
          enableContentPanningGesture={true}
          backgroundStyle={{ borderRadius: 30, backgroundColor: "#1a1a1a" }}
          handleIndicatorStyle={{ display: "none" }}
        >
          <BottomSheetView
            style={{ flex: 1, paddingBottom: insets.bottom + 30 }}
          >
            <View className="flex-col gap-y-3 items-center">
              <Ionicons name="qr-code-sharp" size={20} color="#fff" />

              <View className="w-full border-b border-dashed border-gray-300" />

              <Text className="text-text-1 text-sm font-outfit-bold">
                Locales cercanos
              </Text>
            </View>

            {/* CARRUSEL DE LOCALES */}
            <View className="flex-1 mt-4">
              {isLoading ? (
                <ActivityIndicator size={24} color="#3578e4" className="mt-6" />
              ) : (
                <FlatList
                  data={locals}
                  keyExtractor={(item: Local) => item.id}
                  renderItem={({ item }: { item: Local }) =>
                    renderLocalCard({ item })
                  }
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={width}
                  ListEmptyComponent={
                    <View
                      style={{ width: width }}
                      className="flex-col gap-y-4 items-center justify-center"
                    >
                      <Text className="text-text-2 font-outfit-light text-sm text-center px-4  max-w-[80%]">
                        No detectamos locales a menos de 500 metros. Acércate a
                        uno para escanear.
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          refetch();
                        }}
                        className="py-2 px-4 w-fit bg-bg-blue rounded-full flex-row gap-x-2 items-center justify-center"
                      >
                        <Ionicons name="reload" size={16} color="#fff" />
                        <Text className="text-white text-xs font-outfit-bold">
                          Actualizar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  }
                  decelerationRate="fast"
                  snapToAlignment="center"
                  contentContainerStyle={
                    locals.length > 0
                      ? { paddingHorizontal: 16, gap: 12 }
                      : { flexGrow: 1 }
                  }
                />
              )}
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}
    </ScannerView>
  );
}
