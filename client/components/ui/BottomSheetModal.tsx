import React, { forwardRef, useCallback, useMemo } from "react";
import { View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  onDismiss?: () => void;
  type?: 1 | 2;
  block?: boolean;
  scrollable?: boolean;
  modal?: boolean;
  dark?: boolean;
}


const CustomBottomSheet = forwardRef<BottomSheetModal | BottomSheet, Props>(
  ({ children, onDismiss, type = 2, block = false, scrollable = false, modal = false, dark = false }, ref) => {
    const insets = useSafeAreaInsets();

    // 1. Configuración de SnapPoints
    const snapPoints = useMemo(() => {
      if (type === 1) return ["30%"];
      return ["85%"];
    }, [type]);

    // 2. Renderizado del fondo oscuro
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior={"close"}
        />
      ),
      []
    );

    // 3. Estilos y Contenido común
    const commonContent = (
      <>
        {!scrollable ? (
          <BottomSheetView style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}>
            {children}
          </BottomSheetView>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}>
            {children}
          </View>
        )}
      </>
    );

    const commonProps = {
      ref: ref as any,
      index: 0,
      snapPoints: snapPoints,
      enablePanDownToClose: !block,
      enableDynamicSizing: false,
      backgroundStyle: { 
        borderRadius: 30, 
        backgroundColor: dark ? "#1a1a1a" : "#fff"
      },
      handleIndicatorStyle: { backgroundColor: "#aaa", width: 40, height: 5, borderRadius: 99, marginBottom: 2 },
    };

    // --- RENDERIZADO CONDICIONAL ---
    // A. MODO MODAL
    if (modal) {
      return (
        <BottomSheetModal
          {...commonProps}
          onDismiss={onDismiss}
          backdropComponent={renderBackdrop}
        >
          {commonContent}
        </BottomSheetModal>
      );
    }

    // B. MODO STANDARD
    return (
      <BottomSheet
        {...commonProps}
        onClose={onDismiss}
      >
        {commonContent}
      </BottomSheet>
    );
  }
);

CustomBottomSheet.displayName = "CustomBottomSheet";

export default CustomBottomSheet;