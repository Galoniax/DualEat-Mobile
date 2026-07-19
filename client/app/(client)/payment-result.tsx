import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useEffect } from "react";

export default function PaymentResultScreen() {
  const router = useRouter();
  

 const pathname = usePathname(); // Te da la ruta actual, ej: "/profile/settings"
const urlCompleta = Linking.createURL(pathname);

console.log("BANANA URL COMPLETA:", urlCompleta);



  // Obtener parámetros del deep link
  const { status, payment_id, preference_id, merchant_order_id } =
    useLocalSearchParams<{
      status?: string;
      payment_id?: string;
      preference_id?: string;
      merchant_order_id?: string;
    }>();

  const isSuccess = status === "success" || status === "approved";
  const isPending = status === "pending" || status === "in_process";

  // Configuración visual según el estado del pago
  let iconName: keyof typeof Ionicons.glyphMap = "close-circle";
  let iconColor = "#B53325"; // Rojo brand de la app
  let title = "Pago Rechazado";
  let description =
    "No pudimos procesar tu pago. Por favor, intenta de nuevo o selecciona otro método de pago.";
  let statusText = "Fallo";

  if (isSuccess) {
    iconName = "checkmark-circle";
    iconColor = "#2E7D32"; // Verde de éxito elegante
    title = "¡Pago Exitoso!";
    description =
      "Tu pago ha sido procesado correctamente y la orden ya está confirmada en el local.";
    statusText = "Aprobado";
  } else if (isPending) {
    iconName = "time";
    iconColor = "#E6A657"; // Naranja de pendiente
    title = "Pago Pendiente";
    description =
      "Tu pago está siendo procesado por Mercado Pago. Te notificaremos cuando se complete.";
    statusText = "Pendiente";
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg-semi-white"
      edges={["top", "bottom", "left", "right"]}
    >
      <View className="flex-1 justify-between px-6 py-8">
        {/* Espaciador superior */}
        <View />

        {/* Contenedor del Estado Principal */}
        <View className="items-center justify-center">
          <View
            style={{
              shadowColor: iconColor,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 4,
            }}
            className="w-24 h-24 rounded-full bg-white justify-center items-center mb-6"
          >
            <Ionicons name={iconName} size={64} color={iconColor} />
          </View>

          <Text className="text-[26px] font-outfit-bold text-text-3 text-center mb-2">
            {title}
          </Text>

          <Text className="text-[15px] font-outfit-regular text-text-5 text-center px-4 leading-5">
            {description}
          </Text>
        </View>

        {/* Detalle de la Transacción */}
        <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <Text className="text-[16px] font-outfit-bold text-text-3 mb-4">
            Detalles de la transacción
          </Text>

          <View className="flex-col gap-y-3">
            {/* Estado */}
            <View className="flex-row justify-between items-center">
              <Text className="text-[14px] font-outfit-light text-text-4">
                Estado
              </Text>
              <Text
                style={{ color: iconColor }}
                className="text-[14px] font-outfit-bold"
              >
                {statusText}
              </Text>
            </View>

            {/* ID de Pago */}
            {payment_id && (
              <View className="flex-row justify-between items-center">
                <Text className="text-[14px] font-outfit-light text-text-4">
                  ID de Pago
                </Text>
                <Text className="text-[14px] font-outfit-regular text-text-3">
                  {payment_id}
                </Text>
              </View>
            )}

            {/* ID de Preferencia */}
            {preference_id && (
              <View className="flex-row justify-between items-center">
                <Text className="text-[14px] font-outfit-light text-text-4">
                  Preferencia
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-[14px] font-outfit-regular text-text-3 max-w-[200px]"
                >
                  {preference_id}
                </Text>
              </View>
            )}

            {/* ID Orden de Mercado Pago */}
            {merchant_order_id && (
              <View className="flex-row justify-between items-center">
                <Text className="text-[14px] font-outfit-light text-text-4">
                  Orden MP
                </Text>
                <Text className="text-[14px] font-outfit-regular text-text-3">
                  {merchant_order_id}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botón de Acción */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.replace("/");
          }}
          className="w-full bg-bg-red py-3.5 rounded-[12px] items-center justify-center shadow-md shadow-red-200"
        >
          <Text className="text-white font-outfit-bold text-[16px]">
            Entendido
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
