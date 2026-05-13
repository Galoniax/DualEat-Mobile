import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

type StorageKeys = "recentsIn";

export function useLocalStorage<T>(
  key: StorageKeys,
  initialValue: T,
) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadValue = async () => {
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        setStoredValue(JSON.parse(saved));
      }
    };
    loadValue();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      let finalValue = valueToStore;

      console.log(JSON.stringify(valueToStore, null, 2));

      if (Array.isArray(valueToStore) && valueToStore.length > 5) {
        finalValue = valueToStore.slice(0, 5) as unknown as T;
      }

      setStoredValue(finalValue);
      await AsyncStorage.setItem(key, JSON.stringify(finalValue));
    } catch (error) {
      console.error("Error guardando en AsyncStorage", error);
    }
  };


  return [storedValue, setValue] as const;
}
