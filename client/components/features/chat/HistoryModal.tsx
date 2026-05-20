import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";

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
  const snapPoints = useMemo(() => ["30%"], []);
  return (
    <BottomSheetModal
      snapPoints={snapPoints}
      index={0}
      ref={sheetRef}
      style={{ flex: 1 }}
      enableDynamicSizing={false}
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
      <BottomSheetView className="flex-1 justify-center items-center flex-col gap-y-4 px-4">
        <Text className="text-text-3 font-dosis-bold text-[14px]">
          Acciones
        </Text>

        <TouchableOpacity
          onPress={() => {
            handleDelete();
          }}
          className="relative w-full flex-row items-center justify-center gap-x-2 py-2"
        >
          <Octicons
            className="absolute left-0"
            name="trash"
            size={20}
            color="#B53325"
          />
          <Text className="text-[14px] font-dosis-regular text-text-3">
            Eliminar chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleStartRename();
          }}
          className="relative w-full flex-row items-center justify-center gap-x-2 py-2"
        >
          <MaterialCommunityIcons
            className="absolute left-0"
            name="pencil-outline"
            size={20}
            color="#3578e4"
          />
          <Text className="text-[14px] font-dosis-regular text-text-3">
            Cambiar título
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
