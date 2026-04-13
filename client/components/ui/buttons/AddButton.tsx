import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CartItem, useOrdering } from "@/context/cart/OrderingContext";

const AddButton = ({
  onAdd,
  item_id,
}: {
  onAdd: () => void;
  item_id: string;
}) => {
  const { items, removeItem } = useOrdering();

  const localQuantity =
    items.find((item: CartItem) => item.food_id === item_id)?.quantity ?? 0;

  const handlePressAdd = () => {
    onAdd();
  };

  const handlePressTrash = () => {
    removeItem(item_id as string);
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        height: 28,
        borderRadius: 16,
        backgroundColor: localQuantity > 0 ? "#111" : "#fff",
        borderColor: localQuantity > 0 ? "#fff" : "#000",
        borderWidth: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        elevation: 3,
        width: 80,
      }}
    >
      <TouchableOpacity onPress={handlePressTrash} hitSlop={10}>
        <Feather name="trash-2" size={14} color={localQuantity > 0 ? "#fff" : "#111"} />
      </TouchableOpacity>

      <Text className="font-dosis-bold text-[13.5px]" style={{ marginHorizontal: 8, color: localQuantity > 0 ? "#fff" : "#111" }}>
        {localQuantity}
      </Text>

      <TouchableOpacity onPress={handlePressAdd} hitSlop={10}>
        <Feather name="plus" size={16} color={localQuantity > 0 ? "#fff" : "#111"} />
      </TouchableOpacity>
    </View>
  );
};

export default AddButton;
