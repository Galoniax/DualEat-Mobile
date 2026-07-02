import { create } from "axios";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = process.env.TOKEN_KEY || "dualeat_session_token";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("Conectando a:", BASE_URL);

// https://dualeat-backend.up.railway.app/api

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

// 2. INTERCEPTOR DE RESPONSE (Llegada)
/*
axiosInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Sesión expirada. Cerrando sesión...");
      await SecureStore.deleteItemAsync(TOKEN_KEY);

      router.replace(ROUTES.PUBLIC.HOME);
    }

    return Promise.reject(error);
  },
);
*/
export default axiosInterceptor;
