import "../global.css"; // This must be the first import

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// 1. DEFINE OUR THEMES (Style Guide: 3.2) 
// We are mapping our semantic color roles to the React Navigation theme
// and our own 'semantic' block for the CSS variables.

const MomentumLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5', // color-action-primary [cite: 37]
    background: '#F9FAFB', // color-bg-canvas [cite: 32]
    card: '#FFFFFF', // color-bg-surface [cite: 33]
    text: '#111827', // color-text-primary [cite: 34]
    border: '#E5E7EB', // color-border-subtle [cite: 36]
    notification: '#DC2626', // color-signal-alert [cite: 40]
  },
  semantic: {
    'color-bg-canvas': '#F9FAFB', // [cite: 32]
    'color-bg-surface': '#FFFFFF', // [cite: 33]
    'color-text-primary': '#111827', // [cite: 34]
    'color-text-secondary': '#4B5563', // [cite: 35]
    'color-border-subtle': '#E5E7EB', // [cite: 36]
    'color-action-primary': '#4F46E5', // [cite: 37]
    'color-action-hover': '#4338CA', // indigo-700 [cite: 38]
    'color-signal-success': '#16A34A', // [cite: 39]
    'color-signal-alert': '#DC2626', // [cite: 40]
    'color-signal-focus': '#FACC15', // [cite: 41]
  }
};

const MomentumDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4F46E5', // color-action-primary [cite: 48]
    background: '#111827', // color-bg-canvas [cite: 43]
    card: '#1F2937', // color-bg-surface [cite: 44]
    text: '#F3F4F6', // color-text-primary [cite: 45]
    border: '#374151', // color-border-subtle [cite: 47]
    notification: '#EF4444', // color-signal-alert [cite: 51]
  },
  semantic: {
    'color-bg-canvas': '#111827', // [cite: 43]
    'color-bg-surface': '#1F2937', // [cite: 44]
    'color-text-primary': '#F3F4F6', // [cite: 45]
    'color-text-secondary': '#9CA3AF', // [cite: 46]
    'color-border-subtle': '#374151', // [cite: 47]
    'color-action-primary': '#4F46E5', // [cite: 48]
    'color-action-hover': '#4338CA', // indigo-700 [cite: 49]
    'color-signal-success': '#22C55E', // [cite: 50]
    'color-signal-alert': '#EF4444', // [cite: 51]
    'color-signal-focus': '#FACC15', // [cite: 52]
  }
};


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MomentumDarkTheme : MomentumLightTheme;

  // Load the fonts for the app 
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font load is complete
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // 2. APPLY THE THEME
  // This applies the theme colors as CSS variables to the root element,
  // making our Tailwind classes like `bg-bg-canvas` work.
  return (
    <SafeAreaProvider>
      <style>
        {`
          :root {
            --color-bg-canvas: ${theme.semantic['color-bg-canvas']};
            --color-bg-surface: ${theme.semantic['color-bg-surface']};
            --color-text-primary: ${theme.semantic['color-text-primary']};
            --color-text-secondary: ${theme.semantic['color-text-secondary']};
            --color-border-subtle: ${theme.semantic['color-border-subtle']};
            --color-action-primary: ${theme.semantic['color-action-primary']};
            --color-action-hover: ${theme.semantic['color-action-hover']};
            --color-signal-success: ${theme.semantic['color-signal-success']};
            --color-signal-alert: ${theme.semantic['color-signal-alert']};
            --color-signal-focus: ${theme.semantic['color-signal-focus']};
          }
        `}
      </style>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/* We will add our main app layout (tabs) here later */}
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}