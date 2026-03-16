// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TOKEN: 'momentum_token',
    USER: 'momentum_user',
    HOUSEHOLD_ID: 'momentum_household_id',
    THEME: 'momentum_theme',
    CALENDARS: 'momentum_selected_calendars',
};

export const storage = {
    // Generic
    async getItem(key: string): Promise<string | null> {
        return await AsyncStorage.getItem(key);
    },

    async setItem(key: string, value: string): Promise<void> {
        await AsyncStorage.setItem(key, value);
    },

    // Token
    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(KEYS.TOKEN);
    },

    async setToken(token: string): Promise<void> {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
    },

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.TOKEN);
    },

    // User
    async getUser(): Promise<any | null> {
        const user = await AsyncStorage.getItem(KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    async setUser(user: any): Promise<void> {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    },

    async removeUser(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.USER);
    },

    // Household ID
    async getHouseholdId(): Promise<string | null> {
        return await AsyncStorage.getItem(KEYS.HOUSEHOLD_ID);
    },

    async setHouseholdId(id: string): Promise<void> {
        await AsyncStorage.setItem(KEYS.HOUSEHOLD_ID, id);
    },

    async removeHouseholdId(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.HOUSEHOLD_ID);
    },

    // Theme
    async getTheme(): Promise<string | null> {
        return await AsyncStorage.getItem(KEYS.THEME);
    },

    async setTheme(theme: string): Promise<void> {
        await AsyncStorage.setItem(KEYS.THEME, theme);
    },

    // Clear all
    async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove([
            KEYS.TOKEN,
            KEYS.USER,
            KEYS.HOUSEHOLD_ID,
        ]);
    },
};
