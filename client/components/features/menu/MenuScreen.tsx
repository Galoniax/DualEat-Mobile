import { Food, FoodCategory, Local } from "@/interface/global";
import { getLocalBySlug } from "@/services/discovery.api";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MenuView from "./MenuView";
import { useOrdering } from "@/context/cart/OrderingContext";
import { formatPrice } from "@/utils/distance";
import { isLocalOpen } from "@/utils/isLocalOpen";
import { useLoader } from "@/context/app/LoadingContext";
import { router, useFocusEffect } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBottomSheet from "../../ui/modals/BottomSheetModal";
import { useQuery } from "@tanstack/react-query";
import MenuInfo from "./MenuInfo";

export interface MenuFood extends Food {
  original_price: number;
  discount_pct_applied: number | null;
  ends_at?: string;
  sales_count?: number;
}

export interface MenuCategory extends Omit<FoodCategory, "foods"> {
  foods: MenuFood[];
}

export interface MenuLocal extends Omit<Local, "categories"> {
  categories?: MenuCategory[];
}

type Tab = "Menu" | "Info" | "Reviews";

function MenuScreen({ slug }: { slug: string }) {
  const { items, open } = useOrdering();
  const { setType } = useLoader();

  const [state, setState] = useState<Tab>("Menu");

  const refModal = useRef<BottomSheetModal>(null);

  const insets = useSafeAreaInsets();

  const {
    data: local,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["local", "by-slug", slug],
    enabled: !!slug,

    queryFn: async () => {
      const response = await getLocalBySlug(slug);
      if (response) {
        return response.data as MenuLocal;
      }
    },
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (isLoading) {
      setType("minimal");
    } else {
      setType(null);
    }
    return () => {
      setType(null);
    };
  }, [isLoading, setType]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const isOpen = isLocalOpen(local?.schedules || []);

  const MENU_BUTTONS = [
    {
      id: "Menu",
      label: "Menú del local",
      iconName: "list-outline",
    },
    {
      id: "Info",
      label: "Información del local",
      iconName: "information-circle-outline",
    },
    {
      id: "Reviews",
      label: "Leer opiniones",
      iconName: "star-outline",
    },
    {
      id: "Share",
      label: "Compartir",
      iconName: "share-outline",
    },
  ] as const;

  const handleButtonPress = (id: "Menu" | "Info" | "Reviews" | "Share") => {
    switch (id) {
      case "Menu":
        setState("Menu");
        break;
      case "Info":
        setState("Info");
        break;
      case "Reviews":
        setState("Reviews");
        break;
      case "Share":
        console.log("Share");
        break;
    }
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-white">
        {/* HEADER */}
        <View className="relative h-[250px]">
          <ImageBackground
            className="absolute top-0 left-0 right-0 w-full h-[100%]"
            resizeMode="cover"
            source={{ uri: local?.image_url || undefined }}
          >
            <View className="flex-1 bg-black/50" />
          </ImageBackground>

          {/* NAV & FAVORITE */}
          <View
            className="flex-row justify-between items-center px-4"
            style={{
              paddingTop: insets.top + 10,
              paddingHorizontal: insets.right + insets.left + 10,
            }}
          >
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
              }}
              onPress={() => router.back()}
              className="justify-center items-center rounded-full"
            >
              <Entypo name="chevron-thin-left" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
              }}
              onPress={() => refModal.current?.present()}
              className="rounded-full justify-center items-center"
            >
              <Entypo name="dots-three-vertical" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* INFO & SECTIONS*/}
          <View className="flex-col justify-center items-center h-[50%] absolute bottom-2 left-0 right-0">
            {!isOpen && (
              <View
                style={{
                  backgroundColor: "#B53325",
                  borderWidth: 1,
                  borderColor: "#fff",
                  borderRadius: 9999,
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                }}
                className={`mb-2`}
              >
                <Text
                  className={`text-[12px] text-text-1 font-dosis-bold ${isOpen ? "text-green-700" : "text-red-700"}`}
                >
                  Cerrado
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-x-3">
              <Text className="text-[28px] font-dosis-bold text-text-1">
                {local?.name}
              </Text>
              <View className="flex-row items-center gap-x-1">
                <FontAwesome name="star" size={12} color="#fff" />
                <Text className="text-[12px] font-dosis-bold text-white">
                  {local?.average_rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {state === "Menu" && (
          <MenuView local={local as MenuLocal} insets={insets} />
        )}

        {state === "Info" && (
          <MenuInfo local={local as MenuLocal} insets={insets} />
        )}
      </ScrollView>

      {/* CARRITO */}
      {items.length > 0 && items[0].local.id === local?.id && (
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1.5,
            borderTopColor: "#333333",
            width: "100%",
            gap: 10,
          }}
          className="bg-bg-semi-white flex-row items-center justify-center"
        >
          <View className="flex-col gap-0.5 flex-1 items-start">
            <Text className="text-text-5 text-[13.5px] font-dosis-regular">
              {items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
              {items.reduce((acc, item) => acc + item.quantity, 0) === 1
                ? "producto"
                : "productos"}
            </Text>
            <Text className="text-text-3 text-[17px] font-dosis-bold">
              {formatPrice(
                items.reduce(
                  (acc, item) => acc + item.unit_price * item.quantity,
                  0,
                ),
              )}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => open()}
            className="bg-bg-red py-3 flex-[3] rounded-full items-center"
          >
            <Text className="text-white font-dosis-bold text-[14px]">
              Ver carrito
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL */}
      <CustomBottomSheet
        ref={refModal}
        type={1}
        block={true}
        onDismiss={() => refModal.current?.dismiss()}
      >
        <View className="flex-col gap-4">
          <View className="flex-row items-center relative justify-center mb-1">
            <Text
              style={{ fontSize: 20 }}
              className="text-text-3 font-dosis-bold"
            >
              {local?.name}
            </Text>
            <TouchableOpacity
              onPress={() => refModal.current?.dismiss()}
              className="absolute right-0"
            >
              <Ionicons name="close" size={22} color="#333333" />
            </TouchableOpacity>
          </View>

          {MENU_BUTTONS.map((button) => (
            <TouchableOpacity
              key={button.id}
              className="flex-row items-center justify-between"
              onPress={() => {
                handleButtonPress(button.id);
                refModal.current?.dismiss();
              }}
            >
              <View className="flex-row gap-4 items-center">
                <Ionicons name={button.iconName} size={14} color="#707070" />

                <Text className="text-text-3 text-[14px] font-dosis-medium">
                  {button.label}
                </Text>
              </View>

              <Feather name="chevron-right" size={18} color="#333333" />
            </TouchableOpacity>
          ))}
        </View>
      </CustomBottomSheet>
    </View>
  );
}

export default MenuScreen;
