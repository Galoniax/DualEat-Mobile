import { Stack } from "expo-router";

export default function OutStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" /> 
      
      <Stack.Screen name="local" />
      <Stack.Screen name="cart" />
    </Stack>
  );
}