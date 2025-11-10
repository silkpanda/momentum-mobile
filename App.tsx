// App.tsx
import "./global.css"; // <-- MUST BE THE FIRST IMPORT

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen'; 
import ParentDashboardScreen from './src/screens/ParentDashboardScreen'; // Import the new screen
import { useAuthStore } from './src/store/authStore'; // Import the store

// Mandatory PascalCase variable name
const Stack = createNativeStackNavigator();

// Mandatory PascalCase component name
export default function App() {
  const { isAuthenticated } = useAuthStore(); // Get authentication state

  return (
    <NavigationContainer>
      {/* Status Bar style controlled by the app's theme */}
      <StatusBar style="auto" />
      <Stack.Navigator
        // Use initialRouteName conditionally based on auth state
        initialRouteName={isAuthenticated ? "Dashboard" : "Signup"} 
        screenOptions={{
          headerShown: false, // For a cleaner, mobile-first design
        }}
      >
        {isAuthenticated ? (
          // Authenticated Stack
          <Stack.Screen 
              name="Dashboard" 
              component={ParentDashboardScreen} 
          />
        ) : (
          // Unauthenticated Stack
          <>
            <Stack.Screen 
                name="Signup" 
                component={SignupScreen} 
            />
            <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}