import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-canvas p-6">
      <Text className="font-inter-semibold text-2xl text-text-primary">
        Login Screen
      </Text>
      <Text className="mt-2 font-inter text-base text-text-secondary">
        Build the login form here.
      </Text>

      <Link href="/" className="mt-8">
        <Text className="font-inter-medium text-base text-action-primary">
          Back to Startup
        </Text>
      </Link>
    </View>
  );
}