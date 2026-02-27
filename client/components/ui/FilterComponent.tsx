import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  BottomSheetScrollView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";

import { getFoodCategories } from "@/services/category.api";
import { FoodCategory } from "@/interface/global";
import { preferencesDTO } from "@/interface/global.dto";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated from "react-native-reanimated";

export const initialFilters: preferencesDTO = {
  filter: "distancia",
  categorias: [],
  horario: false,
  bestSellers: false,
};

export type FilterViewMode =
  | "all"
  | "filter"
  | "categorias"
  | "horario"
  | "bestSellers";

interface FilterComponentProps {
  filters: preferencesDTO;
  setPending: React.Dispatch<React.SetStateAction<preferencesDTO>>;
  viewMode?: FilterViewMode;
}

export default function FilterComponent({
  filters,
  setPending,
  viewMode = "all",
}: FilterComponentProps) {
  // --- CATEGORIAS ---
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

   const [open, setOpen] = useState(false);

  // Cargamos las categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getFoodCategories();
      if (response) {
        setCategories(response.data as FoodCategory[]);
      }
    };
    fetchCategories().then(() => setLoading(false));
  }, []);

 

  // --- SECCIONES ---
  const Sections = {
    filter: (
      <View className="mb-6">
        <Text className="font-dosis-bold mb-3 text-lg">Ordenar por</Text>
        <View className="flex-row gap-3">
          {["distancia", "descuento"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setPending((prev) => ({ ...prev, filter: type as any }));
              }}
              className={`flex-1 py-3 mt-2 items-center border border-[#dbdbdb] rounded-full ${
                filters.filter === type ? "bg-bg-semi-black" : "bg-bg-gray"
              }`}
            >
              <Text
                className={
                  filters.filter === type
                    ? "text-white font-dosis-bold"
                    : "text-gray-700 font-dosis-medium"
                }
              >
                {type === "distancia" ? "Distancia" : "Mayor Descuento"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),

    categorias: (
      <View className="mb-6">
        <Text className="font-dosis-bold mb-3 text-lg">Categorías</Text>

        {categories.length === 0 ? (
          <Text className="text-gray-500 text-center mt-4">
            No se pudieron cargar las categorías.
          </Text>
        ) : loading ? (
          <ActivityIndicator size={28} color="#3578e4" className="my-4" />
        ) : (
          <>
            <BottomSheetFlatList
              data={open ? categories : categories.slice(0, 15)}
              keyExtractor={(item: FoodCategory) => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }: { item: FoodCategory }) => (
                <TouchableOpacity
                  className={`flex-1 py-2 h-[50px] m-1 items-center justify-center border rounded-md ${
                    filters.categorias.includes(item.id)
                      ? "bg-bg-semi-black border-transparent"
                      : "bg-bg-gray border-gray-300"
                  }`}
                  onPress={() => {
                    setPending((prev) => {
                      const isSelected = prev.categorias.includes(
                        item.id,
                      );
                      return {
                        ...prev,
                        categorias: isSelected
                          ? prev.categorias.filter(
                              (id) => id !== item.id,
                            )
                          : [...prev.categorias, item.id],
                      };
                    });
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={
                      filters.categorias.includes(item.id)
                        ? "text-white font-dosis-bold text-center px-1"
                        : "text-gray-700 font-dosis-medium text-center px-1"
                    }
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setOpen((prev) => !prev)}
              className="mb-8 mt-3 flex-row justify-center bg-bg-gray py-4 rounded-full"
            >
              <View className="flex-row items-center gap-2">
                <Text className="font-dosis-bold text-md">
                  {open ? "Ver menos categorías" : "Ver más categorías"}
                </Text>

                <Animated.View
                  style={{
                    transform: [{ rotate: open ? "180deg" : "0deg" }],
                    transitionDuration: "200ms",
                  }}
                >
                  <Ionicons name={"chevron-down"} size={18} color="black" />
                </Animated.View>
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    ),

    horario: (
      <View className="mb-6">
        <Text className="font-dosis-bold mb-3 text-lg">Horario</Text>
        <View className="flex-row gap-3">
          {[false, true].map((val) => (
            <TouchableOpacity
              key={String(val)}
              onPress={() => setPending((prev) => ({ ...prev, horario: val }))}
              className={`flex-1 py-3 items-center border rounded-full ${
                filters.horario === val
                  ? "bg-bg-semi-black border-transparent"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Text
                className={
                  filters.horario === val
                    ? "text-white font-dosis-bold"
                    : "text-gray-700 font-dosis-medium"
                }
              >
                {val ? "Abiertos ahora" : "Todos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),

    mejor: (
      <View className="mb-6">
        <Text className="font-dosis-bold mb-3 text-lg">Mejor Calificados</Text>
        <View className="flex-row gap-3">
          {[false, true].map((val) => (
            <TouchableOpacity
              key={String(val)}
              onPress={() => setPending((prev) => ({ ...prev, bestSellers: val }))}
              className={`flex-1 py-3 items-center border rounded-full ${
                filters.bestSellers === val
                  ? "bg-bg-semi-black border-transparent"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Text
                className={
                  filters.bestSellers === val
                    ? "text-white font-dosis-bold"
                    : "text-gray-700 font-dosis-medium"
                }
              >
                {val ? "Mejores locales" : "Todos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),
  };

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 40 }}
      className="p-4"
    >
      {viewMode === "all" ? (
        <>
          {Sections.horario}
          <View className="border-t border-dashed my-2 mb-4" />
          {Sections.filter}

          <View className="border-t border-dashed my-2 mb-4" />
          {Sections.categorias}
          <View className="border-t border-dashed my-2 mb-4" />
          {Sections.mejor}
        </>
      ) : (
        Sections[viewMode as keyof typeof Sections]
      )}
    </BottomSheetScrollView>
  );
}
