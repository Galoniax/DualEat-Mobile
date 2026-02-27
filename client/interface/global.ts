import { JSX } from "react/jsx-runtime";

type Role = "user" | "admin";

type SuscriptionStatus = "active" | "inactive" | "trial" | "canceled";

export interface Response<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ResponseWithPagination<T = unknown> {
  success: boolean;
  pagination: PaginationInfo;
  data?: T;
}

interface PaginationInfo {
  page: number;
  hasMore: boolean;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  next_step?: string;
}

export interface User {
  id: string;
  slug: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role;
  active: boolean;
  verified: boolean;
  provider: string;
  isBusiness: boolean;
  suscription_status: SuscriptionStatus;
  trial_ends_at: Date | null;
  workplaces: Workplace[];
}

export interface Workplace {
  id: string;
  name: string;
  slug: string;
  role: "admin" | "staff";
}

export interface Local {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  type_local: string; // Hacer type
  address: string;
  image_url: string;
  latitude: number;
  longitude: number;
  average_rating: number;

  promotions?: Promotion[];
  schedules?: Schedules[];
  categories?: FoodCategory[];
}

export interface LocalReview {
  id: string;
  user: User;
  user_id: string;
  local: Local;
  local_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;

  order?: Order;
  order_id?: string;
}

export interface Food {
  id: string;
  local_id: string;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  available: boolean;
  votes_up: number;
  votes_down: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Promotion {
  id: string;
  description: string | null;
  discount_pct: number | null;
  local_id: string;
  food_id: string | null;
  title: string;
  starts_at: Date | null;
  ends_at: Date | null;
  active: boolean;
}

export interface Order {
  id: string;
  user: User;
  user_id: string;
  local: Local;
  local_id: string;
  total: number;
  status: "pending" | "paid" | "completed" | "canceled";
  payment_method?: string;
  created_at: Date;
  updated_at: Date;

  short_code?: string;
  delivery_date?: Date;

  order_items: OrderItem[];
  review?: LocalReview;
}

export interface OrderItem {
  id: string;
  order: Order;
  order_id: string;
  food: Food;
  food_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Schedules {
  id: string;
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  local_id: string;
}

export interface FoodCategory {
  id: number;
  name: string;
  tipo: string;
  icon_url: string | null;

  foods?: Food[];
}

export interface CommunityTag {
  id: number;
  name: string;
  icon_url: string | null;
  category?: {
    id: number;
    name: string;
    category_id: number | null;
    active: boolean;
  };
}

// ================================================
// INTERFAZ PARA ITEMS DE NAVEGACIÓN EN TABS
// ================================================
export interface DataItem {
  name: string;
  title: string;
  icons: {
    default: (color: string, size: number) => JSX.Element;
    focused?: (color: string, size: number) => JSX.Element;
  };
  isLg?: boolean;
  isTab?: boolean;
  redirect?: string;
}
export type DayOfWeek =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export type QRTypes = {
  LOCAL: "local";
  ORDER: "order";
  PROMOTION: "promotion";
  USER: "user";
};

export type QROrderItem = {
  id: string; // food_id
  q: number; // quantity
};

export type QROrderPayload = {
  t: "order";
  l: string; // local_id
  u: string; // user_id
  i: QROrderItem[]; // items del carrito
  c?: string; // Código de acceso
};

export type QRUserPayload = {
  t: "user";
  s: string; // slug
};

export type QRLocalPayload = {
  t: "local";
  s: string; // Slug
};

export type QRData = QROrderPayload | QRUserPayload | QRLocalPayload;
