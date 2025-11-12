import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  // This layout wraps all our auth screens (login, signup, etc.)
  // We use a Stack navigator here.
  return (
    <SafeAreaView className="flex-1 bg-bg-canvas">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaView>
  );
}