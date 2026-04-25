import { Recipe, RecipeStep } from "@/interface/global";
import { getMimeTypeFromUrl } from "@/utils/normalize";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import * as ScreenOrientation from "expo-screen-orientation";

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

  /*const handleFullscreenUpdate = async ({ fullscreenUpdate }: { fullscreenUpdate: VideoFullscreenUpdate }) => {
  switch (fullscreenUpdate) {
    case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
      // Al entrar a pantalla completa, permitimos todas las orientaciones
      await ScreenOrientation.unlockAsync();
      break;
    case VideoFullscreenUpdate.PLAYER_DID_DISMISS:
      // Al salir, bloqueamos de nuevo a vertical (Portrait)
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      break;
  }
};*/

  const renderItem = useCallback(
    ({ item }: { item: RecipeStep }) => {
      const isCurrentStep = index === item.step_number;

      const mediaType = item.image_url
        ? getMimeTypeFromUrl(item.image_url)
        : null;

      return (
        <View className="flex-col items-start gap-x-3 mb-6 w-full">
          {isCurrentStep ? (
            <View className="py-3 w-full flex-col gap-y-2">
              <Text className={`font-dosis-bold text-white text-[22px]`}>
                {isCurrentStep ? "Paso " + item.step_number : ""}
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
              <Text className="font-dosis-bold text-white text-[16px]">
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
              className={`font-dosis-regular text-[16px] text-[#f5f5f5] leading-7 tracking-tight mt-2 ${isCurrentStep ? "" : "opacity-50"}`}
            >
              {item.description}
            </Text>
          )}

          {item.image_url && (
            <View className="mt-2 w-full">
              {mediaType === "video" ? (
                <View></View>
              ) : mediaType === "image" ? (
                <Image
                  source={{ uri: item.image_url }}
                  className="w-full h-30 rounded-lg"
                  style={{ display: isCurrentStep ? "flex" : "none" }}
                  resizeMode="cover"
                />
              ) : null}
            </View>
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
              <Text className="font-dosis-bold text-[12px] text-[#f5f5f5]">
                {item.estimated_time}min
              </Text>
            </View>
          ) : null}
        </View>
      );
    },
    [index],
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
        data={recipe?.steps}
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
          paddingHorizontal: insets.left + insets.right + 30,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <View className="flex-row justify-between gap-x-2 w-full mb-6">
              {recipe?.steps.map((step) => (
                <View
                  key={step.id}
                  style={{ height: 4, borderRadius: 999 }}
                  className={`flex-1 bg-bg-semi-white ${index !== step.step_number ? "opacity-30" : ""}`}
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
              <Text className="font-dosis-semibold text-[12px] text-text-1">
                {index !== 1 ? "Paso anterior" : "Volver"}
              </Text>
              <Feather name="arrow-up" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row gap-x-2 py-3 px-6 justify-center items-center border border-bg-semi-white rounded-[8px] mx-auto mt-8"
              onPress={() => handleNext()}
            >
              <Text className="font-dosis-semibold text-[12px] text-text-1">
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
