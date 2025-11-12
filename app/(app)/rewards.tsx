import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RewardsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-canvas">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="font-inter-semibold text-2xl text-text-primary">
          Rewards
        </Text>
        <Text className="mt-2 text-center font-inter text-base text-text-secondary">
          This is where the "Family Points" and store will go.
        </Text>
      </View>
    </SafeAreaView>
  );
}