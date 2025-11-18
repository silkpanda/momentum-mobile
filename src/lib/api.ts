import axios from 'axios';
import { Platform } from 'react-native';

// --- CONFIGURATION ---
// The Mobile App talks to the BFF (Service 4), NOT the Core API.
// BFF is running on Port 3002.

// Android Emulator requires 10.0.2.2 to see localhost.
// iOS Simulator uses localhost.
// Physical devices need your machine's LAN IP (e.g., http://192.168.1.5:3002).
const LOCAL_BFF_URL = Platform.select({
  android: 'http://10.0.2.2:3002',
  ios: 'http://localhost:3002',
  default: 'http://localhost:3002',
});

// We will eventually pull this from .env, but for Phase 1/2 local dev, this is fine.
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

// --- ERROR HANDLING INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for now. In Phase 3, we might trigger a global toast here.
    if (error.response) {
      console.error('[API Error]', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response received', error.request);
    } else {
      console.error('[API Error] Setup error', error.message);
    }
    return Promise.reject(error);
  }
);