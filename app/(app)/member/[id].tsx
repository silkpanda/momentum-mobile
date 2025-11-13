import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberTaskView() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-bg-canvas p-6">
      <View>
        <Text className="font-inter-semibold text-2xl text-text-primary">
          Member Task & Point View
        </Text>
        <Text className="font-inter text-base text-text-secondary mt-2">
          This is the Phase 3.2 screen for member ID: **{id}**.
        </Text>
        <Text className="font-inter text-sm text-text-secondary mt-1">
          (Future implementation: Will show tasks and points from Household.memberProfiles.pointsTotal)
        </Text>
      </View>
    </SafeAreaView>
  );
}