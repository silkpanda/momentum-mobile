// The mobile app communicates with the BFF (Backend-for-Frontend) deployed on Render.
// This provides a unified API interface for all mobile platforms.

import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import {
    ApiResponse,
    User,
    Member,
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
    Meal,
    Routine,
    RoutineItem,
    WishlistItem
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
        logger.debug(`Requesting: ${url} (Attempts left: ${retries})`);

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

    // Members
    async createMember(memberData: {
        householdId: string;
        firstName: string;
        role: 'Parent' | 'Child';
        profileColor: string;
        displayName?: string;
    }): Promise<ApiResponse<{ member: Member }>> {
        return this.request<{ member: Member }>('/family/members', {
            method: 'POST',
            body: JSON.stringify(memberData),
        });
    }

    async updateMember(memberId: string, memberData: {
        householdId: string;
        firstName?: string;
        role?: 'Parent' | 'Child';
        profileColor?: string;
        displayName?: string;
    }): Promise<ApiResponse<{ member: Member }>> {
        return this.request<{ member: Member }>(`/family/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify(memberData),
        });
    }

    async deleteMember(memberId: string, householdId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/family/members/${memberId}`, {
            method: 'DELETE',
            body: JSON.stringify({ householdId }),
        });
    }

    // Focus Mode
    async setFocusTask(householdId: string, memberProfileId: string, taskId: string | null): Promise<ApiResponse<any>> {
        return this.request<any>(`/households/${householdId}/members/${memberProfileId}`, {
            method: 'PATCH',
            body: JSON.stringify({ focusedTaskId: taskId }),
        });
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

    // Meal Plans
    async getMealPlans(): Promise<ApiResponse<{ mealPlans: any[] }>> {
        return this.request<{ mealPlans: any[] }>('/meals/plans');
    }

    async createMealPlan(startDate: string, endDate: string): Promise<ApiResponse<{ mealPlan: any }>> {
        return this.request<{ mealPlan: any }>('/meals/plans', {
            method: 'POST',
            body: JSON.stringify({ startDate, endDate }),
        });
    }

    async addMealToPlan(planId: string, mealData: {
        dayOfWeek: string;
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        itemType: 'recipe' | 'restaurant' | 'custom';
        itemId?: string;
        customTitle?: string;
    }): Promise<ApiResponse<{ meal: any }>> {
        return this.request<{ meal: any }>(`/meals/plans/${planId}/meals`, {
            method: 'POST',
            body: JSON.stringify(mealData),
        });
    }

    async removeMealFromPlan(planId: string, mealId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/meals/plans/${planId}/meals/${mealId}`, {
            method: 'DELETE',
        });
    }

    async deleteMealPlan(planId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/meals/plans/${planId}`, {
            method: 'DELETE',
        });
    }

    async getUnratedMeals(): Promise<ApiResponse<{ unratedMeals: any[] }>> {
        return this.request<{ unratedMeals: any[] }>('/meals/unrated');
    }

    async rateMeal(mealId: string, rating: number): Promise<ApiResponse<{ meal: any }>> {
        return this.request<{ meal: any }>(`/meals/rate/${mealId}`, {
            method: 'POST',
            body: JSON.stringify({ rating }),
        });
    }

    // Routines
    async getAllRoutines(): Promise<ApiResponse<{ routines: Routine[] }>> {
        return this.request<{ routines: Routine[] }>('/routines');
    }

    async getMemberRoutines(memberId: string): Promise<ApiResponse<{ routines: Routine[] }>> {
        return this.request<{ routines: Routine[] }>(`/routines/member/${memberId}`);
    }

    async getRoutineById(routineId: string): Promise<ApiResponse<{ routine: Routine }>> {
        return this.request<{ routine: Routine }>(`/routines/${routineId}`);
    }

    async createRoutine(routineData: Partial<Routine>): Promise<ApiResponse<{ routine: Routine }>> {
        return this.request<{ routine: Routine }>('/routines', {
            method: 'POST',
            body: JSON.stringify(routineData),
        });
    }

    async updateRoutine(routineId: string, routineData: Partial<Routine>): Promise<ApiResponse<{ routine: Routine }>> {
        return this.request<{ routine: Routine }>(`/routines/${routineId}`, {
            method: 'PUT',
            body: JSON.stringify(routineData),
        });
    }

    async deleteRoutine(routineId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/routines/${routineId}`, {
            method: 'DELETE',
        });
    }

    async toggleRoutineItem(routineId: string, itemId: string): Promise<ApiResponse<{ routine: Routine; item: RoutineItem }>> {
        return this.request<{ routine: Routine; item: RoutineItem }>(`/routines/${routineId}/items/${itemId}/toggle`, {
            method: 'POST',
        });
    }

    // ============================================================
    // WISHLIST METHODS
    // ============================================================

    async getWishlist(memberId: string, includePurchased: boolean = false): Promise<ApiResponse<{ wishlistItems: WishlistItem[]; currentPoints: number }>> {
        const query = includePurchased ? '?includePurchased=true' : '';
        return this.request<{ wishlistItems: WishlistItem[]; currentPoints: number }>(`/wishlist/member/${memberId}${query}`);
    }

    async getHouseholdWishlist(householdId: string, includePurchased: boolean = false): Promise<ApiResponse<{ wishlistItems: WishlistItem[] }>> {
        const query = includePurchased ? '?includePurchased=true' : '';
        return this.request<{ wishlistItems: WishlistItem[] }>(`/wishlist/household/${householdId}${query}`);
    }

    async createWishlistItem(data: {
        memberId: string;
        householdId: string;
        title: string;
        description?: string;
        pointsCost: number;
        imageUrl?: string;
        priority?: 'low' | 'medium' | 'high';
    }): Promise<ApiResponse<{ wishlistItem: WishlistItem }>> {
        return this.request<{ wishlistItem: WishlistItem }>('/wishlist', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateWishlistItem(id: string, data: {
        title?: string;
        description?: string;
        pointsCost?: number;
        imageUrl?: string;
        priority?: 'low' | 'medium' | 'high';
    }): Promise<ApiResponse<{ wishlistItem: WishlistItem }>> {
        return this.request<{ wishlistItem: WishlistItem }>(`/wishlist/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteWishlistItem(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/wishlist/${id}`, {
            method: 'DELETE',
        });
    }

    async purchaseWishlistItem(id: string): Promise<ApiResponse<{ wishlistItem: WishlistItem; newPointsTotal: number }>> {
        return this.request<{ wishlistItem: WishlistItem; newPointsTotal: number }>(`/wishlist/${id}/purchase`, {
            method: 'POST',
        });
    }

    // ============================================================
    // PIN AUTHENTICATION METHODS
    // ============================================================

    async setupPin(pin: string): Promise<ApiResponse<{ pinSetupCompleted: boolean }>> {
        return this.request<{ pinSetupCompleted: boolean }>('/pin/setup-pin', {
            method: 'POST',
            body: JSON.stringify({ pin }),
        });
    }

    async verifyPin(pin: string, memberId: string, householdId: string): Promise<ApiResponse<{
        verified: boolean;
        memberId: string;
        userId: string;
        firstName: string;
        role: string;
    }>> {
        const url = `${API_BASE_URL}/pin/verify-pin`;

        try {
            const headers = await this.getHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ pin, memberId, householdId }),
            });

            // For PIN verification, 401 is expected (incorrect PIN), not an error
            if (response.status === 401) {
                // Return a structured response indicating verification failed
                return {
                    status: 'error',
                    data: {
                        verified: false,
                        memberId,
                        userId: '',
                        firstName: '',
                        role: '',
                    },
                };
            }

            // For other non-OK responses, use normal error handling
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'PIN verification failed');
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            // Only log actual errors, not incorrect PIN
            if (error.message !== 'PIN verification failed') {
                logger.error(`Error verifying PIN:`, error.message);
            }
            throw error;
        }
    }

    async changePin(oldPin: string, newPin: string): Promise<ApiResponse<void>> {
        return this.request<void>('/pin/change-pin', {
            method: 'PUT',
            body: JSON.stringify({ oldPin, newPin }),
        });
    }

    async getPinStatus(): Promise<ApiResponse<{ pinSetupCompleted: boolean; lastPinVerification?: string }>> {
        return this.request<{ pinSetupCompleted: boolean; lastPinVerification?: string }>('/pin/pin-status');
    }
    // ============================================================
    // HOUSEHOLD LINK METHODS (Multi-Household)
    // ============================================================

    async generateLinkCode(childId: string): Promise<ApiResponse<{ code: string; expiresAt: string; childName: string }>> {
        return this.request<{ code: string; expiresAt: string; childName: string }>('/household/child/generate-link-code', {
            method: 'POST',
            body: JSON.stringify({ childId }),
        });
    }

    async linkExistingChild(code: string, displayName: string, profileColor: string): Promise<ApiResponse<{ child: Member; householdLink: any; message: string }>> {
        return this.request<{ child: Member; householdLink: any; message: string }>('/household/child/link-existing', {
            method: 'POST',
            body: JSON.stringify({ code, displayName, profileColor }),
        });
    }

    async validateLinkCode(code: string): Promise<ApiResponse<{ valid: boolean; childId: string; childName: string; expiresAt: string }>> {
        return this.request<{ valid: boolean; childId: string; childName: string; expiresAt: string }>(`/household/child/validate-code/${code}`);
    }

    async getHouseholdLinks(): Promise<ApiResponse<{ links: any[]; count: number }>> {
        return this.request<{ links: any[]; count: number }>('/household/links');
    }

    async getLinkSettings(linkId: string): Promise<ApiResponse<{ link: any }>> {
        return this.request<{ link: any }>(`/household/link/${linkId}/settings`);
    }

    async proposeSettingChange(linkId: string, setting: string, newValue: string): Promise<ApiResponse<{ message: string; pendingChange: any }>> {
        return this.request<{ message: string; pendingChange: any }>(`/household/link/${linkId}/propose-change`, {
            method: 'POST',
            body: JSON.stringify({ setting, newValue }),
        });
    }

    async approveChange(linkId: string, changeId: string): Promise<ApiResponse<{ message: string; updatedSettings: any }>> {
        return this.request<{ message: string; updatedSettings: any }>(`/household/link/${linkId}/approve-change/${changeId}`, {
            method: 'POST',
        });
    }

    async rejectChange(linkId: string, changeId: string): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/household/link/${linkId}/reject-change/${changeId}`, {
            method: 'POST',
        });
    }

    async unlinkChild(childId: string): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/household/child/${childId}/unlink`, {
            method: 'POST',
        });
    }

    // ============================================================
    // NOTIFICATION METHODS
    // ============================================================

    async sendParentReminder(): Promise<ApiResponse<{ message: string; data: any }>> {
        return this.request<{ message: string; data: any }>('/notifications/remind', {
            method: 'POST',
        });
    }
}

export const api = new ApiClient();
