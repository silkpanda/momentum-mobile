import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";
import { API_URL } from "@/utils/config"; // <-- This import should now be valid

export default function SignupScreen() {
  // 1. Add state to hold the form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Create the function to call the API
  const onSignUpPress = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // We are calling the 'register' route from your authRoutes.ts
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server returns an error, show it
        throw new Error(data.message || "Something went wrong");
      }

      // Success!
      Alert.alert("Account Created", "You can now sign in.", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-canvas">
      <View className="flex-1 justify-center p-6">
        <Text className="mb-2 text-center font-inter-semibold text-2xl text-text-primary">
          Create Account
        </Text>
        <Text className="mb-8 text-center font-inter text-sm text-text-secondary">
          Let's get you started.
        </Text>

        <View className="mb-4">
          <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
            Full Name
          </Text>
          <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
            <Octicons
              name="person"
              size={16}
              className="mr-2 text-text-secondary"
            />
            <TextInput
              className="flex-1 font-inter text-base text-text-primary"
              placeholder="Your Name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              value={name} // <-- 3. Wire up state
              onChangeText={setName} // <-- 3. Wire up state
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
            Email
          </Text>
          <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
            <Octicons
              name="mail"
              size={16}
              className="mr-2 text-text-secondary"
            />
            <TextInput
              className="flex-1 font-inter text-base text-text-primary"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email} // <-- 3. Wire up state
              onChangeText={setEmail} // <-- 3. Wire up state
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
              value={password} // <-- 3. Wire up state
              onChangeText={setPassword} // <-- 3. Wire up state
            />
          </View>
        </View>

        {/* 4. Wire up the button */}
        <TouchableOpacity
          className="mb-4 h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
          onPress={onSignUpPress} // <-- 4. Wire up button
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center font-inter-medium text-base text-white">
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-center font-inter-medium text-base text-action-primary">
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}