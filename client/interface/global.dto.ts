import { Unit } from "./global";
export interface preferencesDTO {
  filter: "distancia" | "descuento";
  categorias: number[];
  horario: boolean;
  bestSellers: boolean;
}

export const initial: preferencesDTO = {
  filter: "distancia",
  categorias: [],
  horario: false,
  bestSellers: false,
};

export interface UploadPayload {
  post_images?: UploadableFile[];
  recipe_main_image?: UploadableFile;
  recipe_step_images?: UploadableFile[];
  image_url?: UploadableFile;
  banner_url?: UploadableFile;
}

export interface CommunityDTO {
  name: string;
  description: string;
  image_url: UploadableFile | null;
  banner_url: UploadableFile | null;

  tags: number[];
}

export interface CommunityRequest {
  name: string;
  description: string;
  tags: number[];
  image_url: string;
  banner_url:
    | string
    | "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/community/icon_1761245783004_icon.jpeg";
}

export interface PostDTO {
  title: string;
  content: string;
  image_urls: string[] | UploadableFile[];
  community_id: string | null;
}

export interface RecipeDTO {
  name: string;
  description: string;
  total_time?: number;
  main_image: string | UploadableFile;

  ingredients: RecipeIngredientDTO[];
  steps: RecipeStepDTO[];
}

export interface RecipeStepDTO {
  step_number: number;
  description: string;
  estimated_time: number | null;
  image_url: string | UploadableFile;
}

export interface RecipeIngredientDTO {
  ingredient_id: string;
  name: string;
  quantity: string;
  unit: Unit;
  notes?: string;
}

export type UploadableFile = {
  uri: string;
  type: string;
  name: string;
};
