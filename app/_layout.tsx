// silkpanda/momentum-mobile/momentum-mobile-48a3bdaec149b6570562600bab21372e4eb95908/app/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthAndHouseholdProvider, useAuthAndHousehold } from './context/AuthAndHouseholdContext';

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  const [loaded, error] = useFonts({
    // FIX: Adjusted the relative path from '../assets/fonts/' to '../../assets/fonts/' 
    // to correctly resolve the assets based on common Expo Router bundling issues.
    'Inter': require('../../assets/fonts/Inter-Regular.ttf'),
    'Inter-medium': require('../../assets/fonts/Inter-Medium.ttf'),
    'Inter-semibold': require('../../assets/fonts/Inter-SemiBold.ttf'),
  });

  const { isAuthenticated, isLoading } = useAuthAndHousehold();

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
    if (!isLoading) {
        if (isAuthenticated) {
            // User is authenticated, redirect to the app
            router.replace('/(app)');
        } else {
            // User is not authenticated, redirect to login
            router.replace('/(auth)/login');
        }
    }
  }, [isAuthenticated, isLoading]); // Only run when these states change

  if (!loaded || isLoading) {
    return null;
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