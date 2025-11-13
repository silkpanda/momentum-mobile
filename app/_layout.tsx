// silkpanda/momentum-mobile/momentum-mobile-9f8d4a2b72b1c6b369312ebcd296db8cee196e6d/app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router'; // <-- FIX: Import useSegments
import { useFonts } from 'expo-font';
import { useEffect } from 'react'; // <-- FIX: Removed useRef
import * as SplashScreen from 'expo-splash-screen';
import { AuthAndHouseholdProvider, useAuthAndHousehold } from './context/AuthAndHouseholdContext';

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments(); // <-- FIX: Get current route segments
  // FIX: Removed the isRoutingComplete ref

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
    // FIX: Re-written auth logic
    // Wait until auth is no longer loading AND fonts are loaded
    if (isLoading || !loaded) {
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
    // If (isAuthenticated && inAppGroup) -> do nothing, user is in the right place
    // If (!isAuthenticated && !inAppGroup) -> do nothing, user is in auth flow
    
  }, [isAuthenticated, isLoading, loaded, segments, router]); // <-- FIX: Added segments

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