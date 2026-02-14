import { Stack } from "expo-router";

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="(in)" />
      <Stack.Screen name="(out)" />
    </Stack>
  );
}
