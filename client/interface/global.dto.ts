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