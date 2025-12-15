// The mobile app communicates with the BFF (Backend-for-Frontend) deployed on Render.
// This provides a unified API interface for all mobile platforms.

import { BaseApi, BFF_API_URL } from './base.api';
import { authService } from './auth.service';
import { taskService } from './task.service';
import { householdService } from './household.service';
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
    WishlistItem,
    Notification
} from '../types';

class ApiClient extends BaseApi {

    // ============================================================
    // AUTHENTICATION (Delegated to AuthService)
    // ============================================================

    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        return authService.login(email, password);
    }

    async googleLogin(idToken: string, serverAuthCode?: string): Promise<ApiResponse<LoginResponse>> {
        return authService.googleLogin(idToken, serverAuthCode);
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
        return authService.register(userData);
    }

    async getMe(): Promise<ApiResponse<MeResponse>> {
        return authService.getMe();
    }

    async completeOnboarding(data: {
        userId: string;
        householdId: string;
        householdName?: string;
        displayName: string;
        profileColor: string;
        pin: string;
        calendarChoice?: 'sync' | 'create';
        selectedCalendarId?: string;
    }): Promise<ApiResponse<{ user: User; household: any }>> {
        return authService.completeOnboarding(data);
    }

    // ============================================================
    // HOUSEHOLD & MEMBERS (Delegated to HouseholdService)
    // ============================================================

    async getDashboardData(): Promise<ApiResponse<DashboardData>> {
        return householdService.getDashboardData();
    }

    async getFamilyData(): Promise<ApiResponse<FamilyData>> {
        return householdService.getFamilyData();
    }

    async createMember(memberData: {
        householdId: string;
        firstName: string;
        role: 'Parent' | 'Child';
        profileColor: string;
        displayName?: string;
    }): Promise<ApiResponse<{ member: Member }>> {
        return householdService.createMember(memberData);
    }

    async updateMember(memberId: string, memberData: {
        householdId: string;
        firstName?: string;
        role?: 'Parent' | 'Child';
        profileColor?: string;
        displayName?: string;
    }): Promise<ApiResponse<{ member: Member }>> {
        return householdService.updateMember(memberId, memberData);
    }

    async deleteMember(memberId: string, householdId: string): Promise<ApiResponse<void>> {
        return householdService.deleteMember(memberId, householdId);
    }

    async setFocusTask(householdId: string, memberProfileId: string, taskId: string | null): Promise<ApiResponse<any>> {
        return householdService.setFocusTask(householdId, memberProfileId, taskId);
    }

    // ============================================================
    // TASKS & QUESTS (Delegated to TaskService)
    // ============================================================

    async getTasks(): Promise<ApiResponse<{ tasks: Task[] }>> {
        return taskService.getTasks();
    }

    async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
        return taskService.createTask(taskData);
    }

    async completeTask(taskId: string, memberId: string): Promise<ApiResponse<Task>> {
        return taskService.completeTask(taskId, memberId);
    }

    async approveTask(taskId: string): Promise<ApiResponse<Task>> {
        return taskService.approveTask(taskId);
    }

    async updateTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
        return taskService.updateTask(taskId, taskData);
    }

    async deleteTask(taskId: string): Promise<ApiResponse<void>> {
        return taskService.deleteTask(taskId);
    }

    async getQuests(): Promise<ApiResponse<{ quests: Quest[] }>> {
        return taskService.getQuests();
    }

    async createQuest(questData: Partial<Quest>): Promise<ApiResponse<Quest>> {
        return taskService.createQuest(questData);
    }

    async updateQuest(questId: string, questData: Partial<Quest>): Promise<ApiResponse<Quest>> {
        return taskService.updateQuest(questId, questData);
    }

    async deleteQuest(questId: string): Promise<ApiResponse<void>> {
        return taskService.deleteQuest(questId);
    }

    async claimQuest(questId: string, memberId: string): Promise<ApiResponse<Quest>> {
        return taskService.claimQuest(questId, memberId);
    }

    async completeQuest(questId: string, memberId: string): Promise<ApiResponse<Quest>> {
        return taskService.completeQuest(questId, memberId);
    }

    async approveQuest(questId: string, memberId: string): Promise<ApiResponse<Quest>> {
        return taskService.approveQuest(questId, memberId);
    }

    // ============================================================
    // OTHER SERVICES (Inline for now - Future refactor candidates)
    // ============================================================

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

    // Wishlist
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

    // PIN Authentication
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
        // Use BFF URL for legacy PIN verification if not moved to service
        // We import BFF_API_URL from base.api
        const url = `${BFF_API_URL}/pin/verify-pin`;

        try {
            // Helper to get headers from base class (protected)
            // Since we are in subclass we can access protected.
            const headers = await this.getHeaders();

            const response = await fetch(url, {
                method: 'POST',
                headers: headers as HeadersInit,
                body: JSON.stringify({ pin, memberId, householdId }),
            });

            if (response.status === 401) {
                return {
                    status: 'error',
                    data: {
                        verified: false,
                        memberId,
                        userId: '',
                        firstName: '',
                        role: '',
                    },
                } as any;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'PIN verification failed');
            }

            return await response.json();
        } catch (error: any) {
            if (error.message !== 'PIN verification failed') {
                // ignore logger for now or import it
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

    // Household Link Methods
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

    // Notification Methods
    async sendParentReminder(): Promise<ApiResponse<{ message: string; data: any }>> {
        return this.request<{ message: string; data: any }>('/notifications/remind', {
            method: 'POST',
        });
    }

    async getNotifications(): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> {
        return this.request<{ notifications: Notification[]; unreadCount: number }>('/notifications');
    }

    async markAsRead(notificationId: string): Promise<ApiResponse<{ notification: Notification }>> {
        return this.request<{ notification: Notification }>(`/notifications/${notificationId}/read`, {
            method: 'PATCH',
        });
    }

    async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>('/notifications/read-all', {
            method: 'PATCH',
        });
    }

    async savePushToken(token: string): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>('/notifications/push-token', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    // Calendar Methods
    async connectGoogleCalendar(data: { idToken: string; accessToken: string; serverAuthCode?: string }): Promise<ApiResponse<any>> {
        return this.request<any>('/calendar/google/connect', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getGoogleCalendarEvents(): Promise<ApiResponse<any[]>> {
        return this.request<any[]>('/calendar/google/events');
    }

    async listGoogleCalendars(): Promise<ApiResponse<{ calendars: any[] }>> {
        return this.request<{ calendars: any[] }>('/calendar/google/list');
    }
}

export const api = new ApiClient();
