import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export type ErrorType = 400 | 404 | 403 | 500 | 408;

const ERROR_CONFIG: Record<
  ErrorType,
  { id: string; title: string; message: string; actionLabel: string }
> = {
  400: {
    id: "400",
    title: "Datos inválidos",
    message:
      "Los datos proporcionados no son válidos. Por favor, verifica y vuelve a intentarlo.",
    actionLabel: "Volver",
  },

  404: {
    id: "404",
    title: "No encontrado",
    message:
      "Lo que buscas no existe o fue eliminado. Puede que el contenido haya sido movido a otro lugar.",
    actionLabel: "Volver",
  },
  403: {
    id: "403",
    title: "Acceso denegado",
    message:
      "No tienes permiso para ver esta información. Si crees que esto es un error, contacta al administrador o revisa tus credenciales.",
    actionLabel: "Ir al inicio",
  },
  500: {
    id: "500",
    title: "Problemas técnicos",
    message:
      "Nuestros servidores están teniendo dificultades. Estamos trabajando para solucionarlo, por favor intenta nuevamente en unos minutos.",
    actionLabel: "Volver",
  },
  408: {
    id: "408",
    title: "Tiempo de espera agotado",
    message:
      "La solicitud tardó demasiado en responder. Verifica tu conexión e inténtalo otra vez.",
    actionLabel: "Reintentar",
  },
};

export function ErrorView({
  type = 404,
  title,
  message,
  onAction,
  actionLabel,
}: {
  type?: ErrorType;
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  const error = require(`@/assets/images/Error.png`);
  const logo = require(`@/assets/icon/LogoDualEat.png`);

  const router = useRouter();

  const displayTitle = title || ERROR_CONFIG[type].title;
  const displayMessage = message || ERROR_CONFIG[type].message;
  const displayActionLabel = actionLabel || ERROR_CONFIG[type].actionLabel;

  const handleAction = () => {
    if (onAction) onAction();
    else router.back();

    return;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-semi-white">
      <View className="flex-1 items-center justify-center flex-col gap-2 px-6">
        <Image
          style={{ width: "100%", height: "40%", resizeMode: "contain" }}
          source={error}
          className="opacity-80"
        />

        <View
          style={{ backgroundColor: "rgba(181, 51, 37, 0.07)" }}
          className="items-center justify-center flex-row gap-2 px-3 py-1 rounded-full"
        >
          <Ionicons name="warning-outline" size={16} color="#B53325" />
          <Text className="text-bg-red text-[13px] font-dosis-bold">
            Error {type}
          </Text>
        </View>

        <Text
          style={{ fontSize: 24 }}
          className="text-center font-dosis-bold text-text-3"
        >
          {displayTitle}
        </Text>

        <Text
          style={{ fontSize: 15 }}
          className="text-text-5 font-dosis-regular mb-8 text-center leading-[25px]"
        >
          {displayMessage}
        </Text>

        <TouchableOpacity
          className="bg-bg-red flex-row items-center justify-center gap-2 w-full max-w-[90%] rounded-full py-3 shadow-sm active:opacity-80"
          onPress={handleAction}
        >
          <Image
            style={{ width: 20, height: 20, resizeMode: "contain" }}
            source={logo}
          />

          <Text
            style={{ fontSize: 14 }}
            className="text-white font-dosis-bold text-center"
          >
            {displayActionLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}