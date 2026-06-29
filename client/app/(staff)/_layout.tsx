import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useAppMode } from "@/context/app/AppModeContext";
import { ROUTES } from "@/constants/constants";

export default function StaffLayout() {
  const { user } = useAuth();
  const { mode } = useAppMode();

  // 1. Si no está logueado, redirigir al welcome
  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // 2. Si no es staff (y no es business), redirigir a cliente
  const hasWorkplaces = (user.workplaces && user.workplaces.length > 0) || (user.role as string) === 'staff';
  if (!hasWorkplaces && !user.is_business) {
    return <Redirect href={ROUTES.USER.DASHBOARD(mode || "out")} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
