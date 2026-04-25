import { Stack } from "expo-router";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "simple_push",
        headerShown: false,
        presentation: "card",
        gestureEnabled: true,
        gestureDirection: "vertical",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Explorar",
          headerShown: true,
          headerTransparent: true,
          header: () => <TopSearchBar />,
        }}
      />

      <Stack.Screen
        name="[tag_id]"
        options={{
          title: "Comunidades por tag",
          headerShown: false,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="[category_id]/[category_slug]"
        options={{
          title: "Comunidades por categoría",
          headerShown: false,
          headerTransparent: false,
        }}
      />
    </Stack>
  );
}
