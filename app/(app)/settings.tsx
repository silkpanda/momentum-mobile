// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/app/(app)/settings.tsx
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// FIX: Path updated
import { useAuthAndHousehold, useSession } from "../../context/AuthAndHouseholdContext"; 

export default function SettingsScreen() {
  const { signOut } = useAuthAndHousehold();
  const { session, isLoading } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-bg-canvas p-6">
      <Text className="font-inter-semibold text-3xl text-text-primary mb-6">
        Settings
      </Text>

      {/* Current User Info */}
      {isLoading && (
        <ActivityIndicator size="small" />
      )}
      
      {session?.user && (
        <View className="mb-6 p-4 rounded-lg bg-bg-default border border-border-default">
          <Text className="font-inter text-text-secondary mb-1">
            Logged In As
          </Text>
          <Text className="font-inter-semibold text-xl text-text-primary">
            {session.user.firstName} {session.user.lastName}
          </Text>
          <Text className="font-inter text-text-secondary">
            {session.user.email}
          </Text>
        </View>
      )}

      {/* Sign Out Button */}
      <TouchableOpacity
        className="h-12 flex-row items-center justify-center rounded-lg bg-action-danger-default py-3 px-5 shadow-sm"
        onPress={signOut}
      >
        <Text className="text-center font-inter-medium text-base text-white">
          Sign Out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}