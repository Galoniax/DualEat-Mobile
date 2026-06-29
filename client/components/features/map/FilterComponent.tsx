import { FoodCategory } from "@/interface/global";
import { preferencesDTO, initial } from "@/interface/global.dto";
import { getFoodCategories } from "@/services/category.api";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface FilterModalRef {
  open: () => void;
  close: () => void;
}

interface FilterComponentProps {
  filters: preferencesDTO; // Filtros actuales
  onApply: (filters: preferencesDTO) => void;
  onCancel: () => void;
}

const FilterComponent = forwardRef<FilterModalRef, FilterComponentProps>(
  ({ filters, onApply, onCancel }, ref) => {
    const snapPoints = useMemo(() => ["85%"], []);
    const insets = useSafeAreaInsets();

    const [open, setOpen] = useState(false);

    const [localFilters, setLocalFilters] = useState<preferencesDTO>(filters);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setLocalFilters(filters);
        bottomSheetModalRef.current?.present();
      },
      close: () => {
        bottomSheetModalRef.current?.dismiss();
      },
    }));

    useFocusEffect(
      useCallback(() => {
        return () => {
          bottomSheetModalRef.current?.dismiss();
        };
      }, []),
    );

    useEffect(() => {
      setLocalFilters(filters);
    }, [filters]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior={"close"}
        />
      ),
      [],
    );

    const { data: categories = [], isLoading } = useQuery({
      queryKey: ["categories", "food"],
      queryFn: async () => {
        const response = await getFoodCategories();
        return (response?.data as FoodCategory[]) || [];
      },
      staleTime: 1000 * 60 * 30, // 30 minutos
    });

    // --- SECCIONES ---
    const Sections = {
      filter: (
        <View className="mb-6">
          <Text className="font-outfit-bold mb-3 text-lg">Ordenar por</Text>
          <View className="flex-row gap-3">
            {["distancia", "descuento"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setLocalFilters((prev) => ({ ...prev, filter: type as any }));
                }}
                className={`flex-1 py-3 mt-2 items-center border border-[#dbdbdb] rounded-full ${
                  localFilters.filter === type
                    ? "bg-bg-semi-black"
                    : "bg-bg-gray"
                }`}
              >
                <Text
                  className={
                    localFilters.filter === type
                      ? "text-white font-outfit-bold"
                      : "text-gray-700 font-outfit-regular"
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
          <Text className="font-outfit-bold mb-3 text-lg">Categorías</Text>

          {categories.length === 0 ? (
            <Text className="text-gray-500 text-center mt-4">
              No se pudieron cargar las categorías.
            </Text>
          ) : isLoading ? (
            <ActivityIndicator size={28} color="#3578e4" className="my-4" />
          ) : (
            <>
              <BottomSheetFlatList
                data={open ? categories : categories.slice(0, 15)}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }: { item: FoodCategory }) => (
                  <TouchableOpacity
                    className={`flex-1 py-2 h-[50px] m-1 items-center justify-center border rounded-md ${
                      localFilters.categorias.includes(item.id)
                        ? "bg-bg-semi-black border-transparent"
                        : "bg-bg-gray border-gray-300"
                    }`}
                    onPress={() => {
                      setLocalFilters((prev) => {
                        const isSelected = prev.categorias.includes(item.id);
                        return {
                          ...prev,
                          categorias: isSelected
                            ? prev.categorias.filter((id) => id !== item.id)
                            : [...prev.categorias, item.id],
                        };
                      });
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className={
                        localFilters.categorias.includes(item.id)
                          ? "text-white font-outfit-bold text-center px-1"
                          : "text-gray-700 font-outfit-regular text-center px-1"
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
                  <Text className="font-outfit-bold text-md">
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
          <Text className="font-outfit-bold mb-3 text-lg">Horario</Text>
          <View className="flex-row gap-3">
            {[false, true].map((val) => (
              <TouchableOpacity
                key={String(val)}
                onPress={() =>
                  setLocalFilters((prev) => ({ ...prev, horario: val }))
                }
                className={`flex-1 py-3 items-center border rounded-full ${
                  localFilters.horario === val
                    ? "bg-bg-semi-black border-transparent"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <Text
                  className={
                    localFilters.horario === val
                      ? "text-white font-outfit-bold"
                      : "text-gray-700 font-outfit-regular"
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
          <Text className="font-outfit-bold mb-3 text-lg">
            Mejor Calificados
          </Text>
          <View className="flex-row gap-3">
            {[false, true].map((val) => (
              <TouchableOpacity
                key={String(val)}
                onPress={() =>
                  setLocalFilters((prev) => ({ ...prev, bestSellers: val }))
                }
                className={`flex-1 py-3 items-center border rounded-full ${
                  localFilters.bestSellers === val
                    ? "bg-bg-semi-black border-transparent"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <Text
                  className={
                    localFilters.bestSellers === val
                      ? "text-white font-outfit-bold"
                      : "text-gray-700 font-outfit-regular"
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
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        enableOverDrag={false}
      >
        <View style={{ flex: 1 }}>
          <View className="flex-row relative justify-center items-center pb-5 gap-4 border-b border-dashed border-gray-200">
            <TouchableOpacity
              className="absolute left-4 top-0 z-10"
              onPress={() => onCancel()}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-[18px] font-outfit-bold text-text-3">
              Filtros
            </Text>
          </View>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 40 }}
            className="p-4"
          >
            {Sections.horario}
            <View className="border-t border-dashed my-2 mb-4" />
            {Sections.filter}

            <View className="border-t border-dashed my-2 mb-4" />
            {Sections.categorias}
            <View className="border-t border-dashed my-2 mb-4" />
            {Sections.mejor}
          </BottomSheetScrollView>

          {/* --- Botones inferiores fijos --- */}
          <View
            style={{ paddingBottom: insets.bottom + 16 }}
            className="flex-row gap-4 p-4 border-t border-gray-200 bg-white"
          >
            <TouchableOpacity
              className="flex-1 py-3 rounded-full border border-gray-300 items-center justify-center"
              onPress={() => {
                setLocalFilters(initial);
                onCancel();
              }}
            >
              <Text className="font-outfit-bold text-gray-700">Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-full bg-bg-red items-center justify-center shadow-sm"
              onPress={() => {
                onApply(localFilters);
                onCancel();
              }}
            >
              <Text className="text-white font-outfit-bold text-base">
                Aplicar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);

FilterComponent.displayName = "FilterComponent";

export default FilterComponent;
