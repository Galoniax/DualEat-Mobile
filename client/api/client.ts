import { create } from "axios";
import * as SecureStore from "expo-secure-store";
import { BASE_URL, TOKEN_KEY } from "./config";
import { router } from "expo-router";
import { ROUTES } from "@/constants/constants";

console.log("Conectando a:", BASE_URL);

SecureStore.getItemAsync(TOKEN_KEY).then((t) => {
  console.log("[TOKEN ACTUAL EN DISPOSITIVO]:", t ? t : "NO EXISTE");
});

/** CONSEGUIR TOKEN DE FIREBASE
 *
 *  async function getFirebaseToken() {
 *      const token = (await Notifications.getDevicePushTokenAsync()).data;
 *      console.log("Token de Firebase:", token);
 * }
 * getFirebaseToken();
 */

const axiosInterceptor = create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// 1. INTERCEPTOR DE REQUEST (Salida)
axiosInterceptor.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log("Error leyendo token:", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (cb: (() => void) | null) => {
  onUnauthorizedCallback = cb;
};

// 2. INTERCEPTOR DE RESPONSE (Llegada)
axiosInterceptor.interceptors.response.use(
  async (response) => {
    const newToken = response.headers["x-new-access-token"];

    if (newToken) {
      console.log(
        "[RENOVACIÓN TOKEN] Se recibió x-new-access-token:",
        newToken.substring(0, 25) + "...",
      );
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);

      axiosInterceptor.defaults.headers.common["Authorization"] =
        `Bearer ${newToken}`;
    }

    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Sesión expirada o inválida");
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      delete axiosInterceptor.defaults.headers.common["Authorization"];

      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }

      router.replace(ROUTES.AUTH.LOGIN);
    }

    return Promise.reject(error);
  },
);

export default axiosInterceptor;
