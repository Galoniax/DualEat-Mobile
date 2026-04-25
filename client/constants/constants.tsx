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
    DASHBOARD_IN: "/(client)/(in)/(home)/(tabs)",
    LOCAL: "/(client)/(out)/local",
    CART: "/(client)/(out)/cart",
    QR: "/(client)/(out)/(tabs)/qr",

    COMMUNITY: "/(client)/(in)/c/[community_slug]",
    POST: "/(client)/(in)/c/[community_slug]/p/[post_id]/[post_slug]",
    RECIPE: "/(client)/(in)/c/[community_slug]/r/[recipe_id]/[recipe_slug]",
    CREATE: "/(client)/(in)/(home)/(tabs)/create/index",
    CREATE_RECIPE: "/(client)/(in)/(home)/(tabs)/create/recipe",
    CREATE_COMMUNITY: "/(client)/(in)/create-community",
    
    CHAT_HISTORY: "/(client)/(in)/(home)/(tabs)/chat/history",
    CHAT: "/(client)/(in)/(home)/(tabs)/chat/[chat_id]",

    EXPLORE: "/(client)/(in)/(home)/(tabs)/index",
    EXPLORE_TAG: "/(client)/(in)/(tabs)/explore/[tag_id]",
    EXPLORE_CATEGORY: "/(client)/(in)/(tabs)/explore/[category_id]/[category_slug]",
  },

  SHARED: {
    ORDER_INFO: "/(shared)/order_info/[order_id]",
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
  CANCELED: "Cancelado",
};

export const STATUS_COLORS = {
  COMPLETED: "text-green-800",
  PAID: "text-[#3578e4]",
  READY: "text-purple-600",
  CANCELED: "text-[#B53325]",
  PENDING: "text-[#e5a657]",
};

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
