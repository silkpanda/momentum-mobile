// silkpanda/momentum-mobile/momentum-mobile-48a3bdaec149b6570562600bab21372e4eb95908/app/(app)/index.tsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuthAndHousehold, IHouseholdMemberProfile } from "../context/AuthAndHouseholdContext";
import { router } from "expo-router";
import { Octicons } from "@expo/vector-icons";

// Component for the Kiosk Profile Card
const ProfileCard = ({ profile }: { profile: IHouseholdMemberProfile }) => {
  // Utility class for dynamic background color based on the profileColor property
  const bgColorClass = `bg-${profile.profileColor}-500`; 

  const onPress = () => {
    // Navigate to the member's main task/point view (Phase 3.2, TBD)
    router.navigate(`/(app)/member/${profile._id}`); 
  };

  return (
    <TouchableOpacity
      className={`h-40 w-full p-4 rounded-xl shadow-lg my-2 ${bgColorClass}`}
      onPress={onPress}
      // Set the color for the Octicons based on the profile color for contrast (e.g., white text on color background)
      style={{ 
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
      <View className="flex-1 justify-center items-center bg-bg-canvas">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 font-inter text-text-secondary">Loading Household...</Text>
      </View>
    );
  }

  // If loading is finished but no household is found, redirect to a creation screen (Phase 2.3 flow)
  if (!currentHousehold) {
    // In a final MVP, this would navigate to the Create Household screen.
    return (
      <View className="flex-1 justify-center items-center p-6 bg-bg-canvas">
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
      </View>
    );
  }

  // Kiosk View: Display all member profiles
  return (
    <View className="flex-1 bg-bg-canvas p-6">
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
    </View>
  );
}