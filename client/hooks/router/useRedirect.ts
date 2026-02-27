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

  const redirect = () => {
    if (user) {
      const isLocal = user.isBusiness;

      if (isLocal) {
        //router.replace(ROUTES.LOCAL.DASHBOARD);
        return;
      } else {
        return mode === "in"
          ? router.replace(ROUTES.USER.DASHBOARD_IN)
          : router.replace(ROUTES.USER.DASHBOARD_OUT);
      }
    }
    return router.replace(ROUTES.PUBLIC.HOME);
  };

  useEffect(() => {
    if (loading || mode === null || !segments) return;

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
          mode === "in" ? ROUTES.USER.DASHBOARD_IN : ROUTES.USER.DASHBOARD_OUT,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mode, loading]);

  return { redirect };
}
