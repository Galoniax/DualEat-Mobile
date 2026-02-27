import { useAuth } from "@/context/auth/AuthContext";
import { QRData } from "@/interface/global";

export function useQRParser() {
  const { user } = useAuth();

  const parseQR = (qrValue: string) => {
    try {
      const parsedData = JSON.parse(qrValue) as QRData;

      const userWorkplaceIds = user?.workplaces.map((w) => w.id) || [];

      switch (parsedData.t) {
        // ==========================================
        // CASO 1: ORDEN (Restringido para usuarios regulares)
        // ==========================================
        case "order":
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

  return { parseQR };
}
