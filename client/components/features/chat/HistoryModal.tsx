import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { ChatHistory } from "@/hooks/api/chat/useHistory";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";

interface Props {
  sheetRef: React.RefObject<BottomSheetModal>;
  setSelected: (selected: ChatHistory | null) => void;
  handleDelete: () => void;
  handleStartRename: () => void;
}

export default function HistoryModal({
  sheetRef,
  setSelected,
  handleDelete,
  handleStartRename,
}: Props) {
  const snapPoints = useMemo(() => ["25%"], []);
  return (
    <BottomSheetModal
      snapPoints={snapPoints}
      index={0}
      ref={sheetRef}
      style={{ flex: 1 }}
      onDismiss={() => setSelected(null)}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      handleIndicatorStyle={{
        backgroundColor: "#B53325",
        width: 35,
        height: 4,
        borderRadius: 9999,
        marginBottom: 3,
        marginTop: 5,
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
      <View className="flex-1 px-6">
        <Text className="text-[17px] font-dosis-bold text-text-5 text-center">
          Acciones
        </Text>

        <View className="flex-col gap-y-4 mt-2">
          <TouchableOpacity
            onPress={() => {
              handleDelete();
            }}
            className="flex-row items-center gap-x-2 py-2"
          >
            <Octicons name="trash" size={18} color="#B53325" />
            <Text className="text-[16px] font-dosis-regular text-text-5">
              Eliminar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleStartRename();
            }}
            className="flex-row items-center gap-x-2 py-2"
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#3578e4"
            />
            <Text className="text-[16px] font-dosis-regular text-text-5">
              Cambiar nombre
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
