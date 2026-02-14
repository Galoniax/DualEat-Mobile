export interface preferencesDTO {
    filter: "distancia" | "descuento";
    categorias: string[];
    horario: boolean;
    bestSellers: boolean;
}