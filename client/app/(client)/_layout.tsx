import { Stack } from "expo-router";

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(in)" options={{ animation: "slide_from_right" }} /> 
      <Stack.Screen name="(out)" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
