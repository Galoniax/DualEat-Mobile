import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import Toast from "react-native-toast-message";

import "@/app/global.css";
import { useFonts } from "expo-font";

import { useColorScheme } from "../hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";

import {
  LocationProvider,
  useLocation,
} from "@/context/extension/LocationContext";

import { configureNotifications } from "@/utils/notifications";
import * as Location from "expo-location";
import "../tasks/locationTask";

export { ErrorBoundary } from "expo-router";

function RootNavigation() {
  const { user, loading } = useAuth();
  const { location, address } = useLocation();

  const router = useRouter();
  const segments = useSegments();

  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (hasRedirected) {
      return;
    }

    const inAppGroup = segments[0] === "(tabs)";
    const inAuthGroup = segments[0] === "pages";

    if (user && !inAppGroup) {
      router.replace("/(tabs)");
      setHasRedirected(true);
    } else if (!user && !inAuthGroup) {
      router.replace("/(tabs)");
      setHasRedirected(true);
    }
  }, [user, loading, segments]);

  useEffect(() => {
    setHasRedirected(false);
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {/* 1. El "club" (tus pestañas) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 2. La "puerta" (tu login/register en 'pages') */}
      <Stack.Screen
        name="pages/public/login"
        options={{ title: "Login", headerShown: false }}
      />

      {/* 3. Tus otras pantallas (como el modal) */}
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
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
    const startBackgroundTracking = async () => {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de ubicación en segundo plano denegado");
        return;
      }

      // Evitar iniciar la tarea si ya está activa (opcional, pero buena práctica)
      const isTaskStarted = await Location.hasStartedLocationUpdatesAsync(
        "background-location-task"
      );
      if (isTaskStarted) {
        console.log("Location task already started.");
        return;
      }

      await Location.startLocationUpdatesAsync("background-location-task", {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50,
        deferredUpdatesInterval: 1000 * 60,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Seguimiento de ubicación",
          notificationBody: "Estamos detectando tu proximidad a locales",
        },
      });
      console.log("Background location tracking started.");
    };

    startBackgroundTracking();
  }, []);

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Oculta el splash screen
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <LocationProvider>
          <RootNavigation />
        </LocationProvider>
      </AuthProvider>

      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
