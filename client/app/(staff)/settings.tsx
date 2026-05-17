import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/auth/AuthContext";
import { updateUserProfile } from "@/services/auth.api";

export default function StaffSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        Alert.alert("Error", "Debes ingresar tu contraseña actual para cambiarla.");
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "Las nuevas contraseñas no coinciden.");
        return;
      }
    }

    setLoading(true);
    const result = await updateUserProfile(name, currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert("Éxito", result.message, [
        { text: "OK", onPress: () => router.back() }
      ]);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-gray" style={{ paddingTop: insets.top }}>
      {/* HEADER */}
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-[22px] font-dosis-bold text-text-3">Configuración</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
        {/* SECCIÓN DATOS PERSONALES */}
        <Text className="text-[18px] font-dosis-bold text-text-3 mb-4">Datos Personales</Text>
        
        <View className="mb-6">
          <Text className="text-[15px] font-dosis-medium text-text-5 mb-2 ml-1">Nombre Completo</Text>
          <View className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-gray-200">
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 font-dosis-medium text-[16px] text-text-3"
            />
          </View>
        </View>

        {/* SECCIÓN SEGURIDAD */}
        <Text className="text-[18px] font-dosis-bold text-text-3 mb-4 mt-4">Seguridad y Contraseña</Text>
        
        <View className="mb-4">
          <Text className="text-[15px] font-dosis-medium text-text-5 mb-2 ml-1">Contraseña Actual</Text>
          <View className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-gray-200">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Requerida solo para cambiar contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              className="flex-1 ml-3 font-dosis-medium text-[16px] text-text-3"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-[15px] font-dosis-medium text-text-5 mb-2 ml-1">Nueva Contraseña</Text>
          <View className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-gray-200">
            <Ionicons name="key-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              className="flex-1 ml-3 font-dosis-medium text-[16px] text-text-3"
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-[15px] font-dosis-medium text-text-5 mb-2 ml-1">Confirmar Nueva Contraseña</Text>
          <View className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-gray-200">
            <Ionicons name="key-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la nueva contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              className="flex-1 ml-3 font-dosis-medium text-[16px] text-text-3"
            />
          </View>
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`h-14 rounded-full items-center justify-center mb-10 shadow-sm flex-row ${loading ? 'bg-gray-400' : 'bg-[#B53325]'}`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white font-dosis-bold text-[18px] mr-2">Guardar Cambios</Text>
              <Ionicons name="save-outline" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
