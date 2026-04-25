import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Ingredient } from "@/interface/global";
import { getAllIngredients } from "@/services/recipe.api";

const INGREDIENTS_CACHE_KEY = "@ingredients_data";

export const useIngredients = (open: boolean) => {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      try {
        const cached = await AsyncStorage.getItem(INGREDIENTS_CACHE_KEY);
        
        if (cached) {
          console.log("Usando ingredientes desde la caché");
          return JSON.parse(cached) as Ingredient[];
        }

        console.log("Descargando ingredientes desde la API");
        const response = await getAllIngredients();
        
        if (!response?.success || !response?.data) {
          throw new Error("Error obteniendo los ingredientes del servidor");
        }

        const array = response.data as Ingredient[];

        const sorted = array.sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        await AsyncStorage.setItem(
          INGREDIENTS_CACHE_KEY, 
          JSON.stringify(sorted)
        );

        return sorted as Ingredient[];

      } catch (e) {
        console.log("Error en useIngredients:", e);
        throw e;
      }
    },
    enabled: !!open,
    staleTime: Infinity, 
    gcTime: 1000 * 60 * 60, 
  });
};