import { useAuth } from "@/context/auth/AuthContext";
import { RecipeDTO, UploadableFile } from "@/interface/global.dto";
import { AntDesign, Entypo } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  TouchableOpacity,
  View,
  TextInput,
  Text,
} from "react-native";

type RecipePartial = Omit<RecipeDTO, "ingredients" | "steps">;

interface Props {
  recipe: RecipePartial;
  setRecipe: React.Dispatch<React.SetStateAction<RecipePartial>>;
  handleAddImage: () => void;
  children: React.ReactNode;
}

export default function RecipeInfo({
  recipe,
  setRecipe,
  handleAddImage,
  children,
}: Props) {

  const  { user } = useAuth();

    const isPremium =
    user?.subscription_status === "ACTIVE" ||
    user?.subscription_status === "TRIAL";
  return (
    <>
      {/** Imagen */}
      {recipe.main_image ? (
        <View className="relative h-64 rounded-lg border border-gray-200 overflow-hidden">
          <Image
            source={{ uri: (recipe.main_image as UploadableFile).uri }}
            className="w-full h-full"
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => setRecipe((prev) => ({ ...prev, main_image: "" }))}
            style={{
              opacity: 0.8,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-semi-black rounded-full w-10 h-10 flex items-center justify-center z-20 border border-gray-200"
          >
            <Entypo name="cross" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <Pressable
          onPress={() => handleAddImage()}
          className="w-full h-64 rounded-lg border border-gray-300 flex items-center justify-center"
        >
          <AntDesign name="camera" size={24} color="#4A4947" />
        </Pressable>
      )}
      {/** Título y rating */}
      <TextInput
        value={recipe.name}
        maxLength={80}
        onChangeText={(text) => setRecipe({ ...recipe, name: text })}
        placeholder="Nombre de la receta"
        placeholderTextColor="#999"
        className="font-outfit-bold text-[20px] text-text-3 flex-1"
      />

      {children}
      {/** Descripción */}
      <View className="flex-col w-full gap-y-1">
        <TextInput
          value={recipe.description}
          maxLength={isPremium ? 3000 : 1000}
          onChangeText={(text) => setRecipe({ ...recipe, description: text })}
          placeholder="Descripción"
          placeholderTextColor="#999"
          className="font-outfit-light rounded-[4px] text-[14px] text-text-4 p-2 border border-gray-200"
          multiline={true}
          numberOfLines={10}
        />
        <View className="flex-row justify-end items-center px-1">
          <Text
            className={`font-outfit-light text-xs ${
              (recipe.description || "").length >= (isPremium ? 3000 : 1000)
                ? "text-red-500"
                : "text-text-4"
            }`}
          >
            {(recipe.description || "").length} / {isPremium ? 3000 : 1000} caracteres
          </Text>
        </View>
      </View>
    </>
  );
}
