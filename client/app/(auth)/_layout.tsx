import { Stack } from "expo-router";

export default function AuthLayout() {

  const screens = [
    "login",
    "register",
    "welcome",
    "onboarding",
  ];
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {screens.map((screen) => (
        <Stack.Screen key={screen} name={screen} options={{ headerShown: false }} />
      ))}
    </Stack>
  );
}