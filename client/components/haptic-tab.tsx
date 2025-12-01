import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePressIn = (ev?: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    props.onPressIn?.(ev);
  };

  const handlePress = (ev?: any) => {
    console.log('HapticTab onPress', ev);
    // console.log('HapticTab onPress', ev);
    props.onPress?.(ev);
  };

  return (
    <PlatformPressable
      {...props}
      onPressIn={handlePressIn}
      onPress={handlePress}
    />
  );
}