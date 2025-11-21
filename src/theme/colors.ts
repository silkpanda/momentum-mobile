// src/theme/colors.ts
export const themes = {
    calmLight: {
        id: 'calmLight',
        name: 'Calm Light',
        colors: {
            textPrimary: '#111827',
            textSecondary: '#4B5563',
            actionPrimary: '#4F46E5',
            actionHover: '#4338CA',
            signalSuccess: '#16A34A',
            signalAlert: '#DC2626',
            bgCanvas: '#F9FAFB',
            bgSurface: '#FFFFFF',
            borderSubtle: '#E5E7EB',
        },
    },
    darkMode: {
        id: 'darkMode',
        name: 'Dark Mode',
        colors: {
            textPrimary: '#F9FAFB',
            textSecondary: '#D1D5DB',
            actionPrimary: '#818CF8',
            actionHover: '#6366F1',
            signalSuccess: '#34D399',
            signalAlert: '#F87171',
            bgCanvas: '#111827',
            bgSurface: '#1F2937',
            borderSubtle: '#374151',
        },
    },
};

export type ThemeId = keyof typeof themes;
export type Theme = typeof themes.calmLight;
