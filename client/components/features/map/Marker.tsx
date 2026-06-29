import { LocalType } from "@/constants/constants";
import { Local } from "@/interface/global";
import React, { useRef, useEffect } from "react";
import { View, Text } from "react-native";
import ViewShot from "react-native-view-shot";

import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  loc: Local;
  onCaptured: (id: string, uri: string) => void;
}

const PinMarker = ({ loc, onCaptured }: Props) => {
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewShotRef.current && viewShotRef.current.capture) {
        viewShotRef.current
          .capture()
          .then((uri: string) => {
            onCaptured(loc.id, uri);
          })
          .catch((e: any) => console.log("Error captura:", e));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loc.id, onCaptured]);

  const MaterialIconsMap: Record<LocalType, { icon: string; color: string }[]> =
    {
      Hamburguesería: [{ icon: "lunch_dining", color: "#D9441A" }],
      Rápida: [{ icon: "fastfood", color: "#ffcf40" }],
      Pizzería: [{ icon: "local_pizza", color: "#FFA500" }],
      Italiano: [{ icon: "dinner_dining", color: "#DC143C" }],
      Vegano: [{ icon: "avocado_bean", color: "#93C572" }],
      Sushi: [{ icon: "takeout_dining", color: "#F88379" }],
      Restaurante: [{ icon: "restaurant", color: "#848884" }],
      Cafetería: [{ icon: "coffee", color: "#A95C68" }],
      Heladería: [{ icon: "icecream", color: "#4169E1" }],
      Parrilla: [{ icon: "outdoor_grill", color: "#E34234" }],
      Bar: [{ icon: "liquor", color: "#FADA5E" }],
    };

  const icon =
    MaterialIconsMap[loc.type_local as LocalType]?.[0] ||
    MaterialIconsMap.Restaurante[0];

  const rating =
    loc.average_rating.toFixed(1) !== "0.0"
      ? loc.average_rating.toFixed(1)
      : null;

  console.log(`Icono para tipo "${loc.type_local}":`, icon);

  return (
    <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
      <View className="pt-8 relative items-center justify-center flex-col">
        {/** MEJOR PROMOCIÓN */}
        {loc.promotions &&
          loc.promotions.length > 0 &&
          loc.promotions[0].discount_pct && (
            <View className="absolute top-[5px] z-10 flex items-center justify-center">
              <View className="bg-bg-semi-white border-2 border-bg-red rounded-t-[7px] h-8 px-1 pb-[2px] pt-[1px] min-w-[24px] flex items-center justify-center">
                <Text className="text-[12px] font-outfit-bold text-center text-[#B53325]">
                  -{loc.promotions[0].discount_pct}%
                </Text>
              </View>
            </View>
          )}

        {/** ICON/RATING */}
        <View
          style={{ minWidth: 40, borderWidth: 1, borderColor: "#707070" }}
          className={`flex-row bg-bg-gray py-[4px] rounded-full items-center z-20 gap-1 px-[12px]
          ${rating ? "justify-between" : "justify-center"}
        `}
        >
          <View
            style={{
              backgroundColor: `${icon.color}1A`,
              paddingVertical: 2,
              paddingHorizontal: 8,
              borderRadius: 9999,
            }}
          >
            <MaterialIcons
              name={icon.icon as any}
              size={20}
              color={icon.color}
            />
          </View>
          {rating ? (
            <Text className="text-[14px] font-outfit-bold text-text-3">
              {rating}
            </Text>
          ) : null}
        </View>

        {/** NOMBRE DEL LOCAL */}
        <Text
          style={{ maxWidth: 100 }}
          className="text-[13px] text-center font-outfit-bold text-text-3 mt-1"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {loc.name}
        </Text>
      </View>
    </ViewShot>
  );
};

export default PinMarker;
