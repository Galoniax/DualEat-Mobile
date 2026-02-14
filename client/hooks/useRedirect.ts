import { useEffect } from "react";
import { router, useSegments } from "expo-router";

import { ROUTES } from "@/constants/constants";

import { useAuth } from "@/context/auth/AuthContext";
import { useAppMode } from "@/context/app/AppModeContext";
import { useLoader } from "@/context/app/LoadingContext";

export function useRedirect() {
  const segments = useSegments();

  const { mode } = useAppMode();
  const { user } = useAuth();
  const { loading } = useLoader();

  useEffect(() => {
    if (loading || mode === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inLocalGroup = segments[0] === "(local)";

    if (user) {
      const isLocal = user.isBusiness;

      if (isLocal) {
        if (!inLocalGroup) {
          //router.replace(ROUTES.LOCAL.DASHBOARD);
        }
        return;
      }

      if (inAuthGroup || inLocalGroup) {
        router.replace(
          mode === "in"
            ? ROUTES.USER.DASHBOARD_IN
            : ROUTES.USER.DASHBOARD_OUT
        );
        return;
      }

      const currentModeSegment = segments[1];

      if (mode === "in" && currentModeSegment !== "(in)") {
        router.replace(ROUTES.USER.DASHBOARD_IN);
      }

      if (mode === "out" && currentModeSegment !== "(out)") {
        router.replace(ROUTES.USER.DASHBOARD_OUT);
      }

      return;
    }

    if (!inAuthGroup) {
      router.replace(ROUTES.PUBLIC.HOME);
    }

  }, [user, mode, segments, loading]);
}
