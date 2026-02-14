import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { useAuth } from "@/context/auth/AuthContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-bg-gray">
        <View className="flex-1 justify-center items-center">
          <Text className="text-text-3 text-[16px] font-dosis-regular mb-4">
            No has iniciado sesión
          </Text>
          <TouchableOpacity className="bg-bg-red px-4 py-2 rounded-[5px]">
            <Text className="text-white text-[16px] font-dosis-bold">
              Iniciar Sesión
             
             
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView className="flex-1 bg-bg-semi-white">
      <View className="relative p-5">
        <Text className="font-dosis-bold text-[16px] text-text-3 text-center">
          ¡Hola, {user.name}!
        </Text>

        <TouchableOpacity className="absolute right-5 top-1/2 p-[9px] border bg-bg-red border-bg-red rounded-[5px]">
          <Octicons name="bell-fill" size={13} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="px-5 mt-4 rounded-[10px]">
        <WeatherWidget />
      </View>

      <TouchableOpacity className="flex-row bg-[#F3F3F3] mx-5 mt-4 rounded-[10px] p-4 justify-between items-center">
        <View className="flex-[0.8]">
          <Text className="text-text-3 text-[16px] font-dosis-bold">
            Cupones
          </Text>
          <Text className="text-text-3 text-[13px] font-dosis-regular">
            Mira los cupones y obtén descuentos cada vez que compres
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <MaterialIcons name="discount" size={18} color="#B53325" />
          <Text className="text-text-3 text-[20px] font-dosis-bold">0</Text>
        </View>
      </TouchableOpacity>

      <View className="px-5 mt-6 flex-row items-center w-full gap-4">
        <TouchableOpacity
          className={`flex-row flex-1 justify-between items-center bg-[#F3F3F3] rounded-[10px] p-4`}
        >
          <Text className="text-text-3 text-[16px] font-dosis-bold">
            Posts/Recetas
          </Text>

          <MaterialCommunityIcons name="post" size={24} color="#B53325" />
        </TouchableOpacity>

        <TouchableOpacity className={`p-4 bg-[#F3F3F3] rounded-[10px]`}>
          <Octicons name="bell-fill" size={18} color="#4A4947" />
        </TouchableOpacity>
      </View>

      <Text className="text-text-3 text-[13px] font-dosis-regular">
        Información personal
      </Text>
      <Text className="text-text-3 text-[13px] font-dosis-regular">
        Preferencias de comida
      </Text>
      <Text className="text-text-3 text-[13px] font-dosis-regular">
        Lugares favoritos
      </Text>

      <Text className="text-text-3 text-[13px] font-dosis-regular">
        Configuración
      </Text>
    </SafeAreaView>
  );
}
