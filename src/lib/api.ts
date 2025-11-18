import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// --- CONFIGURATION ---
// The Mobile App talks to the BFF (Service 4), NOT the Core API.
// BFF is running on Port 3002.

const LOCAL_BFF_URL = Platform.select({
  android: 'http://10.0.2.2:3002',
  ios: 'http://localhost:3002',
  default: 'http://localhost:3002',
});

export const BASE_URL = process.env.EXPO_PUBLIC_BFF_URL || LOCAL_BFF_URL;

console.log(`[Mobile] API Client initialized. Target BFF: ${BASE_URL}`);

/**
 * The Axios instance for communicating with momentum-mobile-bff.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR ---
// Automatically attach the token if it exists in SecureStore
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('momentum_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- ERROR HANDLING INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API Error]', error.response.status, error.response.data);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);