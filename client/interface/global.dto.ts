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

export interface PostCommentDTO {
  post_id: string;
  parent_comment_id?: string | null;
  reply_to_user_id?: string | null;
  content: string;
}

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
  image_url: UploadableFile | string;
  banner_url: UploadableFile | string;

  tags: number[];
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
  main_image: UploadableFile | string;

  ingredients: RecipeIngredientDTO[];
  steps: RecipeStepDTO[];
}

export interface RecipeStepDTO {
  step_number: number;
  description: string;
  estimated_time: number | null;
  image_url: UploadableFile | string;
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
