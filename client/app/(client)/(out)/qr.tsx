import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { LightSensor } from "expo-sensors";
import { useRouter } from "expo-router";

import CustomBottomSheet from "@/components/ui/BottomSheetModal";
import { useLocation } from "@/context/extension/LocationContext";

import { getLocalByNearby } from "@/services/discovery.api";
import { Local } from "@/interface/global";

export default function QrScreen() {
  const router = useRouter();
  const { location } = useLocation();

  const [flashlight, setFlashlight] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();

  const [nearbyLocals, setNearbyLocals] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { width } = useWindowDimensions(); 
  const CARD_WIDTH = width * 0.75;

  const Logo = require("@/assets/images/icon/LogoDualEat.png");

  // Estado para la luz ambiental
  const [illuminance, setIlluminance] = useState(0);

  useEffect(() => {
    LightSensor.setUpdateInterval(500);

    const subscription = LightSensor.addListener((data) => {
      setIlluminance(data.illuminance);
    });

    return () => {
      subscription.remove();
    };
  }, []);

 useEffect(() => {
    if (location?.coords) {
      const fetchLocals = async () => {
        setIsLoading(true);

        try {

        const response = await getLocalByNearby(
          location.coords.latitude,
          location.coords.longitude,
        );
        
        if (response?.success && response.data) {
          setNearbyLocals(response.data as Local[]);
        }
      } catch (e) {
        
      }
        setIsLoading(false);
      };

      fetchLocals();
    }
  }, [location]);

  const showFlashControls = illuminance < 20 || flashlight;

  if (!permission) return <View className="flex-1 bg-black" />;
  if (!permission.granted) {
    const steps = [1, 2, 3];
    return (
      <SafeAreaView className="flex-1 flex-col h-full justify-end pb-10">
        <ImageBackground
          source={require("@/assets/images/PermissionBG.png")}
          className="absolute inset-0  min-h-full w-full"
          resizeMode="cover"
        />

        <View className="flex px-5 flex-row items-center gap-3 mb-3">
          <Image source={Logo} className="w-6 h-6" />
          <Text className="text-white text-[14px] font-dosis-bold">
            DualEat
          </Text>
        </View>

        <Text className="text-white text-[28px] font-dosis-bold px-5 mb-3">
          Escanea, explora y <Text className="text-[#ec3f2b]">disfruta</Text>
        </Text>

        <View className="items-center px-8">
          <Text className="text-text-2 text-start text-[15px] font-dosis-light">
            Para que puedas descubrir los menús de tus locales favoritos en
            DualEat, necesitamos acceso a tu cámara.
          </Text>

          <View className="flex-row justify-start w-full gap-2 mt-4">
            {steps.map((step) => (
              <View
                key={step}
                className={`${step < steps.length - 1 ? "max-w-10" : "max-w-[6px]"}`}
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: step < steps.length - 1 ? "#B53325" : "gray",
                  borderRadius: 99,
                }}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-bg-red py-3.5 w-full rounded-[10px] mt-[60px] items-center justify-center"
          >
            <Text className="text-white font-dosis-bold text-md">
              Conceder permiso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-5 items-center py-3.5 w-full justify-center"
          >
            <Text className="text-white font-dosis-bold text-md">Cerrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView style={{ flex: 1 }} facing={facing} enableTorch={flashlight}>
        <View className="flex-1 relative">
          <SafeAreaView className="absolute top-0 w-full z-10 px-4 pt-2 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center bg-black/20 rounded-full"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Centro: Escáner y Aviso */}
          <View className="flex-1 absolute bottom-[35%] left-0 right-0 justify-center items-center">
            {showFlashControls && (
              <>
                {!flashlight && (
                  <Animated.View
                    entering={FadeIn.duration(100)}
                    exiting={FadeOut.duration(200)}
                    className="bg-black/60 px-5 py-2.5 rounded-full mb-6 backdrop-blur-md"
                  >
                    <Text className="text-white font-medium text-sm">
                      Hay poca luz, encendé la linterna
                    </Text>
                  </Animated.View>
                )}

                {/* Botón Linterna */}
                <Animated.View
                  entering={FadeIn.delay(100).duration(200)}
                  exiting={FadeOut.duration(200)}
                >
                  <TouchableOpacity
                    onPress={() => setFlashlight(!flashlight)}
                    className={`w-14 h-14 rounded-full items-center justify-center border border-white/20 ${flashlight ? "bg-white" : "bg-black/40"}`}
                  >
                    <Ionicons
                      name={flashlight ? "flashlight" : "flashlight-outline"}
                      size={26}
                      color={flashlight ? "black" : "white"}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>

          {/* Panel Inferior */}
          <CustomBottomSheet modal={false} type={1} block={true} dark={true}>
            <View style={{ flex: 1 }}>
              <View className="flex-row justify-center py-4 border-b border-dashed border-gray-50">
                <Ionicons name="qr-code-sharp" size={30} color="#fff" />
              </View>
              <Text className="text-white font-dosis-regular text-[15px] text-center px-4 mt-4">
                Locales cercanos a tu ubicación
              </Text>
            </View>
          </CustomBottomSheet>
        </View>
      </CameraView>
    </View>
  );
}
