/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // SEMANTIC COLOR ROLES (Style Guide: 3.1)
        // We define CSS variables in our layout and reference them here
        // so we can use classes like `bg-bg-canvas`. [cite: 24, 25]

        // 1. Backgrounds
        'bg-canvas': 'var(--color-bg-canvas)',
        'bg-surface': 'var(--color-bg-surface)',

        // 2. Text
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',

        // 3. Borders
        'border-subtle': 'var(--color-border-subtle)',

        // 4. Actions
        'action-primary': 'var(--color-action-primary)',
        'action-hover': 'var(--color-action-hover)',

        // 5. Signals
        'signal-success': 'var(--color-signal-success)',
        'signal-alert': 'var(--color-signal-alert)',
        'signal-focus': 'var(--color-signal-focus)',
      },
      fontFamily: {
        // TYPOGRAPHY (Style Guide: 2) 
        // We'll set 'sans' as the default, aliasing our primary typeface 'Inter'.
        // We will load the specific font weights in _layout.tsx.
        sans: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        inter: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        'inter-medium': ['Inter_500Medium', 'system-ui', 'sans-serif'],
        'inter-semibold': ['Inter_600SemiBold', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // TYPE SCALE (Style Guide: 2) [cite: 17]
        // H1: Screen Title [cite: 18]
        '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        // H2: Section Heading [cite: 19]
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        // Body-Large: Card Title / Task Name / Button [cite: 20, 22]
        'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        // Body-Small: Body / Descriptions [cite: 21]
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};