import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import OrderingModal from "./OrderingModal";

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
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);

  const [modals, setModals] = useState({
    empty: false,
    conflict: false,
  });

  const cartRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (modals.empty || modals.conflict) {
      cartRef.current?.present();
    } else {
      cartRef.current?.dismiss();
    }
  }, [modals]);

  const open = () => {
    if (items.length > 0) {
      router.push("/(client)/(out)/cart");
    } else {
      setModals((prev) => ({
        ...prev,
        empty: true,
      }));
    }
  };

  const clear = () => {
    setItems([]);
    AsyncStorage.removeItem(CART_KEY);
  };

  const [conflict, setConflict] = useState<CartItem | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      const saved = await AsyncStorage.getItem(CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
      setIsLoaded(true);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const syncData = async () => {
      if (items.length > 0) {
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
      } else {
        await AsyncStorage.removeItem(CART_KEY);
      }
    };
    syncData();
  }, [items, isLoaded]);

  const addItem = (newItem: CartItem) => {
    if (items.length > 0 && items[0].local.id !== newItem.local.id) {
      setConflict(newItem);
      setModals((prev) => ({
        ...prev,
        conflict: true,
      }));
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

  const handleCart = (action: "keep" | "replace") => {
    if (action === "replace") {
      if (conflict) {
        setItems([conflict]);
      }
    }
    setModals((prev) => ({
      ...prev,
      conflict: false,
    }));
    setConflict(null);
  };

  const snapPoints = useMemo(() => {
    return modals.empty ? ["30%"] : ["35%"];
  }, [modals]);

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

      <BottomSheetModal
        ref={cartRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableDynamicSizing={false}
        onDismiss={() =>
          setModals((prev) => ({
            ...prev,
            empty: false,
            conflict: false,
          }))
        }
        index={0}
        handleIndicatorStyle={{
          backgroundColor: "#2F2F2F",
          marginTop: 8,
          marginBottom: 16,
        }}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fefefe",
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.6}
            pressBehavior="close"
          />
        )}
      >
        <OrderingModal
          type={modals.empty ? "empty" : "conflict"}
          items={items}
          handleCart={handleCart}
        />
      </BottomSheetModal>
    </OrderingContext.Provider>
  );
};
