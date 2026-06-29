import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { HapticTab } from "@/components/layout/haptic-tab";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function StaffLocalTabLayout() {
  const insets = useSafeAreaInsets();

  const TabStyle = {
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom + 4,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
    backgroundColor: "#fefefe",
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        tabBarInactiveTintColor: "#8e8e93",
        tabBarButton: HapticTab,
        tabBarStyle: TabStyle,
        headerShown: false,
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="qr"
        options={{
          title: "Escanear",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="orders"
        options={{
          title: "Órdenes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: "Notas",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
