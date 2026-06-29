import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  sheetRef: React.RefObject<BottomSheetModal>;
  handleDelete: () => void;
  handleStartRename: () => void;
}

export default function HistoryModal({
  sheetRef,
  handleDelete,
  handleStartRename,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing={true}
      enableOverDrag={false}
      enablePanDownToClose={true}
      handleIndicatorStyle={{
        backgroundColor: "#2F2F2F",
        marginTop: 4,
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView
        style={{ paddingBottom: insets.bottom + 16 }}
        className="flex-1 justify-center items-center flex-col gap-y-2 px-4"
      >
        <Text className="text-text-3 font-outfit-bold text-sm">Acciones</Text>

        <TouchableOpacity
          onPress={() => {
            handleDelete();
          }}
          className="relative w-full flex-row items-center gap-x-2 py-2"
        >
          <Octicons name="trash" size={20} color="#B53325" />
          <Text className="text-sm font-outfit-light text-text-3">
            Eliminar chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleStartRename();
          }}
          className="relative w-full flex-row items-center gap-x-2 py-2"
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="#3578e4"
          />
          <Text className="text-sm font-outfit-light text-text-3">
            Cambiar título
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
