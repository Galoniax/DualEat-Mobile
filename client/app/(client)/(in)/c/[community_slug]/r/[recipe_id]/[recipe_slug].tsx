import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Entypo,
  EvilIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Recipe, UnitNames } from "@/interface/global";
import { getRecipeById, getRecipeNutrition } from "@/services/recipe.api";
import { useCallback, useRef, useState } from "react";

import { capitalize } from "@/utils/normalize";
import NutritionPie from "@/components/features/recipe/NutritionPie";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import StepsModal from "@/components/features/recipe/StepsModal";

export default function RecipeDetailScreen() {
  const { recipe_id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pathname = usePathname();

  console.log(pathname);

  const [expanded, setExpanded] = useState(true);

  const stepsRef = useRef<BottomSheetModal>(null);

  let rating: number = 0;

  const {
    data: recipe,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["recipe", recipe_id],

    queryFn: async () => {
      const response = await getRecipeById(recipe_id as string);
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as Recipe;
    },

    enabled: !!recipe_id,

    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: nutrition,
    isFetching: isFetchingNutrition,
    refetch: refetchNutrition,
  } = useQuery({
    queryKey: ["nutrition", recipe_id],
    queryFn: async () => {
      if (!recipe?.ingredients) return;

      const ingredients = recipe.ingredients.map(
        (i) => i.ingredient.name,
      ) as string[];

      const fetch = await getRecipeNutrition(ingredients);

      return fetch || null;
    },
    enabled: !!recipe?.ingredients,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 3000,
    staleTime: 5 * 60 * 1000,

    select: (data) => {
      if (!data) return null;

      const proteins = Number(data.avg_proteins ?? 0);
      const carbs = Number(data.avg_carbs ?? 0);
      const fats = Number(data.avg_fat ?? 0);
      const total = proteins + carbs + fats;

      return {
        total_ingredients: data.total_ingredients ?? 0,
        avg_calories: Number(data.avg_calories ?? 0),
        avg_proteins: Number(proteins),
        avg_carbs: Number(carbs),
        avg_fat: Number(fats),
        details: data.details ?? [],
        total: Number(total.toFixed(2)),
      };
    },
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetch(), refetchNutrition()]);
  }, [refetch, refetchNutrition]);

  // Calcular rating
  if (recipe && recipe.votes_up && recipe.votes_down) {
    const total_votes = recipe.votes_down + recipe.votes_up;
    rating = total_votes > 0 ? (recipe.votes_up / total_votes) * 5 : 0;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-bg-semi-white"
    >
      <View className="flex-row items-center justify-between w-full px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="font-dosis-bold text-[16px] text-text-3">Receta</Text>
        <Entypo name="share" size={18} color="#2F2F2F" />
      </View>

      {isLoading || isFetching ? (
        <View className="flex-1 mt-10 items-center justify-center">
          <ActivityIndicator size={32} color="#2F2F2F" />
        </View>
      ) : recipe ? (
        <>
          <ScrollView
            className="flex-1 w-full mt-2 relative"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching || isFetchingNutrition}
                onRefresh={handleRefresh}
                colors={["#e5a657"]}
              />
            }
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
          >
            <View className="flex-col w-full gap-3.5">
              {/** Imagen */}
              <Image
                source={{
                  uri:
                    recipe.main_image === ""
                      ? "https://img.freepik.com/free-photo/hand-holding-delicious-food_23-2150645799.jpg?semt=ais_incoming&w=740&q=80"
                      : recipe.main_image,
                }}
                className="w-full h-64 rounded-lg border border-gray-200"
                resizeMode="cover"
              />

              {/** Título y rating */}
              <View className="flex-row justify-between">
                <Text
                  style={{ flexShrink: 1 }}
                  numberOfLines={2}
                  className="font-dosis-bold text-[22px] text-text-3"
                >
                  {recipe.name}
                </Text>
                <View className="flex-row items-center gap-x-1">
                  <FontAwesome name="star" size={16} color="#e5a657" />
                  <Text className="font-dosis-bold text-[14px] text-text-3">
                    {rating === 0 ? "N/A" : `${rating.toFixed(1)}`}
                  </Text>
                </View>
              </View>

              {/** Tiempo y ingredientes */}
              <View className="flex-row items-center gap-x-4">
                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="clock" size={20} color="#707070" />
                  <Text className="font-dosis-regular text-[14px] text-text-4">
                    {recipe.total_time}min
                  </Text>
                </View>

                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="cart" size={20} color="#707070" />
                  <Text className="font-dosis-regular text-[14px] text-text-4">
                    {recipe.ingredients.length} ingredientes
                  </Text>
                </View>
                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="chart" size={20} color="#707070" />
                  <Text className="font-dosis-regular text-[14px] text-text-4">
                    {recipe.steps.length} pasos
                  </Text>
                </View>
              </View>

              {/** Usuario */}
              <View className="flex-row gap-x-2.5 items-center mt-2">
                <Image
                  source={{ uri: recipe.user.avatar_url }}
                  className="w-8 h-8 rounded-full"
                  resizeMode="cover"
                />
                <View className="flex-col">
                  <Text className="font-dosis-medium text-[12px] text-text-6">
                    Hecha por:
                  </Text>
                  <Text className="font-dosis-bold text-[14px] text-text-3">
                    {recipe.user.name}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-6 flex-col gap-y-6">
              {/** Descripción */}
              <Text className="font-dosis-regular text-[14px] text-text-4 leading-7">
                {recipe.description}
              </Text>

              {/** Ingredientes */}
              <View className="flex-col gap-y-2.5">
                <TouchableOpacity
                  onPress={() => {
                    setExpanded(!expanded);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="flex-row items-center justify-between pb-4 pt-2 mb-2 border-b border-gray-200"
                >
                  <View className="flex-row items-end gap-x-2">
                    <Text className="font-dosis-semibold text-[16px] text-text-3">
                      Ingredientes
                    </Text>
                    <Text className="font-dosis-regular text-[12px] text-text-4">
                      {recipe.ingredients.length} en total
                    </Text>
                  </View>

                  <Entypo
                    name={expanded ? "chevron-small-up" : "chevron-small-down"}
                    size={24}
                    color="#707070"
                  />
                </TouchableOpacity>

                {expanded &&
                  recipe.ingredients.map((ingredient) => (
                    <View
                      key={ingredient.id}
                      className="flex-row items-center justify-between gap-x-1.5 mb-0.5 ms-3"
                    >
                      <View className="flex-row items-center gap-x-1.5">
                        <View className="w-1.5 h-3 bg-bg-red rounded-full" />
                        <Text className="font-dosis-regular text-[14px] text-text-3">
                          {capitalize(ingredient.ingredient.name)}
                        </Text>
                      </View>
                      <Text className="font-dosis-regular text-[12px] text-text-5">
                        {ingredient.quantity}
                        {UnitNames[ingredient.unit].abbreviation}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            <View className="flex-row items-baseline mt-6 gap-x-2 mb-4">
              <Text className="font-dosis-bold text-[16px] text-text-3">
                Información nutricional
              </Text>
              <Text className="font-dosis-regular text-[12px] text-text-4">
                cada 100g de receta
              </Text>
            </View>
            {nutrition && <NutritionPie nutrition={nutrition} />}
          </ScrollView>

          <View
            className="absolute"
            style={{
              bottom: insets.bottom > 0 ? insets.bottom + 20 : 20,
              right: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                stepsRef.current?.present();
              }}
              style={{
                width: 48,
                height: 48,
                elevation: 2.5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
              className="bg-bg-red rounded-[8px] flex items-center justify-center"
            >
              <MaterialCommunityIcons
                name="notebook-multiple"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="flex-1 mt-10 items-center justify-center">
          <Text className="font-dosis-bold text-[16px] text-text-3">
            No se encontro la receta
          </Text>
        </View>
      )}

      {recipe && <StepsModal stepsRef={stepsRef} recipe={recipe} />}
    </SafeAreaView>
  );
}
