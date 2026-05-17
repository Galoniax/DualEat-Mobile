import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useAuth } from "@/context/auth/AuthContext";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Workplace } from "@/interface/global";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

export default function StaffLocalesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const renderItem = ({ item, index }: { item: Workplace; index: number }) => {
    // Gradientes vibrantes inspirados en DualEat
    const gradients = [
      ["#FF4B2B", "#FF416C"], // Rojo/Rosa
      ["#3578e4", "#1e5abb"], // Azul
      ["#e5a657", "#d88524"], // Naranja/Dorado
      ["#11998e", "#38ef7d"], // Verde
    ];
    const gradient = gradients[index % gradients.length];

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => {
          router.push({ pathname: "/(staff)/local/[local_id]" as any, params: { local_id: item.id } });
        }}
        className="mb-5 shadow-sm"
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Marca de agua de la letra */}
          <Text style={styles.watermark}>{item.name.charAt(0).toUpperCase()}</Text>

          <View className="flex-row items-center justify-between h-full">
            <View className="flex-1 justify-center">
              <Text className="text-[24px] font-dosis-bold text-white mb-1 shadow-sm" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-[14px] font-dosis-medium text-white/80 uppercase tracking-widest">
                Ingresar al sistema
              </Text>
            </View>
            
            <View className="w-12 h-12 bg-white/20 rounded-full justify-center items-center backdrop-blur-md border border-white/30">
              <Ionicons name="arrow-forward" size={24} color="#ffffff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F5F7FA]">
      {/* HEADER */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1 mr-4">
            <Text className="text-[16px] font-dosis-medium text-text-4">Hola,</Text>
            <Text className="text-[32px] font-dosis-bold text-text-3 leading-tight">
              {user?.name?.split(" ")[0] || "Staff"}
            </Text>
          </View>
          <View className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden shadow-sm bg-white">
            <Image 
              source={{ uri: user?.avatar_url || "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png" }} 
              className="w-full h-full"
            />
          </View>
        </View>
        <Text className="text-[18px] font-dosis-medium text-text-5">
          ¿En qué local te encuentras hoy?
        </Text>
      </View>

      {/* LISTA DE LOCALES */}
      <FlatList
        data={user?.workplaces || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 px-6">
            <View className="w-24 h-24 bg-gray-200 rounded-full justify-center items-center mb-6">
              <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-[20px] font-dosis-bold text-text-3 text-center mb-2">
              Sin locales asignados
            </Text>
            <Text className="text-[15px] font-dosis-medium text-text-5 text-center">
              Parece que aún no formas parte del personal de ningún local en DualEat.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardGradient: {
    height: 140,
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    right: -20,
    bottom: -40,
    fontSize: 160,
    fontFamily: "Dosis-Bold",
    color: "rgba(255, 255, 255, 0.15)",
    zIndex: 0,
  }
});
