import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ImageBackground, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CameraView, useCameraPermissions } from "expo-camera";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { LightSensor } from "expo-sensors";




export default function QrScreen() {
  const [flashlight, setFlashlight] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();

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


        <View className="items-center px-5">
          <Text className="text-text-2 text-start text-[16px] font-dosis-light">
            Para que puedas descubrir los menús de tus locales favoritos en DualEat, necesitamos acceso a tu cámara.
          </Text>

          <View className="flex-row justify-start w-full gap-2 mt-4">
          {steps.map((step) => (
            <View
              key={step}
              className={`${step < (steps.length - 1)? "max-w-10" : "max-w-[6px]"}`}
              style={{
                height: 4,
                flex: 1,
                backgroundColor: step < (steps.length - 1) ? "#B53325" : "gray",
                borderRadius: 99,
              }}
            />
          ))}
        </View>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-bg-red px-6 py-4 w-full rounded-[15px] mt-10 items-center justify-center"
          >
            <Text className="text-white text-md">
              Conceder permiso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={requestPermission}
            className="mt-8 items-centerjustify-center"
          >
            <Text className="text-white text-md">
              Cerrar
            </Text>
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
              onPress={() => console.log("Cerrar")}
              className="w-10 h-10 items-center justify-center bg-black/20 rounded-full"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Centro: Escáner y Aviso */}
          <View className="flex-1 absolute bottom-[28%] left-0 right-0 justify-center items-center">
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
          <View className="bg-white absolute bottom-0 w-full rounded-t-[32px] px-6 pt-4 pb-10 shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </View>
            <View className="flex-row justify-center gap-10 mb-6">
              <TouchableOpacity className="items-center gap-2">
                <View className="w-16 h-16 rounded-full border border-gray-100 items-center justify-center bg-white shadow-sm elevation-2">
                  <MaterialCommunityIcons
                    name="bus"
                    size={30}
                    color="#374151"
                  />
                </View>
                <Text className="text-xs font-medium text-gray-500">
                  Transporte
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center gap-2">
                <View className="w-16 h-16 rounded-full border border-gray-100 items-center justify-center bg-white shadow-sm elevation-2">
                  <Ionicons
                    name="bag-handle-outline"
                    size={28}
                    color="#374151"
                  />
                </View>
                <Text className="text-xs font-medium text-gray-500">
                  Compras
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-center text-gray-800 text-lg font-bold px-4 leading-6">
              Usá tu QR para pagar viajes y compras
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
