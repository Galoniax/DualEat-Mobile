import { JSX } from "react/jsx-runtime";

export interface Response<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
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
  name: string;
  slug: string;
  email: string;
  role: string;
  provider: string;
  isBusiness: boolean;
  active: boolean;
  subscription_status: string;
  trial_ends_at: string;
  avatar_url: string | null;
}

export interface Local {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  average_rating: number;
  promotions: Promotion[];
  _count?: {
    reviews: number;
  };
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

export interface FoodCategory {
  id: number;
  name: string;
  tipo: string;
  icon_url: string | null;
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
}
