import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ROUTES } from "@/constants/constants";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";

export default function Welcome() {
  const router = useRouter();

  const { handleGoogleLogin } = useGoogleAuth();

  return (
    <SafeAreaView className="flex-1 bg-bg-gray">
      <ImageBackground
        source={require("@/assets/images/WelcomeBG.png")}
        className="absolute inset-0 z-[-1] min-h-full w-full"
        resizeMode="cover"
      />

      <View className="flex-[0.9] px-4 pt-3 flex flex-col justify-end items-center">
        <Text className="text-text-1 text-[26px] font-outfit-bold">
          Bienvenido/a a DualEat
        </Text>
        <Text className="text-[#bdbdbd] text-[15px] text-center font-dosis-light mt-3 leading-6">
          Sumergite en un universo de alta gastronomía: una experiencia
          culinaria diseñada para deleitar tus sentidos.
        </Text>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          className="mt-8 bg-[#212121] w-full py-4 rounded-[40px] items-center flex-row justify-center gap-2"
        >
          <Image
            source={{
              uri: "https://img.icons8.com/fluency/48/google-logo.png",
            }}
            style={{ width: 20, height: 20 }}
            accessibilityLabel="Google logo"
          />
          <Text className="text-white text-[14px] font-outfit-bold">
            Iniciar Sesión con Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.push(ROUTES.AUTH.LOGIN);
          }}
          className="mt-5 bg-bg-red w-full py-4 rounded-[40px] items-center flex-row justify-center gap-2"
        >
          <MaterialIcons name="email" size={19} color="#fff" />
          <Text className="text-white text-[14px] font-outfit-bold">
            Iniciar Sesión con email
          </Text>
        </TouchableOpacity>
        <Text className="text-center text-[14px] text-[#bdbdbd] font-dosis-light mt-6">
          Todavía no tienes una cuenta?{" "}
          <Text
            className="text-text-1 font-outfit-bold"
            onPress={() => {
              router.push(ROUTES.AUTH.REGISTER);
            }}
          >
            Regístrate
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
