import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/context/auth/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppMode } from "@/context/app/AppModeContext";

// Completa el ciclo de autenticación
WebBrowser.maybeCompleteAuthSession();

export default function Welcome() {
  const router = useRouter();
  const { user, setToken } = useAuth();

  const { mode, clearMode } = useAppMode();

  // --- A. PROCESAR DEEP LINK ---
  const handleDeepLink = async (url: string) => {
    try {
      const { queryParams } = Linking.parse(url);

      // Usuario Existente
      if (queryParams?.token) {
        console.log("🎟️ Token recibido:", queryParams.token);
        setToken(queryParams.token as string);

        if (user?.isBusiness === false) {
          router.replace("/(client)/(eatOut)/(tabs)");
        }
       
        return;
      }

      // Usuario Nuevo
      if (queryParams?.tempToken) {
        console.log("🆕 Usuario nuevo. Yendo a onboarding...");
        router.replace(`/(auth)/onboarding?tempToken=${queryParams.tempToken}`);
        return;
      }
    } catch (error) {
      console.error("Error procesando deep link:", error);
    }
  };

  // --- B. ESCUCHAR DEEP LINKS ---
  useEffect(() => {
    // Capturar URL inicial
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await handleDeepLink(url);
      }
    };

    getInitialURL();

    // Listener para URLs mientras la app está abierta
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  // --- C. LOGIN CON GOOGLE ---
  const handleGoogleLogin = async () => {
    try {
      const backendUrl =
        "https://475002fa43ba.ngrok-free.app/api/auth/google?platform=mobile";
      const redirectUrl = Linking.createURL("callback"); // 🔥 Usa createURL

      const result = await WebBrowser.openAuthSessionAsync(
        backendUrl,
        redirectUrl
      );

      

      // ✅ Procesar resultado directo
      if (result.type === "success" && result.url) {
        //console.log("✅ WebBrowser retornó URL:", result.url);
        await handleDeepLink(result.url);
      } else if (result.type === "cancel") {
        console.log("❌ Login cancelado por el usuario");
      } else if (result.type === "dismiss") {
        //console.log("⚠️ WebBrowser cerrado sin completar");
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-gray">
      <ImageBackground
        source={require("@/assets/images/WelcomeBG.png")}
        className="absolute inset-0 z-[-1]  min-h-full w-full"
        resizeMode="cover"
      />

      <View className="flex-[0.9] px-4 pt-3 flex flex-col justify-end items-center">
        <Text className="text-text-1 text-[26px] font-dosis-bold">
          Bienvenido/a a DualEat
        </Text>
        <Text className="text-[#bdbdbd] text-[15px] text-center font-dosis-light mt-3 leading-6">
          Sumergite en un universo de alta gastronomía: una experiencia
          culinaria diseñada para deleitar tus sentidos.
        </Text>

        <TouchableOpacity
          onPress={() => {
            handleGoogleLogin();
          }}
          className="mt-8 bg-[#212121] w-full py-4 rounded-[40px] items-center flex-row justify-center gap-2"
        >
          <Image
            source={{
              uri: "https://img.icons8.com/fluency/48/google-logo.png",
            }}
            style={{ width: 20, height: 20 }}
            accessibilityLabel="Google logo"
          />
          <Text className="text-white text-[14px] font-dosis-bold">
            Iniciar Sesión con Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.push("/(auth)/login");
          }}
          className="mt-5 bg-bg-red w-full py-4 rounded-[40px] items-center flex-row justify-center gap-2"
        >
          <MaterialIcons name="email" size={19} color="#fff" />
          <Text className="text-white text-[14px] font-dosis-bold">
            Iniciar Sesión con email
          </Text>
        </TouchableOpacity>
        <Text className="text-center text-[14px] text-[#bdbdbd] font-dosis-light mt-6">
          Todavía no tienes una cuenta?{" "}
          <Text
            className="text-text-1 font-dosis-bold"
            onPress={() => {
              /* Navegar a la pantalla de registro */
            }}
          >
            Regístrate
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
