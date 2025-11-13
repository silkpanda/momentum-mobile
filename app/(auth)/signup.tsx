// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/app/(auth)/signup.tsx
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

export default function SignUpScreen() {
  const { signUp } = useAuthAndHousehold();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (isLoading) return;

    if (!email || !password || !firstName || !lastName) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signUp({
        email,
        password,
        firstName,
        lastName,
      });
      if (!success) {
        console.log("Sign up failed (error already alerted to user)");
      }
    } catch (err) {
      console.error("Unexpected signup error", err);
      Alert.alert("Sign Up Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="font-inter-semibold text-3xl text-text-primary mb-3">
        Create Account
      </Text>
      <Text className="font-inter text-text-secondary text-base mb-8">
        Let's get started with Momentum.
      </Text>

      {/* Form Fields */}
      <View className="space-y-4">
        <View>
          <Text className="font-inter-medium text-text-secondary text-sm mb-2">
            First Name
          </Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-border-default bg-bg-default px-4 font-inter text-text-primary"
            placeholder="Your first name"
            placeholderTextColor="#6b7280"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            textContentType="givenName"
          />
        </View>

        <View>
          <Text className="font-inter-medium text-text-secondary text-sm mb-2">
            Last Name
          </Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-border-default bg-bg-default px-4 font-inter text-text-primary"
            placeholder="Your last name"
            placeholderTextColor="#6b7280"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            textContentType="familyName"
          />
        </View>
        
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
            textContentType="newPassword"
          />
        </View>

        <View>
          <Text className="font-inter-medium text-text-secondary text-sm mb-2">
            Confirm Password
          </Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-border-default bg-bg-default px-4 font-inter text-text-primary"
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
          />
        </View>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        className="mt-8 h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
        onPress={handleSignUp}
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

      {/* Go to Login */}
      <View className="mt-8 flex-row justify-center">
        <Text className="font-inter text-text-secondary">
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text className="font-inter-medium text-action-primary-default">
            Log in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}