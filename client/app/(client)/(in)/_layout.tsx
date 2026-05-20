import { Stack } from "expo-router";

export default function InStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)" />
      <Stack.Screen name="c" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="create-community" options={{ animation: "simple_push"}} />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
