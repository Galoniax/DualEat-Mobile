export interface Response<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
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
  avatar_url: string | null; // URL de la imagen de perfil.
}