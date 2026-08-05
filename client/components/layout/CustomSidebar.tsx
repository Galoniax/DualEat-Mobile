import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMyCommunities } from "@/hooks/api/useMyCommunities";
import { useAppMode } from "@/context/app/AppModeContext";
import { ROUTES } from "@/constants/constants";
import { Path, Svg } from "react-native-svg";
import { SidebarItem, UserSidebarItems } from "../ui/layout/sidebar-items";
import { useNotifications } from "@/hooks/api/notification/useNotifications";

export const CustomSidebar = (props: any) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, logout } = useAuth();
  const { switchMode, mode } = useAppMode();

  const { unreadCount } = useNotifications();

  const { data: communities, refetch } = useMyCommunities();

  const isDrawerOpen = useDrawerStatus() === "open";

  useEffect(() => {
    if (isDrawerOpen) {
      refetch();
    }
  }, [isDrawerOpen, refetch]);

  const handlePress = useCallback(
    (route: Href) => {
      router.push(route);
      props.navigation.closeDrawer();
    },
    [router, props.navigation],
  );

  const size = 22;

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: insets.top + 30,
        paddingHorizontal: insets.left + insets.right + 20,
      }}
      className="flex-col gap-y-2"
    >
      <Pressable
        onPress={() => handlePress(ROUTES.USER.PROFILE(user?.id as string))}
        className="flex-row items-center gap-x-4"
      >
        <Image
          source={{ uri: user?.avatar_url }}
          className="h-10 w-10 rounded-full"
        />
        <View>
          <Text className="font-outfit-light text-base text-text-6">
            ¡Bienvenido de nuevo!
          </Text>

          <Text className="font-outfit-bold text-lg text-text-3">
            {user?.name}
          </Text>
        </View>
      </Pressable>

      <ScrollView className="my-4 flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ rowGap: 20 }} className="flex-col">
          <TouchableOpacity
            className="flex-row items-center gap-x-4 border-y border-gray-300 border-dashed py-3"
            onPress={() => {
              switchMode(mode === "in" ? "out" : "in");
            }}
          >
            <Svg
              fill="#7D7D7D"
              width={size}
              height={size}
              viewBox="0 0 640 640"
            >
              <Path d="M416 192C486.7 192 544 249.3 544 320C544 390.7 486.7 448 416 448L224 448C153.3 448 96 390.7 96 320C96 249.3 153.3 192 224 192L416 192zM608 320C608 214 522 128 416 128L224 128C118 128 32 214 32 320C32 426 118 512 224 512L416 512C522 512 608 426 608 320zM224 400C268.2 400 304 364.2 304 320C304 275.8 268.2 240 224 240C179.8 240 144 275.8 144 320C144 364.2 179.8 400 224 400z" />
            </Svg>

            <Text className="font-outfit-bold text-sm text-text-3">
              Cambiar de modo
            </Text>
          </TouchableOpacity>

          <SidebarItem
            isExpanded={null}
            icon={
              <Image
                source={{
                  uri: "https://img.icons8.com/?size=100&id=i6fZC6wuprSu&format=png",
                }}
                style={{ width: size, height: size, tintColor: "#4A4947" }}
              />
            }
            onPress={() => {
              handlePress(ROUTES.USER.DASHBOARD(mode));
            }}
            label="Inicio"
          />
          <SidebarItem
            isExpanded={null}
            icon={
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={"#4A4947"}
                  d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"
                />
              </Svg>
            }
            onPress={() => {
              handlePress(ROUTES.USER.PROFILE(user?.id as string));
            }}
            label="Perfil"
          />

          <SidebarItem
            isExpanded={null}
            icon={
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={"#4A4947"}
                  d="M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
                />
              </Svg>
            }
            onPress={() => {
              handlePress(ROUTES.USER.NOTIFICATIONS(mode));
            }}
            label="Notificaciones"
            extra={
              unreadCount !== undefined && unreadCount > 0 ? (
                <View className="bg-bg-blue rounded-full items-center justify-center self-center">
                  <Text className="text-text-1 font-outfit-bold text-[10px] px-2 py-0.5">
                    {unreadCount}
                  </Text>
                </View>
              ) : null
            }
          />

          <View className=" border-t border-gray-400" />
          {mode && (
            <UserSidebarItems
              mode={mode}
              handlePress={handlePress}
              communities={communities || []}
              router={router}
              props={props}
            />
          )}
        </View>
      </ScrollView>

      {/* Botón de Logout */}
      <TouchableOpacity
        onPress={logout}
        className="p-2.5 flex-row items-center gap-x-4 border-y border-dashed border-bg-red py-3"
      >
        <Ionicons name="log-out-outline" size={size} color="#B53325" />
        <Text className="font-outfit-bold text-base text-bg-red">
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
};
