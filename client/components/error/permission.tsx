import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PermissionType = "QR";


interface PermissionViewProps {
  type: PermissionType;
  permission?: { granted: boolean };
  requestPermission: () => void;
}


const PermissionView = ({ type, permission, requestPermission }: PermissionViewProps) => {
  const steps = [1, 2, 3];
  const Logo = require("@/assets/images/icon/LogoDualEat.png");

  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 flex-col h-full justify-end pb-10">
      <ImageBackground
        source={require("@/assets/images/PermissionBG.png")}
        className="absolute inset-0  min-h-full w-full"
        resizeMode="cover"
      />

      <View className="flex px-5 flex-row items-center gap-3 mb-3">
        <Image source={Logo} className="w-6 h-6" />
        <Text className="text-white text-[14px] font-dosis-bold">DualEat</Text>
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
};

export default PermissionView;