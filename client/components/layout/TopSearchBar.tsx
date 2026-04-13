import React from "react";
import { View, TouchableOpacity, Platform, Image } from "react-native";

import { useNavigation, useRouter, useSegments } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "@/context/auth/AuthContext";
import { Path, Svg } from "react-native-svg";
import { ROUTES } from "@/constants/constants";

export const TopSearchBar = () => {
  const segments = useSegments();

  const navigation = useNavigation();
  const router = useRouter();

  const { user } = useAuth();

  const isDashboardIn = (segments as string[]).includes("(in)");

  const handleMenuPress = () => {
    if (!user) return;
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const isChat = (segments as string[]).includes("chat");

  return (
    <View
      style={{
        paddingTop: Platform.OS === "ios" ? 50 : 40,
        paddingBottom: 10,
      }}
      className="flex-row px-5 items-center justify-between"
    >
      <TouchableOpacity
        onPress={() => {
          handleMenuPress();
        }}
      >
        <Image
          source={{ uri: user?.avatar_url }}
          className="w-[28px] h-[28px] rounded-full"
        />
      </TouchableOpacity>

      <View>
        {/* Barra de Búsqueda */}
        {isDashboardIn && <View></View>}
      </View>

      {isChat && (
        <View style={{ gap: 16 }} className="flex-row items-center">
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              router.push(ROUTES.USER.CHAT_HISTORY);
            }}
          >
            <Svg width={24} height={24} viewBox="0 0 640 640">
              <Path
                fill="#333333"
                d="M320 128C426 128 512 214 512 320C512 426 426 512 320 512C254.8 512 197.1 479.5 162.4 429.7C152.3 415.2 132.3 411.7 117.8 421.8C103.3 431.9 99.8 451.9 109.9 466.4C156.1 532.6 233 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C234.3 64 158.5 106.1 112 170.7L112 144C112 126.3 97.7 112 80 112C62.3 112 48 126.3 48 144L48 256C48 273.7 62.3 288 80 288L104.6 288C105.1 288 105.6 288 106.1 288L192.1 288C209.8 288 224.1 273.7 224.1 256C224.1 238.3 209.8 224 192.1 224L153.8 224C186.9 166.6 249 128 320 128zM344 216C344 202.7 333.3 192 320 192C306.7 192 296 202.7 296 216L296 320C296 326.4 298.5 332.5 303 337L375 409C384.4 418.4 399.6 418.4 408.9 409C418.2 399.6 418.3 384.4 408.9 375.1L343.9 310.1L343.9 216z"
              />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Svg width={24} height={24} viewBox="0 0 640 640">
              <Path
                fill="#333333"
                d="M32 176C32 134.5 63.6 100.4 104 96.4L104 96L384 96C437 96 480 139 480 192L480 368L304 368C264.2 368 232 400.2 232 440L232 500C232 524.3 212.3 544 188 544C163.7 544 144 524.3 144 500L144 272L80 272C53.5 272 32 250.5 32 224L32 176zM268.8 544C275.9 530.9 280 515.9 280 500L280 440C280 426.7 290.7 416 304 416L552 416C565.3 416 576 426.7 576 440L576 464C576 508.2 540.2 544 496 544L268.8 544zM112 144C94.3 144 80 158.3 80 176L80 224L144 224L144 176C144 158.3 129.7 144 112 144z"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
