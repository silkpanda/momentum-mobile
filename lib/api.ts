import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../utils/config'; // This will now be http://localhost:3002

// --- THIS IS THE CRITICAL V4 CHANGE ---
// This apiClient is now configured to speak ONLY to the
// momentum-mobile-bff, which acts as a secure proxy.
//
// The value of API_BASE_URL (from utils/config.ts)
// MUST be changed from 'http://localhost:3001'
// to 'http://localhost:3002'
// --- END OF CHANGE ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- API FUNCTION ---
// This function is now simplified. It just calls the one BFF endpoint.
export const getKioskData = async () => {
  try {
    // --- UPDATED ENDPOINT ---
    // Instead of GET '/api/v1/households',
    // we now call our new BFF endpoint from Step 3.1
    const response = await apiClient.get('/api/v1/kiosk-data');
    // --- END OF UPDATE ---
    
    // The BFF forwards the API's response structure,
    // so this data shape should be the same as before.
    return response.data;
  } catch (error) {
    console.error('Error fetching kiosk data from BFF:', error);
    throw error;
  }
};

// We can add other API calls here later, e.g.:
// export const completeTaskOnBff = (taskId: string) => apiClient.post(`/api/v1/tasks/${taskId}/complete`);
// export const purchaseItemOnBff = (itemId: string) => apiClient.post(`/api/v1/store/${itemId}/purchase`);

export default apiClient;