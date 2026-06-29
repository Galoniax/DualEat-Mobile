import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


export function ErrorView({
  type = 404,
  title,
  message,
  onAction,
  actionLabel,
}: {
  type: any;
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  const error = require(`@/assets/images/Error.png`);

  const router = useRouter();

  const handleAction = () => {
    if (onAction) onAction();
    else router.back();

    return;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-semi-white flex-col items-center justify-center gap-8 px-6">
      <View className="flex-col justify-center items-center gap-y-2 ">
        <Image
          source={error}
          resizeMode="contain"
          className="opacity-80 h-[40vh]"
        />

        <View
          style={{ backgroundColor: "rgba(181, 51, 37, 0.07)" }}
          className="items-center justify-center flex-row gap-2 px-3 py-1 rounded-full"
        >
          <Ionicons name="warning-outline" size={16} color="#B53325" />
          <Text className="text-bg-red text-xs font-outfit-bold">
            Error {type}
          </Text>
        </View>

        <Text className="text-center font-outfit-bold text-text-3 text-xl">
          {title}
        </Text>

        <Text className="text-text-5 font-outfit-light text-center text-base">
          {message}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-bg-red w-full max-w-[90%] rounded-[5px] py-3"
        onPress={handleAction}
      >
        <Text className="text-white text-center font-outfit-bold text-center text-sm">
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
