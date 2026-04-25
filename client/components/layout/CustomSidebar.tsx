import React, { useEffect, useState } from "react";
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

export const CustomSidebar = (props: any) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = useAuth();
  const { switchMode } = useAppMode();

  const { data: communities, refetch } = useMyCommunities();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleOption = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const isDrawerOpen = useDrawerStatus() === "open";

  useEffect(() => {
    if (isDrawerOpen) {
      refetch();
    }
  }, [isDrawerOpen, refetch]);

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: insets.top + 30,
        paddingHorizontal: insets.left + insets.right + 20,
      }}
    >
      <View className="flex-col pb-7 gap-3 items-start border-b-[0.5px] border-text-2">
        <Image
          source={{ uri: user?.avatar_url }}
          className="h-11 w-11 rounded-full"
        />
        <View>
          <Text className="font-dosis-bold text-[18px] text-text-3">
            {user?.name}
          </Text>
          <Text className="font-dosis-regular text-[15px] text-text-4">
            @{user?.slug}
          </Text>
        </View>
      </View>

      <ScrollView className="mt-4 flex-1 " showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-y-4">
          <SidebarItem icon="person-outline" label="Perfil" />
          <SidebarItem icon="receipt-outline" label="Mapa" />
          <SidebarItem icon="search-outline" label="Explorar" />

          <View className=" border-y border-gray-200 my-2">
            <SidebarItem
              icon="add-circle-outline"
              label="Crear Comunidad"
              onPress={() => router.push(ROUTES.USER.CREATE_COMMUNITY)}
            />
          </View>

          <SidebarItem
            icon="people-outline"
            label="Comunidades"
            onPress={() => toggleOption("comunity")}
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
            onPress={() => toggleOption("chat")}
            isExpanded={expanded.chat}
          />

          <SidebarItem
            icon="swap-horizontal-outline"
            label="Cambiar Modo"
            onPress={switchMode}
          />
          <SidebarItem icon="qr-code-outline" label="Escanear QR" />
        </View>
      </ScrollView>

      {/* Botón de Logout fijo abajo */}
      <TouchableOpacity className="p-2.5 rounded-[8px] mt-auto">
        <Ionicons name="log-out-outline" size={26} color="#B53325" />
      </TouchableOpacity>
    </View>
  );
};

const SidebarItem = ({
  icon,
  label,
  onPress,
  isExpanded = null,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  isExpanded?: boolean | null;
}) => (
  <TouchableOpacity
    className={`flex-row items-center ${onPress ? "justify-between" : ""} py-3`}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <Ionicons name={icon} size={20} color="#333" />
      <Text className="font-dosis-bold text-[16px]" style={styles.menuText}>
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
