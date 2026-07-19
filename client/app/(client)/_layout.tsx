import { useEffect } from "react";
import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { useAppMode } from "@/context/app/AppModeContext";
import { ROUTES } from "@/constants/constants";

export default function ClientLayout() {
  const { user } = useAuth();
  const { mode, updateModeSilent } = useAppMode();
  const segments = useSegments();

  const currentModeSegment = segments[1];

  useEffect(() => {
    if (currentModeSegment === "(in)" && mode !== "in") {
      updateModeSilent("in");
    } else if (currentModeSegment === "(out)" && mode !== "out") {
      updateModeSilent("out");
    }
  }, [currentModeSegment, mode, updateModeSilent]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const hasWorkplaces = user.workplaces && user.workplaces.length > 0;
  
  if (hasWorkplaces && !user.is_business) {
    return <Redirect href="/(staff)/(tabs)" />;
  }

  if (!currentModeSegment && mode !== null) {
    return <Redirect href={ROUTES.USER.DASHBOARD(mode)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(in)" />
      <Stack.Screen name="(out)" />

      <Stack.Screen name="profile/[user_id]" options={
        {animation: "slide_from_right"}
      }/>

      <Stack.Screen
        name="payment-result"
        options={{ animation: "slide_from_bottom" }}
      />

       <Stack.Screen
        name="qr-screen"
        options={{ animation: "simple_push" }}
      />
    </Stack>
  );
}
