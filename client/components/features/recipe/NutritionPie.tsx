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
    <View className="bg-bg-gray py-4 px-3 rounded-[5px] border border-gray-200 w-full">
      <View className="flex-row items-center justify-between flex-1">
        <View
          style={{ flex: 1 }}
          className="relative items-center justify-center"
        >
          <View style={{ width: "100%", height: "100%", minHeight: 110 }}>
            <PolarChart
              data={chartData}
              colorKey="color"
              valueKey="value"
              labelKey="label"
            >
              <Pie.Chart size={80} innerRadius={30} />
            </PolarChart>
          </View>

          {/* Texto central (kcal) */}
          <View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
            }}
            pointerEvents="none"
          >
            {nutrition.total_ingredients === 0 ? (
              <Text className="font-dosis-regular text-[12px] text-text-4 text-center">
                Sin datos
              </Text>
            ) : (
              <View className="items-center">
                <Text className="font-dosis-bold text-[18px] text-text-3">
                  {nutrition.avg_calories.toFixed(0)}
                </Text>
                <Text className="font-dosis-regular text-[12px] text-text-4">
                  kcal
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
            <View key={item.key} className="flex-col items-start gap-y-1.5">
              <Text className="font-dosis-bold text-[14px] text-text-5">
                {item.value.toFixed(1)}g
              </Text>

              <Text className="font-dosis-regular text-[12px] text-text-4">
                {item.label}
              </Text>
              <View
                style={{
                  width: "100%",
                  backgroundColor: item.color,
                  height: 3,
                  marginTop: 8,
                }}
              />
            </View>
          ))}
        </View>
      </View>
      {/** Información adicional */}
      <View className="flex-col items-start justify-between mt-4 gap-y-1">
        <Text className="font-dosis-regular text-[12px] text-text-4">
          Este tipo de visualización nutricional se representa el aporte
          relativo de carbohidratos, grasas y proteínas en términos de calorías
          de la receta.
        </Text>
        <View className="flex-row gap-x-2 items-center">
          <View
            style={{
              width: 4,
              height: 4,
              backgroundColor: "#3578e4",
              borderRadius: 999,
            }}
          />
          <Text className="font-dosis-semibold text-[12px] text-text-4 underline">
            Ingredientes analizados:
          </Text>
          <Text className="font-dosis-regular text-[12px] text-text-4">
            {nutrition.total_ingredients}
          </Text>
        </View>
      </View>
    </View>
  );
}
