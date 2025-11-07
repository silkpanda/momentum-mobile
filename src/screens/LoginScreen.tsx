// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ViewStyle, TextStyle } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';
import axios, { isAxiosError } from 'axios';
import Button from '../components/Button';
import { useAuthStore } from '../store/authStore'; // Import the store
import Input from '../components/Input'; // Ensure Input is imported

// Mandatory PascalCase interface name
interface LoginScreenProps {
  navigation: any;
}

// Mandatory PascalCase component name
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const tw = useTailwind();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('parent@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    // API MANDATE: Phase 2.1 - /api/v1/auth/login (JWT generation)
    const LOGIN_URL = 'http://localhost:3000/api/v1/auth/login'; 

    try {
      const response = await axios.post(LOGIN_URL, {
        email,
        password,
      });

      // API MANDATE: Assume the backend returns a JWT token in data.token
      const { token } = response.data; 

      if (token) {
        // Use Zustand store to save the token and set isAuthenticated to true
        login(token); 
        // Navigation is now handled by App.tsx rerender
      } else {
        Alert.alert('Login Failed', 'Token not received from server.');
      }

    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Login failed:', error.message);
        Alert.alert(
          'Login Failed', 
          error.response?.data?.message || 'Invalid email or password. Please try again.'
        );
      } else {
        console.error('An unexpected error occurred:', error);
        Alert.alert('Login Failed', 'An unexpected error occurred. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // FIX APPLIED: Asserted to ViewStyle
    <View style={tw('flex-1 items-center justify-center bg-bg-canvas') as ViewStyle}>
      {/* FIX APPLIED: Asserted to TextStyle */}
      <Text style={tw('font-semibold text-2xl text-text-primary mb-4') as TextStyle}>
        Login
      </Text>
      {/* FIX APPLIED: Asserted to TextStyle */}
      <Text style={tw('text-text-secondary mb-8') as TextStyle}>
        Sign in with your Parent account.
      </Text>
      
      {/* Inputs added for functionality */}
      <View style={tw('w-full max-w-xs mb-4') as ViewStyle}>
        <Input 
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input 
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Button 
        title={isLoading ? 'Logging In...' : 'Login'}
        onPress={handleLogin} 
        disabled={isLoading}
        style={tw('mt-4 w-64') as ViewStyle}
      />
      <Button 
        title="Go to Signup" 
        onPress={() => navigation.navigate('Signup')} 
        // Tertiary/Text Button style (bg-transparent, text-action-primary)
        style={tw('mt-2 bg-transparent w-64') as ViewStyle}
        titleStyle='text-color-action-primary'
      />
    </View>
  );
};

export default LoginScreen;