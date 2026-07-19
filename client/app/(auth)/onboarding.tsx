import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState, forwardRef } from "react";
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

// COMPONENTE REUTILIZABLE: SELECTOR DE PREFERENCIAS
// =============================================
type PreferenceItem = FoodCategory | CommunityTag;

const PreferencePickerModal = forwardRef<
  BottomSheetModal,
  {
    title: string;
    data: PreferenceItem[];
    preferences: string[];
    onToggle: (id: string) => void;
  }
>(({ title, data, preferences, onToggle }, ref) => (
  <BottomSheetModal
    ref={ref}
    snapPoints={["40%"]}
    enableOverDrag={false}
    backgroundStyle={{
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      backgroundColor: "#f5f5f5",
    }}
    handleIndicatorStyle={{ backgroundColor: "#d1d5db", width: 40 }}
    backdropComponent={(props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="close"
      />
    )}
  >
    <BottomSheetFlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 60,
        gap: 10,
      }}
      ListHeaderComponent={
        <Text className="text-sm font-outfit-bold mb-2">{title}</Text>
      }
      renderItem={({ item }) => {
        const isSelected = preferences.includes(item.id);
        return (
          <TouchableOpacity
            onPress={() => onToggle(item.id)}
            style={{ flex: 1 }}
            className={`p-2.5 rounded-[5px] border border-dashed border-gray-300 items-center ${
              isSelected ? "bg-bg-semi-black" : ""
            }`}
          >
            <Text
              className={`text-sm ${
                isSelected
                  ? "font-outfit-bold text-text-1"
                  : "text-text-3 font-outfit-light"
              }`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  </BottomSheetModal>
));

PreferencePickerModal.displayName = "PreferencePickerModal";

export default function Onboarding() {
  const router = useRouter();
  const { completeProfile } = useAuth();

  // --- ESTADOS LOCALES ---
  const [name, setName] = useState<string>("");

  const [preferences, setPreferences] = useState<string[]>([]);
  const Logo = require("@/assets/icon/LogoDualEat.png");

  const foodRef = useRef<BottomSheetModal>(null);
  const tagRef = useRef<BottomSheetModal>(null);

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
    <SafeAreaView edges={["bottom", "left", "right", "top"]} className="flex-1">
      <ImageBackground
        source={require("@/assets/images/PermissionBG.png")}
        className="flex-1"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <View className="absolute inset-0 bg-black/50" />

        <View className="flex-row justify-between w-[90%] mx-auto items-center mt-[15%] mb-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center flex-2 justify-center">
            <Text className="text-text-2 text-sm font-outfit-light">
              ¿Ya tienes una cuenta?
            </Text>
            <TouchableOpacity
              className="p-2 rounded-lg"
              onPress={() => router.push(ROUTES.AUTH.LOGIN)}
            >
              <Text className="text-text-1 text-sm font-outfit-bold">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center gap-x-3">
          <Image source={Logo} className="w-[30px] h-[30px] object-contain" />

          <Text className="text-white text-3xl font-outfit-bold">DualEat</Text>
        </View>
      </ImageBackground>

      <BottomSheet
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backgroundStyle={{
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: "#f5f5f5",
        }}
        handleIndicatorStyle={{
          display: "none",
        }}
        snapPoints={["75%"]}
      >
        <BottomSheetView className="flex-1 py-4">
          <View
            style={{ maxWidth: "90%", alignSelf: "center" }}
            className="w-full items-center flex-col gap-y-5"
          >
            <View className="flex-col gap-y-2 items-center mb-4">
              <Text className="text-2xl font-outfit-bold text-text-3">
                Personalizar perfil
              </Text>
              <Text className="font-outfit-light text-base text-center text-text-3">
                Completa tus datos para comenzar tu experiencia culinaria
              </Text>
            </View>

            <TextInputUI
              value={name}
              onChangeText={setName}
              type="default"
              title="Nombre de usuario"
              icon={<Feather name="user" size={22} color="#000" />}
            />

            <View className="flex-row items-center w-[80%]">
              <View className="flex-1 h-px bg-gray-400" />
              <Text className="mx-4 text-text-3 font-outfit-bold">**</Text>
              <View className="flex-1 h-px bg-gray-400" />
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size={26} color="#e5a657" />
              </View>
            ) : (
              <View className="w-full flex-col gap-y-4">
                <TouchableOpacity
                  onPress={() => foodRef.current?.present()}
                  className="flex-row w-full items-center gap-4 border border-gray-400 rounded-full py-3 px-4"
                >
                  <Ionicons name="fast-food" size={16} color="#000" />
                  <Text className="text-text-3 text-sm font-outfit-regular">
                    Preferencias de comida
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => tagRef.current?.present()}
                  className="flex-row w-full items-center gap-4 border border-gray-400 rounded-full py-3 px-4"
                >
                  <MaterialCommunityIcons
                    name="account-group"
                    size={16}
                    color="#000"
                  />
                  <Text className="text-text-3 text-sm font-outfit-regular">
                    Preferencias de comunidad
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-bg-yellow w-full py-3 rounded-full items-center"
            >
              <Text className="text-text-1 font-outfit-bold text-base">
                Completar registro
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <PreferencePickerModal
        ref={foodRef}
        title="Preferencias de comida"
        data={foodCategories ?? []}
        preferences={preferences}
        onToggle={togglePreference}
      />

      <PreferencePickerModal
        ref={tagRef}
        title="Preferencias de comunidad"
        data={tagCategories ?? []}
        preferences={preferences}
        onToggle={togglePreference}
      />
    </SafeAreaView>
  );
}
