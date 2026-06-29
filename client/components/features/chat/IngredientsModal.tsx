import { Ingredient } from "@/interface/global";
import { capitalize } from "@/utils/normalize";
import {
  BottomSheetFlashList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

import { memo, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IngredientsModalProps {
  ingredients: Ingredient[];
  isLoading: boolean;
  onSelectIngredient: (ingredient: Ingredient) => void;
  ingredientsIDs?: Ingredient[];
}

const IngredientItem = memo(
  ({
    item,
    isSelected,
    onSelect,
  }: {
    item: Ingredient;
    isSelected: boolean;
    onSelect: (ingredient: Ingredient) => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(item)}
        style={{
          height: 45,
          width: "100%",
          marginBottom: 8,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: isSelected ? "#3578e4" : "#dbdbdb",
          backgroundColor: isSelected ? "#e7f0fd" : "transparent",
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: isSelected ? "#3578e4" : "#4A4947",
          }}
          className="font-outfit-light text-[14px]"
        >
          {capitalize(item.name)}
        </Text>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected && prev.item.id === next.item.id,
);

IngredientItem.displayName = "IngredientItem";

export default function IngredientsModal({
  ingredients,
  isLoading,
  onSelectIngredient,
  ingredientsIDs,
}: IngredientsModalProps) {
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return ingredients;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseQuery),
    );
  }, [ingredients, searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: Ingredient }) => {
      const isSelected = ingredientsIDs ? ingredientsIDs.includes(item) : false;
      return (
        <IngredientItem
          item={item}
          isSelected={isSelected}
          onSelect={onSelectIngredient}
        />
      );
    },
    [onSelectIngredient, ingredientsIDs],
  );

  const ListEmptyComponent = useCallback(
    () =>
      isLoading ? (
        <View className="flex-1 items-center justify-center mt-10">
          <ActivityIndicator size={30} color="#3578e4" />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center mt-10">
          <Text className="text-text-3 font-outfit-light text-[14px]">
            No hay ingredientes
          </Text>
        </View>
      ),
    [isLoading],
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: insets.left + insets.right + 30,
          marginBottom: 16,
          paddingTop: 5,
        }}
        className="bg-bg-semi-white z-10"
      >
        <Text className="text-text-3 font-outfit-bold text-[18px] text-center mb-3">
          Ingredientes
        </Text>

        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar ingrediente..."
          placeholderTextColor="#999"
          className="font-outfit-light px-3 py-2.5 rounded-[5px] text-[15px] text-text-4 border border-gray-400"
          style={{
            width: "100%",
            margin: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
          clearButtonMode="while-editing"
        />
      </View>

      {/* --- LISTA DE INGREDIENTES --- */}
      <BottomSheetFlashList
        data={filteredIngredients}
        extraData={searchQuery}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item: Ingredient) => item.id}
        showsVerticalScrollIndicator={true}
        numColumns={1}
        drawDistance={250}
        scrollEnabled={true}
        estimatedItemSize={53}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom,
          paddingHorizontal: insets.left + insets.right + 30,
        }}
      />
    </View>
  );
}
