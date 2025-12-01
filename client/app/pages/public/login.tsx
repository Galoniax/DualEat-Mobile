import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from "react-native";

import Logo from "@/assets/images/icon/LogoDualEatRed.png";

import axiosInterceptor from "@/api/client";

import Toast from "react-native-toast-message";

import { GoogleIcon } from "@/components/icon/google";
import { useRef, useState } from "react";

import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

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

  const handleGoogleLogin = async () => {
    try {
      window.location.href = "http://192.168.0.14:3000/api/auth/google";
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  const onVerify = (token: string) => {
    console.log("✅ reCAPTCHA verificado:", token);
    setRecaptchaToken(token);

    // Aquí llamas a tu función de login
    // await login(email, password, false, token);

    Toast.show({
      type: "success",
      text1: "Verificación exitosa",
      text2: "Procesando login...",
    });
  };

  const onExpire = () => {
    console.log("❌ reCAPTCHA expirado");
    setRecaptchaToken(null);

    Toast.show({
      type: "error",
      text1: "Verificación expirada",
      text2: "Por favor, intenta nuevamente.",
    });
  };

  return (
    <View className="flex-1 bg-bg-semi-black">
      <ImageBackground
        source={require("@/assets/images/BGDash.png")}
        resizeMode="cover"
        className="flex-1"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />

      <View className="flex-1 justify-end">
        <View className="w-full flex-[0.8] border border-[#878787] bg-bg-gray rounded-tr-[40px] rounded-tl-[40px] items-center pt-8 pb-10">
          <Image source={Logo} className="w-[40px] h-[40px]" />

          <View className="flex-col gap-1 items-center">
            <Text className="text-[26px] font-dosis-bold text-text-3 mt-4 tracking-tighter">
              Iniciar sesión
            </Text>
            <Text className="font-dosis-light text-[15px] text-text-4 mb-6">
              Conéctate con tu comida, como nunca antes
            </Text>
          </View>

          {/* --- Formulario --- */}
          <View className="w-[80%]">
            <Text className="text-[14px] text-left text-text-3 font-dosis-bold mb-2 tracking-tighter">
              Email
            </Text>
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border w-[80%] rounded-[5px] border-[#dbdbdb] p-2 focus:border-bg-blue focus:border-2"
          />

          <View className="flex-row justify-between w-[80%] mt-4 mb-2">
            <Text className="text-[14px] text-text-3 font-dosis-bold tracking-tighter">
              Contraseña
            </Text>
            <Text className="text-[14px] text-right text-bg-blue font-dosis-medium tracking-tighter">
              ¿Olvidaste tu contraseña?
            </Text>
          </View>
          <TextInput
            keyboardType="visible-password"
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            className="border w-[80%] rounded-[5px] border-[#dbdbdb] p-2 focus:border-bg-blue focus:border-2"
          />

          <View className="w-[80%] items-center my-6">
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
            className="bg-bg-red w-[80%] p-2 rounded-[5px] items-center"
          >
            <Text className="text-text-1 font-dosis-bold text-[15px] tracking-tighter">
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          {/* --- Divisor "o" --- */}
          <View className="flex-row items-center w-[80%] my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 font-dosis-medium">o</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* --- Botón de Google --- */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="bg-bg-gray border border-gray-300 w-[80%] p-2.5 rounded-[5px] items-center flex-row justify-center"
          >
            <GoogleIcon />
            <Text className="text-text-5 font-dosis-bold text-[14px] ml-1 tracking-tighter">
              Iniciar sesión con Google
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-between gap-2 mt-6">
            <Text className="text-[15px] text-right text-text-4 font-dosis-medium tracking-tighter">
              ¿No tienes cuenta?
            </Text>
            <Text className="text-[15px] font-dosis-bold text-right text-text-4 tracking-tighter">
              Registrate
            </Text>
          </View>
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