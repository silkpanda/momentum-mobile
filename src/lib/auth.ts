import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const TOKEN_KEY = 'momentum_auth_token';
const HOUSEHOLD_KEY = 'momentum_household_id';

export const Auth = {
  /**
   * Save auth data after successful login
   */
  async saveSession(token: string, householdId: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(HOUSEHOLD_KEY, householdId);
    
    // Set default header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  /**
   * Clear auth data on logout
   */
  async clearSession() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(HOUSEHOLD_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  /**
   * Retrieve the stored token (for app startup)
   */
  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  /**
   * Retrieve the stored household ID
   */
  async getHouseholdId() {
    return await SecureStore.getItemAsync(HOUSEHOLD_KEY);
  }
};