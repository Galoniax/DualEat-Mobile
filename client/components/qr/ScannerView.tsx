import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LightSensor } from "expo-sensors";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import PermissionView from "@/components/error/permission";

import { useIsFocused } from "@react-navigation/native";

interface ScannerViewProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isScanningEnabled: boolean;
  children: React.ReactNode;
}

function ScannerView({
  onScan,
  onClose,
  isScanningEnabled,
  children,
}: ScannerViewProps) {
  // =========================================================
  // 1. ESTADOS LOCALES
  // =========================================================
  const isFocused = useIsFocused();

  const [permission, requestPermission] = useCameraPermissions();
  const [flashlight, setFlashlight] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [illuminance, setIlluminance] = useState(0);

  const insets = useSafeAreaInsets();
  const showFlashControls = illuminance < 10 || flashlight;

  // Sensor de luz
  useEffect(() => {
    LightSensor.setUpdateInterval(500);
    const subscription = LightSensor.addListener((data) => {
      setIlluminance(data.illuminance);
    });
    return () => subscription.remove();
  }, []);

  // =========================================================
  // 2. PERMISOS
  // =========================================================
  if (!permission) return <View className="flex-1 bg-black" />;
  if (!permission.granted) {
    return (
      <PermissionView
        type="QR"
        permission={permission}
        requestPermission={requestPermission}
      />
    );
  }

  if (!isFocused) return null;

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        enableTorch={flashlight}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          isScanningEnabled ? ({ data }) => onScan(data) : undefined
        }
      />

      <SafeAreaView
        style={{ paddingTop: insets.top + 10 }}
        className="absolute top-0 w-full z-10 px-4 flex-row justify-between items-center"
      >
        <TouchableOpacity
          onPress={onClose}
          className="p-1.5 bg-black/30 rounded-full"
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
          className="p-1.5 bg-black/30 rounded-full"
        >
          <Ionicons name="camera-reverse-outline" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

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

            <Animated.View
              entering={FadeIn.delay(100).duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <TouchableOpacity
                onPress={() => setFlashlight(!flashlight)}
                className={`w-14 h-14 rounded-full items-center justify-center border border-white/20 ${
                  flashlight ? "bg-white" : "bg-black/40"
                }`}
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

      {children}
    </View>
  );
}

export default ScannerView;
