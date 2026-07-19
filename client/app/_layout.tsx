import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Updates from "expo-updates";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "@/app/global.css";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { LocationProvider } from "@/context/extension/LocationContext";
import LoadingScreen from "@/components/ui/feedback/LoadingScreen";
import { LoaderProvider, useLoader } from "@/context/app/LoadingContext";
import { OrderingProvider } from "@/context/cart/OrderingContext";
import { AppModeProvider, useAppMode } from "@/context/app/AppModeContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/context/other/SocketContext";
import { NotificationProvider } from "@/context/other/NotificationsProvider";

import Toast from "react-native-toast-message";
import { toastConfig } from "@/toast-config";

import { configureNotifications } from "@/utils/notifications";
import { registerBackgroundWeatherTask } from "@/services/weatherNotifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { RotateCcw } from "lucide-react-native";

export { ErrorBoundary } from "expo-router";

function RootNavigation() {
  const { loading, type } = useLoader();
  const { authReady } = useAuth();
  const { mode } = useAppMode();

  const { isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    async function checkAndFetchUpdatesOnLaunch() {
      if (!Updates.isEnabled) {
        return;
      }
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch (err) {
        console.log(
          "Error al buscar/descargar actualizaciones al inicio:",
          err,
        );
      }
    }
    checkAndFetchUpdatesOnLaunch();
  }, []);

  if (!authReady || mode === null) {
    return <LoadingScreen type="global" />;
  }

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />

      {isUpdatePending && (
        <SafeAreaView
          edges={["bottom", "left", "right"]}
          style={{ zIndex: 9999 }}
          className="w-full absolute left-0 right-0 top-[85px] flex-row items-center"
        >
          <TouchableOpacity
            onPress={() => Updates.reloadAsync()}
            activeOpacity={0.8}
            className="flex-row items-center justify-between gap-x-2 w-full bg-bg-blue p-4"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles" size={14} color="#FFF" />
              <Text className="font-outfit-light text-text-1 text-sm">
                Actualización disponible
              </Text>
            </View>
            <RotateCcw color="#FFF" size={16} />
          </TouchableOpacity>
        </SafeAreaView>
      )}

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
    "Outfit-Thin": require("@/assets/fonts/Outfit-Thin.ttf"),
    "Outfit-ExtraLight": require("@/assets/fonts/Outfit-ExtraLight.ttf"),
    "Outfit-Light": require("@/assets/fonts/Outfit-Light.ttf"),
    "Outfit-Regular": require("@/assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("@/assets/fonts/Outfit-Medium.ttf"),
    "Outfit-Bold": require("@/assets/fonts/Outfit-Bold.ttf"),
    "Outfit-ExtraBold": require("@/assets/fonts/Outfit-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    async function setupNotificationsAndTasks() {
      try {
        await configureNotifications();
        await registerBackgroundWeatherTask();
      } catch (err) {
        console.log("Error configuring notifications or tasks:", err);
      }
    }
    setupNotificationsAndTasks();
  }, []);

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
                <SocketProvider>
                  <NotificationProvider>
                    <LocationProvider>
                      <BottomSheetModalProvider>
                        <OrderingProvider>
                          <RootNavigation />
                        </OrderingProvider>
                      </BottomSheetModalProvider>
                    </LocationProvider>
                  </NotificationProvider>
                </SocketProvider>
              </AppModeProvider>
            </AuthProvider>
          </LoaderProvider>
          <Toast config={toastConfig} />

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
    zIndex: 9999,
  },
});
