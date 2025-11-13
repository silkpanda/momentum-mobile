// silkpanda/momentum-mobile/momentum-mobile-9f8d4a2b72b1c6b369312ebcd296db8cee196e6d/app/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthAndHouseholdProvider, useAuthAndHousehold } from './context/AuthAndHouseholdContext';

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  // We need a ref to track if we've already tried to route, which prevents the infinite loop.
  const isRoutingComplete = useRef(false); 
    
  const [loaded, error] = useFonts({
    // FIX: The correct relative path from app/_layout.tsx (inside 'app/') to the assets/ folder 
    // (at the project root) is '../assets/fonts/'. Reverting from the over-corrected path.
    'Inter': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-semibold': require('../assets/fonts/Inter-SemiBold.ttf'),
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
    // Only proceed if loading is done AND we haven't already completed a routing decision
    if (!isLoading && loaded && !isRoutingComplete.current) {
        isRoutingComplete.current = true; // Set flag to prevent future re-runs
        
        if (isAuthenticated) {
            // User is authenticated, redirect to the app
            router.replace('/(app)');
        } else {
            // User is not authenticated, redirect to login
            router.replace('/(auth)/login');
        }
    }
  }, [isAuthenticated, isLoading, loaded, router]); // Added router/loaded to dependency array

  // We rely on the initial splash screen being visible until all assets are loaded.
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