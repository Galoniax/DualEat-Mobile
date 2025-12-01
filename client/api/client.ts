import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInterceptor = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// *** INTERCEPTOR CLAVE ***
axiosInterceptor.interceptors.request.use(
  async (config) => {
      
    const token = await SecureStore.getItemAsync('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInterceptor;