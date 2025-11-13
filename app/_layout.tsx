// silkpanda/momentum-mobile/momentum-mobile-9f8d4a2b72b1c6b369312ebcd296db8cee196e6d/app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
// FIX: Path updated
import { AuthAndHouseholdProvider, useAuthAndHousehold } from '../context/AuthAndHouseholdContext'; 

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
    
  const [loaded, error] = useFonts({
    'Inter': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-semibold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  // Use the new auth context
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthAndHousehold();

  // Expo Router's route protection logic
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle route protection based on auth state
  useEffect(() => {
    // Wait until auth is no longer loading AND fonts are loaded
    if (isAuthLoading || !loaded) {
      return;
    }

    // Check if the user is in the '(app)' group
    const inAppGroup = segments[0] === '(app)';

    if (isAuthenticated && !inAppGroup) {
      // User is authenticated but NOT in the (app) group.
      // Redirect them to the (app) group.
      router.replace('/(app)');
    } else if (!isAuthenticated && inAppGroup) {
      // User is NOT authenticated but IS in the (app) group.
      // Redirect them to the login screen.
      router.replace('/(auth)/login');
    }
    
  }, [isAuthenticated, isAuthLoading, loaded, segments, router]);

  // We rely on the initial splash screen being visible until all assets are loaded.
  // We also wait for the initial auth check.
  if (!loaded || isAuthLoading) {
    return null; // The native splash screen will be visible
  }

  return (
    <Slot />
  );
}

// Wrapper component to provide the context
export default function RootLayout() {
  return (
    <AuthAndHouseholdProvider>
      <RootLayoutContent />
    </AuthAndHouseholdProvider>
  );
}