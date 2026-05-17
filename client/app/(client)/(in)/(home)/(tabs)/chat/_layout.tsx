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
          title: "Chats",
          headerShown: true,
          headerTransparent: true,
          header: (props) => <TopSearchBar {...props} />,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "Historial",
        }}
      />
    </Stack>
  );
}
