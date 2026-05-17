import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/context/auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getLocalById } from "@/services/discovery.api";
import { Local } from "@/interface/global";

export default function LocalHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { local_id } = useGlobalSearchParams();
  const { user } = useAuth();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["local", local_id],
    queryFn: () => getLocalById(local_id as string),
    enabled: !!local_id,
  });

  const localData = response?.data as Local | undefined;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg-gray justify-center items-center">
        <ActivityIndicator size="large" color="#B53325" />
      </View>
    );
  }

  if (isError || !localData) {
    return (
      <View className="flex-1 bg-bg-gray justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#707070" className="mb-4" />
        <Text className="text-[16px] font-dosis-medium text-text-4 text-center">
          Error al cargar los datos del local.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-bg-red rounded-full"
        >
          <Text className="text-white font-dosis-bold">Volver atrás</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-gray">
      <ScrollView className="flex-1" bounces={false}>
        {/* HEADER IMMERSIVO */}
        <View className="relative h-[280px]">
          {localData.image_url ? (
            <ImageBackground
              className="absolute top-0 left-0 right-0 w-full h-[100%]"
              resizeMode="cover"
              source={{ uri: localData.image_url }}
            >
              <View className="flex-1 bg-black/60" />
            </ImageBackground>
          ) : (
            <View className="absolute top-0 left-0 right-0 w-full h-[100%] bg-bg-semi-black" />
          )}

          {/* BARRA SUPERIOR (BOTÓN VOLVER) */}
          <View
            className="flex-row justify-between items-center w-full absolute top-0 z-10"
            style={{
              paddingTop: insets.top + 10,
              paddingHorizontal: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/40 rounded-full justify-center items-center"
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View className="bg-bg-red px-3 py-1.5 rounded-full border border-white/20">
              <Text className="text-[12px] font-dosis-bold text-white uppercase tracking-wider">
                Staff
              </Text>
            </View>
          </View>

          {/* INFORMACIÓN SUPERPUESTA */}
          <View className="absolute bottom-6 left-0 right-0 px-6">
            <Text className="text-[32px] font-dosis-bold text-white mb-2 shadow-sm">
              {localData.name}
            </Text>
            {localData.average_rating ? (
              <View className="flex-row items-center gap-x-1.5 bg-black/40 self-start px-2.5 py-1 rounded-full">
                <FontAwesome name="star" size={14} color="#FBBF24" />
                <Text className="text-[14px] font-dosis-bold text-white">
                  {Number(localData.average_rating).toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* CONTENIDO PRINCIPAL */}
        <View className="bg-bg-gray -mt-4 rounded-t-3xl px-6 pt-8 pb-10">
          
          {localData.description ? (
            <View className="mb-6">
              <Text className="text-[18px] font-dosis-bold text-text-3 mb-2">Acerca del local</Text>
              <Text className="text-[15px] font-dosis-medium text-text-5 leading-6">
                {localData.description}
              </Text>
            </View>
          ) : null}

          <View className="bg-white rounded-2xl p-5 shadow-sm mt-2">
            <Text className="text-[16px] font-dosis-bold text-text-3 mb-4">Información de contacto</Text>
            
            {localData.address ? (
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-10 h-10 rounded-full bg-red-50 justify-center items-center">
                  <Ionicons name="location" size={20} color="#B53325" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-dosis-medium text-text-6">Dirección</Text>
                  <Text className="text-[15px] font-dosis-semibold text-text-3">{localData.address}</Text>
                </View>
              </View>
            ) : null}

            {localData.phone ? (
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center">
                  <Ionicons name="call" size={20} color="#3578e4" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-dosis-medium text-text-6">Teléfono Fijo</Text>
                  <Text className="text-[15px] font-dosis-semibold text-text-3">{localData.phone}</Text>
                </View>
              </View>
            ) : null}
            
            {(localData as any).cellphone ? (
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-10 h-10 rounded-full bg-green-50 justify-center items-center">
                  <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-dosis-medium text-text-6">Celular / WhatsApp</Text>
                  <Text className="text-[15px] font-dosis-semibold text-text-3">{(localData as any).cellphone}</Text>
                </View>
              </View>
            ) : null}

            {localData.email ? (
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-yellow-50 justify-center items-center">
                  <Ionicons name="mail" size={20} color="#e5a657" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-dosis-medium text-text-6">Correo electrónico</Text>
                  <Text className="text-[15px] font-dosis-semibold text-text-3">{localData.email}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
