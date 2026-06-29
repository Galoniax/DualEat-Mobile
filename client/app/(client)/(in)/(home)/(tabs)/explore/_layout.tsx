import { Stack } from "expo-router";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "simple_push",
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="[category_id]/[category_slug]"
        options={{
          title: "Explorar",
          headerShown: true,
          headerTransparent: true,
          header: (props) => <TopSearchBar {...props} />,
        }}
      />

      <Stack.Screen
        name="[tag_id]"
        options={{
          title: "Comunidades por tag",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
