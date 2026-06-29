import { Recipe } from "@/interface/global";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { ROUTES } from "@/constants/constants";
import { useRouter } from "expo-router";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();

  if (!recipe) return null;

  const steps = recipe.steps || [];
  const ingredients = recipe.ingredients || [];

  const navigate = () => {
    router.push({
      pathname: ROUTES.USER.RECIPE,
      params: {
        //community_slug: recipe.community?.slug || "",
        community_slug: "DualEat",
        recipe_id: recipe.id || "",
        recipe_slug: recipe.slug || "",
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={navigate}
      activeOpacity={0.7}
      className="py-1 mt-4 rounded-[10px] border border-gray-200 flex-row justify-center items-center gap-x-2"
    >
      <Image
        source={{
          uri:
            recipe.main_image ||
            "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
        }}
        className="w-[30px] h-[30px] rounded-full mr-2"
      />
      <View className="flex-col items-center gap-y-1.5">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-outfit-bold text-text-5 truncate"
        >
          {recipe.name}
        </Text>

        <View className="flex-row items-center justify-center gap-x-4">
          <View className="flex-row items-center gap-x-1.5">
            <EvilIcons name="clock" size={12} color="#707070" />
            <Text className="font-outfit-light text-[14px] text-text-4">
              {recipe.total_time && recipe.total_time > 0
                ? recipe.total_time + " min"
                : "N/A"}
            </Text>
          </View>

          <View className="flex-row items-center gap-x-1.5">
            <EvilIcons name="cart" size={12} color="#707070" />
            <Text className="font-outfit-light text-[14px] text-text-4">
              {ingredients.length || 0} ingredientes
            </Text>
          </View>
          <View className="flex-row items-center gap-x-1.5">
            <EvilIcons name="chart" size={12} color="#707070" />
            <Text className="font-outfit-light text-[14px] text-text-4">
              {steps.length || 0} pasos
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
