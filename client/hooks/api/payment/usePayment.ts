import { prePurchase, purchase } from "@/services/order.api";
import { useMutation } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";

export const handleCheckoutUrl = async (data: any) => {
  if (data.success && data.data?.checkoutUrl) {
    const url = data.data.checkoutUrl;

    // Extraer el pref_id de la url (ej: pref_id=3468655592-5596e5bd-...)
    const match = url.match(/pref_id=([^&]+)/);
    const prefId = match ? match[1] : null;

    const isSandbox = url.includes("sandbox.mercadopago");
    let openedNatively = false;

    console.log("URL", url);
    console.log("PREF ID", prefId);
    console.log("IS SANDBOX", isSandbox);

    if (!isSandbox && prefId) {
      const deeplinkMP =
        Platform.OS === "ios"
          ? `mpago://hp/card/checkout?pref_id=${prefId}`
          : `mercadopago://checkout?pref_id=${prefId}`;

      console.log("DEEP LINK MP", deeplinkMP);
      try {
        await Linking.openURL(deeplinkMP);
        openedNatively = true;
      } catch (error) {
        console.log(
          "App de Mercado Pago no instalada o falló al abrir nativamente:",
          error,
        );
      }
    }

    if (!openedNatively) {
      try {
        // openAuthSessionAsync se cerrará automáticamente cuando redireccione a "dualeat://"
        await WebBrowser.openAuthSessionAsync(url, "dualeat://", {
          preferEphemeralSession: true,
        });
      } catch (e: any) {
        console.log("Error abriendo el navegador integrado:", e);
        await WebBrowser.openBrowserAsync(url);
      }
    }
  }
};

// 1. Hook para prePurchase
//==============================================
export const usePrePurchase = () => {
  return useMutation({
    mutationFn: ({
      local_id,
      items,
    }: {
      local_id: string;
      items: { food_id: string; quantity: number }[];
    }) => {
      return prePurchase(local_id, items);
    },
    onSuccess: (data) => handleCheckoutUrl(data),
  });
};

// 2. Hook para purchase
//==============================================
export const usePurchase = () => {
  return useMutation({
    mutationFn: async ({ order_id }: { order_id: string }) => {
      return await purchase(order_id);
    },
    onSuccess: (data) => {
      handleCheckoutUrl(data);
    },
  });
};
