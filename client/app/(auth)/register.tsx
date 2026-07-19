import {
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from "react-native";

import { globalToast as toast } from "@/utils/toast";

import { GoogleIcon } from "@/assets/icon/google";
import { useState } from "react";

import TextInputUI from "@/components/ui/inputs/TextInput";

import { useRouter } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { ROUTES } from "@/constants/constants";
import { getDeviceId } from "@/utils/device";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { useAuth } from "@/context/auth/AuthContext";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Register() {
  // --- ESTADOS LOCALES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // --- HOOKS ---
  const router = useRouter();
  const { register } = useAuth();
  const { handleGoogleLogin } = useGoogleAuth();

  const Logo = require("@/assets/icon/LogoDualEat.png");

  const handleRegister = async () => {
    const deviceId = await getDeviceId();

    if (!email || !password || !confirmPassword) {
      toast.error("Error", "Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Error", "Las contraseñas no coinciden.");
      return;
    }

    await register(email.trim(), password.trim(), deviceId);
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right", "top"]} className="flex-1">
      <StatusBar style="light" />
      <ImageBackground
        source={require("@/assets/images/YellowPermissionBG.png")}
        className="flex-1"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <View className="absolute inset-0 bg-black/50" />

        <View className="flex-row justify-between w-[90%] mx-auto items-center mt-[15%] mb-12">
          <TouchableOpacity onPress={() => router.push(ROUTES.PUBLIC.HOME)}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-center">
            <Text className="text-text-2 text-sm font-outfit-light">
              ¿Ya tienes una cuenta?
            </Text>
            <TouchableOpacity
              className="p-2 rounded-lg"
              onPress={() => router.push(ROUTES.AUTH.LOGIN)}
            >
              <Text className="text-text-1 text-sm font-outfit-bold">
                Inicia Sesión
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
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          className="flex-1 py-4"
        >
          <View
            style={{ maxWidth: "90%", alignSelf: "center" }}
            className="w-full items-center flex-col gap-y-5"
          >
            <View className="flex-col gap-y-2 items-center mb-4">
              <Text className="text-2xl font-outfit-bold text-text-3">
                Crear una cuenta
              </Text>
              <Text className="font-outfit-light text-base text-center text-text-3">
                ¡Bienvenido a DualEat! Vamos a crear tu cuenta.
              </Text>
            </View>

            <View className="w-full items-center flex-col gap-y-8">
              <TextInputUI
                value={email}
                onChangeText={setEmail}
                type="email-address"
                title="Email"
              />

              <TextInputUI
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                type="default"
                title="Contraseña"
              />

              <TextInputUI
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword={true}
                type="default"
                title="Confirmar Contraseña"
              />
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              className="bg-bg-yellow w-full p-3 rounded-full items-center"
            >
              <Text className="text-text-1 font-outfit-bold text-base">
                Registrarse
              </Text>
            </TouchableOpacity>

            {/* --- Divisor "o" --- */}
            <View className="flex-row items-center w-[80%]">
              <View className="flex-1 h-px bg-gray-400" />
              <Text className="mx-4 text-text-3 font-outfit-bold">**</Text>
              <View className="flex-1 h-px bg-gray-400" />
            </View>

            {/* --- Botón de Google --- */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className="bg-bg-gray border border-gray-300 p-3 w-full rounded-full items-center flex-row justify-center"
            >
              <GoogleIcon />
              <Text className="text-text-5 font-outfit-bold text-sm">
                Regístrate con Google
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
