import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useAuth } from "@/context/auth/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function StaffProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const workplaces = user?.workplaces || [];
  const DEFAULT_AVATAR = "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-gray">
      {/* HEADER */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10">
        <Text className="text-[24px] font-dosis-bold text-text-3">Mi Perfil</Text>
        <TouchableOpacity 
          onPress={() => router.push("/(staff)/settings")}
          className="w-11 h-11 rounded-full bg-bg-gray items-center justify-center border border-gray-100"
        >
          <Ionicons name="settings-outline" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* INFO DEL USUARIO */}
        <View className="bg-white px-6 py-8 items-center border-b border-gray-100">
          <View className="relative mb-5">
            <Image 
              source={{ uri: user?.avatar_url || DEFAULT_AVATAR }} 
              className="w-28 h-28 rounded-full bg-bg-gray border-4 border-white"
            />
            <View className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-[3px] border-white" />
          </View>
          
          <Text className="text-[26px] font-dosis-bold text-text-3 tracking-tight">{user?.name}</Text>
          <Text className="text-[15px] font-dosis-medium text-text-6 mb-4">{user?.email}</Text>
          
          <View className="bg-bg-red px-5 py-2 rounded-full flex-row items-center">
            <Ionicons name="shield-checkmark" size={16} color="white" style={{ marginRight: 6 }} />
            <Text className="text-white text-[13px] font-dosis-bold uppercase tracking-widest">Staff Oficial</Text>
          </View>
        </View>

        {/* LUGARES DE TRABAJO */}
        <View className="px-6 mt-8">
          <Text className="text-[18px] font-dosis-bold text-text-3 mb-4 ml-1">Mis Locales</Text>
          
          {workplaces.map((w) => (
            <View key={w.id} className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100">
              <View className="w-12 h-12 rounded-xl bg-[#FEE2E2] items-center justify-center mr-4">
                <Ionicons name="business" size={24} color="#B53325" />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-dosis-bold text-text-3">{w.name}</Text>
                <Text className="text-[14px] font-dosis-medium text-text-6 capitalize">{w.role}</Text>
              </View>
            </View>
          ))}

          {workplaces.length === 0 && (
            <View className="bg-white rounded-2xl p-6 items-center border border-gray-100 border-dashed">
              <Ionicons name="business-outline" size={32} color="#D1D5DB" className="mb-2" />
              <Text className="text-[15px] font-dosis-medium text-text-4 text-center">
                No tienes locales asignados actualmente.
              </Text>
            </View>
          )}
        </View>

        {/* ACCIONES Y AJUSTES */}
        <View className="px-6 mt-8">
          <Text className="text-[18px] font-dosis-bold text-text-3 mb-4 ml-1">Opciones</Text>
          
          <View className="bg-white rounded-3xl overflow-hidden border border-gray-100">
            <TouchableOpacity 
              onPress={() => router.push("/(staff)/settings")}
              className="px-5 py-4 flex-row items-center border-b border-gray-50"
            >
              <View className="w-10 h-10 rounded-full bg-bg-gray items-center justify-center mr-4">
                <Ionicons name="person-circle-outline" size={24} color="#4B5563" />
              </View>
              <Text className="flex-1 text-[16px] font-dosis-medium text-text-3">Editar Perfil y Contraseña</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={logout}
              className="px-5 py-4 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-[#FEE2E2] items-center justify-center mr-4">
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              </View>
              <Text className="flex-1 text-[16px] font-dosis-bold text-red-500">Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-center text-[13px] font-dosis-medium text-text-6 mt-10">DualEat Staff v1.0.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
