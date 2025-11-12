import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView, // <-- Import is correct
  Platform,
  ScrollView,
} from "react-native";
// --- 1. REMOVE SafeAreaView import ---
import { Octicons } from "@expo/vector-icons";
import { API_URL } from "@/utils/config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSignInPress = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      Alert.alert("Login Success", "Welcome back!");
      router.replace("/(app)");
    } catch (error: any) {
      if (error.message.includes("JSON")) {
        Alert.alert(
          "Login Failed",
          "Error connecting to server. Please check your ngrok URL and network connection."
        );
      } else {
        Alert.alert("Login Failed", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // --- 2. Make KeyboardAvoidingView the root component ---
    // Move the className from SafeAreaView here
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-bg-canvas" // <-- 3. Moved classes here
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="justify-center p-6">
          <Text className="mb-2 text-center font-inter-semibold text-2xl text-text-primary">
            Welcome Back
          </Text>
          <Text className="mb-8 text-center font-inter text-sm text-text-secondary">
            Please sign in to your account.
          </Text>

          {/* Form Container */}
          <View className="mb-4">
            <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
              Email
            </Text>
            <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
              <Octicons
                name="person"
                size={16}
                className="mr-2 text-text-secondary"
              />
              <TextInput
                className="flex-1 font-inter text-base text-text-primary"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
              Password
            </Text>
            <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
              <Octicons
                name="lock"
                size={16}
                className="mr-2 text-text-secondary"
              />
              <TextInput
                className="flex-1 font-inter text-base text-text-primary"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            className="mb-4 h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
            onPress={onSignInPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center font-inter-medium text-base text-white">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text className="text-center font-inter-medium text-base text-action-primary">
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    // --- 4. Removed the extra SafeAreaView wrapper ---
  );
}