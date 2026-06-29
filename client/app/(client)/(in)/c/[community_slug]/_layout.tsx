import { Stack } from "expo-router";

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="search"
        options={{
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}
