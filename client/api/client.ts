import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router'; 

// Usar una constante para evitar errores de dedo
const TOKEN_KEY = 'dualeat_session_token'; 
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("Conectando a:", BASE_URL);

const axiosInterceptor = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 1. INTERCEPTOR DE REQUEST (Salida) - Lo que ya tenías
axiosInterceptor.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error leyendo token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. INTERCEPTOR DE RESPONSE (Llegada) - ¡NUEVO!
axiosInterceptor.interceptors.response.use(
  (response) => response, // Si todo salió bien, pasa la respuesta
  async (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response?.status === 401) {
      console.log("Sesión expirada. Cerrando sesión...");
      
      // Borramos el token vencido de la caja fuerte
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      
      // Redirigimos al usuario al login forzosamente
      // Nota: A veces es mejor hacer esto a través del AuthContext, 
      // pero para el interceptor directo, esto funciona:
      router.replace('/(auth)/login');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInterceptor;