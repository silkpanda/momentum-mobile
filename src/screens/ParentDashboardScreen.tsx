import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";

// Define the types for our navigation stack
// This screen doesn't navigate anywhere *yet*
type RootStackParamList = {
  Dashboard: undefined;
};

// Mandatory PascalCase component name
export default function ParentDashboardScreen() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    // We'll wire this up to our API and auth store later
    // For now, it just calls the stubbed function
    logout();
  };

  return (
    // Use SafeAreaView for content to avoid notches/status bars
    // Styled as 'color-bg-canvas'
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Area */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        {/* Screen Title (H1) Styling */}
        <Text className="text-2xl font-semibold text-gray-900">
          Today's Focus
        </Text>

        [cite_start]{/* Secondary Button (Calm) for Logout [cite: 85-88] */}
        <TouchableOpacity
          className="bg-white border border-gray-200 rounded-lg py-2 px-4 shadow-sm"
          onPress={handleLogout}
        >
          <Text className="text-gray-600 font-medium text-base">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 p-4">
        {/* Placeholder for future content */}
        <Text className="text-lg font-medium text-gray-500 mb-4">
          Family Members
        </Text>
        {/* This is where we'll list the family members */}
        <View className="bg-white border border-gray-200 rounded-lg p-6">
          <Text className="text-base text-gray-600">
            (Content for Kiosk View, Task Lists, and Store Items will go
            here...)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}