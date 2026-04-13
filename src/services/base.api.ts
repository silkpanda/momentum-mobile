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

  private delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ status: string; data?: T; message?: string; token?: string }> {
    const url = `${BFF_API_URL}${endpoint}`;
    const headers = await this.getHeaders();
    const maxRetries = 2; // 1 original + 1 retry

    try {
      let lastResponse: Response | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
        lastResponse = response;

        // Retry once on 429 (Render cold-start / rate limit)
        if (response.status === 429 && attempt < maxRetries - 1) {
          logger.warn(`Got 429 on ${endpoint}, retrying in 3s (attempt ${attempt + 1})...`);
          await this.delay(3000);
          continue;
        }
        break;
      }

      const json = await lastResponse!.json().catch(() => ({}));

      if (!lastResponse!.ok) {
        const msg = json.message || `Request failed with status ${lastResponse!.status}`;
        throw new Error(msg);
      }

      return json;
    } catch (error: any) {
      logger.error(`API ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }
}
