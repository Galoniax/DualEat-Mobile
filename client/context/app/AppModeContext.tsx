import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoader } from "./LoadingContext";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { ROUTES } from "@/constants/constants";

export type AppMode = "in" | "out" | null;

const STORAGE_KEY = process.env.STORAGE_KEY || "dualeat_app-mode";

interface AppModeContextType {
  mode: AppMode;
  switchMode: (mode: AppMode) => void;
  clearMode: () => void;
  updateModeSilent: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context)
    throw new Error("useAppMode debe ser usado dentro de un AppModeProvider");
  return context;
};

function parseMode(saved: string | null): AppMode {
  if (saved === "in" || saved === "out") return saved;
  return "out";
}

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigation = useNavigation();
  const router = useRouter();
  const [mode, setMode] = useState<AppMode>(null);

  const { setType } = useLoader();

  useEffect(() => {
    (async () => {
      try {
        setType("global");
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        setMode(parseMode(saved));
        setType(null);
      } catch (e) {
        setType(null);
        console.log("Error al cargar el modo", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = useCallback(
    async (newMode: AppMode) => {
      if (!newMode) return;
      try {
        setType("global");
        await AsyncStorage.setItem(STORAGE_KEY, newMode);
        setMode(newMode);

        router.replace(ROUTES.USER.DASHBOARD(newMode));

        setTimeout(() => {
          setType(null);
        }, 800);
      } catch (e) {
        setType(null);
        console.log("Error al establecer el modo específico", e);
      }
    },
    [setType, router],
  );

  const updateModeSilent = useCallback(async (newMode: AppMode) => {
    if (!newMode) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      setMode(newMode);
    } catch (e) {
      console.log("Error al establecer modo silencioso", e);
    }
  }, []);

  const clearMode = useCallback(async () => {
    navigation.dispatch(DrawerActions.closeDrawer());
    setMode(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, [navigation]);

  const contextValue = useMemo(
    () => ({
      mode,
      switchMode,
      clearMode,
      updateModeSilent,
    }),
    [mode, switchMode, clearMode, updateModeSilent],
  );
  return (
    <AppModeContext.Provider value={contextValue}>
      {children}
    </AppModeContext.Provider>
  );
};
