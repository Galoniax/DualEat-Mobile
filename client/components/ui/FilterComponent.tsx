import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// 1. Definimos los tipos de vista disponibles
export type FilterViewMode = 'all' | 'sort' | 'rating' | 'hours' | 'discount';

interface FilterState {
  sortBy: "distance" | "discount";
  minRating: (2 | 3 | 4 | 5) | null;
  openNow: boolean;
  minDiscount: (20 | 30 | 40 | 50) | null;
  categories: string[];
  priceRange?: string;
  newPlates: boolean;
}

export const initialFilters: FilterState = {
  sortBy: "distance",
  minRating: null,
  openNow: false,
  minDiscount: null,
  categories: [],
  newPlates: false,
};

interface FilterComponentProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode?: FilterViewMode;
}

export default function FilterComponent({
  filters,
  setFilters,
  viewMode = 'all',
}: FilterComponentProps) {

  // 3. Helper para saber si mostrar una sección
  const shouldShow = (section: FilterViewMode) => viewMode === 'all' || viewMode === section;

  const handleRatingPress = (rating: 2 | 3 | 4 | 5 | null) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
      
      {/* SECCIÓN: ORDENAR (Recuperada y estilizada) */}
      {shouldShow('sort') && (
        <View className="mb-6">
          <Text className="font-bold mb-3 text-md">Ordenar por</Text>
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={() => setFilters(prev => ({ ...prev, sortBy: 'distance' }))}
              className={`${filters.sortBy === 'distance' ? "bg-[#B53325] border-[#B53325]" : "bg-gray-100 border-gray-200"} flex-1 rounded-l-full border items-center justify-center py-2.5`}
            >
              <Text className={filters.sortBy === 'distance' ? "text-white font-bold" : "text-gray-700"}>Distancia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilters(prev => ({ ...prev, sortBy: 'discount' }))}
              className={`${filters.sortBy === 'discount' ? "bg-[#B53325] border-[#B53325]" : "bg-gray-100 border-gray-200"} flex-1 rounded-r-full border border-l-0 items-center justify-center py-2.5`}
            >
              <Text className={filters.sortBy === 'discount' ? "text-white font-bold" : "text-gray-700"}>Mayor Descuento</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SECCIÓN: CALIFICACIÓN */}
      {shouldShow('rating') && (
        <View className="mb-6">
          <Text className="font-bold mb-3 text-md">Calificación</Text>

          <View className="flex-row flex-wrap">
            <TouchableOpacity
              onPress={() => handleRatingPress(null)}
              className={`px-4 py-2.5 flex-1 justify-center items-center rounded-l-full border ${
                filters.minRating === null
                  ? "bg-[#B53325] border-[#B53325]"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Text className={`${filters.minRating === null ? "text-white font-bold" : "text-gray-700"}`}>
                Todos
              </Text>
            </TouchableOpacity>

            {[2, 3, 4, 5].map((rating, index, array) => {
              const isSelected = filters.minRating === rating;
              const isLast = index === array.length - 1;

              return (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleRatingPress(rating as 2 | 3 | 4 | 5)}
                  className={`px-4 py-2.5 flex-1 justify-center flex-row items-center border border-dashed ${
                    isSelected
                      ? "bg-[#B53325] border-[#B53325]"
                      : "bg-gray-100 border-gray-200"
                  } ${isLast ? "rounded-r-full border-dashed" : "border-l-0"}`}
                >
                  <Text className={isSelected ? "text-white font-bold" : "text-gray-700"}>
                    +{rating}
                  </Text>
                  <Ionicons
                    name="star"
                    size={14}
                    color={isSelected ? "white" : "#B53325"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* SECCIÓN: HORARIO */}
      {shouldShow('hours') && (
        <View className="mb-6">
          <Text className="font-bold mb-3 text-md">Horario</Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={() => setFilters(prev => ({ ...prev, openNow: false }))}
              className={`${filters.openNow === false ? "bg-[#B53325] border-[#B53325]" : "bg-gray-100 border-dashed border-[#B53325]"} flex-1 rounded-l-full border items-center justify-center py-2.5`}
            >
              <Text className={filters.openNow === false ? "text-white font-bold" : "text-gray-700"}>Todos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilters(prev => ({ ...prev, openNow: true }))}
              className={`${filters.openNow === true ? "bg-[#B53325] border-[#B53325]" : "bg-gray-100 border-dashed border-[#B53325]"} flex-1 rounded-r-full border border-l-0 border-gray-200 items-center justify-center py-2.5`}
            >
              <Text className={filters.openNow === true ? "text-white font-bold" : "text-gray-700 text-center"}>Abiertos ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SECCIÓN: DESCUENTOS */}
      {shouldShow('discount') && (
        <View className="mb-6">
          <Text className="font-bold mb-3 text-md">Descuentos</Text>

          <View className="flex-row flex-wrap">
            <TouchableOpacity
              onPress={() => setFilters((prev) => ({ ...prev, minDiscount: null }))}
              className={`px-4 py-2.5 flex-[1] rounded-l-full items-center justify-center border-dashed border ${
                filters.minDiscount === null
                  ? "bg-[#B53325] border-[#B53325]"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Text className={`${filters.minDiscount === null ? "text-white font-bold" : "text-gray-700"}`}>
                Todos
              </Text>
            </TouchableOpacity>

            {[20, 30, 40, 50].map((discount, index, array) => {
              const isSelected = filters.minDiscount === discount;
              const isLast = index === array.length - 1;

              return (
                <TouchableOpacity
                  key={discount}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      minDiscount: discount as 20 | 30 | 40 | 50,
                    }))
                  }
                  className={`px-4 py-2.5 flex-row items-center gap-1 border border-dashed border-l-0 flex-[1] justify-center ${
                    isSelected
                      ? "bg-[#B53325] border-[#B53325]"
                      : "bg-gray-100 border-gray-200"
                  } ${isLast ? "rounded-r-full border-dashed" : ""}`}
                >
                  <Text className={isSelected ? "text-white font-bold" : "text-gray-700"}>
                    +{discount}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}