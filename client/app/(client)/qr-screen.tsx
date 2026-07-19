import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

import { useAuth } from "@/context/auth/AuthContext";
import { useQRParser } from "@/utils/qr";
import { useOrderStore } from "@/context/store/useOrderStore";
import { QROrderPurchase } from "@/interface/global";

export default function QRScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { generateQR } = useQRParser();
  const { width } = useWindowDimensions();

  const { tempOrder, clearTempOrder } = useOrderStore();

  const payload: QROrderPurchase = {
    t: "purchase",
    oi: "IDPUVvzLnP",
    l: "fPzxwgzxwJ",
    u: "PNACq4A9krJq",
  };

  const rawData = generateQR(payload);

  console.log("RAW DATA", rawData);

  const isOrder = !!tempOrder;

  useEffect(() => {
    return () => {
      clearTempOrder();
    };
  }, [clearTempOrder]);

  if (!user) return null;

  let qrValue: string;

  if (tempOrder) {
    const rawData = generateQR(tempOrder);
    // Para órdenes, redirige a la pantalla de órdenes del staff con el payload de la orden
    qrValue = `dualeat://local/${tempOrder}/orders?tab=new&qrPayload=${encodeURIComponent(JSON.stringify(tempOrder))}&data=${rawData}`;
  } else {
    const rawData = generateQR({
      t: "user",
      id: user.id,
    });
    // Para usuarios, redirige directamente a su perfil
    qrValue = `dualeat://profile/${user.id}?data=${rawData}`;
  }

  console.log(qrValue);


  return (
    <SafeAreaView
      className="flex-1 bg-black px-6 py-2"
      edges={["top", "bottom", "left", "right"]}
    >
      {/* HEADER */}
      <View className="flex-row justify-center items-center py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>

        <Text className="text-white text-base font-outfit-bold">
          {isOrder ? "Código QR del Pedido" : "Tu Código QR"}
        </Text>
      </View>

      {/* QR CONTAINER */}
      <View className="flex-1 justify-center items-center py-4">
        <View className="p-6 border-2 border-white/20 rounded-[36px] bg-black items-center justify-center mb-6">
          <QRCode
            value={qrValue}
            size={width * 0.52}
            color="#ffffff"
            backgroundColor="transparent"
            ecl="M"
          />
        </View>

        {/* HELP TEXT */}
        {isOrder ? (
          <Text className="text-gray-400 text-center text-sm font-outfit-light leading-5 px-6">
            Muestra este{" "}
            <Text className="text-white font-outfit-bold">
              código QR del pedido
            </Text>{" "}
            en el restaurante para solicitar tu comida.
          </Text>
        ) : (
          <Text className="text-gray-400 text-center text-sm font-outfit-light leading-5 px-6">
            Muestra este{" "}
            <Text className="text-white font-outfit-bold">código QR</Text> a las
            personas que quieres que vean tu perfil.
          </Text>
        )}
      </View>

      {/* METADATA INFO */}
      <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 gap-y-3.5">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-sm font-outfit-regular">
            Nombre de Perfil
          </Text>
          <Text className="text-white text-sm font-outfit-bold">
            {user.name}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-sm font-outfit-regular">
            Email de perfil
          </Text>
          <Text className="text-white text-sm font-outfit-bold">
            {user.email}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-sm font-outfit-regular">ID</Text>
          <Text className="text-white text-sm font-outfit-bold">
            #{isOrder ? "PEDIDO_NUEVO" : user.id}
          </Text>
        </View>
      </View>

      {/* ROW BUTTONS */}

      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.8}
        className="bg-bg-blue py-3.5 rounded-full flex-row items-center justify-center gap-x-2"
      >
        <MaterialCommunityIcons name="arrow-left" size={18} color="#ffffff" />
        <Text className="text-white font-outfit-bold text-sm">Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
