import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type PermissionType = "QR" | "QR_STAFF";

interface PermissionViewProps {
  type: PermissionType;
  requestPermission: () => void;
}

const PermissionView = ({ type, requestPermission }: PermissionViewProps) => {
  const steps = [1, 2, 3];
  const Logo = require("@/assets/icon/LogoDualEat.png");

  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ paddingBottom: insets.bottom }}
      className="flex-1"
    >
      <ImageBackground
        source={require("@/assets/images/PermissionBG.png")}
        className="absolute inset-0 min-h-full w-full"
        resizeMode="cover"
      />

      <LinearGradient
        colors={["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0)"]}
        className="absolute inset-0 min-h-full w-full"
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />

      <View className="flex-col h-full justify-end gap-y-6 px-4">
        <View className="flex flex-row items-center gap-x-2">
          <Image source={Logo} resizeMode="contain" className="w-5 h-5" />
          <Text className="text-white text-sm font-outfit-bold">DualEat</Text>
        </View>

        <Text className="text-white text-2xl font-outfit-bold">
          {type === "QR_STAFF" ? (
            <>
              Escanea pedidos <Text className="text-[#ec3f2b]">rápido</Text>
            </>
          ) : (
            <>
              Escanea, explora y{" "}
              <Text className="text-[#ec3f2b]">disfruta</Text>
            </>
          )}
        </Text>

        <Text className="text-text-1 text-base font-outfit-light">
          {type === "QR_STAFF"
            ? "Para que puedas escanear el QR de los clientes y cargar sus órdenes de forma inmediata, necesitamos acceso a tu cámara."
            : "Para que puedas descubrir los menús de tus locales favoritos en DualEat, necesitamos acceso a tu cámara."}
        </Text>

        <View className="flex-row justify-start w-full gap-2">
          {steps.map((step, idx) => (
            <View
              key={step}
              className={`${idx === 0 ? "max-w-10" : "max-w-[6px]"}`}
              style={{
                height: 4,
                flex: 1,
                backgroundColor: step < steps.length - 1 ? "#B53325" : "gray",
                borderRadius: 999,
              }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-bg-red py-3.5 w-full rounded-[5px] items-center justify-center"
        >
          <Text className="text-white font-outfit-bold text-sm">
            Conceder permiso
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center py-3.5 w-full justify-center"
        >
          <Text className="text-text-1 font-outfit-bold text-sm">Cerrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PermissionView;
