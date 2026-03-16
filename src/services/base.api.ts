import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const getCoreUrl = () => {
    // UNCOMMENT FOR LOCAL DEBUGGING
    // return 'http://localhost:8000/api/v1'; // Core API local

    // Production Core API on Render
    return 'https://momentum-api-vpkw.onrender.com/api/v1';
};

const getBffUrl = () => {
    // UNCOMMENT FOR LOCAL DEBUGGING
    // return 'http://localhost:8000/mobile-bff'; // BFF local

    // Production BFF on Render
    return 'https://momentum-mobile-bff.onrender.com/mobile-bff';
};

export const CORE_API_URL = getCoreUrl();
export const BFF_API_URL = getBffUrl();

export type ApiTarget = 'core' | 'bff';

export class BaseApi {
    private target: ApiTarget;

    constructor(target: ApiTarget = 'bff') {
        this.target = target;
    }

    protected getBaseUrl(): string {
        return this.target === 'core' ? CORE_API_URL : BFF_API_URL;
    }

    protected async getHeaders(): Promise<HeadersInit> {
        const token = await storage.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    protected async request<T = any>(
        endpoint: string,
        options: RequestInit = {},
        retries = 3,
        backoff = 1000
    ): Promise<ApiResponse<T>> {
        const url = `${this.getBaseUrl()}${endpoint}`;
        logger.debug(`Requesting [${this.target.toUpperCase()}]: ${url} (Attempts left: ${retries})`);

        try {
            const headers = await this.getHeaders();

            // Create a controller for timeout (60s for Render cold starts)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);


            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        ...headers,
                        ...options.headers,
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // Check response status BEFORE parsing JSON
                if (!response.ok) {
                    logger.warn(`Non-OK response from ${endpoint}:`, response.status);

                    // Clone the response so we can try multiple parsing strategies
                    const responseClone = response.clone();

                    // Try to parse error response as JSON, but fall back to text
                    let errorMessage = 'Request failed';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
                    } catch (parseError) {
                        // If JSON parsing fails, use the cloned response to get text
                        try {
                            const textResponse = await responseClone.text();
                            logger.error(`Non-JSON error response:`, textResponse.substring(0, 200));
                            errorMessage = textResponse || `Request failed with status ${response.status}`;
                        } catch (textError) {
                            errorMessage = `Request failed with status ${response.status}`;
                        }
                    }

                    throw new Error(errorMessage);
                }

                // Only parse JSON for successful responses
                const data = await response.json();
                logger.info(`Response from ${endpoint}:`, response.status);

                return data;
            } catch (fetchError: any) {
                clearTimeout(timeoutId);

                // Handle timeouts and network errors with retries
                if (retries > 0 && (fetchError.name === 'AbortError' || fetchError.message === 'Network request failed')) {
                    logger.warn(`Request failed, retrying in ${backoff}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return this.request(endpoint, options, retries - 1, backoff * 2);
                }

                if (fetchError.name === 'AbortError') {
                    logger.error(`Timeout waiting for ${url}`);
                    throw new Error('Request timed out. The server might be waking up (Cold Start). Please try again.');
                }
                throw fetchError;
            }
        } catch (error: any) {
            logger.error(`Error requesting ${url}:`, error.message);
            throw new Error(error.message || 'Network error');
        }
    }

    /**
     * Wake up the API by pinging the health endpoint
     * This is useful before critical operations to avoid cold-start failures
     */
    async wakeUpApi(): Promise<boolean> {
        try {
            logger.info(`Waking up ${this.target.toUpperCase()} API...`);
            // Core API health is usually /health or just /
            // BFF health is /health (relative to root, not mobile-bff prefix usually, checks need confirm)
            // Let's assume /health work for both relative to their base or root.

            // Adjusting logic: 
            // CORE_API_URL ends in /api/v1 
            // BFF_API_URL ends in /mobile-bff

            let healthUrl = '';
            if (this.target === 'core') {
                // Core: .../api/v1 -> .../health (assuming standard) or just root
                healthUrl = this.getBaseUrl().replace('/api/v1', '/health');
            } else {
                // BFF: .../mobile-bff -> .../health
                healthUrl = this.getBaseUrl().replace('/mobile-bff', '/health');
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(healthUrl, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                logger.info(`${this.target.toUpperCase()} API is awake and ready`);
                return true;
            }

            logger.warn(`${this.target.toUpperCase()} API health check returned non-OK status`);
            return false;
        } catch (error) {
            logger.warn(`${this.target.toUpperCase()} API wake-up failed, but continuing anyway:`, error);
            return false; // Don't block the request, just log
        }
    }
}
