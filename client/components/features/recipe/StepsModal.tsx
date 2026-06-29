import { Recipe, RecipeStep } from "@/interface/global";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StepsModalProps {
  stepsRef: React.RefObject<BottomSheetModal | null>;
  recipe: Recipe;
}

export default function StepsModal({ stepsRef, recipe }: StepsModalProps) {
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ["100%"], []);
  const [index, setIndex] = useState(1);

  const handleNext = useCallback(() => {
    if (index === recipe?.steps.length) {
      setIndex(1);
      stepsRef.current?.dismiss();
      return;
    }
    setIndex((prev) => prev + 1);
  }, [index, recipe?.steps.length, stepsRef]);

  const handleBack = useCallback(() => {
    if (index === 1) {
      stepsRef.current?.dismiss();
      return;
    }
    setIndex((prev) => prev - 1);
  }, [index, stepsRef]);

  const renderItem = useCallback(
    ({ item }: { item: RecipeStep }) => {
      const isCurrentStep = index === item.step_number;

      return (
        <View className="flex-col items-start gap-x-3 mb-6 w-full">
          {isCurrentStep ? (
            <View className="py-3 w-full flex-col gap-y-2">
              <Text className={`font-outfit-bold text-white text-xl`}>
                {isCurrentStep && "Paso " + item.step_number}
              </Text>
              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "#fff",
                }}
              />
            </View>
          ) : (
            <View className="flex-row items-center gap-x-2 opacity-50">
              <Text className="font-outfit-bold text-white text-base">
                {item.step_number}
              </Text>
              <View
                style={{
                  width: "100%",
                  height: 1,
                  borderColor: "#fff",
                  borderTopWidth: 1,
                  borderStyle: "dotted",
                }}
              />
            </View>
          )}

          {(isCurrentStep || item.step_number < index) && (
            <Text
              className={`font-outfit-light text-base text-text-1 leading-7 tracking-tight mt-2 ${isCurrentStep ? "" : "opacity-50"}`}
            >
              {item.description}
            </Text>
          )}

          {item.estimated_time &&
          (isCurrentStep || item.step_number < index) ? (
            <View
              className={`flex-row items-center gap-x-2 mt-2 ${isCurrentStep ? "" : "opacity-50"}`}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="#fff"
              />
              <Text className="font-outfit-bold text-[12px] text-[#f5f5f5]">
                {item.estimated_time}min
              </Text>
            </View>
          ) : null}
        </View>
      );
    },
    [index],
  );

  const sortedSteps = useMemo(
    () => recipe?.steps?.sort((a, b) => a.step_number - b.step_number) || [],
    [recipe?.steps],
  );

  return (
    <BottomSheetModal
      ref={stepsRef}
      snapPoints={snapPoints}
      index={0}
      onDismiss={() => setIndex(1)}
      style={{ flex: 1 }}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleComponent={null}
    >
      <BottomSheetFlatList
        data={sortedSteps}
        keyExtractor={(item: RecipeStep) => item.id}
        extraData={index}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: "#B53325",
        }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: insets.left + insets.right + 12,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <View className="flex-row justify-between gap-x-2 w-full mb-6">
              {recipe?.steps.map((step) => (
                <View
                  key={step.id}
                  style={{ height: 4, borderRadius: 999 }}
                  className={`flex-1 bg-bg-semi-white ${index !== step.step_number && "opacity-30"}`}
                />
              ))}
            </View>

            {/* Botón de retroceso */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => stepsRef.current?.dismiss()}>
                <Feather name="arrow-left" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={renderItem}
        ListFooterComponent={
          <View className="flex-row gap-x-2 justify-evenly">
            <TouchableOpacity
              className="flex-row gap-x-2 py-3 px-6 justify-center items-center border border-bg-semi-white rounded-[8px] mx-auto mt-8"
              onPress={() => handleBack()}
            >
              <Text className="font-outfit-medium text-[12px] text-text-1">
                {index !== 1 ? "Paso anterior" : "Volver"}
              </Text>
              <Feather name="arrow-up" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row gap-x-2 py-3 px-6 justify-center items-center border border-bg-semi-white rounded-[8px] mx-auto mt-8"
              onPress={() => handleNext()}
            >
              <Text className="font-outfit-medium text-[12px] text-text-1">
                {index !== recipe?.steps.length
                  ? "Siguiente paso"
                  : "Finalizar"}
              </Text>
              <Feather
                name={index !== recipe?.steps.length ? "arrow-down" : "check"}
                size={14}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        }
      />
    </BottomSheetModal>
  );
}
