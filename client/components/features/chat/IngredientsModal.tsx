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
  onSelectIngredient: (id: string) => void;
}

const IngredientItem = memo(
  ({
    item,
    isSelected,
    onSelect,
  }: {
    item: Ingredient;
    isSelected: boolean;
    onSelect: (id: string) => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(item.id)}
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
          className="font-dosis-regular text-[14px]"
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

  /*const handleSelect = useCallback(
    (id: string) => {
      setIngredientsIDs((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        } else {
          return [...prev, id];
        }
      });
    },
    [setIngredientsIDs],
  );*/

  /*const renderItem = useCallback(
    ({ item, extraData }: { item: Ingredient; extraData: string[] }) => {
      const isSelected = extraData.includes(item.id);
      return (
        <IngredientItem
          item={item}
          isSelected={isSelected}
          onSelect={handleSelect}
        />
      );
    },
    [handleSelect],
  );*/

  const renderItem = useCallback(
    ({ item }: { item: Ingredient }) => {
      //const isSelected = extraData.includes(item.id);
      return (
        <IngredientItem
          item={item}
          isSelected={false}
          onSelect={onSelectIngredient}
        />
      );
    },
    [onSelectIngredient],
  );

  const ListEmptyComponent = useCallback(
    () =>
      isLoading ? (
        <View className="flex-1 items-center justify-center mt-10">
          <ActivityIndicator size={30} color="#3578e4" />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center mt-10">
          <Text className="text-text-3 font-dosis-regular text-[14px]">
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
        <Text className="text-text-3 font-dosis-bold text-[18px] text-center mb-3">
          Ingredientes
        </Text>

        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar ingrediente..."
          placeholderTextColor="#999"
          className="font-dosis-regular px-3 py-2.5 rounded-[5px] text-[15px] text-text-4 border border-gray-400"
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
        //extraData={searchQuery}
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

/** 
 * <BottomSheetModal
      ref={ingredientsRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      style={{ flex: 1 }}
      index={0}
      handleIndicatorStyle={{
        backgroundColor: "#2F2F2F",
        marginTop: 10,
      }}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: "#dbdbdb",
        borderWidth: 1,
        backgroundColor: "#fefefe",
      }}
    >
      <BottomSheetFlashList
        data={sort}
        extraData={ingredientsIDs}
        keyExtractor={(item: Ingredient) => item.id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        drawDistance={600}
        scrollEnabled={true}
        ListHeaderComponent={Header}
        estimatedItemSize={65}
        getItemType={(item: Ingredient) => "ingredient_button"}
        renderItem={renderItem}
        style={{
          flex: 1,
        }}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: insets.left + insets.right + 30,
          flexGrow: 1,
        }}
      />
    </BottomSheetModal>
 */
