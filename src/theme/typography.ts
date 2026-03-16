// src/theme/typography.ts
/**
 * Typography System - Unified with Web
 * 
 * This file defines the typography tokens used throughout the mobile app.
 * It matches the web application's typography system (Inter font family).
 * 
 * Font Weights:
 * - Regular: 400
 * - Medium: 500
 * - Semibold: 600
 */

export const typography = {
    // Font Families
    fontFamily: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semibold: 'Inter_600SemiBold',
    },

    // Font Sizes (matching web scale)
    fontSize: {
        xs: 11,      // Extra small (footer text, captions)
        sm: 12,      // Small (secondary text, labels)
        base: 14,    // Base (body text, buttons)
        md: 16,      // Medium (headings, emphasis)
        lg: 18,      // Large (section titles)
        xl: 20,      // Extra large (page titles)
        xxl: 24,     // 2X large (hero text)
        xxxl: 32,    // 3X large (display text)
    },

    // Line Heights (relative to font size)
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter Spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },

    // Font Weights (numeric values for React Native)
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
    },
} as const;

/**
 * Text Style Presets
 * 
 * Common text styles used throughout the app.
 * These match the web application's typography patterns.
 */
export const textStyles = {
    // Display styles
    displayLarge: {
        fontFamily: typography.fontFamily.semibold,
        fontSize: typography.fontSize.xxxl,
        lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
        letterSpacing: typography.letterSpacing.tight,
    },
    displayMedium: {
        fontFamily: typography.fontFamily.semibold,
        fontSize: typography.fontSize.xxl,
        lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
        letterSpacing: typography.letterSpacing.tight,
    },

    // Heading styles
    h1: {
        fontFamily: typography.fontFamily.semibold,
        fontSize: typography.fontSize.xl,
        lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
    },
    h2: {
        fontFamily: typography.fontFamily.semibold,
        fontSize: typography.fontSize.lg,
        lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    },
    h3: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    },

    // Body styles
    bodyLarge: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    },
    body: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.base,
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    },
    bodySmall: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },

    // Label styles
    label: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.base,
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    },
    labelSmall: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },

    // Button styles
    button: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.base,
        lineHeight: typography.fontSize.base * typography.lineHeight.tight,
        letterSpacing: typography.letterSpacing.wide,
    },
    buttonSmall: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
        letterSpacing: typography.letterSpacing.wide,
    },

    // Caption styles
    caption: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
        lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    },
    captionBold: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.xs,
        lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    },
} as const;

export type TextStylePreset = keyof typeof textStyles;
