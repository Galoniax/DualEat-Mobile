import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  Pressable,
  FlatList,
} from "react-native";

import TextInputUI from "@/components/ui/inputs/TextInput";

import { ROUTES } from "@/constants/constants";
import { useLocalSearchParams, useRouter } from "expo-router";

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/context/auth/AuthContext";

import { getFoodCategories, getTags } from "@/services/category.api";

import { FoodCategory, CommunityTag } from "@/interface/global";
import { useQuery } from "@tanstack/react-query";

import { globalToast as toast } from "@/utils/toast";

export default function Onboarding() {
  const router = useRouter();
  const { completeProfile } = useAuth();

  // --- ESTADOS LOCALES ---
  const [name, setName] = useState<string>("");

  const [preferences, setPreferences] = useState<string[]>([]);
  const Logo = require("@/assets/icon/LogoDualEat.png");

  // --- ESTADO DE CONTROL ---
  const [open, setOpen] = useState<"food" | "community" | null>(null);

  // --- PARAMETROS ---
  const { tempToken } = useLocalSearchParams<{ tempToken?: string }>();

  const { data: foodCategories = [], isLoading: loadingFood } = useQuery({
    queryKey: ["categories", "food"],
    queryFn: async () => {
      const response = await getFoodCategories();
      return response?.data as FoodCategory[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: tagCategories = [], isLoading: loadingTags } = useQuery({
    queryKey: ["categories", "tags"],
    queryFn: async () => {
      const response = await getTags();
      return response?.data as CommunityTag[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const isLoading = loadingFood || loadingTags;

  const handleOpen = (section: "food" | "community") => {
    setOpen((prev) => (prev === section ? null : section));
  };

  const togglePreference = (id: string) => {
    setPreferences((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async () => {
    if (!name || preferences.length < 3) {
      toast.error(
        "Error",
        "Por favor, completa todos los campos y selecciona al menos 3 preferencias.",
      );
      return;
    }

    if (!tempToken) {
      toast.error("Error", "Token temporal no encontrado.");
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }

    const foodPreferences = preferences.filter((id) =>
      foodCategories.some((c) => c.id === id),
    );
    const communityPreferences = preferences.filter((id) =>
      tagCategories.some((t) => t.id === id),
    );

    try {
      await completeProfile(
        name.trim(),
        foodPreferences,
        communityPreferences,
        tempToken,
      );
    } catch (e) {
      console.log("Error al enviar datos de completado de perfil:", e);
    }
  };

  return (
    <View className="flex-1 bg-bg-semi-black">
      <ImageBackground
        source={require("@/assets/images/PermissionBG.png")}
        className="flex-1"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <View className="absolute inset-0 bg-black/50" />

        <View className="flex-row justify-between w-[90%] mx-auto items-center mt-[15%] mb-12">
          <View className="flex-1">
            <Ionicons
              name="chevron-back"
              size={22}
              color="#fff"
              onPress={() => router.back()}
            />
          </View>
          <View className="flex-row items-center flex-2 justify-center">
            <Text className="text-text-2 text-[13px] font-dosis-light mr-2">
              ¿Ya tienes una cuenta?
            </Text>
            <TouchableOpacity
              className="p-2 rounded-lg "
              onPress={() => router.push(ROUTES.AUTH.LOGIN)}
            >
              <Text className="text-text-1 text-[13px] font-outfit-bold text-center">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center gap-2">
          <Image source={Logo} className="w-[30px] h-[30px] object-contain" />

          <Text className="text-white text-[26px] font-outfit-bold">
            DualEat
          </Text>
        </View>
      </ImageBackground>

      <View className="flex-1 justify-end">
        <View className="w-full flex-[0.75] bg-[#1A1A1A] rounded-tr-[40px] rounded-tl-[40px] items-center pt-8">
          <View className="flex-col gap-1 items-center">
            <Text className="text-[24px] font-outfit-bold text-text-1 mt-2 tracking-tighter">
              Personalizar perfil
            </Text>
            <Text className="font-dosis-light text-[14px] text-text-2 mb-10">
              Completa tus datos para comenzar tu experiencia culinaria
            </Text>
          </View>

          <View className="w-full items-center flex-col gap-3">
            <TextInputUI
              value={name}
              onChangeText={setName}
              type="default"
              title="Nombre de usuario"
              icon={<Feather name="user" size={22} color="#fff" />}
            />
          </View>

          {/* --- Divisor "o" --- */}
          <View className="flex-row items-center w-[80%] my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-text-1 font-outfit-regular">**</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="w-full flex-col items-center gap-6">
            {/* Preferencias de comida */}
            <Pressable
              onPress={() => handleOpen("food")}
              className="flex-row w-[80%] relative items-center gap-4 border border-[#e5a657] rounded-full p-3.5"
            >
              <Ionicons name="fast-food" size={20} color="#fff" />
              <Text className="text-text-1 text-md font-outfit-regular">
                Preferencias de comida
              </Text>
            </Pressable>

            {/* ScrollView condicional */}
            {open === "food" && (
              <FlatList
                data={foodCategories}
                keyExtractor={(item) => item.id.toString()}
                style={{ maxHeight: 120, minWidth: "80%" }}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity onPress={() => togglePreference(item.id)}>
                      <Text
                        className={`text-white text-sm px-2 py-1  border rounded-md border-zinc-100 
                      ${preferences.includes(item.id) ? "bg-bg-yellow" : ""}`}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />
            )}

            {/* Preferencias de comunidad */}
            <Pressable
              onPress={() => handleOpen("community")}
              className="flex-row w-[80%] relative items-center gap-4 border border-[#e5a657] rounded-full p-3.5"
            >
              <MaterialCommunityIcons
                name="account-group"
                size={22}
                color="#fff"
              />
              <Text className="text-text-1 text-md font-outfit-regular">
                Preferencias de comunidad
              </Text>
            </Pressable>

            {/* ScrollView condicional */}
            {open === "community" && (
              <FlatList
                data={tagCategories}
                keyExtractor={(item) => item.id.toString()}
                style={{ maxHeight: 120, minWidth: "80%" }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => togglePreference(item.id)}>
                    <Text
                      className={`text-white text-sm px-2 py-1  border rounded-md border-zinc-100 
                      ${preferences.includes(item.id) ? "bg-bg-yellow" : ""}`}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.7}
            className="bg-bg-yellow w-[80%] p-3 rounded-full items-center mt-8"
          >
            <Text className="text-text-1 font-outfit-bold text-[15px] tracking-tighter">
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
