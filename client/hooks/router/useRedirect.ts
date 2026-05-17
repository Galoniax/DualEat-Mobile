import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

import { ROUTES } from "@/constants/constants";

import { useAuth } from "@/context/auth/AuthContext";
import { useLoader } from "@/context/app/LoadingContext";
import { useAppMode } from "@/context/app/AppModeContext";

export function useRedirect() {
  const segments = useSegments();
  const router = useRouter();

  const { user } = useAuth();
  const { loading } = useLoader();
  const { mode } = useAppMode();

  useEffect(() => {
    if (loading || mode === null || !segments) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "(auth)";
    const inLocalGroup = rootSegment === "(local)";
    const inStaffGroup = rootSegment === "(staff)";
    const currentModeSegment = segments[1];

    // --- ESCENARIO 1: NO LOGUEADO ---
    if (!user) {
      if (!inAuthGroup) {
        router.replace(ROUTES.PUBLIC.HOME);
      }
      return;
    }

    // --- ESCENARIO 2: USUARIO BUSINESS ---
    if (user.isBusiness) {
      if (!inLocalGroup) {
        // router.replace(ROUTES.LOCAL.DASHBOARD);
      }
      return;
    }

    // --- ESCENARIO 3: USUARIO STAFF / ADMIN LOCAL ---
    // Si el usuario tiene lugares de trabajo, es parte del staff o admin de un local.
    const hasWorkplaces = (user.workplaces && user.workplaces.length > 0) || (user.role as string) === 'staff';

    if (hasWorkplaces && !user.isBusiness) {
      console.log("Redirecting to Staff Dashboard (hasWorkplaces)");
      if (!inStaffGroup) {
        router.replace(ROUTES.STAFF.DASHBOARD as any);
      }
      return;
    }


    const needsRedirectIn =
      mode === "in" &&
      (inAuthGroup || inLocalGroup || inStaffGroup || currentModeSegment !== "(in)");
    const needsRedirectOut =
      mode === "out" &&
      (inAuthGroup || inLocalGroup || inStaffGroup || currentModeSegment !== "(out)");

    if (needsRedirectIn) {
      router.replace(ROUTES.USER.DASHBOARD_IN as any);
    } else if (needsRedirectOut) {
      router.replace(ROUTES.USER.DASHBOARD_OUT as any);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mode, loading, segments]);
}
