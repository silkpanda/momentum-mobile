// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/app/(auth)/login.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
// FIX: Path updated
import { useAuthAndHousehold } from "../../context/AuthAndHouseholdContext"; 
import { router } from "expo-router";
import { Octicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { signIn } = useAuthAndHousehold();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Local loading state for button

  const handleSignIn = async () => {
    if (isLoading) return;

    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(email, password);
      if (!success) {
        console.log("Sign in failed (error already alerted to user)");
      }
    } catch (err) {
      console.error("Unexpected login error", err);
      Alert.alert("Login Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="font-inter-semibold text-3xl text-text-primary mb-3">
        Welcome Back
      </Text>
      <Text className="font-inter text-text-secondary text-base mb-8">
        Log in to continue your day.
      </Text>

      {/* Form Fields */}
      <View className="space-y-4">
        <View>
          <Text className="font-inter-medium text-text-secondary text-sm mb-2">
            Email
          </Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-border-default bg-bg-default px-4 font-inter text-text-primary"
            placeholder="you@example.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>

        <View>
          <Text className="font-inter-medium text-text-secondary text-sm mb-2">
            Password
          </Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-border-default bg-bg-default px-4 font-inter text-text-primary"
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
        </View>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        className="mt-8 h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Octicons name="arrow-right" size={20} color="white" />
        )}
      </TouchableOpacity>

      {/* Go to Sign Up */}
      <View className="mt-8 flex-row justify-center">
        <Text className="font-inter text-text-secondary">
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
          <Text className="font-inter-medium text-action-primary-default">
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}