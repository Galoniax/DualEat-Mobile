import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useAppMode } from "@/context/app/AppModeContext";
import { ROUTES } from "@/constants/constants";

export default function AuthLayout() {
  const { user } = useAuth();
  const { mode } = useAppMode();

  if (user) {
    const hasWorkplaces = (user.workplaces && user.workplaces.length > 0) || (user.role as string) === 'staff';
    if (hasWorkplaces && !user.is_business) {
      return <Redirect href="/(staff)/(tabs)" />;
    }
    return <Redirect href={ROUTES.USER.DASHBOARD(mode || "out")} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
