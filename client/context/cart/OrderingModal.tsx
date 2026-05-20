import { BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import { CartItem } from "./OrderingContext";

interface Props {
  type: "empty" | "conflict";
  items: CartItem[];
  handleCart: (action: "keep" | "replace") => void;
}

export default function OrderingModal({ type, items, handleCart }: Props) {
  const insets = useSafeAreaInsets();

  const renderContent = () => {
    switch (type) {
      case "empty":
        return (
          <BottomSheetView
            style={{
              paddingHorizontal: insets.left + insets.right + 16,
            }}
            className="flex-col flex-1 items-center justify-center gap-y-2"
          >
            <Svg width={30} height={30} viewBox="0 0 640 640">
              <Path
                fill="#4A4947"
                d="M560.3 301.2C570.7 313 588.6 315.6 602.1 306.7C616.8 296.9 620.8 277 611 262.3L563 190.3C560.2 186.1 556.4 182.6 551.9 180.1L351.4 68.7C332.1 58 308.6 58 289.2 68.7L88.8 180C83.4 183 79.1 187.4 76.2 192.8L27.7 282.7C15.1 306.1 23.9 335.2 47.3 347.8L80.3 365.5L80.3 418.8C80.3 441.8 92.7 463.1 112.7 474.5L288.7 574.2C308.3 585.3 332.2 585.3 351.8 574.2L527.8 474.5C547.9 463.1 560.2 441.9 560.2 418.8L560.2 301.3zM320.3 291.4L170.2 208L320.3 124.6L470.4 208L320.3 291.4zM278.8 341.6L257.5 387.8L91.7 299L117.1 251.8L278.8 341.6z"
              />
            </Svg>
            <Text className="font-dosis-bold text-[18px] text-text-3">
              No tenés productos en el carrito
            </Text>
            <Text className="text-center text-text-4 text-[14px] font-dosis-regular">
              Los productos que selecciones se guardarán aquí hasta que realices
              tu pedido.
            </Text>
          </BottomSheetView>
        );
      case "conflict":
        return (
          <BottomSheetView
            style={{
              paddingHorizontal: insets.left + insets.right + 16,
              paddingBottom: insets.bottom + 16,
            }}
            className="flex-col flex-1 items-center justify-center gap-y-2"
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
              onPress={() => handleCart("replace")}
              style={{ borderRadius: 80 }}
              className="bg-bg-semi-black w-full py-3.5 items-center"
            >
              <Text className="text-white text-[15px] font-dosis-bold">
                Crear carrito nuevo
              </Text>
            </TouchableOpacity>

            {/* BOTÓN: CANCELAR */}
            <TouchableOpacity
              onPress={() => handleCart("keep")}
              style={{ borderRadius: 80 }}
              className="w-full py-3.5 items-center"
            >
              <Text className="text-text-3 text-[15px] font-dosis-bold">
                Mantener mi pedido actual
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        );
    }
  };

  return renderContent();
}
