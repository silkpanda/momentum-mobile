import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// --- CONFIGURATION ---

// 1. YOUR NGROK URL
// Make sure this is the full URL exactly as Ngrok gave it to you.
const MANUAL_LAN_IP = 'https://unthirsting-soritic-raymonde.ngrok-free.dev';

// 2. Standard Loopbacks for Emulators
const LOCAL_BFF_URL = Platform.select({
  android: 'http://10.0.2.2:3002', // Android Emulator standard loopback
  ios: 'http://localhost:3002',    // iOS Simulator standard loopback
  default: 'http://localhost:3002',
});

// 3. Determine the final URL
// ✅ FIX: We simply use MANUAL_LAN_IP directly if it exists.
// We do NOT add "http://" or ":3002" because the Ngrok URL already has them.
export const BASE_URL = MANUAL_LAN_IP || process.env.EXPO_PUBLIC_BFF_URL || LOCAL_BFF_URL;

console.log(`[Mobile] API Client initialized.`);
console.log(`[Mobile] Target BFF URL: ${BASE_URL}`);

/**
 * The Axios instance for communicating with momentum-mobile-bff.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to fail faster if the server is unreachable (5 seconds)
  timeout: 5000,
});

// --- REQUEST INTERCEPTOR ---
// Automatically attach the token if it exists in SecureStore
api.interceptors.request.use(
  async (config) => {
    // Log the attempt for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

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
    // Enhanced Error Logging
    const targetUrl = error.config
      ? `${error.config.baseURL || ''}${error.config.url || ''}`
      : 'Unknown URL';

    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error(`[API Error] ${error.response.status} at ${targetUrl}`);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received (Network Error)
      console.error(`[API Error] NO RESPONSE from ${targetUrl}`);
      console.error('Possible causes: BFF not running, Wrong IP, or Firewall.');
      console.error('Raw Error:', error.message);
    } else {
      // Something happened in setting up the request
      console.error(`[API Error] Setup Failure: ${error.message}`);
    }
    return Promise.reject(error);
  }
);