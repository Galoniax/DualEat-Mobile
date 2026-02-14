import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = process.env.DEVICE_ID_KEY || "dualeat_device_id";

export const getDeviceId = async (): Promise<string> => {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    // Generar 16 bytes aleatorios con expo-crypto
    const randomBytes = await Crypto.getRandomBytesAsync(16);

    // Convertirlos a UUID
    const random = new Uint8Array(randomBytes);

    deviceId = uuidv4({ random });

    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};