import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMyCommunities } from "@/hooks/api/useMyCommunities";
import { useAppMode } from "@/context/app/AppModeContext";
import { CommunityMember } from "@/interface/global";
import { ROUTES } from "@/constants/constants";
import { Path, Svg } from "react-native-svg";

export const CustomSidebar = (props: any) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, logout } = useAuth();
  const { switchMode, mode } = useAppMode();

  const { data: communities, refetch } = useMyCommunities();
  const [expanded, setExpanded] = useState({
    comunity: true,
    chat: true,
  });

  const isDrawerOpen = useDrawerStatus() === "open";

  useEffect(() => {
    if (isDrawerOpen) {
      refetch();
    }
  }, [isDrawerOpen, refetch]);

  const items: Record<string, JSX.Element> = useMemo(() => {
    return {
      mode: mode === "out" ? (
        <>
        </>
      ) : (
        <></>
      ),
    };
  }, [mode]);

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: insets.top + 30,
        paddingHorizontal: insets.left + insets.right + 20,
      }}
      className="flex-col gap-y-2"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-x-4 items-center">
          <Image
            source={{ uri: user?.avatar_url }}
            className="h-10 w-10 rounded-full"
          />
          <View>
            <Text className="font-dosis-regular text-[14px] text-text-6">
              ¡Bienvenido de nuevo!
            </Text>

            <Text className="font-dosis-bold text-[16px] text-text-3">
              {user?.name}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-1.5" onPress={switchMode}>
          <Svg fill="#7D7D7D" width={24} height={24} viewBox="0 0 640 640">
            <Path d="M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-y-4">
          <TouchableOpacity
            className="flex-row items-center gap-x-4 border-y border-gray-200 border-dashed py-2.5"
            onPress={() => {
              switchMode();
              props.navigation.closeDrawer();
            }}
          >
            <Svg fill="#7D7D7D" width={22} height={22} viewBox="0 0 640 640">
              <Path d="M416 192C486.7 192 544 249.3 544 320C544 390.7 486.7 448 416 448L224 448C153.3 448 96 390.7 96 320C96 249.3 153.3 192 224 192L416 192zM608 320C608 214 522 128 416 128L224 128C118 128 32 214 32 320C32 426 118 512 224 512L416 512C522 512 608 426 608 320zM224 400C268.2 400 304 364.2 304 320C304 275.8 268.2 240 224 240C179.8 240 144 275.8 144 320C144 364.2 179.8 400 224 400z" />
            </Svg>

            <Text className="font-dosis-bold text-[14px]">Cambiar de modo</Text>
          </TouchableOpacity>

          <SidebarItem isExpanded={null} icon="receipt-outline" label="Mapa" />
          <SidebarItem
            isExpanded={null}
            icon="search-outline"
            label="Explorar"
          />

          <View className=" border-y border-gray-200 my-2">
            <SidebarItem
              icon="add-circle-outline"
              label="Crear Comunidad"
              onPress={() => router.push(ROUTES.USER.CREATE_COMMUNITY)}
              isExpanded={null}
            />
          </View>

          <SidebarItem
            icon="people-outline"
            label="Comunidades"
            onPress={() =>
              setExpanded({ ...expanded, comunity: !expanded.comunity })
            }
            isExpanded={expanded.comunity}
          />

          {expanded.comunity && communities && communities.length > 0 && (
            <View className="pb-2">
              {communities.map((item: CommunityMember) => (
                <TouchableOpacity
                  key={item.community.id}
                  onPress={() => {
                    router.push({
                      pathname: ROUTES.USER.COMMUNITY,
                      params: {
                        community_slug: item.community.slug || "",
                      },
                    });
                    props.navigation.closeDrawer();
                  }}
                  className="flex-row items-center py-1"
                >
                  {/* Avatar */}
                  <Image
                    source={{ uri: item.community.image_url }}
                    className="w-6 h-6 rounded-full mr-3"
                  />

                  {/* Community Info */}
                  <View className="flex-1">
                    <Text
                      className="font-dosis-regular text-[14px] text-text-4 truncate"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.community.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <SidebarItem
            icon="chatbubbles-outline"
            label="Chats"
            onPress={() => setExpanded({ ...expanded, chat: !expanded.chat })}
            isExpanded={expanded.chat}
          />

          <SidebarItem
            isExpanded={null}
            icon="qr-code-outline"
            label="Escanear QR"
          />
        </View>
      </ScrollView>

      {/* Botón de Logout fijo abajo */}
      <TouchableOpacity
        onPress={logout}
        className="p-2.5 rounded-[8px] mt-auto"
      >
        <Ionicons name="log-out-outline" size={26} color="#B53325" />
      </TouchableOpacity>
    </View>
  );
};

const SidebarItem = ({
  icon,
  label,
  onPress,
  isExpanded,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  isExpanded?: boolean | null;
}) => (
  <TouchableOpacity
    className={`flex-row items-center ${onPress ? "justify-between" : ""} py-2.5`}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <Ionicons name={icon} size={20} color="#4A4947" />
      <Text className="font-dosis-bold text-[14px]" style={styles.menuText}>
        {label}
      </Text>
    </View>
    {isExpanded !== null && (
      <Ionicons
        name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
        size={17}
        color="#333"
      />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menuText: {
    marginLeft: 15,
    color: "#333",
  },
});
