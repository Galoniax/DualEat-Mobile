import { createContext, useContext, useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const CART_KEY = process.env.CART_KEY || "dualeat_cart";

export interface CartItem {
  food_id: string;
  local: {
    id: string;
    name: string;
  };
  name: string;
  unit_price: number;
  quantity: number;
}

interface OrderingContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (item_id: string) => CartItem | null;
  open: () => void;
  clear: () => void;
}

const OrderingContext = createContext<OrderingContextType | null>(null);

export const useOrdering = () => {
  const context = useContext(OrderingContext);
  if (!context)
    throw new Error("useOrdering debe ser usado dentro de un OrderingProvider");
  return context;
};

export const OrderingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  // -- ESTADOS PARA MODALS Y CONFLICTOS --
  const [showEmptyCart, setShowEmptyCart] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const open = () => {
    if (items.length > 0) {
      router.push("/(client)/(out)/cart");
    } else {
      setShowEmptyCart(true);
    }
  };

  const clear = () => {
    setItems([]);
    AsyncStorage.removeItem(CART_KEY);
  };

  // -- ITEM EN CONFLICTO --
  const [conflict, setConflict] = useState<CartItem | null>(null);

  useEffect(() => {
    const response = async () => {
      await AsyncStorage.getItem(CART_KEY).then((res) => {
        if (res) {
          setItems(JSON.parse(res));
        }
      });
    };
    response();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
    } else {
      AsyncStorage.removeItem(CART_KEY);
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    if (items.length > 0 && items[0].local.id !== newItem.local.id) {
      setConflict(newItem);
      setShowModal(true);

      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.food_id === newItem.food_id,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.food_id === newItem.food_id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        );
      }
      return [...prevItems, newItem];
    });
  };

  const removeItem = (item_id: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.food_id !== item_id),
    );
    return items.find((item) => item.food_id === item_id) || null;
  };

  const handleReplaceCart = () => {
    if (conflict) {
      setItems([conflict]);
    }
    setShowModal(false);
    setConflict(null);
  };

  const handleKeepCart = () => {
    setShowModal(false);
    setConflict(null);
  };

  return (
    <OrderingContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        open,
        clear,
      }}
    >
      {children}

      <Modal visible={showModal} transparent={true} animationType="fade">
        <Pressable
          onPress={handleKeepCart}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
            }}
            style={{
              width: "80%",
              paddingVertical: 28,
              paddingHorizontal: 22,
              gap: 10,
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
            className="bg-white flex-col items-center py-[30px] px-4 rounded-[10px]"
          >
            <Text className="text-center text-text-3 text-[22px] font-dosis-bold">
              ¿Querés crear un nuevo pedido?
            </Text>

            <Text className="text-center text-text-5 text-[15px] font-dosis-regular mb-6">
              Para hacerlo tenemos que eliminar los productos que agregaste
              anteriormente de{" "}
              <Text className="font-dosis-bold text-black">
                {items[0]?.local.name}
              </Text>
              .
            </Text>

            {/* BOTÓN: REEMPLAZAR */}
            <TouchableOpacity
              onPress={handleReplaceCart}
              style={{ borderRadius: 80 }}
              className="bg-bg-semi-black w-full py-3.5 items-center"
            >
              <Text className="text-white text-[15px] font-dosis-bold">
                Crear carrito nuevo
              </Text>
            </TouchableOpacity>

            {/* BOTÓN: CANCELAR */}
            <TouchableOpacity
              onPress={handleKeepCart}
              style={{ borderRadius: 80 }}
              className="w-full py-3.5 items-center"
            >
              <Text className="text-text-3 text-[15px] font-dosis-bold">
                Mantener mi pedido actual
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </OrderingContext.Provider>
  );
};
