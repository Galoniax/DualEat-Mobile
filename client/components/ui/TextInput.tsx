import { useState } from "react";
import { Text, View, TextInput as RNTextInput, TouchableOpacity } from "react-native";

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
}

export default function TextInput({
  value,
  onChangeText,
  title,
  type,
  isPassword,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [valueLocal, setValueLocal] = useState(value);

  const [showPassword, setShowPassword] = useState(false);

  

  return (
    <View className="w-[80%] relative mt-4">
      <View className="absolute -top-2.5 left-10 z-10 px-1">
        <Text className="text-text-1 text-xs font-dosis-bold">{title}</Text>
      </View>

      {/* 2. CONTENEDOR (El que tiene el borde) */}
      <View
        className={`
            flex-row items-center 
            border rounded-full px-4 py-1
            ${isFocused ? "border-[#afafaf]" : "border-[#dbdbdb]"}
        `}
      >
        {/* Icono a la izquierda */}
        {type === "email-address" ? (
          <Ionicons name="mail-outline" size={18} color="#fff" />
        ) : isPassword ? (
          <Ionicons name="lock-closed-outline" size={18} color="#fff" />
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
          className="flex-1 ml-2 text-text-1 font-dosis-regular text-base"
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-2"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
