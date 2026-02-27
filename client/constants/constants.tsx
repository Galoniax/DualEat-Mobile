// =========================================================
// 1. RUTAS
// =========================================================
export const ROUTES = {
  PUBLIC: {
    HOME: "/(auth)/welcome",
  },
  AUTH: {
    LOGIN: "/(auth)/login",
    REGISTER: "/(auth)/register",
    ONBOARDING: "/(auth)/onboarding",
    RESET_PASSWORD: "/(auth)/password_recovery",
  },
  USER: {
    DASHBOARD_OUT: "/(client)/(out)/(tabs)",
    DASHBOARD_IN: "/(client)/(in)",
    LOCAL: "/(client)/(out)/local",
    CART: "/(client)/(out)/cart",
    QR: "/(client)/(out)/(tabs)/qr",
  },
} as const;

// =========================================================
// 2. TIPOS Y CONSTANTES
// =========================================================
export const LOCAL_TYPES = [
  "Hamburguesería",
  "Comida rápida",
  "Pizzería",
  "Restaurante italiano",
  "Vegano",
  "Sushi bar",
  "Restaurante",
  "Cafetería",
  "Heladería",
  "Parrilla",
  "Bar",
];

export type LocalType = (typeof LOCAL_TYPES)[number];

export const QR_TYPES = ["order", "menu", "user"];

// =========================================================
// 3. MAPAS
// =========================================================

// JSON DE GOOGLE MAPS
export const mapStyle = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ weight: "1.00" }],
  },
  {
    featureType: "all",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e0e0e0" }],
  },
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#eeeeee" }],
  },

  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#BBBBBB" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#c8d7d4" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f4f4f" }],
  },
];
