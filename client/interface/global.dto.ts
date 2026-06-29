import { Community, Ingredient, Unit } from "./global";
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

export interface ReviewDTO {
  order_id: string;
  rating: number;
  comment?: string;
  votes?: {
    id: string;
    type: "UP" | "DOWN";
  }[];
}

export interface PostCommentDTO {
  post_id: string;
  parent_comment_id: string | null;
  reply_to_user_id: string | null;
  content: string;
}

export interface UploadPayload {
  post_images?: UploadableFile[];
  main_image?: UploadableFile;
  image_url?: UploadableFile;
  banner_url?: UploadableFile;
}

export interface CommunityDTO {
  name: string;
  description: string;
  image_url: UploadableFile | string;
  banner_url: UploadableFile | string;

  tags: string[];
}

export interface PostDTO {
  id?: string;
  title: string;
  content: string;
  image_urls: string[] | UploadableFile[];
  community: Community | null;
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
}

export interface RecipeIngredientDTO {
 ingredient: Ingredient | null;
  quantity: string;
  unit: Unit;
  notes?: string;
}

export type UploadableFile = {
  uri: string;
  type: string;
  name: string;
};
