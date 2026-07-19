import { useCallback, useEffect } from "react";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuth } from "@/context/auth/AuthContext";
import { useRouter } from "expo-router";

import { ROUTES } from "@/constants/constants";
import { globalToast as toast } from "@/utils/toast";
import { useLoader } from "@/context/app/LoadingContext";
import { getDeviceId } from "@/utils/device";
import { BASE_URL } from "@/api/config";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const router = useRouter();

  const { setToken } = useAuth();
  const { setType } = useLoader();

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

  const handleGoogleLogin = useCallback(async () => {
    const deviceID = await getDeviceId();

    console.log("Iniciando login con Google. Device ID:", deviceID);

    try {
      setType("minimal");
      const url = `${BASE_URL}/auth/google?platform=mobile&deviceId=${deviceID}`;
      const redirect = Linking.createURL("callback");

      const result = await WebBrowser.openAuthSessionAsync(url, redirect);

      // Procesar resultado directo
      if (result.type === "success" && result.url) {
        await handleDeepLink(result.url);
      } else if (result.type === "cancel") {
        toast.info("OAuth", "Inicio de sesión OAuth cancelado por el usuario");
      } else if (result.type === "dismiss") {
        toast.info("OAuth", "Inicio de sesión OAuth no completado");
      }
    } catch (e) {
      console.log("Error en login:", e);
    } finally {
      setType(null);
    }
  }, [setType, handleDeepLink]);

  useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await handleDeepLink(url);
      }
    };

    getInitialURL();

    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { handleGoogleLogin };
};
