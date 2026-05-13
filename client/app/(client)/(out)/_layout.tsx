import { Stack } from "expo-router";

export default function OutStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)" />

      <Stack.Screen name="order_info/[order_id]" />

      <Stack.Screen
        name="l/[local_id]/[local_slug]"
        options={{ animation: "fade_from_bottom" }}
      />
      <Stack.Screen name="cart" />
    </Stack>
  );
}
