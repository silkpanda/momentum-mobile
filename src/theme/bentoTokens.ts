// momentum-mobile/src/theme/bentoTokens.ts
// Design Tokens for the Bento Command Center Parent View
// Based on the "Disney Adult" aesthetic with ADHD-friendly principles

/**
 * SPACING SYSTEM
 * Base unit: 4px
 * All spacing should be multiples of 4 for consistency
 */
export const spacing = {
    xs: 4,      // Micro spacing
    sm: 8,      // Small spacing
    md: 12,     // Medium spacing (tight gutter)
    lg: 16,     // Large spacing (standard gutter)
    xl: 20,     // Extra large (outer padding)
    xxl: 24,    // 2X large (border radius)
    xxxl: 32,   // 3X large (dock bottom position)
    huge: 40,   // Huge spacing
    massive: 48, // Massive spacing
    giant: 64,  // Giant spacing
} as const;

/**
 * SHADOW SYSTEM
 * Three levels: soft, float, deep
 */
export const shadows = {
    // Soft shadow with indigo glow (for Bento cards)
    soft: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    // Floating shadow (for dock and modals)
    float: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    // Deep shadow (for expanded cards)
    deep: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
} as const;

/**
 * BENTO PALETTE
 * "Disney Adult" color scheme
 */
export const bentoPalette = {
    // Backgrounds
    canvas: '#FFF9F5',      // Warm cream canvas
    surface: '#FFFFFF',     // Pure white cards

    // Text
    textPrimary: '#1C1917',    // Stone 900
    textSecondary: '#57534E',  // Stone 600
    textTertiary: '#A8A29E',   // Stone 400

    // Brand & Actions
    brandPrimary: '#6366f1',   // Indigo (primary actions)
    brandLight: '#818cf8',     // Lighter indigo
    brandDark: '#4f46e5',      // Darker indigo

    // Signals
    alert: '#F59E0B',          // Amber (approvals, overdue)
    alertLight: '#FFFBEB',     // Amber background
    success: '#10B981',        // Green (completed, all caught up)
    successLight: '#ECFDF5',   // Green background
    error: '#EF4444',          // Red (errors)
    errorLight: '#FEF2F2',     // Red background

    // Glassmorphism
    glassWhite: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
} as const;

/**
 * BORDER RADIUS
 * The "Squish" factor
 */
export const borderRadius = {
    sm: 8,      // Small radius
    md: 12,     // Medium radius
    lg: 16,     // Large radius
    xl: 24,     // Bento card radius (The Squish)
    xxl: 32,    // Expanded card radius
    pill: 9999, // Pill shape (dock)
} as const;

/**
 * ANIMATION PRESETS
 * Standardized animation configurations
 */
export const animations = {
    // Spring bounce (for card release)
    springBounce: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 200,
        mass: 1,
    },

    // Quick spring (for micro-interactions)
    quickSpring: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 300,
        mass: 0.5,
    },

    // Smooth timing (for fades)
    smoothTiming: {
        type: 'timing' as const,
        duration: 300,
        useNativeDriver: true,
    },

    // Scale values for press animations
    scalePress: {
        pressed: 0.96,
        released: 1.0,
    },

    // Rotation for Create button
    rotation: {
        plus: '0deg',
        close: '45deg',
    },
} as const;

/**
 * TYPOGRAPHY SCALE
 * Mobile-optimized sizes using Inter and Fredoka
 */
export const typography = {
    // Widget titles (Fredoka)
    widgetTitle: {
        fontFamily: 'Fredoka-SemiBold',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0,
    },

    // Hero greeting (Fredoka)
    heroGreeting: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: 0,
    },

    // Big numbers (Inter)
    bigNumber: {
        fontFamily: 'Inter-Bold',
        fontSize: 32,
        lineHeight: 40,
        letterSpacing: -0.5,
    },

    // Body text (Inter)
    body: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0,
    },

    // Caption/micro text (Inter)
    caption: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },

    // Button text (Inter)
    button: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
    },
} as const;

/**
 * WIDGET SIZES
 * Standardized dimensions for the Bento grid
 */
export const widgetSizes = {
    // Grid configuration
    columns: 2,
    gutter: spacing.lg,        // 16px
    outerPadding: spacing.xl,  // 20px

    // Widget aspect ratios (for sizing calculations)
    aspectRatios: {
        hero: 2.5,      // Full width, short
        standard: 1.2,  // Half width, slightly tall
        wide: 3.5,      // Full width, very short
        tall: 0.6,      // Half width, double height
    },
} as const;

/**
 * HAPTIC FEEDBACK TYPES
 * Standardized haptic patterns
 */
export const haptics = {
    light: 'light' as const,       // Checkbox toggle
    medium: 'medium' as const,     // Create button
    heavy: 'heavy' as const,       // Approval action
    selection: 'selection' as const, // Card press
    success: 'notificationSuccess' as const, // Task completion
    warning: 'notificationWarning' as const, // Overdue alert
    error: 'notificationError' as const,     // Error state
} as const;

/**
 * DOCK CONFIGURATION
 * Settings for the floating navigation dock
 */
export const dockConfig = {
    height: 64,
    bottomOffset: spacing.xxxl,  // 32px from bottom
    blur: 30,
    opacity: 0.85,
    borderWidth: 1,
    iconSize: 24,
    createButtonSize: 56,  // Larger center button
} as const;

/**
 * GRID BREAKPOINTS
 * Responsive behavior (future-proofing for tablets)
 */
export const breakpoints = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
} as const;

/**
 * Z-INDEX LAYERS
 * Consistent layering system
 */
export const zIndex = {
    base: 0,
    card: 1,
    cardExpanded: 10,
    dock: 100,
    modal: 1000,
    toast: 2000,
} as const;

/**
 * ACCESSIBILITY
 * Minimum sizes and contrast ratios
 */
export const a11y = {
    minTouchTarget: 44,  // Minimum 44x44px touch targets
    minContrast: 4.5,    // WCAG AA standard
    focusRingWidth: 2,
    focusRingColor: bentoPalette.brandPrimary,
} as const;

// Type exports for TypeScript
export type Spacing = keyof typeof spacing;
export type Shadow = keyof typeof shadows;
export type BentoColor = keyof typeof bentoPalette;
export type BorderRadius = keyof typeof borderRadius;
export type Animation = keyof typeof animations;
export type Typography = keyof typeof typography;
export type WidgetSize = keyof typeof widgetSizes.aspectRatios;
export type Haptic = typeof haptics[keyof typeof haptics];
