import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "@/app/global.css";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { LocationProvider } from "@/context/extension/LocationContext";
import { configureNotifications } from "@/utils/notifications";
import * as Location from "expo-location";
import "../tasks/locationTask";
import { useRedirect } from "@/hooks/router/useRedirect";
import LoadingScreen from "@/components/ui/feedback/LoadingScreen";
import { LoaderProvider, useLoader } from "@/context/app/LoadingContext";
import { OrderingProvider } from "@/context/cart/OrderingContext";
import { AppModeProvider, useAppMode } from "@/context/app/AppModeContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export { ErrorBoundary } from "expo-router";

function RootNavigation() {
  const { loading, type } = useLoader();
  const { authReady } = useAuth();
  const { mode } = useAppMode();

  useRedirect();

  if (!authReady || mode === null) {
    return <LoadingScreen type="global" />;
  }

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />

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

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={client}>
        <ThemeProvider value={DefaultTheme}>
          <LoaderProvider>
            <AuthProvider>
              <AppModeProvider>
                <LocationProvider>
                  <OrderingProvider>
                    <BottomSheetModalProvider>
                      <RootNavigation />
                    </BottomSheetModalProvider>
                  </OrderingProvider>
                </LocationProvider>
              </AppModeProvider>
            </AuthProvider>
          </LoaderProvider>

          <StatusBar style="inverted" animated />
        </ThemeProvider>
      </QueryClientProvider>
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
