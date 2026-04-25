import { Unit, UnitNames } from "@/interface/global";
import { RecipeIngredientDTO } from "@/interface/global.dto";
import { AntDesign } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  ingredients: RecipeIngredientDTO[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredientDTO[]>>;

  onOpenUnitModal: (index: number, type: "unit") => void;
  onOpenIngredientModal: (index: number, type: "ingredient") => void;
}

export default function IngredientsInput({
  ingredients,
  setIngredients,
  onOpenUnitModal,
  onOpenIngredientModal,
}: Props) {
  return (
    <View style={{ flex: 1, flexGrow: 1 }} className="flex-col gap-y-4 w-full">
      {ingredients.map((ingredient, index) => (
        <View key={index} className="flex-col gap-2 w-full">
          {/* Fila de Ingrediente, Cantidad y Unidad */}
          <View className="flex-row items-center gap-x-2 w-full">
            <TouchableOpacity
              onPress={() => {
                onOpenIngredientModal(index, "ingredient");
              }}
              style={{ flex: 5 }}
              className="font-dosis-regular px-3 py-2 rounded-[4px] text-[14px] text-text-4 border border-gray-300"
            >
              <Text className="text-text-4 text-[14px] font-dosis-regular">
                {ingredient.name || "Ingrediente"}
              </Text>
            </TouchableOpacity>
           
            <TextInput
              value={ingredient.quantity.toString()}
              keyboardType="default"
              onChangeText={(text) =>
                setIngredients((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, quantity: text } : item,
                  ),
                )
              }
              placeholder="Cantidad"
              placeholderTextColor="#999"
              style={{ flex: 3 }}
              className="font-dosis-regular truncate px-3 py-2 rounded-[4px] text-[14px] text-text-4 border border-gray-200"
            />
            <TouchableOpacity
              onPress={() => {
                onOpenUnitModal(index, "unit");
              }}
              style={{ flex: 2 }}
              className="px-3 py-2 rounded-[4px] border border-gray-300"
            >
              <Text className="text-text-4 text-[14px] font-dosis-regular">
                {UnitNames[ingredient.unit].abbreviation}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input de Notas abajo */}
          <TextInput
            value={ingredient.notes || ""}
            multiline={true}
            numberOfLines={2}
            onChangeText={(text) =>
              setIngredients((prev) =>
                prev.map((item, i) =>
                  i === index ? { ...item, notes: text } : item,
                ),
              )
            }
            placeholder="Notas"
            placeholderTextColor="#999"
            className="font-dosis-regular px-3 py-2 w-full rounded-[4px] text-[14px] text-text-4 border border-gray-200"
          />
        </View>
      ))}

      <View className="flex-row gap-x-2 mt-4">
        {/* Botón Agregar */}
        <TouchableOpacity
          onPress={() =>
            setIngredients([
              ...ingredients,
              {
                ingredient_id: "",
                name: "",
                quantity: "",
                unit: Unit.GRAMOS,
                notes: "",
              },
            ])
          }
          className="flex-1 flex-row items-center gap-x-2 py-2.5 rounded-[5px] justify-center border border-[#e5a657]"
        >
          <AntDesign name="plus" size={18} color="#e5a657" />
          <Text
            numberOfLines={1}
            className="font-dosis-regular text-[14px] text-text-3"
          >
            Agregar ingrediente
          </Text>
        </TouchableOpacity>

        {/* Botón Eliminar o Espacio Vacío */}
        {ingredients.length > 1 && (
          <TouchableOpacity
            onPress={() =>
              setIngredients((prev) => prev.slice(0, prev.length - 1))
            }
            className="flex-1 flex-row items-center gap-x-2 py-2.5 rounded-[5px] justify-center border border-[#e5a657]"
          >
            <AntDesign name="minus" size={18} color="#e5a657" />
            <Text
              numberOfLines={1}
              className="font-dosis-regular text-[14px] text-text-3"
            >
              Eliminar ingrediente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
