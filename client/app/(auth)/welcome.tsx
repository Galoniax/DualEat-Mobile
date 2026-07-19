import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ROUTES } from "@/constants/constants";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { handleGoogleLogin } = useGoogleAuth();

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={{ paddingBottom: insets.bottom + 12 }}
      className="flex-1 py-6 "
    >
      <ImageBackground
        source={require("@/assets/images/WelcomeBG.png")}
        className="absolute inset-0 min-h-full w-full"
        resizeMode="cover"
      />

      <View
        style={{ paddingHorizontal: insets.left + insets.right + 16 }}
        className="flex flex-col gap-y-2 items-center justify-end flex-1"
      >
        <Text className="text-text-1 text-2xl font-outfit-bold">
          Bienvenido/a a DualEat
        </Text>
        <Text className="text-text-2 text-base text-center font-outfit-light">
          Sumergite en un universo de alta gastronomía: una experiencia
          culinaria diseñada para deleitar tus sentidos.
        </Text>

        <View className="flex-col gap-y-2 w-full">
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="mt-8 bg-bg-semi-black  py-3.5 rounded-full items-center flex-row justify-center gap-2"
          >
            <Image
              source={{
                uri: "https://img.icons8.com/fluency/48/google-logo.png",
              }}
              style={{ width: 20, height: 20 }}
              accessibilityLabel="Google logo"
            />
            <Text className="text-white text-sm font-outfit-bold">
              Iniciar Sesión con Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              router.push(ROUTES.AUTH.LOGIN);
            }}
            className="mt-5 bg-bg-red py-3.5 rounded-full items-center flex-row justify-center gap-2"
          >
            <MaterialIcons name="email" size={19} color="#fff" />
            <Text className="text-white text-sm font-outfit-bold">
              Iniciar Sesión con email
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-x-2 mt-6">
          <Text className="text-center text-sm text-text-2 font-outfit-light ">
            Todavía no tienes una cuenta?
          </Text>

          <TouchableOpacity
            onPress={() => {
              router.push(ROUTES.AUTH.REGISTER);
            }}
          >
            <Text className="text-white text-sm font-outfit-bold">
              Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
