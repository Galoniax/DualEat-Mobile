import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/auth/AuthContext";
import { changeStatus } from "@/services/notification.api";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROUTES } from "@/constants/constants";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { getFoodCategories, getTags } from "@/services/category.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityTag, FoodCategory, User } from "@/interface/global";
import { getUserById, update, upload } from "@/services/auth.api";
import { pickMedia } from "@/utils/media";
import { UploadableFile } from "@/interface/global.dto";
import { Pencil } from "lucide-react-native";

import { globalToast as toast } from "@/utils/toast";
import { WeatherWidget } from "@/components/features/weather/WeatherWidget";

export default function ConfigurationScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setToken, logout, logoutAll } = useAuth();

  const [existPass, setExistPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");
  const [confirmNewPass, setConfirmNewPass] = useState<string>("");

  const insets = useSafeAreaInsets();

  const [enabled, setEnabled] = useState<boolean>(
    user?.notificationsPref === "ALWAYS",
  );

  const ref = useRef<BottomSheetModal>(null);

  const [openPreferences, setOpenPreferences] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await getUserById(user.id);
      if (!response?.success || !response?.data) {
        throw new Error("Error al obtener perfil del usuario");
      }
      return response.data as User;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!user?.id,
  });

  const { data: foodCategories = [], isLoading: loadingFood } = useQuery({
    queryKey: ["categories", "food"],
    enabled: openPreferences,
    queryFn: async () => {
      const response = await getFoodCategories();
      return response?.data as FoodCategory[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: tagCategories = [], isLoading: loadingTags } = useQuery({
    queryKey: ["categories", "tags"],
    enabled: openPreferences,
    queryFn: async () => {
      const response = await getTags();
      return response?.data as CommunityTag[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const [expanded, setExpanded] = useState({
    password: false,
    logout: false,
  });

  const [backup, setBackup] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);

  // CAMBIAR PREFERENCIAS
  const togglePreference = (id: string) => {
    setPreferences((prev) => {
      const isSelected = prev.includes(id);
      let updated = [];

      if (isSelected) {
        updated = prev.filter((p) => p !== id);
      } else {
        updated = [...prev, id];
        const existsInBoth =
          foodCategories.some((c) => c.id === id) &&
          tagCategories.some((t) => t.id === id);

        if (existsInBoth && !updated.includes(id)) {
          updated.push(id);
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!data?.preferences) return;

    const foodIds = data.preferences
      .filter((p) => p.food_category_id !== null)
      .map((p) => p.food_category_id as string);

    const tagIds = data.preferences
      .filter((p) => p.community_tag_id !== null)
      .map((p) => p.community_tag_id as string);

    setBackup([...foodIds, ...tagIds]);
    setPreferences([...foodIds, ...tagIds]);
  }, [data]);

  // CAMBIAR ESTADO DE NOTIFICACIONES
  const handleToggleNotifications = async (value: boolean) => {
    setEnabled(value);
    try {
      const response = await changeStatus(
        undefined,
        "user",
        value ? "ALWAYS" : "NONE",
      );
      if (response && response.success) {
        await setToken(null);
        toast.success("Éxito", "Configuración actualizada");
      } else {
        throw new Error(response.message || "Error al actualizar");
      }
    } catch (e: any) {
      setEnabled(!value);
      console.log(e);
    }
  };

  // CERRAR SESIÓN
  const handleLogout = async (type: "single" | "all") => {
    try {
      if (type === "all") {
        await logoutAll();
      } else {
        await logout();
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  // BORRAR CACHÉ
  const handleCacheClear = async () => {
    try {
      const result = await AsyncStorage.removeItem("@ingredients_data");

      if (result === undefined) {
        console.log("No existe la key ");
      }
    } catch (e: any) {
      console.log("Error al leer AsyncStorage:", e);
    }
  };

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (file?: UploadableFile) => {
      if (existPass && newPass) {
        if (newPass.length < 6) {
          toast.error(
            "Error",
            "La contraseña debe tener al menos 6 caracteres",
          );
          return;
        }
        if (newPass !== confirmNewPass) {
          toast.error("Error", "Las contraseñas no coinciden");
          return;
        }
      }

      let avatar_url: string | undefined = undefined;

      let foodPreferences = preferences.filter((id) =>
        foodCategories.some((c) => c.id === id),
      );

      let communityPreferences = preferences.filter((id) =>
        tagCategories.some((t) => t.id === id),
      );

      if (file) {
        const response = await upload(file);
        if (!response.success) {
          throw new Error(response.message || "Error al subir la imagen");
        }
        avatar_url = response.data;
      }

      const response = await update({
        avatar_url: avatar_url,
        currentPassword: existPass || undefined,
        newPassword: newPass || undefined,
        foodPreferences:
          foodPreferences.length > 0 ? foodPreferences : undefined,
        communityPreferences:
          communityPreferences.length > 0 ? communityPreferences : undefined,
      });

      if (!response.success) {
        throw new Error(response.message || "Error al subir la imagen");
      }

      return response;
    },

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      await setToken(null);

      toast.success(
        res?.message || "Éxito",
        "Su perfil fue actualizado, espere un momento para ver los cambios.",
      );
    },
    onError: (err: any) => {
      toast.error(
        err.message,
        "Error al actualizar perfil, intentelo más tarde",
      );
    },
  });

  const handleUpdateProfile = async (isAvatarURL: boolean) => {
    let avatar_url: UploadableFile | undefined = undefined;

    ref.current?.dismiss();

    if (isAvatarURL) {
      // 1. Cerramos el BottomSheet primero para que la actividad de Android se estabilice

      const result = await pickMedia({
        mediaType: "Images",
        allowsEditing: true,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (result && result.length > 0) {
        avatar_url = result[0];
        updateProfile(avatar_url);
      }
    } else {
      updateProfile(avatar_url);
    }
  };

  const defaultAvatar = "https://placehold.co/100x100";

  const size = 18;

  const isLoading = loadingFood || loadingTags;

  const isEqual =
    backup.length === preferences.length &&
    backup.every((id) => preferences.includes(id));

  return (
    <SafeAreaView className="flex-1 bg-bg-gray flex-col gap-y-6 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-center w-full py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 absolute left-0 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-base text-text-3">
          Configuración
        </Text>
      </View>

      <WeatherWidget type="PROFILE" />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={10}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
          className="flex-1"
        >
          {/* Usuario*/}
          <View className="flex-row items-center gap-x-4">
            <TouchableOpacity onPress={() => handleUpdateProfile(true)}>
              <View className="relative w-20 h-20 rounded-full border border-gray-200 overflow-hidden">
                <View className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                  <Pencil size={16} color="#fff" />
                </View>
                <Image
                  source={{ uri: user?.avatar_url || defaultAvatar }}
                  className="w-full h-full"
                />
              </View>
            </TouchableOpacity>

            <View className="flex-1 flex-col gap-y-1 justify-center">
              <Text className="text-xl font-outfit-bold text-gray-900 leading-6">
                {user?.name || "Usuario"}
              </Text>
              <Text className="text-gray-500 font-outfit-regular text-sm">
                {user?.email || "correo@correo.com"}
              </Text>
            </View>
          </View>

          {/* SECTION: PREFERENCIAS */}
          <Text className="text-text-6 font-outfit-bold text-xs uppercase tracking-wider">
            Preferencias
          </Text>
          <View className="rounded-3xl border border-dashed border-gray-300 px-3 py-1.5 overflow-hidden flex-col gap-y-4">
            {/* NOTIFICACIONES */}
            <View className="flex-row items-center justify-between w-full p-2">
              <View className="flex-row items-center gap-x-3">
                <Ionicons
                  name="notifications-outline"
                  size={size}
                  color="#4A4947"
                />

                <Text className="text-text-3 font-outfit-medium text-base">
                  Notificaciones
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={() => handleToggleNotifications(!enabled)}
                trackColor={{ false: "#e5e7eb", true: "#B53325" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* EDITAR PREFERENCIAS */}
            <TouchableOpacity
              onPress={() => {
                setOpenPreferences(true);
                ref.current?.present();
              }}
              className="flex-row items-center justify-between w-full p-2"
            >
              <View className="flex-row items-center gap-x-3">
                <Ionicons name="settings-outline" size={size} color="#4A4947" />

                <Text className="text-text-3 font-outfit-medium text-base">
                  Editar preferencias
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>

            {/* HISTORIAL DE ÓRDENES */}
            <TouchableOpacity
              onPress={() => router.push(ROUTES.USER.ORDERS)}
              className="flex-row items-center gap-x-3 w-full p-2"
            >
              <View className="flex-row items-center gap-x-3">
                <Ionicons name="cart-outline" size={size} color="#4A4947" />

                <Text className="text-text-3 font-outfit-medium text-base">
                  Historial de órdenes
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/** SECTION CUENTA */}
          <Text className="text-text-6 font-outfit-bold text-xs uppercase tracking-wider">
            Cuenta
          </Text>
          <View className="rounded-3xl border border-dashed border-gray-300 px-3 py-1.5 overflow-hidden flex-col gap-y-4">
            {/* CONTRASEÑA */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={user?.provider !== "local"}
              onPress={() =>
                setExpanded((prev) => ({ ...prev, password: !prev.password }))
              }
              className="flex-row items-center justify-between p-2 border-b border-gray-100"
            >
              <View className="flex-row items-center gap-x-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={size}
                  color="#4A4947"
                />

                <Text
                  className={`font-outfit-medium text-base ${user?.provider !== "local" ? "text-text-6" : "text-text-3"}`}
                >
                  {user?.provider !== "local"
                    ? `Iniciado con ${user?.provider}`
                    : "Contraseña"}
                </Text>
              </View>
              <Ionicons
                name={expanded.password ? "chevron-up" : "chevron-forward"}
                size={16}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {expanded.password && (
              <View className="w-full flex-col gap-y-6">
                {[
                  "Contraseña actual",
                  "Nueva contraseña",
                  "Confirmar nueva contraseña",
                ].map((item, index) => (
                  <View key={index} className="w-full flex-col gap-y-2">
                    <Text className="text-text-6 font-outfit-bold text-xs tracking-wider">
                      {item}
                    </Text>
                    <TextInput
                      className="w-full h-12 px-4 border border-gray-300 rounded-2xl"
                      value={
                        index === 0
                          ? existPass
                          : index === 1
                            ? newPass
                            : index === 2
                              ? confirmNewPass
                              : ""
                      }
                      onChangeText={
                        index === 0
                          ? setExistPass
                          : index === 1
                            ? setNewPass
                            : index === 2
                              ? setConfirmNewPass
                              : () => {}
                      }
                      secureTextEntry
                    />
                  </View>
                ))}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    handleUpdateProfile(false);
                  }}
                  className="w-full py-3 bg-bg-blue rounded-[5px] flex items-center justify-center"
                >
                  <Text className="text-white font-outfit-bold text-sm">
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BORRAR CACHÉ */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleCacheClear()}
              className="flex-row items-center justify-between p-2 border-b border-gray-100"
            >
              <View className="flex-row items-center gap-x-3">
                <Ionicons name="trash-outline" size={size} color="#4A4947" />

                <Text className="text-text-3 font-outfit-medium text-base">
                  Borrar caché
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>

            {/* LOGOUT */}
            <View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setExpanded((prev) => ({ ...prev, logout: !prev.logout }))
                }
                className="flex-row items-center justify-between p-2"
              >
                <View className="flex-row items-center gap-x-3">
                  <Ionicons
                    name="log-out-outline"
                    size={size}
                    color="#B53325"
                  />
                  <Text className="text-[#B53325] font-outfit-bold text-base">
                    Cerrar sesión
                  </Text>
                </View>
                <Ionicons
                  name={expanded.logout ? "chevron-down" : "chevron-forward"}
                  size={16}
                  color="#B53325"
                />
              </TouchableOpacity>

              {expanded.logout && (
                <View className="bg-gray-50/50 py-3 border-t border-gray-100 flex-col gap-y-2">
                  {/* Cerrar todas las sesiones */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleLogout("all")}
                    className="py-3 px-4 rounded-xl border border-gray-200 flex-row items-center justify-between"
                  >
                    <Text className="text-text-5 font-outfit-medium text-sm">
                      Cerrar todas las sesiones
                    </Text>
                    <Ionicons name="key-outline" size={16} color="#6b7280" />
                  </TouchableOpacity>

                  {/* Cerrar sesión actual */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleLogout("single")}
                    className="py-3 px-4 rounded-xl border border-gray-200 flex-row items-center justify-between"
                  >
                    <Text className="text-[#B53325] font-outfit-medium text-sm">
                      Cerrar sesión
                    </Text>
                    <Ionicons
                      name="log-out-outline"
                      size={16}
                      color="#B53325"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheetModal
        ref={ref}
        snapPoints={["85%"]}
        enableDynamicSizing={false}
        enableOverDrag={false}
        onDismiss={() => {
          setPreferences(backup);
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.8}
            pressBehavior="close"
          />
        )}
        enablePanDownToClose={true}
      >
        {isLoading ? (
          <BottomSheetView className="h-full w-full flex-col justify-center items-center">
            <ActivityIndicator size={30} color="#4A4947" />
          </BottomSheetView>
        ) : (
          <View className="flex-1 bg-bg-semi-white px-4">
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ gap: 16 }}
            >
              <Text className="font-outfit-bold text-text-3 text-base">
                Tipos de Comida
              </Text>
              <View className="flex flex-1 flex-row flex-wrap justify-between gap-y-3 mb-6">
                {foodCategories.map((item) => {
                  const isSelected = preferences.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => togglePreference(item.id)}
                      style={{ width: "48%" }}
                      className={`justify-center p-2 items-center rounded-[8px] border 
                        ${isSelected ? "bg-bg-semi-black border-black" : "border-gray-300 border-dashed"}
                      `}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className={`font-outfit-bold text-sm ${isSelected ? "text-white" : "text-text-5"}`}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="font-outfit-bold text-text-3 text-base">
                Tags
              </Text>
              <View className="flex flex-1 flex-row flex-wrap justify-between gap-y-3 mb-8">
                {tagCategories.map((item) => {
                  const isSelected = preferences.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => togglePreference(item.id)}
                      style={{ width: "48%" }}
                      className={`justify-center p-2 items-center rounded-[8px] border
                        ${isSelected ? "bg-bg-semi-black border-black" : "border-gray-300 border-dashed"}
                      `}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className={`font-outfit-bold text-sm ${isSelected ? "text-white" : "text-text-5"}`}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BottomSheetScrollView>

            <View style={{ paddingBottom: insets.bottom + 16 }}>
              <TouchableOpacity
                onPress={() => handleUpdateProfile(false)}
                disabled={isPending || isEqual}
                className={`flex-row justify-center w-full rounded-[8px] py-3 ${isEqual ? "bg-gray-300" : "bg-bg-red"}`}
              >
                {isPending ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <Text className="text-white font-outfit-bold text-base">
                    Confirmar preferencias
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
