import {
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from "react-native";

import Toast from "react-native-toast-message";

import { GoogleIcon } from "@/assets/icon/google";
import { useRef, useState } from "react";

import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works";

import TextInputUI from "@/components/ui/TextInput";

import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ROUTES } from "@/constants/constants";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { getDeviceId } from "@/utils/device";
import { useAuth } from "@/context/auth/AuthContext";

export default function Login() {
  // --- ESTADOS LOCALES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- HOOKS ---
  const router = useRouter();

  const { login } = useAuth();
  const { handleGoogleLogin } = useGoogleAuth();

  const Logo = require("@/assets/images/icon/LogoDualEat.png");

  // --- REFERENCIA AL RECAPTCHA ---
  const recaptchaRef = useRef<RecaptchaRef>(null);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Por favor, completa todos los campos.",
      });
      return;
    }

    recaptchaRef.current?.open();
  };

  const onVerify = async (token: string) => {
    const deviceId = await getDeviceId();

    await login(email.trim(), password.trim(), true, token, deviceId);
  };

  const onExpire = () => {
    recaptchaRef.current?.close();

    Toast.show({
      type: "error",
      text1: "Verificación expirada",
      text2: "Por favor, intenta nuevamente.",
    });
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
              onPress={() => router.push(ROUTES.PUBLIC.HOME)}
            />
          </View>

          <View className="flex-row items-center flex-2 justify-center">
            <Text className="text-text-2 text-[13px] font-dosis-light mr-2">
              ¿Todavía no tienes una cuenta?
            </Text>
            <TouchableOpacity
              className="p-2 rounded-lg "
              onPress={() => router.push(ROUTES.AUTH.REGISTER)}
            >
              <Text className="text-text-1 text-[13px] font-dosis-bold text-center">
                Registrate
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
              Iniciar sesión
            </Text>
            <Text className="font-dosis-light text-[14px] text-text-2 mb-10">
              Conéctate con tu comida, como nunca antes
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
          </View>

          <TouchableOpacity className=" w-[80%] mt-5 me-5">
            <Text className="text-[13px] text-right text-text-1 font-dosis-bold tracking-tighter">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <View className="w-[80%] items-center my-4">
            <Recaptcha
              ref={recaptchaRef}
              siteKey="6LcEHaYrAAAAAOD2H4YUWk_9AiJsgtAdbHI1usz1"
              baseUrl="http://localhost"
              onVerify={onVerify}
              onExpire={onExpire}
              size="normal"
              theme="light"
              style={{ width: "100%", height: 80 }}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            className="bg-bg-red w-[80%] p-3 rounded-full items-center border border-gray-300"
          >
            <Text className="text-text-1 font-dosis-bold text-[15px] tracking-tighter">
              Iniciar Sesión
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
              Iniciar sesión con Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* reCAPTCHA Modal */}
      <Recaptcha
        ref={recaptchaRef}
        siteKey="6LcEHaYrAAAAAOD2H4YUWk_9AiJsgtAdbHI1usz1"
        baseUrl="http://localhost"
        onVerify={onVerify}
        onExpire={onExpire}
        size="normal"
        theme="light"
      />
    </View>
  );
}