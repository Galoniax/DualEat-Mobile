import { useCallback, useEffect } from "react";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuth } from "@/context/auth/AuthContext";
import { useRouter } from "expo-router";

import { ROUTES } from "@/constants/constants";
import { showToast } from "@/utils/toast";
import { useLoader } from "@/context/app/LoadingContext";
import { getDeviceId } from "@/utils/device";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const router = useRouter();

  const { setToken } = useAuth();
  const { setType } = useLoader();

  // --- A. PROCESAR DEEP LINK ---
  const handleDeepLink = useCallback(
    async (url: string) => {
      try {
        const { queryParams } = Linking.parse(url);

        // Usuario Existente
        if (queryParams?.token) {
          router.replace("/");
          await setToken(queryParams.token as string);
        }

        // Usuario Nuevo
        if (queryParams?.tempToken) {
          console.log("Usuario nuevo. Yendo a onboarding...");
          router.replace(
            `${ROUTES.AUTH.ONBOARDING}?tempToken=${queryParams.tempToken}`,
          );
          return true;
        }
      } catch (e) {
        console.log("Error procesando deep link:", e);
        return false;
      }
    },
    [router, setToken],
  );

  // --- B. LOGIN CON GOOGLE ---
  const handleGoogleLogin = useCallback(async () => {
    const deviceID = await getDeviceId();

    console.log("Iniciando login con Google. Device ID:", deviceID);

    try {
      setType("minimal");

      //const url = process.env.GOOGLE_CALLBACK_URL;
      const backendUrl = `https://honest-continuous-sponsored-singh.trycloudflare.com/api/auth/google?platform=mobile&deviceId=${deviceID}`;

      const redirectUrl = Linking.createURL("callback");

      const result = await WebBrowser.openAuthSessionAsync(
        backendUrl,
        redirectUrl,
      );

      // Procesar resultado directo
      if (result.type === "success" && result.url) {
        await handleDeepLink(result.url);
      } else if (result.type === "cancel") {
        showToast("info", "Inicio de sesión OAuth cancelado por el usuario", "Info");
      } else if (result.type === "dismiss") {
        showToast("info", "Inicio de sesión OAuth no completado", "Info");
      }
    } catch (e) {
      console.log("Error en login:", e);
    } finally {
      setType(null);
    }
  }, [setType, handleDeepLink]);

  // --- C. ESCUCHAR DEEP LINKS ---
  useEffect(() => {
    // Capturar URL inicial
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await handleDeepLink(url);
      }
    };

    getInitialURL();

    // Listener para URLs mientras la app está abierta
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { handleGoogleLogin };
};
