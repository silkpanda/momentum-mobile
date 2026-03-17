// Theme tokens for Momentum — "Disney Adult" ADHD-friendly design system

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, massive: 48, giant: 64,
} as const;

export const shadows = {
  soft: { shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  float: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  deep: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
} as const;

export const bentoPalette = {
  canvas: '#FFF9F5', surface: '#FFFFFF',
  textPrimary: '#1C1917', textSecondary: '#57534E', textTertiary: '#A8A29E',
  brandPrimary: '#6366f1', brandLight: '#818cf8', brandDark: '#4f46e5',
  alert: '#F59E0B', alertLight: '#FFFBEB',
  success: '#10B981', successLight: '#ECFDF5',
  error: '#EF4444', errorLight: '#FEF2F2',
  glassWhite: 'rgba(255, 255, 255, 0.85)', glassBorder: 'rgba(255, 255, 255, 0.5)',
} as const;

export const familyPalette = {
  questGradient: ['#F59E0B', '#7C3AED'] as const,
  taskBlue: '#38BDF8', streakFire: '#EF4444', coinGold: '#FBBF24',
} as const;

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, round: 32, pill: 9999,
} as const;

export const animations = {
  springBounce: { type: 'spring' as const, damping: 15, stiffness: 200, mass: 1 },
  bouncySpring: { type: 'spring' as const, damping: 12, stiffness: 180, mass: 1.2 },
  quickSpring: { type: 'spring' as const, damping: 20, stiffness: 300, mass: 0.5 },
  smoothTiming: { type: 'timing' as const, duration: 300, useNativeDriver: true },
  scalePress: { pressed: 0.96, released: 1.0 },
  squishPress: { pressed: 0.90, released: 1.0 },
  rotation: { plus: '0deg', close: '45deg' },
} as const;

export const typography = {
  widgetTitle: { fontFamily: 'Fredoka-SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: 0 },
  heroGreeting: { fontFamily: 'Fredoka-Bold', fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  bigNumber: { fontFamily: 'Inter-Bold', fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
  body: { fontFamily: 'Inter-Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  button: { fontFamily: 'Inter-SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: 0 },
} as const;

export const widgetSizes = {
  columns: 2, gutter: spacing.lg, outerPadding: spacing.xl,
  aspectRatios: { hero: 2.5, standard: 1.2, wide: 3.5, tall: 0.6 },
} as const;

export const haptics = {
  light: 'light' as const, medium: 'medium' as const, heavy: 'heavy' as const,
  selection: 'selection' as const,
  success: 'notificationSuccess' as const, warning: 'notificationWarning' as const, error: 'notificationError' as const,
} as const;

export const dockConfig = {
  height: 64, bottomOffset: spacing.xxxl, blur: 30, opacity: 0.85,
  borderWidth: 1, iconSize: 24, createButtonSize: 56,
} as const;

export const breakpoints = { mobile: 0, tablet: 768, desktop: 1024 } as const;

export const zIndex = { base: 0, card: 1, cardExpanded: 10, dock: 100, modal: 1000, toast: 2000 } as const;

export const a11y = {
  minTouchTarget: 44, minContrast: 4.5, focusRingWidth: 2, focusRingColor: bentoPalette.brandPrimary,
} as const;

export type Spacing = keyof typeof spacing;
export type Shadow = keyof typeof shadows;
export type BentoColor = keyof typeof bentoPalette;
export type BorderRadius = keyof typeof borderRadius;
export type Animation = keyof typeof animations;
export type Typography = keyof typeof typography;
export type WidgetSize = keyof typeof widgetSizes.aspectRatios;
export type Haptic = typeof haptics[keyof typeof haptics];
