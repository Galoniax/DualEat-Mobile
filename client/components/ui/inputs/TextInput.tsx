import { ReactNode, useState } from "react";
import {
  Text,
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  title: string;
  type?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "visible-password";
  isPassword?: boolean;
  icon?: ReactNode;
}

export default function TextInput({
  value,
  onChangeText,
  title,
  type,
  isPassword,
  icon,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [valueLocal, setValueLocal] = useState(value);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full relative">
      <View className="absolute -top-2.5 left-10 z-10 px-1">
        <Text className="text-text-3 text-xs font-outfit-bold">{title}</Text>
      </View>

      {/* 2. CONTENEDOR (El que tiene el borde) */}
      <View
        className={`
            flex-row items-center 
            border rounded-full px-4 py-1
            ${isFocused ? "border-gray-400" : "border-gray-300"}
        `}
      >
        {/* Icono a la izquierda */}
        {type === "email-address" ? (
          <Ionicons name="mail-outline" size={18} color="#000000ff" />
        ) : isPassword ? (
          <Ionicons name="lock-closed-outline" size={18} color="#000000ff" />
        ) : icon ? (
          icon
        ) : null}

        {/* Input Real (Sin bordes, llena el espacio restante) */}
        <RNTextInput
          value={valueLocal}
          onChangeText={(text) => {
            setValueLocal(text);
            onChangeText(text);
          }}
          secureTextEntry={isPassword || false ? !showPassword : false}
          placeholder={title}
          placeholderTextColor="#666"
          keyboardType={type || "default"}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 ml-2 text-text-3 font-outfit-light text-sm"
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-2"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#000000ff"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
