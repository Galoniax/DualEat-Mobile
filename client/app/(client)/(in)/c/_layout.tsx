import { Stack } from "expo-router";

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[community_slug]" />
    </Stack>
  );
}
