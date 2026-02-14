import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoader } from "./LoadingContext";

type AppMode = "in" | "out" | null;

const STORAGE_KEY = "@dualeat/app-mode";

interface AppModeContextType {
  mode: AppMode;
  switchMode: () => void;
  clearMode: () => void;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context)
    throw new Error("useAppMode debe ser usado dentro de un AppModeProvider");
  return context;
};

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<AppMode>(null);

  const { setType } = useLoader();

  useEffect(() => {
    (async () => {
      try {
        setType("global");
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && (saved === "in" || saved === "out")) {
          setMode(saved as AppMode);
        } else {
          setMode("out");
        }
      } catch (e) {
        console.log("Error al cargar el modo", e);
      } finally {
        setType(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = async () => {
    try {
      setType("global");
      const Umode = await AsyncStorage.getItem(STORAGE_KEY);
      const newMode = Umode === "out" ? "in" : "out";

      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      setMode(newMode);
    } finally {
      setType(null);
    }
  };

  const clearMode = async () => {
    setMode(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppModeContext.Provider value={{ mode, switchMode, clearMode }}>
      {children}
    </AppModeContext.Provider>
  );
};
