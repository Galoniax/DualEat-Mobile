import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, ViewStyle } from "react-native";

import { HapticTab } from "@/components/layout/haptic-tab";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

import { Bell, House, MessageCircle, Plus, Search } from "lucide-react-native";
import { useNotifications } from "@/hooks/api/notification/useNotifications";

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
                marginTop: -4,
                fontSize: 11,
                paddingBottom: 4,
              }}
            >
              Inicio
            </Text>
          ),
          tabBarIcon: ({ color }) => <House color={color} size={size} />,
        }}
      />

      {/* ---------------- PESTAÑA: BUSCAR ---------------- */}
      <Tabs.Screen
        name="explore"
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
              Explorar
            </Text>
          ),
          tabBarIcon: ({ color }) => {
            return <Search color={color} size={size} />;
          },
        }}
      />

      {/* ---------------- PESTAÑA: CREATE ---------------- */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Crear",
          headerShown: false,
          tabBarLabel: () => null,
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
              <Plus size={size} color="white" />
            </View>
          ),
        }}
      />

      {/* ---------------- PESTAÑA: CHATS ---------------- */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
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
              Chats
            </Text>
          ),
          tabBarIcon: ({ color }) => {
            return <MessageCircle color={color} size={size} />;
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
