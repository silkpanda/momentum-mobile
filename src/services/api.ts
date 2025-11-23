// The mobile app communicates with the BFF (Backend-for-Frontend) deployed on Render.
// This provides a unified API interface for all mobile platforms.

import { storage } from '../utils/storage';
import {
    ApiResponse,
    User,
    AuthResponse,
    LoginResponse,
    RegisterResponse,
    MeResponse,
    DashboardData,
    FamilyData,
    Task,
    Quest,
    StoreItem,
    Restaurant,
    Meal
} from '../types';

const getBaseUrl = () => {
    // Production BFF on Render
    return 'https://momentum-mobile-bff.onrender.com/mobile-bff';
};

const API_BASE_URL = getBaseUrl();

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

                // Check response status BEFORE parsing JSON
                if (!response.ok) {
                    console.log(`[API] ⚠️ Non-OK response from ${endpoint}:`, response.status);

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
                            console.error(`[API] 📄 Non-JSON error response:`, textResponse.substring(0, 200));
                            errorMessage = textResponse || `Request failed with status ${response.status}`;
                        } catch (textError) {
                            errorMessage = `Request failed with status ${response.status}`;
                        }
                    }

                    throw new Error(errorMessage);
                }

                // Only parse JSON for successful responses
                const data = await response.json();
                console.log(`[API] ✅ Response from ${endpoint}:`, response.status);

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
    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        return this.request<LoginResponse>('/auth/login', {
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
    }): Promise<ApiResponse<RegisterResponse>> {
        return this.request<RegisterResponse>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async getMe(): Promise<ApiResponse<MeResponse>> {
        return this.request<MeResponse>('/auth/me');
    }

    // Dashboard
    async getDashboardData(): Promise<ApiResponse<DashboardData>> {
        return this.request<DashboardData>('/dashboard/page-data');
    }

    // Family
    async getFamilyData(): Promise<ApiResponse<FamilyData>> {
        return this.request<FamilyData>('/family/page-data');
    }

    // Tasks
    async getTasks(): Promise<ApiResponse<{ tasks: Task[] }>> {
        return this.request<{ tasks: Task[] }>('/tasks');
    }

    async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
        return this.request<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }

    async completeTask(taskId: string, memberId: string): Promise<ApiResponse<Task>> {
        return this.request<Task>(`/tasks/${taskId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    async approveTask(taskId: string): Promise<ApiResponse<Task>> {
        return this.request<Task>(`/tasks/${taskId}/approve`, {
            method: 'POST',
        });
    }

    async updateTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
        return this.request<Task>(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify(taskData),
        });
    }

    async deleteTask(taskId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    // Quests
    async getQuests(): Promise<ApiResponse<{ quests: Quest[] }>> {
        return this.request<{ quests: Quest[] }>('/quests');
    }

    async createQuest(questData: Partial<Quest>): Promise<ApiResponse<Quest>> {
        return this.request<Quest>('/quests', {
            method: 'POST',
            body: JSON.stringify(questData),
        });
    }

    async updateQuest(questId: string, questData: Partial<Quest>): Promise<ApiResponse<Quest>> {
        return this.request<Quest>(`/quests/${questId}`, {
            method: 'PUT',
            body: JSON.stringify(questData),
        });
    }

    async deleteQuest(questId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/quests/${questId}`, {
            method: 'DELETE',
        });
    }

    async claimQuest(questId: string, memberId: string): Promise<ApiResponse<Quest>> {
        return this.request<Quest>(`/quests/${questId}/claim`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    async completeQuest(questId: string, memberId: string): Promise<ApiResponse<Quest>> {
        return this.request<Quest>(`/quests/${questId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    async approveQuest(questId: string, memberId: string): Promise<ApiResponse<Quest>> {
        return this.request<Quest>(`/quests/${questId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    // Store
    async getStoreItems(): Promise<ApiResponse<{ storeItems: StoreItem[] }>> {
        return this.request<{ storeItems: StoreItem[] }>('/store');
    }

    async createStoreItem(itemData: Partial<StoreItem>): Promise<ApiResponse<StoreItem>> {
        return this.request<StoreItem>('/store', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    }

    async updateStoreItem(itemId: string, itemData: Partial<StoreItem>): Promise<ApiResponse<StoreItem>> {
        return this.request<StoreItem>(`/store/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify(itemData),
        });
    }

    async deleteStoreItem(itemId: string): Promise<ApiResponse<void>> {
        const result = await this.request<void>(`/store/${itemId}`, {
            method: 'DELETE',
        });
        return result;
    }

    async purchaseItem(itemId: string, memberId: string): Promise<ApiResponse<{ newPointsTotal: number }>> {
        return this.request<{ newPointsTotal: number }>(`/store/${itemId}/purchase`, {
            method: 'POST',
            body: JSON.stringify({ memberId }),
        });
    }

    // Meals & Restaurants
    async getRestaurants(): Promise<ApiResponse<{ restaurants: Restaurant[] }>> {
        return this.request<{ restaurants: Restaurant[] }>('/meals/restaurants');
    }

    async createRestaurant(restaurantData: Partial<Restaurant>): Promise<ApiResponse<{ restaurant: Restaurant }>> {
        return this.request<{ restaurant: Restaurant }>('/meals/restaurants', {
            method: 'POST',
            body: JSON.stringify(restaurantData),
        });
    }

    async updateRestaurant(restaurantId: string, restaurantData: Partial<Restaurant>): Promise<ApiResponse<{ restaurant: Restaurant }>> {
        return this.request<{ restaurant: Restaurant }>(`/meals/restaurants/${restaurantId}`, {
            method: 'PUT',
            body: JSON.stringify(restaurantData),
        });
    }

    async deleteRestaurant(restaurantId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/meals/restaurants/${restaurantId}`, {
            method: 'DELETE',
        });
    }

    async getMeals(): Promise<ApiResponse<{ recipes: Meal[] }>> {
        return this.request<{ recipes: Meal[] }>('/meals/recipes');
    }

    async createMeal(mealData: Partial<Meal>): Promise<ApiResponse<{ recipe: Meal }>> {
        return this.request<{ recipe: Meal }>('/meals/recipes', {
            method: 'POST',
            body: JSON.stringify(mealData),
        });
    }

    async updateMeal(mealId: string, mealData: Partial<Meal>): Promise<ApiResponse<{ recipe: Meal }>> {
        return this.request<{ recipe: Meal }>(`/meals/recipes/${mealId}`, {
            method: 'PUT',
            body: JSON.stringify(mealData),
        });
    }

    async deleteMeal(mealId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/meals/recipes/${mealId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();
