import { RecipeDTO } from "@/interface/global.dto";
import { AntDesign, Entypo } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

type RecipePartial = Omit<RecipeDTO, "ingredients" | "steps">;

interface Props {
  recipe: RecipePartial;
  setRecipe: React.Dispatch<React.SetStateAction<RecipePartial>>;
  handleAddImage: (isSteps: boolean, index: number) => void;
  children: React.ReactNode;
}

export default function RecipeInfo({
  recipe,
  setRecipe,
  handleAddImage,
  children
}: Props) {
  return (
    <>
      {/** Imagen */}
      {recipe.main_image ? (
        <View className="relative h-64 rounded-lg border border-gray-200 overflow-hidden">
          <Image
            source={{ uri: recipe.main_image.uri }}
            className="w-full h-full"
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => setRecipe((prev) => ({ ...prev, main_image: null }))}
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
          onPress={() => handleAddImage(false, 0)}
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
        className="font-dosis-bold text-[20px] text-text-3 flex-1"
      />
      
      {children}
      {/** Descripción */}
      <TextInput
        value={recipe.description}
        maxLength={300}
        onChangeText={(text) => setRecipe({ ...recipe, description: text })}
        placeholder="Descripción"
        placeholderTextColor="#999"
        className="font-dosis-regular rounded-[4px] text-[14px] text-text-4 flex-1 border border-gray-200"
        multiline={true}
        numberOfLines={3}
      />
    </>
  );
}
