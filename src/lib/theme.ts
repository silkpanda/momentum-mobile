// Theme System for Momentum App
// Supports "Calm Light" (default), "Calm Dark", and future Premium Themes

export type ThemeMode = 'light' | 'dark';
export type ThemeName = 'calm-light' | 'calm-dark' | 'forest' | 'ruby' | 'aqua' | 'zen-garden' | 'cyber-glow' | 'sunset-wave';

export interface Theme {
    name: ThemeName;
    displayName: string;
    isPremium: boolean;
    mode: ThemeMode;
    colors: {
        // Canvas & Surfaces
        bgCanvas: string;
        bgSurface: string;
        bgSurfaceHover: string;

        // Text
        textPrimary: string;
        textSecondary: string;

        // Borders
        borderSubtle: string;

        // Actions
        actionPrimary: string;
        actionHover: string;

        // Signals
        signalSuccess: string;
        signalAlert: string;
        signalFocus: string;
    };
}

// Default Themes (Free)
export const CALM_LIGHT: Theme = {
    name: 'calm-light',
    displayName: 'Calm Light',
    isPremium: false,
    mode: 'light',
    colors: {
        bgCanvas: '#F9FAFB',      // gray-50
        bgSurface: '#FFFFFF',      // white
        bgSurfaceHover: '#F3F4F6', // gray-100
        textPrimary: '#111827',    // gray-900
        textSecondary: '#4B5563',  // gray-600
        borderSubtle: '#E5E7EB',   // gray-200
        actionPrimary: '#4F46E5',  // indigo-600
        actionHover: '#4338CA',    // indigo-700
        signalSuccess: '#16A34A',  // green-600
        signalAlert: '#DC2626',    // red-600
        signalFocus: '#FACC15',    // yellow-400
    },
};

export const CALM_DARK: Theme = {
    name: 'calm-dark',
    displayName: 'Calm Dark',
    isPremium: false,
    mode: 'dark',
    colors: {
        bgCanvas: '#111827',       // gray-900
        bgSurface: '#1F2937',      // gray-800
        bgSurfaceHover: '#374151', // gray-700
        textPrimary: '#F3F4F6',    // gray-100
        textSecondary: '#9CA3AF',  // gray-400
        borderSubtle: '#374151',   // gray-700
        actionPrimary: '#4F46E5',  // indigo-600
        actionHover: '#4338CA',    // indigo-700
        signalSuccess: '#22C55E',  // green-500
        signalAlert: '#EF4444',    // red-500
        signalFocus: '#FACC15',    // yellow-400
    },
};

// Accent Themes (Free) - Only change action colors
export const FOREST: Theme = {
    ...CALM_LIGHT,
    name: 'forest',
    displayName: 'Forest',
    colors: {
        ...CALM_LIGHT.colors,
        actionPrimary: '#059669',  // emerald-600
        actionHover: '#047857',    // emerald-700
    },
};

export const RUBY: Theme = {
    ...CALM_LIGHT,
    name: 'ruby',
    displayName: 'Ruby',
    colors: {
        ...CALM_LIGHT.colors,
        actionPrimary: '#F43F5E',  // rose-500
        actionHover: '#E11D48',    // rose-600
    },
};

export const AQUA: Theme = {
    ...CALM_LIGHT,
    name: 'aqua',
    displayName: 'Aqua',
    colors: {
        ...CALM_LIGHT.colors,
        actionPrimary: '#06B6D4',  // cyan-500
        actionHover: '#0891B2',    // cyan-600
    },
};

// Premium Themes (Paid) - Complete custom aesthetics
export const ZEN_GARDEN: Theme = {
    name: 'zen-garden',
    displayName: 'Zen Garden',
    isPremium: true,
    mode: 'light',
    colors: {
        bgCanvas: '#F0F4F0',       // Soft sage
        bgSurface: '#FFFFFF',
        bgSurfaceHover: '#E8F0E8',
        textPrimary: '#2D3E2D',    // Deep forest
        textSecondary: '#5A6F5A',
        borderSubtle: '#D4E4D4',
        actionPrimary: '#4A7C59',  // Bamboo green
        actionHover: '#3D6B4A',
        signalSuccess: '#6B9B7C',
        signalAlert: '#B85C5C',
        signalFocus: '#D4A574',
    },
};

export const CYBER_GLOW: Theme = {
    name: 'cyber-glow',
    displayName: 'Cyber Glow',
    isPremium: true,
    mode: 'dark',
    colors: {
        bgCanvas: '#000000',       // Pure black
        bgSurface: '#0A0A0A',
        bgSurfaceHover: '#1A1A1A',
        textPrimary: '#00FF9F',    // Neon green
        textSecondary: '#00CC7F',
        borderSubtle: '#1A3A2A',
        actionPrimary: '#00FF9F',
        actionHover: '#00E68F',
        signalSuccess: '#00FFD4',
        signalAlert: '#FF0055',
        signalFocus: '#FFD700',
    },
};

export const SUNSET_WAVE: Theme = {
    name: 'sunset-wave',
    displayName: 'Sunset Wave',
    isPremium: true,
    mode: 'light',
    colors: {
        bgCanvas: '#FFF5F0',       // Warm cream
        bgSurface: '#FFFFFF',
        bgSurfaceHover: '#FFE8DC',
        textPrimary: '#4A2C2A',    // Deep brown
        textSecondary: '#8B6B5C',
        borderSubtle: '#FFD4C4',
        actionPrimary: '#FF6B6B',  // Coral
        actionHover: '#E85555',
        signalSuccess: '#6BCF7F',
        signalAlert: '#FF4757',
        signalFocus: '#FFA502',
    },
};

// Theme Registry
export const THEMES: Record<ThemeName, Theme> = {
    'calm-light': CALM_LIGHT,
    'calm-dark': CALM_DARK,
    'forest': FOREST,
    'ruby': RUBY,
    'aqua': AQUA,
    'zen-garden': ZEN_GARDEN,
    'cyber-glow': CYBER_GLOW,
    'sunset-wave': SUNSET_WAVE,
};

// Free themes available to all users
export const FREE_THEMES: ThemeName[] = ['calm-light', 'calm-dark', 'forest', 'ruby', 'aqua'];

// Premium themes (require purchase)
export const PREMIUM_THEMES: ThemeName[] = ['zen-garden', 'cyber-glow', 'sunset-wave'];

// Helper to get theme
export function getTheme(name: ThemeName): Theme {
    return THEMES[name] || CALM_LIGHT;
}

// Helper to check if theme is premium
export function isThemePremium(name: ThemeName): boolean {
    return THEMES[name]?.isPremium || false;
}

// Helper to get available themes for user
export function getAvailableThemes(hasPremium: boolean): Theme[] {
    if (hasPremium) {
        return Object.values(THEMES);
    }
    return FREE_THEMES.map(name => THEMES[name]);
}
