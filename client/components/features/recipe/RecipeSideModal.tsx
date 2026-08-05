import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useFocusEffect } from "expo-router";
import { Recipe } from "@/interface/global";
import { getUserRecipes } from "@/services/recipe.api";
import { capitalize } from "@/utils/normalize";
import { ROUTES } from "@/constants/constants";

interface RecipeSideModalProps {
  ref: React.RefObject<BottomSheetModal | null>;
  recipe?: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function RecipeSideModal({
  ref,
  onSelectRecipe,
  recipe,
}: RecipeSideModalProps) {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const snapPoints = useMemo(() => ["85%"], []);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["user_recipes"],
    queryFn: async () => {
      const response = await getUserRecipes();
      if (!response.success) {
        throw new Error(response.message || "Error al obtener recetas");
      }
      return response.data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [recipes, search]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearch("");
      };
    }, []),
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => {
      const total_votes = (item.votes_down || 0) + (item.votes_up || 0);
      const rating =
        total_votes > 0 ? ((item.votes_up || 0) / total_votes) * 5 : 0;

      const isSelected = item.id === recipe?.id;

      return (
        <TouchableOpacity
          onPress={() => {
            onSelectRecipe(item);
            ref.current?.dismiss();
          }}
          className={`flex-row gap-x-3 items-center p-3 rounded-xl mx-4 mb-3 border ${
            isSelected
              ? "border-[#3578e4] bg-[#e7f0fd]"
              : "border-gray-200 bg-white"
          }`}
        >
          <Image
            source={{ uri: item.main_image || "https://placehold.co/100x100" }}
            className="w-8 h-full rounded-lg"
            resizeMode="cover"
          />

          <View className="flex-1 flex-col gap-y-1">
            <View className="flex-row justify-between items-center gap-x-2">
              <Text
                style={{ flexShrink: 1 }}
                numberOfLines={1}
                className="font-outfit-bold text-base text-text-3"
              >
                {item.name}
              </Text>
              <View className="flex-row items-center gap-x-1">
                <FontAwesome name="star" size={13} color="#e5a657" />
                <Text className="font-outfit-bold text-xs text-text-3">
                  {rating === 0 ? "N/A" : rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-x-3">
              <View className="flex-row items-center gap-x-1">
                <Feather name="clock" size={13} color="#707070" />
                <Text className="text-xs text-text-4 font-outfit-light">
                  {item.total_time || 0} min
                </Text>
              </View>

              <View className="flex-row items-center gap-x-1">
                <Feather name="shopping-cart" size={13} color="#707070" />
                <Text className="text-xs text-text-4 font-outfit-light">
                  {item._count?.ingredients || 0} ing.
                </Text>
              </View>

              <View className="flex-row items-center gap-x-1">
                <Feather name="bar-chart-2" size={13} color="#707070" />
                <Text className="text-xs text-text-4 font-outfit-light">
                  {item._count?.steps || 0} pasos
                </Text>
              </View>
            </View>

            {item.description ? (
              <Text
                numberOfLines={2}
                className="text-text-4 text-xs font-outfit-light"
              >
                {capitalize(item.description)}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [onSelectRecipe, recipe?.id, ref],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      style={{ flex: 1 }}
      enablePanDownToClose={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      handleIndicatorStyle={{
        backgroundColor: "#e5a657",
        width: 35,
        height: 4,
        borderRadius: 9999,
        marginTop: 5,
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetFlatList
        data={filtered}
        keyExtractor={(item: Recipe) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        renderItem={renderItem}
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-2">
            {/* HEADER TITLE & CLOSE */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-outfit-bold text-lg text-text-3">
                Tus recetas
              </Text>
              <TouchableOpacity
                onPress={() => ref.current?.dismiss()}
                className="rounded-full p-2 bg-gray-100 items-center justify-center"
              >
                <Feather name="x" size={18} color="#2F2F2F" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT */}
            <View className="flex-row items-center px-3 py-1 border border-gray-200 bg-white rounded-full gap-x-3 mb-4">
              <Feather name="search" size={18} color="#707070" />
              <TextInput
                className="flex-1 text-sm font-outfit-light text-text-3 py-1.5"
                value={search}
                placeholder="Buscar receta por nombre..."
                placeholderTextColor="#999"
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12 px-4">
            {isLoading ? (
              <ActivityIndicator size="large" color="#e5a657" />
            ) : (
              <Text className="text-sm font-outfit-medium text-text-4 text-center">
                No tienes recetas publicadas con ese nombre
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="px-4 pt-3 pb-6 border-t border-gray-100">
            <TouchableOpacity
              className="flex-row items-center justify-center border border-dashed border-[#e5a657] py-3 rounded-xl gap-x-2 bg-white"
              onPress={() => {
                ref.current?.dismiss();
                router.push(ROUTES.USER.CREATE_RECIPE);
              }}
            >
              <Feather name="plus" size={20} color="#e5a657" />
              <Text className="text-sm font-outfit-bold text-[#e5a657]">
                Crear receta
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </BottomSheetModal>
  );
}
