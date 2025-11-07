// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';
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
    
    // TODO: Replace with actual API call (Phase 2.1 - /api/v1/auth/signup)
    console.log('Attempting signup with:', { firstName, email, password });
    
    try {
      // Simulate API call success/failure (replace with axios.post)
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      // On success, navigate to the Login screen as a placeholder
      Alert.alert('Success', 'Account created! Please log in.');
      navigation.replace('Login'); 

    } catch (error) {
      console.error('Signup failed:', error);
      Alert.alert('Signup Failed', 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use the mandated background canvas color
    <ScrollView 
      style={tw('flex-1 bg-bg-canvas')}
      contentContainerStyle={tw('p-6 items-center')}
      keyboardShouldPersistTaps="handled"
    >
      {/* Screen Title (H1 equivalent: font-semibold, text-2xl) */}
      <Text style={tw('font-semibold text-2xl text-text-primary mt-10 mb-8')}>
        Welcome to Momentum
      </Text>
      <Text style={tw('text-text-secondary mb-8 text-center')}>
        Let's create your primary Parent account and household.
      </Text>

      <View style={tw('w-full max-w-sm')}>
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
          style={tw('mt-4')}
        />

        <View style={tw('mt-8 items-center')}>
          <Text style={tw('text-text-secondary')}>
            Already have an account? 
          </Text>
          <Button 
            title="Go to Login" 
            onPress={() => navigation.navigate('Login')} 
            // Tertiary/Text Button style (bg-transparent, text-action-primary)
            style={tw('mt-2 bg-transparent')}
            titleStyle={tw('text-color-action-primary')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;