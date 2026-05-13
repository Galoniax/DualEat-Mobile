import {
  Image,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatPrice } from "@/utils/distance";
import { useOrdering } from "@/context/cart/OrderingContext";
import { useMemo, useState } from "react";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AddButton from "../../ui/buttons/AddButton";
import { MenuLocal } from "@/app/(client)/(out)/l/[local_id]/[local_slug]";
import { EdgeInsets } from "react-native-safe-area-context";

interface MenuViewProps {
  local: MenuLocal;
  insets: EdgeInsets;
}

function MenuView({ local, insets }: MenuViewProps) {
  const { addItem } = useOrdering();

  const filter = {
    descuentos: false,
    masVendidos: false,
    precioLower: false,
    favoritos: false,
  };

  type FilterKey = keyof typeof filter;

  const FILTER_OPTIONS: { name: string; key: FilterKey }[] = [
    { name: "Descuentos", key: "descuentos" },
    { name: "Más Vendidos", key: "masVendidos" },
    { name: "Precio", key: "precioLower" },
  ];

  const [filters, setFilters] = useState<typeof filter>(filter);

  const toggleFilter = (key: keyof typeof filter) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const { processedCategories, topSellingIds, topDiscounts } = useMemo(() => {
    if (!local || !local.categories) {
      return {
        processedCategories: [],
        topSellingIds: new Set(),
        topDiscounts: [],
      };
    }

    // 1. Procesar categorías
    const processed = local.categories
      .map((cat) => {
        let foods = [...cat.foods];

        if (filters.descuentos) {
          foods = foods.filter(
            (food) =>
              food.discount_pct_applied && food.discount_pct_applied > 0,
          );
        }

        if (filters.precioLower) {
          foods.sort((a, b) => a.price - b.price);
        }

        if (filters.masVendidos) {
          foods.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        }

        return { ...cat, foods };
      })
      .filter((cat) => cat.foods.length > 0);

    // 2. Top selling IDs
    const topSelling = new Set(
      local.categories
        .flatMap((cat) => cat.foods)
        .filter((food) => (food.sales_count || 0) > 0)
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 3)
        .map((food) => food.id),
    );

    // 3. Top discounts
    const discounts = processed
      .flatMap((cat) => cat.foods)
      .filter(
        (food) => food.discount_pct_applied && food.discount_pct_applied > 0,
      )
      .sort(
        (a, b) => (b.discount_pct_applied || 0) - (a.discount_pct_applied || 0),
      )
      .slice(0, 4);

    return {
      processedCategories: processed,
      topSellingIds: topSelling,
      topDiscounts: discounts,
    };
  }, [local.categories, filters]);

  if (!local) return null;

  const menuSections =
    processedCategories?.map((categoria) => ({
      title: categoria.name,
      data: categoria.foods,
    })) || [];

  return (
    <View
      style={{
        paddingTop: insets.top - 18,
        paddingLeft: insets.left + 16,
        paddingRight: insets.right + 16,
      }}
      className="flex-1"
    >
      {/* FILTROS */}
      <View className="w-full mb-4 bg-bg-semi-white">
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            gap: 24,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <View className="flex-row items-center gap-x-2 mt-2">
            <FontAwesome5 name="utensils" size={11} color="#2F2F2F" />
            <Text className="text-[13px] font-dosis-bold text-text-3 mb-2">
              Menú
            </Text>
          </View>
          {FILTER_OPTIONS.map(({ name, key }) => {
            const isActive = filters[key];
            return (
              <TouchableOpacity
                key={key}
                onPress={() => toggleFilter(key)}
                className={`py-1 px-2 rounded-full ${
                  isActive ? "bg-bg-semi-black border-white border" : " "
                }`}
              >
                <Text
                  className={`text-[13px] font-dosis-bold ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. LOS MEJORES DESCUENTOS */}
      {/*{topDiscounts && topDiscounts.length > 0 && (
        <View className="mb-10">
          <Text className="text-[20px] font-dosis-bold text-text-3 mb-4">
            Los mejores descuentos
          </Text>

          
          <View className="flex-row flex-wrap justify-between">
            {topDiscounts.map((item) => (
              <View key={item.id} style={{ width: "100%", marginBottom: 16 }}>
                {renderFoodItem({ item }, "row")}
              </View>
            ))}
          </View>
        </View>
      )}*/}

      {/* 3. CATEGORÍAS */}
      <SectionList
        scrollEnabled={false}
        sections={menuSections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section: { title, data } }) =>
          data.length > 0 ? (
            <Text className="text-[20px] font-dosis-bold mb-4 bg-white">
              {title}
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const total_votes = item.votes_down + item.votes_up;
          const rating =
            total_votes > 0 ? (item.votes_up / total_votes) * 5 : 0;

          return (
            <View
              style={{ gap: 12, marginBottom: 28 }}
              className="flex-row-reverse justify-between flex-1 w-full"
            >
              {/* Imagen del producto */}
              <View
                style={{
                  flex: 1.2,
                  height: 120,
                  borderRadius: 15,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Image
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  }}
                  resizeMode="cover"
                  source={{ uri: item.image_url }}
                />

                <View
                  style={{ marginHorizontal: 10, marginVertical: 8 }}
                  className={`absolute top-0 left-0 right-0 flex-row items-start
                  ${item.discount_pct_applied ? "justify-between" : "justify-end"}`}
                >
                  {item.discount_pct_applied &&
                    item.discount_pct_applied > 0 && (
                      <View className="py-[3px] px-2 border border-[#fff] bg-bg-red rounded-bl-[0px] rounded-tl-[10px] rounded-[18px] flex-row items-center gap-1">
                        <Text className="text-text-1 text-[12px] font-dosis-bold">
                          {item.discount_pct_applied}% OFF
                        </Text>
                      </View>
                    )}
                </View>

                <AddButton
                  onAdd={() =>
                    addItem({
                      food_id: item.id,
                      local: {
                        id: item.local_id,
                        name: local.name,
                      },
                      name: item.name,
                      unit_price: item.price,
                      quantity: 1,
                    })
                  }
                  item_id={item.id}
                />
              </View>

              {/* Detalles del producto */}
              <View className="flex-col flex-[2]">
                <View className="flex-row items-center gap-2">
                  {rating.toFixed(1) === "0.0" ? null : (
                    <View className="flex-row items-center gap-x-0.5">
                      <FontAwesome name="star" size={11} color="#000" />

                      <Text className="text-[11.5px] font-dosis-bold text-text-3 ml-1">
                        {rating.toFixed(1)}
                      </Text>

                      <Text className="text-[11.5px] font-dosis-regular text-text-3 ml-1">
                        ({total_votes})
                      </Text>
                    </View>
                  )}
                  {topSellingIds.has(item.id) && (
                    <Text className="text-[11px] font-dosis-bold text-bg-red">
                      Más vendido
                    </Text>
                  )}
                </View>
                <Text className="font-dosis-bold text-[16px] mb-2">
                  {item.name}
                </Text>
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={2}
                  className="font-dosis-regular text-[13.5px] mb-2"
                >
                  {item.description}
                </Text>

                <View className="flex-row gap-x-2 items-center">
                  <Text className="font-dosis-bold text-[17px] text-text-3">
                    {formatPrice(item.price)}
                  </Text>
                  {item.price !== item.original_price && (
                    <Text className="line-through text-[11.5px] text-text-4 tracking-[-0.5px]">
                      {formatPrice(item.original_price)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

export default MenuView;
