import { Feather } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: () => void;
  setOpenIngredients: (openIngredients: boolean) => void;
  ingredientsRef: React.RefObject<BottomSheetModal | null>;
  recipeRef: React.RefObject<BottomSheetModal | null>;
}

export default function MessageInput({
  message,
  setMessage,
  handleSubmit,
  setOpenIngredients,
  ingredientsRef,
  recipeRef,
}: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsFocused(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsFocused(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
        borderRadius: 20,
      }}
      className={`flex-col py-2 px-4 mb-4 items-center border justify-between gap-y-3 bg-bg-semi-white ${isFocused ? "border-gray-400" : "border-gray-200"}`}
    >
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={true}
        maxLength={500}
        numberOfLines={8}
        style={{ minHeight: 50 }}
        className="text-text-5 font-outfit-regular text-base w-full"
        placeholder="¿Qué quieres cocinar hoy?"
        placeholderTextColor="#2F2F2F"
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
      />
      <View className="flex-row justify-between items-center w-full">
        <View className="flex-row items-center gap-x-4">
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              Keyboard.dismiss();
              setOpenIngredients(true);
              ingredientsRef.current?.present();
            }}
            className="border border-gray-200 rounded-full p-2"
          >
            <Svg viewBox="0 0 640 640" width={20} height={20}>
              <Path
                fill="#2F2F2F"
                d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
              />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              Keyboard.dismiss();
              recipeRef.current?.present();
            }}
            className="border border-gray-200 rounded-full p-2 flex-row items-center gap-x-2"
          >
            <Svg width={20} height={20} viewBox="0 0 640 640">
              <Path
                fill="#2F2F2F"
                d="M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z"
              />
            </Svg>
            <Text className="text-text-3 font-outfit-light text-sm">
              Recetas
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!message.trim()}
          className={`rounded-full h-10 w-10 flex items-center justify-center bg-bg-semi-black`}
        >
          <Feather name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
