import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Entypo, EvilIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  PostDTO,
  RecipeDTO,
  RecipeIngredientDTO,
  RecipeStepDTO,
  UploadPayload,
  UploadableFile,
} from "@/interface/global.dto";

import { useCallback, useMemo, useRef, useState } from "react";
import { Ingredient, Unit, UnitList, UnitNames } from "@/interface/global";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { capitalize } from "@/utils/normalize";
import RecipeInfo from "@/components/features/create/recipe/RecipeInfo";
import IngredientsInput from "@/components/features/create/recipe/IngredientsInput";
import StepsInput from "@/components/features/create/recipe/StepsInput";
import { pickMedia } from "@/utils/media";
import { useIngredients } from "@/hooks/api/recipe/useIngredients";
import IngredientsModal from "@/components/features/chat/IngredientsModal";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { createPost, upload } from "@/services/post.api";

type RecipePartial = Omit<RecipeDTO, "ingredients" | "steps">;
type IngredientPartial = RecipeIngredientDTO[];
type StepsPartial = RecipeStepDTO[];

export default function CreateRecipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { post, clearPost } = usePostCreateStore();

  const unitModalRef = useRef<BottomSheetModal>(null);
  const ingredientModalRef = useRef<BottomSheetModal>(null);

  const { data, isLoading } = useIngredients(true);

  const [ingredients, setIngredients] = useState<IngredientPartial>([
    {
      ingredient_id: "",
      name: "",
      quantity: "",
      unit: Unit.GRAMOS,
      notes: "",
    },
  ]);

  const [steps, setSteps] = useState<StepsPartial>([
    {
      step_number: 1,
      description: "",
      estimated_time: null,
      image_url: "",
    },
  ]);

  const total = useMemo(() => {
    return steps.reduce((acc, step) => acc + (step.estimated_time || 0), 0);
  }, [steps]);

  const [recipe, setRecipe] = useState<RecipePartial>({
    name: "",
    description: "",
    total_time: total,
    main_image: "",
  });

  const handleAddImage = async (isSteps: boolean, index: number) => {
    let newImage: UploadableFile[] = [];
    if (!isSteps) {
      newImage = await pickMedia({
        mediaType: "Images",
        allowsEditing: true,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      setRecipe((prev) => ({ ...prev, main_image: newImage[0] }));
    } else {
      newImage = await pickMedia({
        mediaType: "All",
        allowsEditing: false,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (newImage.length > 0) {
        setSteps((prev) =>
          prev.map((step, i) =>
            i === index ? { ...step, image_url: newImage[0] } : step,
          ),
        );
      }
    }
  };

  const indexIngredient = useRef<number | null>(null);

  const handleModal = (index: number, type: "unit" | "ingredient") => {
    indexIngredient.current = index;

    if (type === "unit") unitModalRef.current?.present();
    if (type === "ingredient") ingredientModalRef.current?.present();
  };

  const handleSelectUnit = (selectedUnit: Unit) => {
    const target = indexIngredient.current;

    if (target !== null) {
      setIngredients((prev) =>
        prev.map((item, i) =>
          i === target ? { ...item, unit: selectedUnit } : item,
        ),
      );
    }

    unitModalRef.current?.dismiss();
  };

  const handleSelectIngredient = (selectedIngredient: Ingredient) => {
    setIngredients((prev) =>
      prev.map((item, i) =>
        i === indexIngredient.current
          ? {
              ...item,
              ingredient_id: selectedIngredient.id,
              name: selectedIngredient.name,
            }
          : item,
      ),
    );
    ingredientModalRef.current?.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        unitModalRef.current?.dismiss();
        ingredientModalRef.current?.dismiss();
      };
    }, []),
  );

  const handleSubmit = async () => {
    // TODO: Toast
    if (!recipe.name || !recipe.description || !recipe.main_image) {
      console.log("Faltan datos en la receta");
      return;
    }

    if (
      ingredients.some(
        (ingredient) =>
          !ingredient.ingredient_id ||
          !ingredient.name ||
          !ingredient.quantity ||
          !ingredient.unit,
      )
    ) {
      return;
    }

    if (steps.some((step) => !step.description)) {
      return;
    }

    const uploadPayload: UploadPayload = {
      post_images: post.image_urls as UploadableFile[],
      recipe_main_image: recipe.main_image as UploadableFile,
      recipe_step_images: steps.flatMap((step) =>
        step.image_url ? [step.image_url] : [],
      ) as UploadableFile[],
    };

    const response = await upload(uploadPayload);

    if (!response.success) {
      console.log("Error al subir las imágenes");
      return;
    }

    const urls = response.data;

    let counter = 0;

    const postDTO: PostDTO = {
      title: post.title.trim(),
      content: post.content.trim(),
      image_urls: urls?.post_images || [],
      community_id: post.community_id,
    };

    const recipeDTO: RecipeDTO = {
      name: recipe.name.trim(),
      description: recipe.description.trim(),
      total_time: recipe.total_time,
      main_image: urls?.recipe_main_image || "",
      ingredients: ingredients.map((ingredient) => {
        return {
          ...ingredient,
          name: ingredient.name.trim(),
          notes: ingredient.notes?.trim() || "",
        };
      }),
      steps: steps.map((step): RecipeStepDTO => {
        let image_url: string | null = null;
        if (step.image_url) {
          image_url = urls?.recipe_step_images?.[counter] || null;
          counter++;
        }

        return {
          ...step,
          description: step.description.trim(),
          image_url: image_url as string,
        };
      }),
    };

    const createResponse = await createPost(postDTO, recipeDTO);

    if (createResponse.success) {
      clearPost();
      router.back();
    } else {
      console.log("Error al crear la receta");
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-bg-semi-white"
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>

        <Text className="font-dosis-bold text-center text-[16px] text-text-3 flex-1">
          Crear Receta
        </Text>

        <TouchableOpacity
          onPress={() => {
            handleSubmit();
          }}
          className="rounded-full bg-bg-semi-black py-1 px-4 items-center"
        >
          <Text className="font-dosis-bold text-[14px] text-text-1">
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={30}
      >
        <ScrollView
          className="flex-1 w-full mt-2 relative bg-bg-semi-white"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 60,
            paddingHorizontal: insets.right + insets.left + 20,
          }}
        >
          <View className="flex-col w-full gap-3.5">
            <RecipeInfo
              recipe={recipe}
              setRecipe={setRecipe}
              handleAddImage={handleAddImage}
            >
              {/** Tiempo y ingredientes */}
              <View className="flex-row items-center gap-x-4">
                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="clock" size={20} color="#707070" />
                  <Text className="font-dosis-regular text-[14px] text-text-4">
                    {total} min
                  </Text>
                </View>

                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="cart" size={20} color="#707070" />
                  <Text className="font-dosis-regular text-[14px] text-text-4">
                    {ingredients.length} ingredientes
                  </Text>
                </View>
                <View className="flex-row items-center gap-x-1.5">
                  <EvilIcons name="chart" size={20} color="#707070" />
                  <Text className="font-dosis-regular text-[14px] text-text-4">
                    {steps.length} pasos
                  </Text>
                </View>
              </View>
            </RecipeInfo>

            <View className="mt-6 flex-col gap-y-6">
              <Text className="font-dosis-bold text-text-3 text-[16px]">
                Ingredientes
              </Text>

              <IngredientsInput
                ingredients={ingredients}
                setIngredients={setIngredients}
                onOpenUnitModal={(index) => handleModal(index, "unit")}
                onOpenIngredientModal={(index) =>
                  handleModal(index, "ingredient")
                }
              />

              <Text className="font-dosis-bold text-text-3 text-[16px] mt-8">
                Pasos
              </Text>

              <StepsInput steps={steps} setSteps={setSteps} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/** MODALS  (unit modal)*/}
      <BottomSheetModal
        ref={unitModalRef}
        snapPoints={["30%"]}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableDynamicSizing={false}
        index={0}
        handleIndicatorStyle={{
          backgroundColor: "#2F2F2F",
          marginVertical: 10,
        }}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderColor: "#dbdbdb",
          borderWidth: 1,
          backgroundColor: "#fefefe",
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
          data={UnitList}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          numColumns={1}
          keyExtractor={(item: Unit) => item}
          contentContainerStyle={{
            gap: 10,
            paddingBottom: insets.bottom + 10,
            paddingHorizontal: insets.left + insets.right + 30,
          }}
          renderItem={({ item }: { item: Unit }) => (
            <TouchableOpacity
              onPress={() => {
                handleSelectUnit(item);
              }}
              style={{ width: "90%", margin: "auto" }}
              className="py-2 rounded-[4px] flex-row gap-x-1 border justify-center items-center border-gray-300 "
            >
              <Text className="text-text-5 text-[14px] font-dosis-bold">
                {capitalize(UnitNames[item].name)}
              </Text>
              <Text className="text-text-4 text-[14px] font-dosis-regular">
                ({UnitNames[item].abbreviation})
              </Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModal>

      {/** MODALS  (ingredient modal)*/}
      <BottomSheetModal
        ref={ingredientModalRef}
        snapPoints={["80%"]}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableDynamicSizing={false}
        index={0}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        handleIndicatorStyle={{
          backgroundColor: "#2F2F2F",
          marginVertical: 10,
        }}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderColor: "#dbdbdb",
          borderWidth: 1,
          backgroundColor: "#fefefe",
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
        <IngredientsModal
          ingredients={data || []}
          onSelectIngredient={handleSelectIngredient}
          isLoading={isLoading}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}
