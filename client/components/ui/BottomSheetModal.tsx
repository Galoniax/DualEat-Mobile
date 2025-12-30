import React, { forwardRef, useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

interface Props {
  children: React.ReactNode;
  snapPoints?: string[];
  onDismiss?: () => void;
  type?: "small" | "large";
}

export type CustomBottomSheetRef = BottomSheetModal;
const CustomBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ children, onDismiss, type }, ref) => {

    const points = useMemo(() => (type === "small" ? ['30%'] : ['85%']), [type]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={1} 
        snapPoints={points}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

CustomBottomSheet.displayName = 'CustomBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});

export default CustomBottomSheet;