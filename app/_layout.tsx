import "../global.css"; // This must be the first import

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Slot } from "expo-router"; // <-- USE SLOT
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// 1. DEFINE OUR THEMES (Style Guide: 3.2)
const MomentumLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5', // color-action-primary
    background: '#F9FAFB', // color-bg-canvas
    card: '#FFFFFF', // color-bg-surface
    text: '#111827', // color-text-primary
    border: '#E5E7EB', // color-border-subtle
    notification: '#DC2626', // color-signal-alert
  },
  semantic: {
    '--color-bg-canvas': '#F9FAFB',
    '--color-bg-surface': '#FFFFFF',
    '--color-text-primary': '#111827',
    '--color-text-secondary': '#4B5563',
    '--color-border-subtle': '#E5E7EB',
    '--color-action-primary': '#4F46E5',
    '--color-action-hover': '#4338CA',
    '--color-signal-success': '#16A34A',
    '--color-signal-alert': '#DC2626',
    '--color-signal-focus': '#FACC15',
  }
};

const MomentumDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5', // color-action-primary
    background: '#111827', // color-bg-canvas
    card: '#1F2937', // color-bg-surface
    text: '#F3F4F6', // color-text-primary
    border: '#374151', // color-border-subtle
    notification: '#EF4444', // color-signal-alert
  },
  semantic: {
    '--color-bg-canvas': '#111827',
    '--color-bg-surface': '#1F2937',
    '--color-text-primary': '#F3F4F6',
    '--color-text-secondary': '#9CA3AF',
    '--color-border-subtle': '#374151',
    '--color-action-primary': '#4F46E5',
    '--color-action-hover': '#4338CA',
    '--color-signal-success': '#22C55E',
    '--color-signal-alert': '#EF4444',
    '--color-signal-focus': '#FACC15',
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
  // This applies the theme colors as CSS variables to the root element
  return (
    // Use the `vars` function to apply CSS variables to a View's style prop
    <View style={vars(theme.semantic)} className="flex-1">
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          {/* Slot renders the active layout, either (app) or (auth) */}
          <Slot />
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </SafeAreaProvider>
    </View>
  );
}