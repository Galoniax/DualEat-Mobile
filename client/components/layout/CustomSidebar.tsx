import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import {
  useDrawerStatus,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMyCommunities } from "@/hooks/api/useMyCommunities";

export const CustomSidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const { data: communities, refetch } = useMyCommunities();

  const expandOptions = [
    { name: "Comunidades", key: "comunity" },
    { name: "Chats", key: "chats" },
  ];

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleOption = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const insets = useSafeAreaInsets();

  const isDrawerOpen = useDrawerStatus() === "open";

  useEffect(() => {
    if (isDrawerOpen) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen]);
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

      <ScrollView>
        <View className="mt-4">
          <View className="flex-col gap-2">
            <SidebarItem icon="person-outline" label="Perfil" />
            <SidebarItem icon="receipt-outline" label="Mapa" />
            <SidebarItem icon="search-outline" label="Explorar" />

            <TouchableOpacity
              style={{ borderColor: "#E5E5E5" }}
              className={`flex-row items-center py-3 border-y mt-2`}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle-outline" size={20} color="#333" />
                <Text
                  className="font-dosis-bold text-[16.5px]"
                  style={styles.menuText}
                >
                  Crear Comunidad
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-2 mt-7">
            <SidebarItem
              icon="people-outline"
              label="Comunidades"
              onPress={() => toggleOption("comunity")}
              isExpanded={expanded.comunity}
            />

            {expanded.comunity && (
              <View className="flex-col gap-2">
                {communities && communities.length > 0 ? (
                  communities.map((community) => (
                    <TouchableOpacity
                      key={community.id}
                      className="flex-row items-center py-3"
                    >
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: community.image_url }}
                          className="h-11 w-11 rounded-full"
                        />
                        <Text
                          className="font-dosis-bold text-[16.5px]"
                          style={styles.menuText}
                        >
                          {community.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="font-dosis-regular text-[14.5px] text-center mb-2">
                    No tienes comunidades
                  </Text>
                )}
              </View>
            )}
            <SidebarItem icon="chatbubbles-outline" label="Chats" />
          </View>

          <View style={styles.divider} />
          <View>
            <SidebarItem
              icon="swap-horizontal-outline"
              label="Cambiar Modo"
              // onPress={toggleAppMode}
            />
            <SidebarItem icon="qr-code-outline" label="Escanear QR" />
          </View>

          <View style={styles.divider} />
        </View>

        
      </ScrollView>
      <TouchableOpacity className="p-2.5 rounded-[8px]">
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
  isExpanded?: boolean;
}) => (
  <TouchableOpacity
    className={`flex-row items-center ${onPress ? "justify-between" : ""} py-3`}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <Ionicons name={icon} size={24} color="#333" strokeWidth={5} />
      <Text className="font-dosis-bold text-[18px]" style={styles.menuText}>
        {label}
      </Text>
    </View>
    {onPress && (
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
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 20,
    marginVertical: 10,
  },
});
