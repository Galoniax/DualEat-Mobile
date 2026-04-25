import { Feather, Fontisto } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { Keyboard, TextInput, TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";

interface MessageInputProps {
  insets: EdgeInsets;
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: () => void;
  setOpenIngredients: (openIngredients: boolean) => void;
  ingredientsRef: React.RefObject<BottomSheetModal | null>;
}

export default function MessageInput({
  insets,
  message,
  setMessage,
  handleSubmit,
  setOpenIngredients,
  ingredientsRef,
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
      style={{ marginHorizontal: insets.left + insets.right + 16 }}
      className={`flex-col py-2.5 px-5 mb-4 items-center justify-between gap-y-2 border  rounded-[24px] bg-[#f8f8f8] ${isFocused ? "border-gray-400" : "border-gray-200"}`}
    >
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={true}
        maxLength={500}
        numberOfLines={8}
        className="py-2.5 text-text-3 font-dosis-medium text-[16px] tracking-wide w-full min-h-[20px]"
        placeholder="Pregunta cualquier cosa..."
        placeholderTextColor="#707070"
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
      />
      <View className="flex-row justify-between items-center w-full">
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            Keyboard.dismiss();
            setOpenIngredients(true);
            ingredientsRef.current?.present();
          }}
        >
          <Fontisto name="paperclip" size={18} color="#4A4947" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!message.trim()}
          className={`rounded-full h-10 w-10 flex items-center justify-center ${!message.trim() ? "bg-gray-300" : "bg-bg-semi-black"}`}
        >
          <Feather name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
