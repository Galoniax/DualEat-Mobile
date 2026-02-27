export interface preferencesDTO {
    filter: "distancia" | "descuento";
    categorias: number[];
    horario: boolean;
    bestSellers: boolean;
}