import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { HapticTab } from "@/components/layout/haptic-tab";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function StaffTabLayout() {
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
          title: "Mis Locales",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "storefront" : "storefront-outline"} size={24} color={color} />
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
