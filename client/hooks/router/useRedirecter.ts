import { ROUTES } from "@/constants/constants";

import { useAuth } from "@/context/auth/AuthContext";
import { useAppMode } from "@/context/app/AppModeContext";
import { useCallback } from "react";
import { useRouter } from "expo-router";

export function useRedirecter() {
  const router = useRouter();

  const { user } = useAuth();
  const { mode } = useAppMode();

  const redirect = useCallback(() => {
    if (user) {
      const isLocal = user.is_business;
      if (isLocal) {
        return;
      } else {
        return router.replace(ROUTES.USER.DASHBOARD(mode));
      }
    }
    return router.replace(ROUTES.PUBLIC.HOME);
  }, [user, mode, router]);

  return { redirect };
}
