import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { NutritionData, Recipe, UnitNames } from "@/interface/global";
import { getRecipeById } from "@/services/recipe.api";
import { useEffect, useRef, useState } from "react";

import { capitalize } from "@/utils/normalize";
import NutritionPie from "@/components/features/recipe/NutritionPie";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import StepsModal from "@/components/features/recipe/StepsModal";

export default function RecipeDetailScreen() {
  const { recipe_id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [expanded, setExpanded] = useState(true);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);

  const stepsRef = useRef<BottomSheetModal>(null);

  let rating: number = 0;

  const {
    data: recipe,
    isLoading,
    refetch,
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

  useEffect(() => {
    if (!recipe?.ingredients) return;

    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalCalories = 0;

    for (const item of recipe.ingredients) {
      const rawQuantity = Number(item.quantity) || 0;
      const ing = item.ingredient;

      if (!ing) continue;

      let weightInGrams = 0;

      switch (item.unit) {
        case "GRAMOS":
        case "MILILITROS":
          weightInGrams = rawQuantity;
          break;

        case "KILOGRAMOS":
        case "LITROS":
          weightInGrams = rawQuantity * 1000;
          break;

        case "CUCHARADITA":
          weightInGrams = rawQuantity * 5;
          break;

        case "CUCHARADA":
          weightInGrams = rawQuantity * 15;
          break;

        case "TAZA":
          weightInGrams = rawQuantity * 240;
          break;

        case "PIZCA":
          weightInGrams = rawQuantity * 0.5;
          break;

        case "UNIDAD":
          weightInGrams = rawQuantity * 100;
          break;

        case "PAQUETE":
          weightInGrams = rawQuantity * 400;
          break;

        case "OPCIONAL":
          weightInGrams = rawQuantity > 0 ? rawQuantity * 10 : 0;
          break;

        default:
          weightInGrams = rawQuantity;
          break;
      }

      const factor = weightInGrams / 100;

      totalFat += (ing.fat || 0) * factor;
      totalCarbs += (ing.carbs || 0) * factor;
      totalProtein += (ing.proteins || 0) * factor;
      totalCalories += (ing.calories || 0) * factor;
    }

    const totalMacros = totalProtein + totalCarbs + totalFat;

    setNutrition({
      total_ingredients: recipe.ingredients.length,
      avg_calories: Math.round(totalCalories),
      avg_proteins: Number(totalProtein.toFixed(1)),
      avg_carbs: Number(totalCarbs.toFixed(1)),
      avg_fat: Number(totalFat.toFixed(1)),
      total: Number(totalMacros.toFixed(1)),
    });
  }, [recipe]);

  useEffect(() => {
    if (recipe) {
      router.setParams({
        recipe_id: recipe.id,
        recipe_slug: recipe.slug,
      });
    }
  }, [recipe, router]);

  // Calcular rating
  if (recipe && recipe.votes_up && recipe.votes_down) {
    const total_votes = recipe.votes_down + recipe.votes_up;
    rating = total_votes > 0 ? (recipe.votes_up / total_votes) * 5 : 0;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-bg-semi-white relative px-3"
    >
      <View className="flex-row items-center justify-between w-full py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-base text-text-3">Receta</Text>
        <Entypo name="share" size={18} color="#2F2F2F" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={32} color="#2F2F2F" />
        </View>
      ) : recipe ? (
        <>
          <ScrollView
            className="flex-1 w-full"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={["#e5a657"]}
              />
            }
            contentContainerStyle={{
              flexDirection: "column",
              gap: 16,
              paddingBottom: 40,
            }}
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
                  className="font-outfit-bold text-[22px] text-text-3"
                >
                  {recipe.name}
                </Text>
                <View className="flex-row items-center gap-x-1">
                  <FontAwesome name="star" size={16} color="#e5a657" />
                  <Text className="font-outfit-bold text-[14px] text-text-3">
                    {rating === 0 ? "N/A" : `${rating.toFixed(1)}`}
                  </Text>
                </View>
              </View>

              {/** Tiempo y ingredientes */}
              <View className="flex-row items-center gap-x-4">
                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="clock" size={20} color="#707070" />
                  <Text className="font-outfit-light text-[14px] text-text-4">
                    {recipe.total_time}min
                  </Text>
                </View>

                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="cart" size={20} color="#707070" />
                  <Text className="font-outfit-light text-[14px] text-text-4">
                    {recipe.ingredients.length} ingredientes
                  </Text>
                </View>
                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="chart" size={20} color="#707070" />
                  <Text className="font-outfit-light text-[14px] text-text-4">
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
                  <Text className="font-outfit-regular text-[12px] text-text-6">
                    Hecha por:
                  </Text>
                  <Text className="font-outfit-bold text-[14px] text-text-3">
                    {recipe.user.name}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-col gap-y-6">
              {/** Descripción */}
              <Text className="font-outfit-light text-[14px] text-text-4 leading-7">
                {recipe.description}
              </Text>

              {/** Ingredientes */}
              {recipe.ingredients.length > 0 && (
                <View className="flex-col gap-y-2.5">
                  <TouchableOpacity
                    onPress={() => {
                      setExpanded(!expanded);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="flex-row items-center justify-between pb-4 pt-2 mb-2 border-b border-gray-200"
                  >
                    <View className="flex-row items-end gap-x-2">
                      <Text className="font-outfit-bold text-lg text-text-3">
                        Ingredientes
                      </Text>
                      <Text className="font-outfit-light text-sm text-text-4">
                        {recipe.ingredients.length} en total
                      </Text>
                    </View>

                    <Entypo
                      name={
                        expanded ? "chevron-small-up" : "chevron-small-down"
                      }
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
                          <Text className="font-outfit-light text-[14px] text-text-3">
                            {capitalize(ingredient.ingredient.name)}
                          </Text>
                        </View>
                        <Text className="font-outfit-light text-[12px] text-text-5">
                          {ingredient.quantity}
                          {UnitNames[ingredient.unit].abbreviation}
                        </Text>
                      </View>
                    ))}
                </View>
              )}
            </View>

            {nutrition && nutrition.total_ingredients > 0 && (
              <NutritionPie nutrition={nutrition} />
            )}
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
          <Text className="font-outfit-bold text-[16px] text-text-3">
            No se encontro la receta
          </Text>
        </View>
      )}

      {recipe && <StepsModal stepsRef={stepsRef} recipe={recipe} />}
    </SafeAreaView>
  );
}
