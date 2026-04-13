import { useAuth } from "@/context/auth/AuthContext";
import { QRData } from "@/interface/global";

import LZString from "lz-string";

export function useQRParser() {
  const { user } = useAuth();

  const parseQR = (qrValue: string) => {
    try {
      // TODO:
      // qrValue: string
      //const decompressed = LZString.decompressFromEncodedURIComponent(qrValue);

      //const parsedData = JSON.parse(decompressed) as QRData;

      console.log("qrValue", qrValue);

      const parsedData = JSON.parse(qrValue) as QRData;

      const userWorkplaceIds = user?.workplaces.map((w) => w.id) || [];

      switch (parsedData.t) {
        // ==========================================
        // CASO 1: ORDEN (Restringido para usuarios regulares)
        // ==========================================
        case "order":
          console.log("ENTRO");
          if (!user?.isBusiness) {
            return {
              success: false,
              error:
                "Acceso denegado: Solo el personal del local puede escanear órdenes.",
            };
          }

          if (!userWorkplaceIds.includes(parsedData.l)) {
            return {
              success: false,
              error: "Esta orden pertenece a otro restaurante.",
            };
          }

          return {
            success: true,
            type: "order",
            data: parsedData,
          };

        // ==========================================
        // CASO 2: USUARIO
        // ==========================================
        case "user":
          return {
            success: true,
            type: "user",
            data: parsedData,
          };

        // ==========================================
        // CASO 3: LOCAL
        // ==========================================
        case "local":
          return {
            success: true,
            type: "local",
            data: parsedData,
          };

        // ==========================================
        // DEFAULT
        // ==========================================
        default:
          return {
            success: false,
            error: "Tipo de código QR no reconocido.",
          };
      }
    } catch (e) {
      console.log("Error al parsear el QR: ", e);
      return {
        success: false,
        error: "Código QR inválido o no pertenece a DualEat.",
      };
    }
  };

  const generateQR = (data: QRData) => {
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(data),
    );
    return compressed;
  };

  return { parseQR, generateQR };
}
