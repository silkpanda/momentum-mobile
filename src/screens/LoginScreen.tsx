import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// We don't have this file yet, but we will soon
// import { useAuthStore } from "../store/authStore";

// Define the types for our navigation stack
// Both Login and Signup are in this stack
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
};
type NavigationProp = {
  navigate: (screen: keyof RootStackParamList) => void;
};

// Mandatory PascalCase component name
export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  // const { login } = useAuthStore(); // This is for later

  // Mandatory camelCase for variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mandatory camelCase for functions
  const handleLogin = async () => {
    // We'll wire this up to our API and auth store later
    // For now, just show an alert
    Alert.alert(
      "Login Tapped",
      `Email: ${email}, Password: (hidden)`
    );
    // try {
    //   await login(email, password);
    // } catch (error) {
    //   Alert.alert("Login Failed", "Invalid email or password.");
    // }
  };

  return (
    // Use SafeAreaView for content to avoid notches/status bars
    // Styled as 'color-bg-canvas'
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-6">
        {/* Screen Title (H1) Styling */}
        <Text className="text-2xl font-semibold text-center text-gray-900 mb-8">
          Welcome Back
        </Text>

        {/* Form Input Label Styling */}
        <Text className="text-sm font-medium text-gray-600 mb-2">
          Email
        </Text>
        [cite_start]{/* Form Input Field Styling [cite: 1333-1335] */}
        <TextInput
          className="bg-white border border-gray-200 rounded-md p-3 text-base text-gray-900 mb-4"
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF" // text-gray-400
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Form Input Label Styling */}
        <Text className="text-sm font-medium text-gray-600 mb-2">
          Password
        </Text>
        [cite_start]{/* Form Input Field Styling [cite: 1333-1335] */}
        <TextInput
          className="bg-white border border-gray-200 rounded-md p-3 text-base text-gray-900 mb-8"
          placeholder="Your secure password"
          placeholderTextColor="#9CA3AF" // text-gray-400
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        [cite_start]{/* Primary Button (Signal) Styling [cite: 1320-1322] */}
        <TouchableOpacity
          className="bg-indigo-600 rounded-lg py-3 px-5 shadow-sm"
          onPress={handleLogin}
        >
          <Text className="text-white text-base font-medium text-center">
            Log In
          </Text>
        </TouchableOpacity>

        {/* Tertiary/Text Button Styling */}
        <TouchableOpacity
          className="mt-6"
          onPress={() => navigation.navigate("Signup")}
        >
          <Text className="text-indigo-600 font-medium text-center">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}