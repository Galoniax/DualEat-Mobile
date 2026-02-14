import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { ROUTES } from "@/constants/constants";

const TOKEN_KEY = process.env.TOKEN_KEY || "dualeat_session_token";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("Conectando a:", BASE_URL);

const axiosInterceptor = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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
axiosInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response?.status === 401) {
      console.log("Sesión expirada. Cerrando sesión...");

      await SecureStore.deleteItemAsync(TOKEN_KEY);

      router.replace(ROUTES.PUBLIC.HOME);
    }

    return Promise.reject(error);
  },
);

export default axiosInterceptor;