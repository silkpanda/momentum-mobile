// src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';
import Button from '../components/Button';

// Mandatory PascalCase interface name
interface LoginScreenProps {
  navigation: any;
}

// Mandatory PascalCase component name
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const tw = useTailwind();

  const handleLogin = () => {
    // TODO: Implement actual login logic (Phase 2.1)
    Alert.alert('Login', 'Login functionality will be implemented here.');
  };

  return (
    <View style={tw('flex-1 items-center justify-center bg-bg-canvas')}>
      <Text style={tw('font-semibold text-2xl text-text-primary mb-4')}>
        Login
      </Text>
      <Text style={tw('text-text-secondary mb-8')}>
        Sign in with your Parent account.
      </Text>
      
      {/* Placeholder for Inputs to be added later */}
      <View style={tw('w-full max-w-xs mb-4')}>
        <Text style={tw('text-text-secondary text-center')}>[Email/Password Inputs Here]</Text>
      </View>

      <Button title="Login" onPress={handleLogin} style={tw('mt-4 w-64')} />
      <Button 
        title="Go to Signup" 
        onPress={() => navigation.navigate('Signup')} 
        // Tertiary/Text Button style (bg-transparent, text-action-primary)
        style={tw('mt-2 bg-transparent w-64')}
        titleStyle={tw('text-color-action-primary')}
      />
    </View>
  );
};

export default LoginScreen;