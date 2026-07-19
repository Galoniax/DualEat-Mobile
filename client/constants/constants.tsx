import { AppMode } from "@/context/app/AppModeContext";
import { Href } from "expo-router";

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
  STAFF: {
    DASHBOARD: "/(staff)",
    LOCAL: "/(staff)/local/[local_id]",
  },
  USER: {
    // RUTAS DINÁMICAS
    DASHBOARD: (mode: AppMode) => `/(client)/(${mode})/(home)/(tabs)` as Href,
    NOTIFICATIONS: (mode: AppMode) =>
      `/(client)/(${mode})/(home)/(tabs)/notifications` as Href,
    PROFILE: (user_id: string) => `/(client)/profile/${user_id}` as Href,

    CREATE_REVIEW: (order_id: string) =>
      `/(client)/(out)/review/${order_id}` as Href,

    PAYMENT: "/(client)/payment-result",

    // OUT
    MAPS: "/(client)/(out)/(home)/(tabs)/maps",
    LOCAL: "/(client)/(out)/local/[local_id]",
    CART: "/(client)/(out)/cart",
    QR: "/(client)/(out)/(home)/(tabs)/qr",
    ORDERS: "/(client)/(out)/(home)/(tabs)/orders",
    ORDER_INFO: "/(client)/(out)/order_info/[order_id]",

    // IN
    COMMUNITY: "/(client)/(in)/c/[community_slug]",
    POST: "/(client)/(in)/p/[post_id]/[post_slug]",
    RECIPE: "/(client)/(in)/r/[recipe_id]/[recipe_slug]",
    CREATE: "/(client)/(in)/(home)/(tabs)/create" as Href,
    CREATE_RECIPE: "/(client)/(in)/(home)/(tabs)/create/recipe" as Href,
    CREATE_COMMUNITY: "/(client)/(in)/create-community",

    CHAT_HISTORY: "/(client)/(in)/(home)/(tabs)/chat/history",
    CHAT: "/(client)/(in)/(home)/(tabs)/chat/[chat_id]",

    QR_SCREEN: "/(client)/qr-screen",

    EXPLORE: "/(client)/(in)/(home)/(tabs)/explore/",
    EXPLORE_SEARCH: "/(client)/(in)/(home)/(tabs)/explore/search",
    COMMUNITY_SEARCH: "/(client)/(in)/c/[community_slug]/search",

    EXPLORE_TAG: "/(client)/(in)/(tabs)/explore/[tag_id]",
    EXPLORE_CATEGORY:
      "/(client)/(in)/(tabs)/explore/[category_id]/[category_slug]",
  },

  SHARED: {
    SUBSCRIPTION: "/(shared)/subscription",
    CONFIGURATION: "/(shared)/configuration",
  },
} as const;

// 2. TIPOS Y CONSTANTES
// =========================================================
export const LOCAL_TYPES = [
  "Hamburguesería",
  "Comida rápida",
  "Pizzería",
  "Restaurante italiano",
  "Vegano",
  "Sushi",
  "Restaurante",
  "Cafetería",
  "Heladería",
  "Parrilla",
  "Bar",
];

export const ORDER_STATUS_DICT: Record<string, string> = {
  PENDING: "Pendiente",
  READY: "Listo para pagar",
  PAID: "Pagado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#166534",
  PAID: "#3578e4",
  READY: "#7c3aed",
  CANCELLED: "#B53325",
  PENDING: "#e5a657",
};

export type LocalType = (typeof LOCAL_TYPES)[number];

export const QR_TYPES = ["order", "menu", "user"];

// 3. MAPAS
// =========================================================
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
    featureType: "transit.station",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "transit.station.bus",
    elementType: "all",
    stylers: [{ visibility: "on" }],
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
