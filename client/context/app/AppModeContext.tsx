import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Definimos que el modo puede ser null inicialmente
//type AppMode = "eatOut" | "eatIn" | "eatBoth";

type AppMode = "eatOut" | "eatIn"

const STORAGE_KEY = "@dualeat/app-mode";

interface AppModeContextType {
  mode: AppMode; 
  switchMode: () => void;
  clearMode: () => void;
  isLoading: boolean; 
}

const AppModeContext = createContext<AppModeContextType | null>(null);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<AppMode | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setModeState(saved as AppMode);
        } else {
          setModeState("eatOut"); 
        }
      } catch (e) {
        console.error("Failed to load mode", e);
        setModeState("eatOut"); 
      }
    })();
  }, []);

  const switchMode = () => {
    if (!mode) return; 

    let newMode: AppMode;
    if (mode === "eatOut") newMode = "eatIn";
    else if (mode === "eatIn") newMode = "eatOut";
    else newMode = "eatOut";

    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
    
  };

  const clearMode = () => {
    setModeState("eatOut");
    AsyncStorage.removeItem(STORAGE_KEY);
  };

 
  if (mode === null) {
    return null; 
  }

  return (
    <AppModeContext.Provider 
      value={{ mode: mode as AppMode, switchMode, clearMode, isLoading: false }}
    >
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useMode must be used within AppModeProvider");
  }
  return context;
};