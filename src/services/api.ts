// src/services/api.ts
import { storage } from '../utils/storage';

// =============================================================================
// NETWORK CONFIGURATION
// =============================================================================
// The mobile app communicates with the BFF (Backend-for-Frontend) deployed on Render.
// This provides a unified API interface for all mobile platforms.

const getBaseUrl = () => {
    // Production BFF on Render
    return 'https://momentum-mobile-bff.onrender.com/mobile-bff';
};

const API_BASE_URL = getBaseUrl();

interface ApiResponse<T = any> {
    status: string;
    data?: T;
    message?: string;
    token?: string;
}

class ApiClient {
    private async getHeaders(): Promise<HeadersInit> {
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

    async request<T = any>(
        endpoint: string,
        options: RequestInit = {},
        retries = 3,
        backoff = 1000
    ): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`[API] 🚀 Requesting: ${url} (Attempts left: ${retries})`);

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

                const data = await response.json();
                console.log(`[API] ✅ Response from ${endpoint}:`, response.status);

                if (!response.ok) {
                    throw new Error(data.message || 'Request failed');
                }

                return data;
            } catch (fetchError: any) {
                clearTimeout(timeoutId);

                // Handle timeouts and network errors with retries
                if (retries > 0 && (fetchError.name === 'AbortError' || fetchError.message === 'Network request failed')) {
                    console.log(`[API] ⚠️ Request failed, retrying in ${backoff}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return this.request(endpoint, options, retries - 1, backoff * 2);
                }

                if (fetchError.name === 'AbortError') {
                    console.error(`[API] ⏱️ Timeout waiting for ${url}`);
                    throw new Error('Request timed out. The server might be waking up (Cold Start). Please try again.');
                }
                throw fetchError;
            }
        } catch (error: any) {
            console.error(`[API] ❌ Error requesting ${url}:`, error.message);
            throw new Error(error.message || 'Network error');
        }
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: string;
        householdName: string;
        userDisplayName: string;
        userProfileColor: string;
    }) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // Dashboard
    async getDashboardData() {
        return this.request('/dashboard/page-data');
    }

    // Family
    async getFamilyData() {
        return this.request('/family/page-data');
    }

    // Tasks
    async getTasks() {
        return this.request('/tasks');
    }

    async createTask(taskData: any) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }

    async completeTask(taskId: string, memberId: string) {
        return this.request(`/tasks/${taskId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    async approveTask(taskId: string) {
        return this.request(`/tasks/${taskId}/approve`, {
            method: 'POST',
        });
    }

    async updateTask(taskId: string, taskData: any) {
        return this.request(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify(taskData),
        });
    }

    async deleteTask(taskId: string) {
        return this.request(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    // Quests
    async getQuests() {
        return this.request('/quests');
    }

    async createQuest(questData: any) {
        return this.request('/quests', {
            method: 'POST',
            body: JSON.stringify(questData),
        });
    }

    async updateQuest(questId: string, questData: any) {
        return this.request(`/quests/${questId}`, {
            method: 'PUT',
            body: JSON.stringify(questData),
        });
    }

    async deleteQuest(questId: string) {
        return this.request(`/quests/${questId}`, {
            method: 'DELETE',
        });
    }

    async claimQuest(questId: string, memberId: string) {
        return this.request(`/quests/${questId}/claim`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    async completeQuest(questId: string, memberId: string) {
        return this.request(`/quests/${questId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    async approveQuest(questId: string, memberId: string) {
        return this.request(`/quests/${questId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    // Store
    async getStoreItems() {
        return this.request('/store');
    }

    async createStoreItem(itemData: any) {
        return this.request('/store', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    }

    async updateStoreItem(itemId: string, itemData: any) {
        return this.request(`/store/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify(itemData),
        });
    }

    async deleteStoreItem(itemId: string) {
        console.log('[API] Deleting store item:', itemId);
        console.log('[API] DELETE URL:', `/store/${itemId}`);
        const result = await this.request(`/store/${itemId}`, {
            method: 'DELETE',
        });
        console.log('[API] Delete result:', result);
        return result;
    }

    async purchaseItem(itemId: string, memberId: string) {
        return this.request(`/store/${itemId}/purchase`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    // Meals & Restaurants
    async getRestaurants() {
        return this.request('/meals/restaurants');
    }

    async createRestaurant(restaurantData: any) {
        return this.request('/meals/restaurants', {
            method: 'POST',
            body: JSON.stringify(restaurantData),
        });
    }

    async updateRestaurant(restaurantId: string, restaurantData: any) {
        return this.request(`/meals/restaurants/${restaurantId}`, {
            method: 'PUT',
            body: JSON.stringify(restaurantData),
        });
    }

    async deleteRestaurant(restaurantId: string) {
        return this.request(`/meals/restaurants/${restaurantId}`, {
            method: 'DELETE',
        });
    }

    async getMeals() {
        return this.request('/meals/meals');
    }

    async createMeal(mealData: any) {
        return this.request('/meals/meals', {
            method: 'POST',
            body: JSON.stringify(mealData),
        });
    }

    async updateMeal(mealId: string, mealData: any) {
        return this.request(`/meals/meals/${mealId}`, {
            method: 'PUT',
            body: JSON.stringify(mealData),
        });
    }

    async deleteMeal(mealId: string) {
        return this.request(`/meals/meals/${mealId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();
