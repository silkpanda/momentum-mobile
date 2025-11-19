import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// --- CONFIGURATION ---

// 1. YOUR NGROK URL
const MANUAL_LAN_IP = 'https://unthirsting-soritic-raymonde.ngrok-free.dev';

// 2. Standard Loopbacks for Emulators
const LOCAL_BFF_URL = Platform.select({
  android: 'http://10.0.2.2:3002', // Android Emulator standard loopback
  ios: 'http://localhost:3002',    // iOS Simulator standard loopback
  default: 'http://localhost:3002',
});

// 3. Determine the final URL
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
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
    'User-Agent': 'MomentumMobile/1.0', // Custom User-Agent
  },
  timeout: 10000, // Increased timeout to 10s
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    // Force the header again just in case
    config.headers['ngrok-skip-browser-warning'] = 'true';

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
    const targetUrl = error.config
      ? `${error.config.baseURL || ''}${error.config.url || ''}`
      : 'Unknown URL';

    if (error.response) {
      console.error(`[API Error] ${error.response.status} at ${targetUrl}`);
      // Only log data if it's not a huge HTML string
      if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
        console.error('Response Data: [HTML Error Page - Likely Ngrok Warning]');
      } else {
        console.error('Response Data:', error.response.data);
      }
    } else if (error.request) {
      console.error(`[API Error] NO RESPONSE from ${targetUrl}`);
      console.error('Raw Error:', error.message);
    } else {
      console.error(`[API Error] Setup Failure: ${error.message}`);
    }
    return Promise.reject(error);
  }
);