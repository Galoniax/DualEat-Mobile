import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/layout/haptic-tab";
import { TopSearchBar } from "@/components/layout/TopSearchBar";
import { useNotifications } from "@/hooks/api/notification/useNotifications";
import { Bell, House, Map, QrCode, ReceiptText } from "lucide-react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const { unreadCount } = useNotifications();

  const TabStyle: ViewStyle = {
    height: 66 + insets.bottom,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e7",
  };

  const size = 22;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#171717",
        tabBarInactiveTintColor: "#a3a3a3",
        tabBarButton: HapticTab,
        tabBarStyle: TabStyle,
        headerTransparent: true,
        tabBarShowLabel: true,
        header: (props) => <TopSearchBar {...props} />,
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {/* ---------------- PESTAÑA: INICIO ---------------- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: true,
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontFamily: focused ? "Outfit-Bold" : "Outfit-Medium",
                fontSize: 10,
                marginTop: -4,
                paddingBottom: 4,
              }}
            >
              Inicio
            </Text>
          ),
          tabBarIcon: ({ color }) => <House color={color} size={size} />,
        }}
      />

      {/* ---------------- PESTAÑA: MAPS ---------------- */}
      <Tabs.Screen
        name="maps"
        options={{
          headerShown: false,
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontFamily: focused ? "Outfit-Bold" : "Outfit-Medium",
                fontSize: 10,
                marginTop: -4,
                paddingBottom: 4,
              }}
            >
              Mapa
            </Text>
          ),
          tabBarIcon: ({ color }) => {
            return <Map color={color} size={size} />;
          },
        }}
      />

      {/* ---------------- PESTAÑA: QR ---------------- */}
      <Tabs.Screen
        name="qr"
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarStyle: { display: "none" },
          tabBarIcon: () => (
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                backgroundColor: "#333333",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: -5 }],
                shadowColor: "#000",
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <QrCode size={size} color="white" />
            </View>
          ),
        }}
      />

      {/* ---------------- PESTAÑA: ÓRDENES ---------------- */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Pedidos",
          headerShown: true,
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontFamily: focused ? "Outfit-Bold" : "Outfit-Medium",
                fontSize: 10,
                marginTop: -4,
                paddingBottom: 4,
              }}
            >
              Pedidos
            </Text>
          ),
          tabBarIcon: ({ color }) => {
            return <ReceiptText color={color} size={size} />;
          },
        }}
      />

      {/* ---------------- PESTAÑA: NOTIFICACIONES ---------------- */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notificaciones",
          headerShown: false,
          tabBarBadge:
            unreadCount > 9 ? "+9" : unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#3578e4",
            color: "#ffffff",
            fontSize: 9,
            fontWeight: "bold",
            height: 14,
            minWidth: 14,
            lineHeight: 13,
            borderRadius: 7,
            paddingHorizontal: 3,
            alignSelf: "center",
          },
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontFamily: focused ? "Outfit-Bold" : "Outfit-Medium",
                fontSize: 10,
                marginTop: -4,
                paddingBottom: 4,
              }}
            >
              Alertas
            </Text>
          ),
          tabBarIcon: ({ color }) => {
            return <Bell color={color} size={size} />;
          },
        }}
      />
    </Tabs>
  );
}
