// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes, defaultTheme } from '../theme/colors';

interface ThemeContextType {
    currentTheme: Theme;
    setTheme: (themeId: string) => void;
    availableThemes: Theme[];
    hasPremiumAccess: boolean;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@momentum_theme';
const PREMIUM_STORAGE_KEY = '@momentum_premium';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
    const [hasPremiumAccess, setHasPremiumAccess] = useState(true); // TODO: Tie to actual subscription
    const [isLoading, setIsLoading] = useState(true);

    // Load theme from AsyncStorage on mount
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const [savedThemeId, premiumStatus] = await Promise.all([
                AsyncStorage.getItem(THEME_STORAGE_KEY),
                AsyncStorage.getItem(PREMIUM_STORAGE_KEY),
            ]);

            // TODO: In production, check actual subscription status
            // For now, always enable premium for testing
            setHasPremiumAccess(true);
            await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, 'true');

            if (savedThemeId && themes[savedThemeId]) {
                setCurrentTheme(themes[savedThemeId]);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setTheme = async (themeId: string) => {
        const theme = themes[themeId];
        if (!theme) return;

        // TODO: In production, re-enable premium check
        // if (theme.isPremium && !hasPremiumAccess) {
        //     console.warn('Premium theme requires subscription');
        //     return;
        // }

        try {
            setCurrentTheme(theme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    // TODO: In production, filter by premium access
    // For now, show all themes for testing
    const availableThemes = Object.values(themes);

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                availableThemes,
                hasPremiumAccess,
                isLoading
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
