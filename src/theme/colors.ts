// src/theme/colors.ts
export interface Theme {
    id: string;
    name: string;
    description: string;
    isPremium: boolean;
    backgroundImage?: string; // Optional background image URL or gradient
    backgroundOpacity?: number; // Opacity for background overlay (0-1)
    colors: {
        textPrimary: string;
        textSecondary: string;
        textTertiary: string;
        textInverse: string;        // Text on dark/colored backgrounds
        actionPrimary: string;
        actionHover: string;
        actionSecondary: string;    // Secondary action color (outline buttons, etc.)
        signalSuccess: string;
        signalAlert: string;
        signalWarning: string;      // Amber/orange warning color
        bgCanvas: string;
        bgSurface: string;
        borderSubtle: string;
    };
}

export const themes: Record<string, Theme> = {
    calmLight: {
        id: 'calmLight',
        name: 'Calm Light',
        description: 'Soft, neutral tones for focused work',
        isPremium: false,
        colors: {
            textPrimary: '#111827',
            textSecondary: '#4B5563',
            textTertiary: '#9CA3AF',
            textInverse: '#FFFFFF',
            actionPrimary: '#4F46E5',
            actionHover: '#4338CA',
            actionSecondary: '#818CF8',
            signalSuccess: '#16A34A',
            signalAlert: '#DC2626',
            signalWarning: '#D97706',
            bgCanvas: '#F9FAFB',
            bgSurface: '#FFFFFF',
            borderSubtle: '#E5E7EB',
        },
    },
    darkMode: {
        id: 'darkMode',
        name: 'Dark Mode',
        description: 'Easy on the eyes for evening use',
        isPremium: false,
        colors: {
            textPrimary: '#F9FAFB',
            textSecondary: '#D1D5DB',
            textTertiary: '#6B7280',
            textInverse: '#111827',
            actionPrimary: '#818CF8',
            actionHover: '#6366F1',
            actionSecondary: '#6366F1',
            signalSuccess: '#34D399',
            signalAlert: '#F87171',
            signalWarning: '#FBBF24',
            bgCanvas: '#111827',
            bgSurface: '#1F2937',
            borderSubtle: '#374151',
        },
    },
    oceanBreeze: {
        id: 'oceanBreeze',
        name: 'Ocean Breeze',
        description: 'Calming blues and teals',
        isPremium: true,
        colors: {
            textPrimary: '#0F172A',
            textSecondary: '#475569',
            textTertiary: '#94A3B8',
            textInverse: '#FFFFFF',
            actionPrimary: '#0EA5E9',
            actionHover: '#0284C7',
            actionSecondary: '#38BDF8',
            signalSuccess: '#14B8A6',
            signalAlert: '#EF4444',
            signalWarning: '#F59E0B',
            bgCanvas: '#F0F9FF',
            bgSurface: '#FFFFFF',
            borderSubtle: '#BAE6FD',
        },
    },
    forestCalm: {
        id: 'forestCalm',
        name: 'Forest Calm',
        description: 'Grounding greens and earth tones',
        isPremium: true,
        colors: {
            textPrimary: '#1C1917',
            textSecondary: '#57534E',
            textTertiary: '#A8A29E',
            textInverse: '#FFFFFF',
            actionPrimary: '#16A34A',
            actionHover: '#15803D',
            actionSecondary: '#4ADE80',
            signalSuccess: '#22C55E',
            signalAlert: '#DC2626',
            signalWarning: '#CA8A04',
            bgCanvas: '#F7FEE7',
            bgSurface: '#FFFFFF',
            borderSubtle: '#D9F99D',
        },
    },
    sunsetWarmth: {
        id: 'sunsetWarmth',
        name: 'Sunset Warmth',
        description: 'Energizing oranges and warm hues',
        isPremium: true,
        colors: {
            textPrimary: '#1C1917',
            textSecondary: '#78716C',
            textTertiary: '#A8A29E',
            textInverse: '#FFFFFF',
            actionPrimary: '#F97316',
            actionHover: '#EA580C',
            actionSecondary: '#FB923C',
            signalSuccess: '#84CC16',
            signalAlert: '#DC2626',
            signalWarning: '#EAB308',
            bgCanvas: '#FFF7ED',
            bgSurface: '#FFFFFF',
            borderSubtle: '#FED7AA',
        },
    },
    lavenderDreams: {
        id: 'lavenderDreams',
        name: 'Lavender Dreams',
        description: 'Soft purples and gentle pastels',
        isPremium: true,
        colors: {
            textPrimary: '#1E1B4B',
            textSecondary: '#6366F1',
            textTertiary: '#A5B4FC',
            textInverse: '#FFFFFF',
            actionPrimary: '#A78BFA',
            actionHover: '#8B5CF6',
            actionSecondary: '#C4B5FD',
            signalSuccess: '#34D399',
            signalAlert: '#F472B6',
            signalWarning: '#FCD34D',
            bgCanvas: '#FAF5FF',
            bgSurface: '#FFFFFF',
            borderSubtle: '#E9D5FF',
        },
    },
    bluey: {
        id: 'bluey',
        name: 'Bluey',
        description: 'Playful and warm, inspired by everyone\'s favorite Blue Heeler',
        isPremium: true,
        colors: {
            textPrimary: '#2C3E50',
            textSecondary: '#5D6D7E',
            textTertiary: '#95A5A6',
            textInverse: '#FFFFFF',
            actionPrimary: '#5B9BD5',
            actionHover: '#4A8BC2',
            actionSecondary: '#93C5FD',
            signalSuccess: '#52C41A',
            signalAlert: '#FF6B6B',
            signalWarning: '#F6AD55',
            bgCanvas: '#FFF8E7',
            bgSurface: '#FFFFFF',
            borderSubtle: '#FFE4B5',
        },
    },
    neonCyberpunk: {
        id: 'neonCyberpunk',
        name: 'Neon Cyberpunk',
        description: '🌃 Electric neon vibes with cyberpunk aesthetics',
        isPremium: true,
        backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        backgroundOpacity: 0.95,
        colors: {
            textPrimary: '#00FFFF', // Cyan
            textSecondary: '#FF00FF', // Magenta
            textTertiary: '#9D00FF', // Purple
            textInverse: '#0a0a0a',
            actionPrimary: '#FF00FF', // Hot Pink/Magenta
            actionHover: '#FF1493', // Deep Pink
            actionSecondary: '#9D00FF',
            signalSuccess: '#00FF41', // Neon Green
            signalAlert: '#FF073A', // Neon Red
            signalWarning: '#FFD700',
            bgCanvas: '#0a0a0a', // Almost black
            bgSurface: 'rgba(26, 10, 46, 0.8)', // Dark purple with transparency
            borderSubtle: '#FF00FF80', // Magenta with 50% opacity
        },
    },
    spaceExplorer: {
        id: 'spaceExplorer',
        name: 'Space Explorer',
        description: '🚀 Journey through the cosmos with stellar colors',
        isPremium: true,
        backgroundImage: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
        backgroundOpacity: 0.9,
        colors: {
            textPrimary: '#FFFFFF', // White
            textSecondary: '#B8C5D6', // Light blue-gray
            textTertiary: '#7B8FA3', // Medium blue-gray
            textInverse: '#000428',
            actionPrimary: '#00D9FF', // Bright cyan
            actionHover: '#00B8D4', // Darker cyan
            actionSecondary: '#7DD3FC',
            signalSuccess: '#00FF88', // Bright green
            signalAlert: '#FF6B9D', // Soft pink
            signalWarning: '#FDE68A',
            bgCanvas: '#000428', // Deep space blue
            bgSurface: 'rgba(0, 78, 146, 0.6)', // Semi-transparent blue
            borderSubtle: '#00D9FF40', // Cyan with 25% opacity
        },
    },
};

export const freeThemes = Object.values(themes).filter(t => !t.isPremium);
export const premiumThemes = Object.values(themes).filter(t => t.isPremium);
export const defaultTheme = themes.calmLight;

export type ThemeId = keyof typeof themes;
