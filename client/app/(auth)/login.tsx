import {
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";

import { WebView } from "react-native-webview";
import { GoogleIcon } from "@/assets/icon/google";
import { useRef, useState } from "react";

import TextInputUI from "@/components/ui/inputs/TextInput";

import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ROUTES } from "@/constants/constants";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { getDeviceId } from "@/utils/device";
import { useAuth } from "@/context/auth/AuthContext";
import { globalToast as toast } from "@/utils/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { login } = useAuth();
  const { handleGoogleLogin } = useGoogleAuth();

  const Logo = require("@/assets/icon/LogoDualEat.png");

  // --- REFERENCIA AL RECAPTCHA ---
  const recaptchaRef = useRef<WebView>(null);

  const onPressLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      toast.error("Error", "Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      recaptchaRef.current?.injectJavaScript(`
        if (window.turnstileWidgetId !== undefined) {
          turnstile.execute(window.turnstileWidgetId);
        }
        true;
      `);
    } catch (e) {
      console.log("Error inyectando script: ", e);
      setLoading(false);
    }
  };

  // 2. Manejador de la respuesta de Cloudflare
  const onMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "success") {
        try {
          // === INICIO DEL LOGIN REAL ===
          const deviceId = await getDeviceId();
          await login(
            email.trim(),
            password.trim(),
            true,
            data.token,
            deviceId,
          );
        } catch (e) {
          console.log("Error en credenciales o servidor:", e);
        } finally {
          setLoading(false);
        }
      } else if (data.type === "error") {
        toast.error(
          "Error de Seguridad",
          "Por favor, completa todos los campos.",
        );
        setLoading(false);
      } else if (data.type === "expired") {
        toast.error(
          "Sesión Expirada",
          "Por favor, vuelve a intentar iniciar sesión.",
        );
        setLoading(false);
      }
    } catch (e) {
      console.log("Error parseando mensaje de Turnstile:", e);
      setLoading(false);
    }
  };
  const cloudfareHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>
      </head>
      <body>
        <div id="cf-turnstile"></div>
        <script>
          window.onload = function () {
            window.turnstileWidgetId = turnstile.render('#cf-turnstile', {
              sitekey: '0x4AAAAAACny8xDMqyxHHXxu',
              size: 'invisible',
              execution: 'execute', 
              callback: function(token) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', token: token }));
              },
              'error-callback': function(err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: String(err) }));
              },
              'expired-callback': function() {
                turnstile.reset(window.turnstileWidgetId);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expired' }));
              }
            });
          };
        </script>
      </body>
    </html>
  `;

  return (
   <SafeAreaView edges={["bottom", "left", "right", "top"]} className="flex-1">
    <StatusBar style="light" />
      <ImageBackground
        source={require("@/assets/images/PermissionBG.png")}
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
              ¿Todavía no tienes una cuenta?
            </Text>
            <TouchableOpacity
              className="p-2 rounded-lg"
              onPress={() => router.push(ROUTES.AUTH.REGISTER)}
            >
              <Text className="text-text-1 text-sm font-outfit-bold">
                Registrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        <View className="flex flex-row items-center justify-center gap-2">
          <Image source={Logo} className="w-[30px] h-[30px] object-contain" />

          <Text className="text-white text-3xl font-outfit-bold">
            DualEat
          </Text>
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
                Iniciar sesión
              </Text>
              <Text className="font-outfit-light text-base text-center text-text-3">
                Conéctate con tu comida, como nunca antes
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
            </View>

            <TouchableOpacity
            onPress={onPressLogin}
            activeOpacity={0.9}
            className="bg-bg-red w-full p-3 rounded-full items-center"
          >
            {loading ? (
              <ActivityIndicator className="py-0.5" color="#fff" />
            ) : (
              <Text className="text-text-1 font-outfit-bold text-base tracking-tighter">
                Iniciar Sesión
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="w-full">
            <Text className="text-sm text-text-3 font-outfit-bold text-right">
              ¿Olvidaste tu contraseña?
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

      <View style={{ width: 0, height: 0, overflow: "hidden", opacity: 0 }}>
        <WebView
          ref={recaptchaRef}
          source={{ html: cloudfareHTML, baseUrl: "http://localhost" }}
          onMessage={onMessage}
          javaScriptEnabled={true}
          bounces={false}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
}
