import { showToast } from "@/utils/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  Pressable,
  FlatList,
} from "react-native";

import TextInputUI from "@/components/ui/TextInput";

import { ROUTES } from "@/constants/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { completeProfile } from "@/services/auth.api";

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/context/auth/AuthContext";

import { getFoodCategories, getTagCategories } from "@/services/category.api";

import { FoodCategory, CommunityTag } from "@/interface/global";

export default function Onboarding() {
  const router = useRouter();
  const { setToken } = useAuth();

  // --- ESTADOS LOCALES ---
  const [name, setName] = useState<string>("");

  const [preferences, setPreferences] = useState<string[]>([]);
  const [foodC, setFoodC] = useState<FoodCategory[]>([]);
  const [communityC, setCommunityC] = useState<CommunityTag[]>([]);

  const Logo = require("@/assets/images/icon/LogoDualEat.png");

  // --- ESTADO DE CONTROL ---
  const [open, setOpen] = useState<"food" | "community" | null>(null);

  // --- PARAMETROS ---
  const { tempToken } = useLocalSearchParams<{ tempToken?: string }>();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [food, tags] = await Promise.all([
          getFoodCategories(),
          getTagCategories(),
        ]);

        // Validamos y asignamos foodC
        if (food?.success && Array.isArray(food.data)) {
          setFoodC(food.data);
        } else {
          setFoodC([]);
        }

        // Validamos y asignamos communityC
        if (tags?.success && Array.isArray(tags.data)) {
          setCommunityC(tags.data);
        } else {
          setCommunityC([]);
        }
      } catch (e: unknown) {
        console.log("Error con las categorías", e);
        showToast(
          "error",
          "No se pudieron cargar las categorías. Inténtalo de nuevo.",
          "Error",
        );
      }
    };

    fetch();
  }, []);

  const handleOpen = (section: "food" | "community") => {
    setOpen((prev) => (prev === section ? null : section));
  };

  const togglePreference = (prefName: string) => {
    setPreferences((prev) => {
      const isSelected = prev.includes(prefName);
      let updated = [];

      if (isSelected) {
        updated = prev.filter((p) => p !== prefName);
      } else {
        updated = [...prev, prefName];
        const existsInBoth =
          foodC.some((c) => c.name === prefName) &&
          communityC.some((t) => t.name === prefName);

        if (existsInBoth && !updated.includes(prefName)) {
          updated.push(prefName);
        }
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!name || preferences.length < 3) {
      showToast(
        "error",
        "Por favor, completa todos los campos y selecciona al menos 3 preferencias.",
        "Error",
      );
      return;
    }

    if (!tempToken) {
      showToast("error", "Token temporal no encontrado.", "Error");
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }

    const foodPreferenceIds = preferences
      .map((prefName) => foodC.find((cat) => cat.name === prefName)?.id)
      .filter((id) => id !== undefined) as number[];

    const communityPreferenceIds = preferences
      .map((prefName) => communityC.find((tag) => tag.name === prefName)?.id)
      .filter((id) => id !== undefined) as number[];

    try {
      const response = await completeProfile(
        name.trim(),
        foodPreferenceIds,
        communityPreferenceIds,
        tempToken,
      );
      if (response?.success && response.token) {
        await setToken(response.token);
        router.replace(ROUTES.USER.DASHBOARD_IN);
      } else {
        router.replace(ROUTES.PUBLIC.HOME);
      }
    } catch (e) {
      console.log("Error al enviar datos de completado de perfil:", e);
      showToast(
        "error",
        "No se pudieron enviar los datos de completado de perfil.",
        "Error",
      );
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
              <Text className="text-text-1 text-[13px] font-dosis-bold text-center">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center gap-2">
          <Image source={Logo} className="w-[30px] h-[30px] object-contain" />

          <Text className="text-white text-[26px] font-dosis-bold">
            DualEat
          </Text>
        </View>
      </ImageBackground>

      <View className="flex-1 justify-end">
        <View className="w-full flex-[0.75] bg-[#1A1A1A] rounded-tr-[40px] rounded-tl-[40px] items-center pt-8">
          <View className="flex-col gap-1 items-center">
            <Text className="text-[24px] font-dosis-bold text-text-1 mt-2 tracking-tighter">
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
            <Text className="mx-4 text-text-1 font-dosis-medium">**</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="w-full flex-col items-center gap-6">
            {/* Preferencias de comida */}
            <Pressable
              onPress={() => handleOpen("food")}
              className="flex-row w-[80%] relative items-center gap-4 border border-[#e5a657] rounded-full p-3.5"
            >
              <Ionicons name="fast-food" size={20} color="#fff" />
              <Text className="text-text-1 text-md font-dosis-medium">
                Preferencias de comida
              </Text>
            </Pressable>

            {/* ScrollView condicional */}
            {open === "food" && (
              <FlatList
                data={foodC}
                keyExtractor={(item) => item.id.toString()}
                style={{ maxHeight: 120, minWidth: "80%" }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => togglePreference(item.name)}>
                    <Text
                      className={`text-white text-sm px-2 py-1  border rounded-md border-zinc-100 
                      ${preferences.includes(item.name) ? "bg-bg-yellow" : ""}`}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
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
              <Text className="text-text-1 text-md font-dosis-medium">
                Preferencias de comunidad
              </Text>
            </Pressable>

            {/* ScrollView condicional */}
            {open === "community" && (
              <FlatList
                data={communityC}
                keyExtractor={(item) => item.id.toString()}
                style={{ maxHeight: 120, minWidth: "80%" }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => togglePreference(item.name)}>
                    <Text
                      className={`text-white text-sm px-2 py-1  border rounded-md border-zinc-100 
                      ${preferences.includes(item.name) ? "bg-bg-yellow" : ""}`}
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
            <Text className="text-text-1 font-dosis-bold text-[15px] tracking-tighter">
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
