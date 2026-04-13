import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LinearGradient from "react-native-linear-gradient";

import { useEffect, useRef } from "react";

interface LoadingType {
  type: "global" | "minimal" | null;
}

const LoadingScreen = ({ type }: LoadingType) => {
  const Logo = require("@/assets/icon/LogoDualEat.png");

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const colors = ["#B53325", "#d33325", "#e5a657", "#d5a657"];

  if (type === "minimal") {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ImageBackground style={{ opacity: 0.98 }} className="absolute inset-0 z-[-1] bg-black min-h-full w-full" />
        <Image
          source={Logo}
          className="w-[40px] h-[40px] object-contain mb-8"
        />
        <ActivityIndicator color="#3578e4" size={24} />
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView className={`flex-1 justify-center items-center`}>
        <Animated.View
          style={{
            position: "absolute",
            width: "300%",
            height: "250%",
            transform: [{ rotate }],
          }}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>

        <Image
          source={Logo}
          className="w-[40px] h-[40px] object-contain mb-8"
        />
        <ActivityIndicator color="#fff" size={24} />
      </SafeAreaView>
    );
  }
};

export default LoadingScreen;
