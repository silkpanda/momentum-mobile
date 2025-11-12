import { Link } from "expo-router";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";

export default function LoginScreen() {
  return (
    // Use SafeAreaView for auth screens as per app/(auth)/_layout.tsx
    <SafeAreaView className="flex-1 bg-bg-canvas">
      <View className="flex-1 justify-center p-6">
        {/* Screen Title (H1) [cite: 490] */}
        <Text className="mb-2 text-center font-inter-semibold text-2xl text-text-primary">
          Welcome Back
        </Text>
        {/* Body / Descriptions (Body-Small) [cite: 493] */}
        <Text className="mb-8 text-center font-inter text-sm text-text-secondary">
          Please sign in to your account.
        </Text>

        {/* Form Container */}
        <View className="mb-4">
          {/* Input Label [cite: 569] */}
          <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
            Email
          </Text>
          {/* Input Field [cite: 566, 567] */}
          <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
            <Octicons
              name="person"
              size={16}
              className="mr-2 text-text-secondary"
            />
            <TextInput
              className="flex-1 font-inter text-base text-text-primary"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF" // gray-400
              keyboardType="email-address"
              autoCapitalize="none"
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
              placeholderTextColor="#9CA3AF" // gray-400
              secureTextEntry
            />
          </View>
          {/* We can add a "Forgot Password?" link here later */}
        </View>

        {/* Primary Button (Signal) [cite: 553, 554, 555] */}
        <TouchableOpacity className="mb-4 rounded-lg bg-action-primary py-3 px-5 shadow-sm">
          <Text className="text-center font-inter-medium text-base text-white">
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Tertiary/Text Button [cite: 561, 562] */}
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <Text className="text-center font-inter-medium text-base text-action-primary">
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}