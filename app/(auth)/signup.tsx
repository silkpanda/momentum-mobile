import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Octicons } from "@expo/vector-icons";
import { API_URL } from "@/utils/config";
import { useAuthAndHousehold } from "../context/AuthAndHouseholdContext";

// Profile colors from Governance Doc
const PROFILE_COLORS = [
  { name: 'Blueberry', hex: '#4285F4' }, { name: 'Celtic Blue', hex: '#1967D2' },
  { name: 'Selective Yellow', hex: '#FBBC04' }, { name: 'Pigment Red', hex: '#F72A25' },
  { name: 'Sea Green', hex: '#34A853' }, { name: 'Dark Spring Green', hex: '#188038' },
  { name: 'Tangerine', hex: '#FF8C00' }, { name: 'Grape', 'hex': '#8E24AA' },
  { name: 'Flamingo', hex: '#E67C73' }, { name: 'Peacock', hex: '#039BE5' },
];

export default function SignupScreen() {
  const { signIn } = useAuthAndHousehold();

  // --- NEW STEP STATE ---
  const [step, setStep] = useState(1);
  
  // --- ALL FORM STATES ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0].hex);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleNextStep = () => {
    setError(null);
    if (!firstName || !lastName || !email || !password) {
        setError('Please complete all required fields.');
        return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }
    setStep(2);
  }

  const onSignUpPress = async () => {
    if (isLoading) return;
    setError(null);

    // Final client-side validation for Step 2 fields
    if (!householdName || !userDisplayName) {
        setError('Please provide a Household Name and Display Name.');
        return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          householdName,
          userDisplayName,
          userProfileColor: selectedColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      await signIn(data.token); 

      Alert.alert("Account Created", "You can now start using Momentum.", [
        { text: "OK", onPress: () => router.replace("/(app)") },
      ]);
    } catch (error: any) {
      if (error.message.includes("JSON")) {
        setError(
          "Error connecting to server. Please check your ngrok URL and network connection."
        );
      } else {
        setError(error.message); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <>
      <Text className="mb-2 text-center font-inter-semibold text-2xl text-text-primary">
        Your Identity & Security
      </Text>
      <Text className="mb-8 text-center font-inter text-sm text-text-secondary">
        Step 1 of 2: Who are you?
      </Text>

      {/* First Name & Last Name */}
      <View className="mb-4">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Your First Name
        </Text>
        <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
          <Octicons name="person" size={16} className="mr-2 text-text-secondary" />
          <TextInput
            className="flex-1 font-inter text-base text-text-primary"
            placeholder="e.g., Jessica"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
      </View>
      
      <View className="mb-4">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Your Last Name
        </Text>
        <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
          <Octicons name="person" size={16} className="mr-2 text-text-secondary" />
          <TextInput
            className="flex-1 font-inter text-base text-text-primary"
            placeholder="e.g., Smith"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>
      
      {/* Email Input */}
      <View className="mb-4">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Email
        </Text>
        <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
          <Octicons name="mail" size={16} className="mr-2 text-text-secondary" />
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

      {/* Password Input */}
      <View className="mb-6">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Password (Min. 8 characters)
        </Text>
        <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
          <Octicons name="lock" size={16} className="mr-2 text-text-secondary" />
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
        onPress={handleNextStep}
        disabled={isLoading}
      >
        <Text className="text-center font-inter-medium text-base text-white">
          Next: Create Household
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderStepTwo = () => (
    <>
      <Text className="mb-2 text-center font-inter-semibold text-2xl text-text-primary">
        Create Your Household
      </Text>
      <Text className="mb-8 text-center font-inter text-sm text-text-secondary">
        Step 2 of 2: Set up your family space.
      </Text>

      {/* Household Name Input */}
      <View className="mb-4">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Household Name
        </Text>
        <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
          <Octicons name="home" size={16} className="mr-2 text-text-secondary" />
          <TextInput
            className="flex-1 font-inter text-base text-text-primary"
            placeholder="e.g., 'The Smith Family'"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={householdName}
            onChangeText={setHouseholdName}
          />
        </View>
      </View>
      
      {/* Your Display Name Input */}
      <View className="mb-4">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Your Display Name
        </Text>
        <View className="flex-row items-center rounded-lg border border-border-subtle bg-bg-surface p-3">
          <Octicons name="person" size={16} className="mr-2 text-text-secondary" />
          <TextInput
            className="flex-1 font-inter text-base text-text-primary"
            placeholder="e.g., 'Mom' or 'Jessica'"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={userDisplayName}
            onChangeText={setUserDisplayName}
          />
        </View>
      </View>

      {/* Color Picker */}
      <View className="mb-6">
        <Text className="mb-2 font-inter-medium text-sm text-text-secondary">
          Your Profile Color
        </Text>
        <View className="flex-row flex-wrap gap-2 p-2 bg-bg-canvas rounded-lg border border-border-subtle">
          {PROFILE_COLORS.map((color) => (
            <TouchableOpacity
              key={color.hex}
              onPress={() => setSelectedColor(color.hex)}
              className={`w-8 h-8 rounded-full border-2 transition-all items-center justify-center`}
              style={{ 
                backgroundColor: color.hex,
                borderColor: selectedColor === color.hex ? PROFILE_COLORS[0].hex : 'transparent',
                borderWidth: selectedColor === color.hex ? 3 : 0,
                opacity: selectedColor === color.hex ? 1 : 0.7,
              }}
            >
              {selectedColor === color.hex && <Octicons name="check" size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        className="mb-4 h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
        onPress={onSignUpPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-center font-inter-medium text-base text-white">
            Create Account & Sign In
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        className="h-12 flex-row items-center justify-center"
        onPress={() => setStep(1)}
      >
        <Text className="text-center font-inter-medium text-base text-text-secondary">
          {"< Back to Step 1"}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-bg-canvas"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, 
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6">
          
          {/* Error Display (Appears on both steps) */}
          {error && (
            <View className="mb-4 flex-row items-center p-4 bg-signal-alert/10 rounded-lg border border-border-subtle">
              <Octicons name="alert" size={16} className="mr-3 text-signal-alert" />
              <Text className="text-sm font-inter-medium text-signal-alert">
                {error}
              </Text>
            </View>
          )}

          {step === 1 ? renderStepOne() : renderStepTwo()}

          <Link href="/login" asChild>
            <TouchableOpacity className="mt-6">
              <Text className="text-center font-inter-medium text-base text-action-primary">
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}