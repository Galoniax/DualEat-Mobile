import { RecipeStepDTO } from "@/interface/global.dto";
import { AntDesign } from "@expo/vector-icons";
import { TextInput, View, Text, TouchableOpacity } from "react-native";

interface Props {
  steps: RecipeStepDTO[];
  setSteps: React.Dispatch<React.SetStateAction<RecipeStepDTO[]>>;
}

export default function StepsInput({ steps, setSteps }: Props) {
  return (
    <>
      {steps.map((step, index) => (
        <View key={index} className="flex-col gap-4 w-full">
          <View className="flex-row items-center gap-x-4 w-full">
            <Text className="font-outfit-bold">{step.step_number}</Text>

            <TextInput
              multiline={true}
              numberOfLines={2}
              maxLength={200}
              value={step.description}
              style={{ flex: 2 }}
              onChangeText={(text) =>
                setSteps((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, description: text } : item,
                  ),
                )
              }
              placeholder="Descripción"
              placeholderTextColor="#999"
              className="font-outfit-light px-3 py-2 rounded-[4px] text-[14px] text-text-4 border border-gray-200"
            />

            <TextInput
              value={step.estimated_time?.toString() || ""}
              style={{ flex: 1 }}
              keyboardType="numeric"
              onChangeText={(text) =>
                setSteps((prev) =>
                  prev.map((item, i) =>
                    i === index
                      ? { ...item, estimated_time: Number(text) }
                      : item,
                  ),
                )
              }
              placeholder="Tiempo estimado"
              placeholderTextColor="#999"
              className="font-outfit-light px-3 py-2 rounded-[4px] text-[14px] text-text-4 border border-gray-200"
            />
          </View>
        </View>
      ))}

      <View className="flex-row gap-x-2 mt-4">
        {/* Botón Agregar */}
        <TouchableOpacity
          onPress={() =>
            setSteps([
              ...steps,
              {
                step_number: steps.length + 1,
                description: "",
                estimated_time: null,
              },
            ])
          }
          className="flex-1 flex-row items-center gap-x-2 py-2.5 rounded-[5px] justify-center border border-[#e5a657]"
        >
          <AntDesign name="plus" size={18} color="#e5a657" />
          <Text
            numberOfLines={1}
            className="font-outfit-light text-[14px] text-text-3"
          >
            Agregar paso
          </Text>
        </TouchableOpacity>

        {/* Botón Eliminar o Espacio Vacío */}
        {steps.length > 1 && (
          <TouchableOpacity
            onPress={() => setSteps((prev) => prev.slice(0, prev.length - 1))}
            className="flex-1 flex-row items-center gap-x-2 py-2.5 rounded-[5px] justify-center border border-[#e5a657]"
          >
            <AntDesign name="minus" size={18} color="#e5a657" />
            <Text
              numberOfLines={1}
              className="font-outfit-light text-[14px] text-text-3"
            >
              Eliminar paso
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
