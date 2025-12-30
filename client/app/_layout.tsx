/* eslint-disable react-hooks/exhaustive-deps */
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, SplashScreen, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
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

export { ErrorBoundary } from "expo-router";

function RootNavigation() {
  const { user, loading } = useAuth();
  const { mode } = useAppMode();

  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  if (loading || !isNavigationReady) return;

  const inAuthGroup = segments[0] === "(auth)";
  const inClientGroup = segments[0] === "(client)";

  // 1. Si NO hay usuario, mandar al login
  if (!user) {
    // Solo redirigir si no está ya en el grupo correcto
    if (!inClientGroup) {
      router.replace("/(client)/(tabs)");
    }
    return;
  }

  // 2. Si HAY usuario
  if (user) {
    // Si está en Auth (login/register), sacarlo de ahí
    if (inAuthGroup) {
      router.replace("/(client)/(tabs)");
      return;
    }

    // Solo redirigir si NO está en cliente en absoluto
    // NO redirigir si ya está dentro de las tabs navegando
    if (!inClientGroup) {
      router.replace("/(client)/(tabs)");
      return;
    }
  }

}, [user, loading, isNavigationReady, mode]); 

  if (loading || !isNavigationReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Grupo de autenticación */}
      <Stack.Screen name="(auth)" />

      <Stack.Screen name="(client)/(tabs)" />

      {/* Modal */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Modal",
          headerShown: true,
        }}
      />
    </Stack>
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

        if (status !== "granted") {
          console.log("Permiso de ubicación en segundo plano denegado");
          return;
        }

        const isTaskStarted = await Location.hasStartedLocationUpdatesAsync(
          "background-location-task"
        );

        if (isTaskStarted) {
          console.log("Location task already running");
          return;
        }

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

        console.log("Background location tracking started");
      } catch (error) {
        console.error("Error setting up background location:", error);
      }
    };

    setupBackgroundLocation();
  }, []);

  useEffect(() => {
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
        <AuthProvider>
          <AppModeProvider>
            <LocationProvider>
              <BottomSheetModalProvider>
                <RootNavigation />
              </BottomSheetModalProvider>
            </LocationProvider>
          </AppModeProvider>
        </AuthProvider>

        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
