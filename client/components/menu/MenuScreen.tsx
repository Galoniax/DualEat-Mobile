import { Food, FoodCategory, Local, User } from "@/interface/global";
import { getLocalBySlug } from "@/services/discovery.api";

import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useEffect, useState } from "react";
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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MenuInfo from "./MenuInfo";

interface MenuScreenProps {
  user: User | null;
  slug: string;
}

type Tab = "Menu" | "Info" | "Reviews";

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

function MenuScreen({ user, slug }: MenuScreenProps) {
  const { items, open } = useOrdering();
  const [state, setState] = useState<Tab>("Menu");
  const { setType } = useLoader();

  const tabOptions: Tab[] = ["Info", "Reviews"];

  const [local, setLocal] = useState<MenuLocal | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetch = async () => {
      try {
        setType("global");
        const response = await getLocalBySlug(slug);
        if (response) {
          setLocal(response.data as MenuLocal);
        }
      } catch (e) {
        console.log("Error consultando el local:", e);
        router.back();
      } finally {
        setType(null);
      }
    };
    fetch();
  }, [slug, setType]);

  const isOpen = isLocalOpen(local?.schedules || []);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-white">
        {/* HEADER */}
        <View className="relative h-[300px]">
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
              onPress={() => router.back()}
              className="w-[38px] h-[38px] justify-center items-center bg-bg-gray rounded-full"
            >
              <Entypo name="chevron-thin-left" size={18} color="#333333" />
            </TouchableOpacity>

            <View className="flex-row bg-bg-gray rounded-full justify-center items-center gap-x-1">
              <TouchableOpacity
                onPress={() => setState("Info")}
                className="w-[38px] h-[38px] justify-center items-center"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#333333"
                />
              </TouchableOpacity>

              <TouchableOpacity className="w-[38px] h-[38px] justify-center items-center">
                <EvilIcons name="heart" size={26} color="#333333" />
              </TouchableOpacity>
            </View>
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
                className={`mb-4`}
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

        <View className="flex-row w-full">
          {state !== "Menu" &&
            tabOptions.map((tab) => {
              const isActive = state === tab;

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setState(tab)}
                  className={`flex-1 items-center py-[14px] border-[#4A4947] ${
                    isActive && "border-b-2"
                  }`}
                >
                  <Text
                    className={`font-dosis-bold text-[15px] ${
                      isActive ? "text-text-5" : "text-text-6"
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* TOCHANGE !isOpen && isOpen */}
        {isOpen ? (
          <View className="px-4 mt-6">
            <Text className="text-text-3 text-[18px] font-dosis-bold mb-2">
              Lo sentimos, este local está cerrado.
            </Text>
            <Text className="text-text-5 text-[14px] font-dosis-regular">
              Por favor, volvé más tarde o explorá otros locales disponibles.
            </Text>
          </View>
        ) : state === "Menu" && local ? (
          <MenuView local={local as MenuLocal} insets={insets} />
        ) : state === "Info" && local ? (
          <MenuInfo local={local as MenuLocal} insets={insets} />
        ) : null}
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
    </View>
  );
}

export default MenuScreen;
