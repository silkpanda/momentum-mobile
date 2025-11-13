// silkpanda/momentum-mobile/momentum-mobile-48a3bdaec149b6570562600bab21372e4eb95908/app/(app)/index.tsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAuthAndHousehold,
  useHousehold 
} from "../../context/AuthAndHouseholdContext";
import { IHouseholdMemberProfile } from "../../lib/types";
import { router } from "expo-router";
import { Octicons } from "@expo/vector-icons";

// Component for the Kiosk Profile Card
const ProfileCard = ({ profile }: { profile: IHouseholdMemberProfile }) => {
  
  const { selectMemberProfile } = useAuthAndHousehold();

  const onPress = () => {
    selectMemberProfile(profile);
    router.navigate(`/(app)/member/${profile._id}`); 
  };

  return (
    <TouchableOpacity
      className={`h-40 w-full p-4 rounded-xl shadow-lg my-2`}
      onPress={onPress}
      style={{ 
        backgroundColor: profile.profileColor,
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
  const { household, error, isLoading } = useHousehold();
  const { signOut } = useAuthAndHousehold(); // <-- FIX: Get the signOut function

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-bg-canvas">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 font-inter text-text-secondary">Loading Household...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
     return (
      <SafeAreaView className="flex-1 justify-center items-center p-6 bg-bg-canvas">
        <Text className="font-inter-semibold text-xl text-text-primary mb-4 text-center">
          Error Loading Household
        </Text>
        <Text className="font-inter text-text-secondary mb-8 text-center">
          {error.message}
        </Text>
         {/* FIX: Add Sign Out button to error state */}
        <TouchableOpacity
          className="mt-4 h-12 flex-row items-center justify-center rounded-lg bg-action-danger-default py-3 px-5 shadow-sm"
          onPress={signOut}
        >
          <Text className="text-center font-inter-medium text-base text-white">
            Sign Out
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // If loading is finished but no household is found (e.g., new user)
  if (!household) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center p-6 bg-bg-canvas">
        <Text className="font-inter-semibold text-xl text-text-primary mb-4 text-center">
          No Household Found
        </Text>
        <Text className="font-inter text-text-secondary mb-8 text-center">
          You are not yet part of a household. Please create or join one (web app).
        </Text>
        
        {/* FIX: Add Sign Out button so the user isn't stuck */}
        <TouchableOpacity
          className="mt-4 h-12 flex-row items-center justify-center rounded-lg bg-action-danger-default py-3 px-5 shadow-sm"
          onPress={signOut}
        >
          <Text className="text-center font-inter-medium text-base text-white">
            Sign Out
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Kiosk View: Display all member profiles
  return (
    <SafeAreaView className="flex-1 bg-bg-canvas p-6">
      <Text className="font-inter-semibold text-3xl text-text-primary mb-2">
        {household.householdName}
      </Text>
      <Text className="font-inter text-text-secondary text-base mb-6">
        Select a profile to begin your focus session.
      </Text>

      <FlatList
        data={household.memberProfiles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ProfileCard profile={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}