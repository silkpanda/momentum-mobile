import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import Constants from 'expo-constants';

export const BFF_API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://momentum-mobile-bff.onrender.com/mobile-bff';

export class BaseApi {
  protected async getHeaders(): Promise<Record<string, string>> {
    const token = await storage.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ status: string; data?: T; message?: string; token?: string }> {
    const url = `${BFF_API_URL}${endpoint}`;
    const headers = await this.getHeaders();

    try {
      const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = json.message || `Request failed with status ${response.status}`;
        throw new Error(msg);
      }

      return json;
    } catch (error: any) {
      logger.error(`API ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }
}
