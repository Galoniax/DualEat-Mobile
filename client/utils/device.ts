import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { v4 as uuidv4 } from "uuid";
import { Platform } from "react-native";

const DEVICE_ID_KEY = process.env.DEVICE_ID_KEY || "dualeat_device_id";

export const getDeviceId = async (): Promise<string> => {
  let deviceId: string | null = null;

  if (Platform.OS === "web") {
    deviceId = localStorage.getItem(DEVICE_ID_KEY);
  } else {
    deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  }

  if (!deviceId) {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const random = new Uint8Array(randomBytes);

    deviceId = uuidv4({ random });

    if (Platform.OS === "web") {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } else {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
  }
  return deviceId;
};