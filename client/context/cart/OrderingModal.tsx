import { useOrdering } from "@/context/cart/OrderingContext";
import CustomBottomSheet from "../../components/ui/modals/BottomSheetModal";
import { Text } from "react-native";

const OrderingModal = () => {
  const { opened, items } = useOrdering();

  const isItems: Props =
    items.length > 0
      ? { type: 2, scrollable: true, block: false, modal: true }
      : { type: 1, scrollable: false, block: false, modal: true };

  if (!opened) return null;
  return (
    <CustomBottomSheet {...(isItems as Props)}>
      <Text>Hola</Text>
    </CustomBottomSheet>
  );
};
