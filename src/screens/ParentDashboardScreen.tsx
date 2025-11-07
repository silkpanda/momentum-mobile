// src/screens/ParentDashboardScreen.tsx
import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';
import Button from '../components/Button';
import { useAuthStore } from '../store/authStore';

// Mandatory PascalCase interface name
interface ParentDashboardScreenProps {
  // Navigation prop not strictly needed but included for standard component structure
  navigation: any; 
}

// Mandatory PascalCase component name
const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = () => {
  const tw = useTailwind();
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={tw('flex-1 items-center justify-center bg-bg-canvas') as ViewStyle}>
      <Text style={tw('font-semibold text-2xl text-text-primary mb-4') as TextStyle}>
        Parent Dashboard (MVP)
      </Text>
      <Text style={tw('text-text-secondary mb-8 text-center px-4') as TextStyle}>
        Welcome. This view will contain all CRUD operations for Tasks, Store, and Members (Phase 2 & 3).
      </Text>
      
      <Button
        title="Logout"
        onPress={logout}
        // Use the action color for a clear primary button
        style={tw('mt-4 w-64') as ViewStyle}
      />
    </View>
  );
};

export default ParentDashboardScreen;