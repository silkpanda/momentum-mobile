// silkpanda/momentum-mobile/momentum-mobile-48a3bdaec149b6570562600bab21372e4eb95908/app/(app)/index.tsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // <-- FIX 1: Import SafeAreaView
import { useAuthAndHousehold, IHouseholdMemberProfile } from "../context/AuthAndHouseholdContext";
import { router } from "expo-router";
import { Octicons } from "@expo/vector-icons";

// Component for the Kiosk Profile Card
const ProfileCard = ({ profile }: { profile: IHouseholdMemberProfile }) => {
  // FIX 2: Removed broken dynamic bgColorClass. 
  // NativeWind cannot build dynamic classes like `bg-${color}-500` at runtime.
  // We will apply the color directly via inline style.

  const onPress = () => {
    // Navigate to the member's main task/point view (Phase 3.2, TBD)
    router.navigate(`/(app)/member/${profile._id}`); 
  };

  return (
    <TouchableOpacity
      // FIX 3: Removed ${bgColorClass} from className
      className={`h-40 w-full p-4 rounded-xl shadow-lg my-2`}
      onPress={onPress}
      // Set the color for the Octicons based on the profile color for contrast (e.g., white text on color background)
      style={{ 
        backgroundColor: profile.profileColor, // <-- FIX 4: Apply color directly as an inline style
        // We'll set the text color to white for contrast on the colorful card
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-medium text-lg text-white capitalize">
          {profile.role}
        </Text>
        <Octicons name="chevron-right" size={24} color="#FFFFFF" />
      </View>
      <View className="flex-1 justify-center">
        <Text className="font-inter-semibold text-4xl text-white">
          {profile.displayName}
        </Text>
        <Text className="font-inter-medium text-lg text-white opacity-80">
          Points: {profile.pointsTotal}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


export default function KioskScreen() {
  const { currentHousehold, isLoading, currentMemberProfile } = useAuthAndHousehold();

  if (isLoading) {
    return (
      // FIX 5: Use SafeAreaView here for loading state as well
      <SafeAreaView className="flex-1 justify-center items-center bg-bg-canvas">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 font-inter text-text-secondary">Loading Household...</Text>
      </SafeAreaView>
    );
  }

  // If loading is finished but no household is found, redirect to a creation screen (Phase 2.3 flow)
  if (!currentHousehold) {
    // In a final MVP, this would navigate to the Create Household screen.
    return (
      // FIX 6: Use SafeAreaView here for the "No Household" state
      <SafeAreaView className="flex-1 justify-center items-center p-6 bg-bg-canvas">
        <Text className="font-inter-semibold text-xl text-text-primary mb-4 text-center">
          No Household Context
        </Text>
        <Text className="font-inter text-text-secondary mb-8 text-center">
          It looks like you haven't created a household yet. Please create one to continue.
        </Text>
        <TouchableOpacity
            className="h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
            onPress={() => console.log('TODO: Navigate to Create Household Screen')}
          >
            <Text className="text-center font-inter-medium text-base text-white">
                Create Household
            </Text>
          </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Kiosk View: Display all member profiles
  return (
    // FIX 7: Replace root View with SafeAreaView to respect device's status bar/notch
    <SafeAreaView className="flex-1 bg-bg-canvas p-6">
      <Text className="font-inter-semibold text-3xl text-text-primary mb-2">
        {currentHousehold.householdName}
      </Text>
      <Text className="font-inter text-text-secondary text-base mb-6">
        Select a profile to begin your focus session.
      </Text>

      <FlatList
        data={currentHousehold.memberProfiles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ProfileCard profile={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}