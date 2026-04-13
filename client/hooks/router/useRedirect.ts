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
        // Solo reemplaza si no estás ya en la sección local
        // router.replace(ROUTES.LOCAL.DASHBOARD);
      }
      return;
    }

    // --- ESCENARIO 3: CAMBIO DE MODO (El corazón del switchMode) ---

    // Si estamos en una ruta de auth o local pero somos usuario normal,
    // o si el segmento de modo no coincide con el estado actual:

    const needsRedirectIn =
      mode === "in" &&
      (inAuthGroup || inLocalGroup || currentModeSegment !== "(in)");
    const needsRedirectOut =
      mode === "out" &&
      (inAuthGroup || inLocalGroup || currentModeSegment !== "(out)");

    if (needsRedirectIn) {
      router.replace(ROUTES.USER.DASHBOARD_IN);
    } else if (needsRedirectOut) {
      router.replace(ROUTES.USER.DASHBOARD_OUT);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mode, loading, segments]);
}
