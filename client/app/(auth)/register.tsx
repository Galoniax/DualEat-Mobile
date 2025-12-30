import {
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from "react-native";

import Toast from "react-native-toast-message";

import { GoogleIcon } from "@/components/icon/google";
import { useState } from "react";

import TextInputUI from "@/components/ui/TextInput";

import { useRouter } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { register } from "@/services/auth.api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const router = useRouter();

  const Logo = require("@/assets/images/icon/LogoDualEat.png");

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Por favor, completa todos los campos.",
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Las contraseñas no coinciden.",
      });
      return;
    }

    await register(email, password);
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = "http://192.168.0.14:3000/api/auth/google";
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <View className="flex-1 bg-bg-semi-black">
      <ImageBackground
        source={require("@/assets/images/YellowPermissionBG.png")}
        className="flex-1"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <View className="absolute inset-0 bg-black/50" />

        <View className="flex-row justify-between w-[90%] mx-auto items-center mt-[15%] mb-12">
          <View className="flex-1">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </View>

          <View className="flex-row items-center flex-2 justify-center">
            <Text className="text-text-2 text-[13px] font-dosis-light mr-2">
              ¿Ya tienes una cuenta?
            </Text>
            <TouchableOpacity
              className="p-2 rounded-lg "
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-text-1 text-[13px] font-dosis-bold text-center">
                Inicia Sesión
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
              Crear una cuenta
            </Text>
            <Text className="font-dosis-light text-[14px] text-text-2 mb-10">
              ¡Bienvenido a DualEat! Vamos a crear tu cuenta.
            </Text>
          </View>

          <View className="w-full items-center flex-col gap-3">
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
            activeOpacity={0.7}
            className="bg-bg-yellow w-[80%] p-3 rounded-full items-center mt-10"
          >
            <Text className="text-text-1 font-dosis-bold text-[15px] tracking-tighter">
              Registrarse
            </Text>
          </TouchableOpacity>

          {/* --- Divisor "o" --- */}
          <View className="flex-row items-center w-[80%] my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-text-1 font-dosis-medium">**</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* --- Botón de Google --- */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="bg-bg-gray border border-gray-300 w-[80%] p-3 rounded-full items-center flex-row justify-center"
          >
            <GoogleIcon />
            <Text className="text-text-5 font-dosis-bold text-[14px] ml-1 tracking-tighter">
              Regístrate con Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
