import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useAppMode } from "@/context/app/AppModeContext";
import { ROUTES } from "@/constants/constants";

export default function AuthLayout() {
  const { user } = useAuth();
  const { mode } = useAppMode();

  if (user) {
    const hasWorkplaces =
      (user.workplaces && user.workplaces.length > 0) ||
      (user.role as string) === "staff";
    if (hasWorkplaces && !user.is_business) {
      return <Redirect href="/(staff)/(tabs)" />;
    }
    return <Redirect href={ROUTES.USER.DASHBOARD(mode || "out")} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen name="login" options={{ animation: "fade_from_bottom" }} />
      <Stack.Screen name="register" options={{ animation: "flip" }} />
      <Stack.Screen name="onboarding" options={{ animation: "simple_push" }} />
    </Stack>
  );
}
