import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DataProvider } from './src/contexts/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { NotificationManager } from './src/components/notifications/NotificationManager';
import { configureGoogleSignIn } from './src/config/googleSignIn';

import { SocketProvider } from './src/contexts/SocketContext';

// Initialize Google Sign-In configuration
configureGoogleSignIn();

// Detect if device is a tablet
const isTablet = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const aspectRatio = width / height;
  const minDimension = Math.min(width, height);

  // Tablets typically have larger screens (> 600dp) and closer to square aspect ratios
  return minDimension >= 600;
};

export default function App() {
  console.log('[App] Rendering App component');

  // Lock orientation based on device type
  useEffect(() => {
    async function lockOrientation() {
      if (isTablet()) {
        // Tablets: Allow all orientations
        await ScreenOrientation.unlockAsync();
        console.log('[App] Tablet detected - orientation unlocked');
      } else {
        // Phones: Lock to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        console.log('[App] Phone detected - locked to portrait');
      }
    }

    lockOrientation();
  }, []);

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <NavigationContainer>
              <AuthProvider>
                <SocketProvider>
                  <DataProvider>
                    <NotificationManager>
                      <AppNavigator />
                    </NotificationManager>
                    <StatusBar style="auto" />
                  </DataProvider>
                </SocketProvider>
              </AuthProvider>
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
