// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, Alert, ViewStyle, TextStyle } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';
import axios, { isAxiosError } from 'axios'; // Import isAxiosError
import Input from '../components/Input';
import Button from '../components/Button';

// Mandatory PascalCase interface name
interface SignupScreenProps {
  // Navigation prop to allow moving to other screens (e.g., Login or KioskView)
  navigation: any; 
}

// Mandatory PascalCase component name
const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const tw = useTailwind();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the Parent Sign-Up (Phase 2.1)
  const handleSignup = async () => {
    if (!firstName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all mandatory fields.');
      return;
    }
    
    setIsLoading(true);
    
    // API MANDATE: Phase 2.1 - /api/v1/auth/signup
    const SIGNUP_URL = 'http://localhost:3000/api/v1/auth/signup'; 
    
    try {
      // Replaced TODO with actual axios post to the future API endpoint
      const response = await axios.post(SIGNUP_URL, {
        firstName,
        email,
        password
      });

      console.log('Signup successful:', response.data);
      
      // On success, navigate to the Login screen as a placeholder
      Alert.alert('Success', 'Account created! Please log in.');
      navigation.replace('Login'); 

    } catch (error) {
      // FIX APPLIED: Use isAxiosError to safely narrow the 'unknown' error type 
      // and access specific properties like response.
      if (isAxiosError(error)) {
        console.error('Signup failed:', error.message);
        Alert.alert(
          'Signup Failed', 
          error.response?.data?.message || 'An error occurred during registration. Please try again.'
        );
      } else {
        // Handle non-Axios errors (e.g., network issues, or other unexpected exceptions)
        console.error('An unexpected error occurred:', error);
        Alert.alert('Signup Failed', 'An unexpected error occurred. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use the mandated background canvas color
    <ScrollView 
      // FIX APPLIED: Asserted to ViewStyle
      style={tw('flex-1 bg-bg-canvas') as ViewStyle}
      // FIX APPLIED: Asserted to ViewStyle
      contentContainerStyle={tw('p-6 items-center') as ViewStyle}
      keyboardShouldPersistTaps="handled"
    >
      {/* Screen Title (H1 equivalent: font-semibold, text-2xl) */}
      {/* FIX APPLIED: Asserted to TextStyle */}
      <Text style={tw('font-semibold text-2xl text-text-primary mt-10 mb-8') as TextStyle}>
        Welcome to Momentum
      </Text>
      {/* FIX APPLIED: Asserted to TextStyle */}
      <Text style={tw('text-text-secondary mb-8 text-center') as TextStyle}>
        Let's create your primary Parent account and household.
      </Text>

      {/* FIX APPLIED: Asserted to ViewStyle */}
      <View style={tw('w-full max-w-sm') as ViewStyle}>
        <Input 
          label="Your First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
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
        
        <Button 
          title={isLoading ? 'Signing Up...' : 'Sign Up & Create Household'}
          onPress={handleSignup}
          disabled={isLoading}
          // FIX APPLIED: Asserted to ViewStyle
          style={tw('mt-4') as ViewStyle}
        />

        {/* FIX APPLIED: Asserted to ViewStyle */}
        <View style={tw('mt-8 items-center') as ViewStyle}>
          {/* FIX APPLIED: Asserted to TextStyle */}
          <Text style={tw('text-text-secondary') as TextStyle}>
            Already have an account? 
          </Text>
          <Button 
            title="Go to Login" 
            onPress={() => navigation.navigate('Login')} 
            // Tertiary/Text Button style (bg-transparent, text-action-primary)
            // FIX APPLIED: Asserted to ViewStyle
            style={tw('mt-2 bg-transparent') as ViewStyle}
            // FIX APPLIED: Corrected to pass the class string
            titleStyle='text-color-action-primary'
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;