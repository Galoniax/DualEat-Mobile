import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";
import "@/app/global.css";
import { useFonts } from "expo-font";
import { useColorScheme } from "../hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { LocationProvider } from "@/context/extension/LocationContext";
import { configureNotifications } from "@/utils/notifications";
import * as Location from "expo-location";
import "../tasks/locationTask";
import { AppModeProvider, useAppMode } from "@/context/app/AppModeContext";
import { useRedirect } from "@/hooks/useRedirect";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { LoaderProvider, useLoader } from "@/context/app/LoadingContext";

export { ErrorBoundary } from "expo-router";

function RootNavigation() {
  const { loading, type } = useLoader();

  const { mode } = useAppMode();

  const { authReady } = useAuth();

  useRedirect();

  if (!authReady || mode === null) {
    return <LoadingScreen type="global" />;
  }

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(local)" />
      </Stack>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <LoadingScreen type={type} />
        </View>
      )}
    </View>
  );
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    "Dosis-Bold": require("@/assets/fonts/Dosis-Bold.ttf"),
    "Dosis-Regular": require("@/assets/fonts/Dosis-Regular.ttf"),
    "Dosis-Light": require("@/assets/fonts/Dosis-Light.ttf"),
    "Dosis-Medium": require("@/assets/fonts/Dosis-Medium.ttf"),
    "Dosis-SemiBold": require("@/assets/fonts/Dosis-SemiBold.ttf"),
  });

  useEffect(() => {
    const setupBackgroundLocation = async () => {
      try {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status !== "granted") return;
        const isTaskStarted = await Location.hasStartedLocationUpdatesAsync(
          "background-location-task",
        );
        if (isTaskStarted) return;
        await Location.startLocationUpdatesAsync("background-location-task", {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,
          deferredUpdatesInterval: 60000,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Seguimiento de ubicación",
            notificationBody: "Detectando proximidad a locales",
          },
        });
      } catch (e) {
        console.log("Error al configurar la ubicación en segundo plano", e);
      }
    };
    setupBackgroundLocation();
    configureNotifications();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <LoaderProvider>
          <AuthProvider>
            <AppModeProvider>
              <LocationProvider>
                <BottomSheetModalProvider>
                  <RootNavigation />
                </BottomSheetModalProvider>
              </LocationProvider>
            </AppModeProvider>
          </AuthProvider>
        </LoaderProvider>

        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
