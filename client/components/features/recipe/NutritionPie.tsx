import { Text, View } from "react-native";

import { Pie, PolarChart } from "victory-native";
import { NutritionData } from "@/interface/global";

export default function NutritionPie({
  nutrition,
}: {
  nutrition: NutritionData;
}) {
  const macro = [
    {
      key: "carbs",
      label: "Carbohidratos",
      color: "#46999F",
      value: Number(nutrition.avg_carbs),
    },
    {
      key: "fat",
      label: "Grasas",
      color: "#EE7D5F",
      value: Number(nutrition.avg_fat),
    },
    {
      key: "proteins",
      label: "Proteínas",
      color: "#FDC343",
      value: Number(nutrition.avg_proteins),
    },
  ];

  const chartData =
    nutrition.total_ingredients === 0
      ? [{ key: "empty", label: "Sin datos", color: "#E5E7EB", value: 1 }]
      : macro;

  return (
    <View className="flex-col gap-y-4 flex-1">
      <Text className="font-outfit-bold text-lg text-text-3">
        Información Nutricional Aproximada
      </Text>

      <View className="p-4 grow rounded-[10px] flex-col gap-y-3 border border-dashed border-gray-400 w-full">
        <View className="flex-row items-center justify-between flex-1 gap-4">
          <View
            style={{ width: 110, height: 110 }}
            className="items-center justify-center relative"
          >
            {/* Gráfico */}
            <View style={{ width: "100%", height: "100%" }}>
              <PolarChart
                data={chartData}
                colorKey="color"
                valueKey="value"
                labelKey="label"
              >
                <Pie.Chart size={90} innerRadius={30}>
                  {() => (
                    <>
                      <Pie.Slice />
                      <Pie.SliceAngularInset
                        angularInset={{
                          angularStrokeWidth: 5,
                          angularStrokeColor: "#f5f5f5",
                        }}
                      />
                    </>
                  )}
                </Pie.Chart>
              </PolarChart>
            </View>

            {/* Texto central */}
            <View
              style={{ position: "absolute" }}
              className="items-center justify-center"
              pointerEvents="none"
            >
              {nutrition.total_ingredients === 0 ? (
                <Text className="font-outfit-light text-[12px] text-text-4 text-center">
                  Sin datos
                </Text>
              ) : (
                <View className="items-center">
                  <Text className="font-outfit-bold text-xl text-text-3">
                    {nutrition.avg_calories.toFixed(0)}
                  </Text>
                  <Text className="font-outfit-light text-sm text-text-4">
                    Cals
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Leyenda */}
          <View
            style={{ flex: 2, flexDirection: "row", gap: 8, flexWrap: "wrap" }}
          >
            {macro.map((item) => (
              <View
                key={item.key}
                className="flex-1 flex-col items-start gap-y-2"
              >
                <Text className="font-outfit-bold text-base text-text-3">
                  {item.value.toFixed(1)}g
                </Text>

                <Text className="font-outfit-light text-sm text-text-4">
                  {item.label}
                </Text>
                <View
                  style={{
                    width: "100%",
                    backgroundColor: item.color,
                    height: 4,
                    borderRadius: 999,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
        <Text className="font-outfit-light text-sm text-text-4">
          Este tipo de visualización nutricional se representa el aporte
          relativo de carbohidratos, grasas y proteínas en términos de calorías
          de la receta.
        </Text>
      </View>
    </View>
  );
}
