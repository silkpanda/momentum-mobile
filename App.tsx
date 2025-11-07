// App.tsx
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen'; 

// Mandatory PascalCase variable name
const Stack = createNativeStackNavigator();

// Mandatory PascalCase component name
export default function App() {
  return (
    <NavigationContainer>
      {/* Status Bar style controlled by the app's theme */}
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Signup"
        screenOptions={{
          headerShown: false, // For a cleaner, mobile-first design
        }}
      >
        <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
        />
        <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
        />
        {/* All other core app screens will be added here later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}