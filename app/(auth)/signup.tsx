import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignupScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-canvas p-6">
      <Text className="font-inter-semibold text-2xl text-text-primary">
        Signup Screen
      </Text>
      <Text className="mt-2 font-inter text-base text-text-secondary">
        Build the signup form here.
      </Text>

      <Link href="/" className="mt-8">
        <Text className="font-inter-medium text-base text-action-primary">
          Back to Startup
        </Text>
      </Link>
    </View>
  );
}