import { Stack } from "expo-router";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

export default function ChatStackLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: false,
        presentation: "card",
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen
        name="[chat_id]"
        options={{
          title: "Chat",
          headerShown: true,
          headerTransparent: true,
          header: () => <TopSearchBar />,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "Historial",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
