import React, { forwardRef, useCallback } from "react";
import {
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
}

const CustomBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ children, onDismiss, type = 2, block = false }, ref) => {
    const insets = useSafeAreaInsets();

    // 2. Renderizado del fondo oscuro
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior={"close"}
        />
      ),
      [],
    );

    // 3. Estilos y Contenido común
    const commonContent = (
      <BottomSheetView
        style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
      >
        {children}
      </BottomSheetView>
    );

    const commonProps = {
      ref: ref as any,
      index: 0,
      enablePanDownToClose: true,
      enableOverDrag: false,
      enableDynamicSizing: true,
      backgroundStyle: {
        borderRadius: 20,
        backgroundColor: "#fefefe",
      },
      handleIndicatorStyle: {
        backgroundColor: block ? "transparent" : "#aaa",
        width: 40,
        height: block ? 0 : 5,
        borderRadius: 99,
        marginBottom: block ? 0 : 2,
      },
    };

    return (
      <BottomSheetModal
        {...commonProps}
        onDismiss={onDismiss}
        backdropComponent={renderBackdrop}
      >
        {commonContent}
      </BottomSheetModal>
    );
  },
);

CustomBottomSheet.displayName = "CustomBottomSheet";

export default CustomBottomSheet;