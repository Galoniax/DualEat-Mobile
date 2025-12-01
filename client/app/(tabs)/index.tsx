import {
  Text,
  View,
  TextInput,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocation } from "@/context/extension/LocationContext";

export default function HomeScreen() {
  const { address } = useLocation();

  console.log("Dirección obtenida del contexto de ubicación:", address);

  return (
    <SafeAreaView className="flex-1 bg-bg-gray">
      <ImageBackground
        source={require("../../assets/images/BGDash-Mini.png")}
        className="absolute inset-0 z-[-1] opacity-20  min-h-full w-full"
        resizeMode="cover"
      />

      <View className="flex-1 px-4 pt-3 ">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity className="p-3 border bg-bg-yellow border-bg-yellow rounded-[10px]">
            <MaterialCommunityIcons
              name="toggle-switch"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          <View className="flex-row gap-4">
            <TouchableOpacity className="p-3 border bg-bg-red border-bg-red rounded-[10px]">
              <Octicons name="bell-fill" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity className="p-3 border border-text-5 rounded-[10px]">
              <Octicons name="bell-fill" size={16} color="#707070" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-10">
          <Text className="text-text-5 text-[18px] font-dosis-regular">
            Ubicación
          </Text>
          <Text className="text-text-3 text-[20px] font-dosis-bold">
            {address
              ? `${address.street ? address.street + ", " : ""}${
                  address.city ? address.city : ""
                }`
              : "Ubicación no disponible"}
          </Text>
        </View>

        <TextInput
          className="bg-white border border-text-3 rounded-[5px] p-4 mt-8"
          placeholder="Buscar locales y productos"
          placeholderTextColor="#6B7280"
        />

        {/* <View className="mt-12">
          <Text className="text-text-5 text-[24px] font-dosis-bold">
            Recomendaciones
          </Text>
        </View> */}

        <View className="mt-12">
          <Text className="text-text-3 text-[28px] font-dosis-bold">
            Explorar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
