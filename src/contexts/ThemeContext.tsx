import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, CALM_LIGHT, getTheme } from '../lib/theme';

interface ThemeContextType {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => Promise<void>;
    hasPremiumAccess: boolean;
    setPremiumAccess: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@momentum_theme';
const PREMIUM_STORAGE_KEY = '@momentum_premium';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>('calm-light');
    const [theme, setThemeState] = useState<Theme>(CALM_LIGHT);
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

    // Load theme and premium status on mount
    useEffect(() => {
        loadTheme();
        loadPremiumStatus();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme) {
                const name = savedTheme as ThemeName;
                setThemeName(name);
                setThemeState(getTheme(name));
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const loadPremiumStatus = async () => {
        try {
            const premium = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
            setHasPremiumAccess(premium === 'true');
        } catch (error) {
            console.error('Failed to load premium status:', error);
        }
    };

    const setTheme = async (name: ThemeName) => {
        try {
            const newTheme = getTheme(name);

            // Check if theme is premium and user doesn't have access
            if (newTheme.isPremium && !hasPremiumAccess) {
                throw new Error('This theme requires premium access');
            }

            setThemeName(name);
            setThemeState(newTheme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
        } catch (error) {
            console.error('Failed to set theme:', error);
            throw error;
        }
    };

    const setPremiumAccess = async (value: boolean) => {
        try {
            setHasPremiumAccess(value);
            await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, value.toString());
        } catch (error) {
            console.error('Failed to set premium access:', error);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeName,
                setTheme,
                hasPremiumAccess,
                setPremiumAccess,
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

// Helper hook to get theme-aware styles
export function useThemedStyles() {
    const { theme } = useTheme();

    return {
        // Canvas & Surfaces
        bgCanvas: { backgroundColor: theme.colors.bgCanvas },
        bgSurface: { backgroundColor: theme.colors.bgSurface },
        bgSurfaceHover: { backgroundColor: theme.colors.bgSurfaceHover },

        // Text
        textPrimary: { color: theme.colors.textPrimary },
        textSecondary: { color: theme.colors.textSecondary },

        // Borders
        borderSubtle: { borderColor: theme.colors.borderSubtle },

        // Actions
        bgActionPrimary: { backgroundColor: theme.colors.actionPrimary },
        textActionPrimary: { color: theme.colors.actionPrimary },

        // Signals
        textSuccess: { color: theme.colors.signalSuccess },
        textAlert: { color: theme.colors.signalAlert },
        bgFocus: { backgroundColor: theme.colors.signalFocus },
    };
}
