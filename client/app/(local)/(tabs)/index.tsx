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

import { useAppMode } from "@/context/app/AppModeContext";

export default function HomeScreen() {
  const { address } = useLocation();

 
  const {  switchMode } = useAppMode();

  

  return (
    <SafeAreaView className="flex-1 bg-bg-gray">
      <ImageBackground
        source={require("@/assets/images/BGDash-Mini.png")}
        className="absolute inset-0 z-[-1] opacity-20  min-h-full w-full"
        resizeMode="cover"
      />

      <View className="flex-1 px-4 pt-3 ">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => switchMode()}
            className="p-[9px] border bg-bg-yellow border-bg-yellow rounded-[5px]"
          >
            <MaterialCommunityIcons
              name="toggle-switch"
              size={13}
              color="#fff"
            />
          </TouchableOpacity>

          <View className="flex-row gap-4">
            <TouchableOpacity className="p-[9px] border bg-bg-red border-bg-red rounded-[5px]">
              <Octicons name="bell-fill" size={13} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity className="p-[9px] border border-text-5 rounded-[5px]">
              <Octicons name="bell-fill" size={13} color="#707070" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-10">
          <Text className="text-text-5 text-[16px] font-dosis-regular">
            Ubicación
          </Text>
          <Text className="text-text-3 text-[18px] font-dosis-bold">
            {address
              ? `${address.street ? address.street + ", " : ""}${
                  address.city ? address.city : ""
                }`
              : "Ubicación no disponible"}
          </Text>
        </View>

        <TextInput
          className="bg-white border border-text-3 rounded-[5px] p-3 mt-8"
          placeholder="Buscar locales y productos"
          placeholderTextColor="#6B7280"
        />

        {/* <View className="mt-12">
          <Text className="text-text-5 text-[24px] font-dosis-bold">
            Recomendaciones
          </Text>
        </View> */}

        <View className="mt-12">
          <Text className="text-text-3 text-[24px] font-dosis-bold">
            Explorar adentro
          </Text>

          <TouchableOpacity
            className="mt-4  text-text-3 p-4 rounded-lg"
          >
            Hola
          </TouchableOpacity>

          
        </View>
      </View>
    </SafeAreaView>
  );
}
