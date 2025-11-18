import { View, Text, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- TYPES ---
// We should eventually move these to a shared types file
interface MemberProfile {
  _id: string;
  familyMemberId: string;
  displayName: string;
  profileColor: string;
  role: 'Parent' | 'Child';
  pointsTotal: number;
}

interface HouseholdData {
  _id: string;
  householdName: string;
  memberProfiles: MemberProfile[];
}

// --- COMPONENT ---
export default function ProfileSelectionScreen() {
  // HARDCODED HOUSEHOLD ID FOR PHASE 1/2 DEV
  // In Phase 3 (Auth), we will get this from the logged-in user's context.
  // REPLACEME: Put a valid Household ID from your MongoDB here!
  const TEST_HOUSEHOLD_ID = 'REPLACE_WITH_VALID_HOUSEHOLD_ID'; 

  // 1. Fetch Household Data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['household', TEST_HOUSEHOLD_ID],
    queryFn: async () => {
      // This calls GET /api/v1/household/:id on the BFF
      const response = await api.get(`/api/v1/household/${TEST_HOUSEHOLD_ID}`);
      return response.data as HouseholdData; // core API returns the object directly now
    },
  });

  // 2. Loading State
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500 font-medium">Loading Household...</Text>
      </SafeAreaView>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-600 text-lg font-bold mb-2">Unable to Connect</Text>
        <Text className="text-gray-600 text-center mb-6">
          Could not fetch household data. Is the BFF running on Port 3002?
        </Text>
        <Text className="text-xs text-gray-400 mb-4 text-center">
          {(error as Error).message}
        </Text>
      </SafeAreaView>
    );
  }

  // 4. Success State - Render Profiles
  const household = data;
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="p-6">
        <Text className="text-3xl font-bold text-gray-900 text-center mt-10 mb-2">
          Who is watching?
        </Text>
        <Text className="text-gray-500 text-center mb-10">
          {household?.householdName}
        </Text>

        <View className="flex-row flex-wrap justify-center gap-6">
          {household?.memberProfiles.map((profile) => (
            <Pressable 
              key={profile._id || profile.familyMemberId}
              className="items-center mb-6"
              onPress={() => console.log(`Selected: ${profile.displayName}`)}
            >
              {/* Avatar Circle */}
              <View 
                className="w-24 h-24 rounded-full justify-center items-center shadow-sm mb-3"
                style={{ backgroundColor: profile.profileColor }}
              >
                <Text className="text-3xl text-white font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              {/* Name Label */}
              <Text className="text-lg font-medium text-gray-800">
                {profile.displayName}
              </Text>
              
              {/* Role Badge */}
              <View className={`mt-1 px-2 py-0.5 rounded-full ${profile.role === 'Parent' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                 <Text className={`text-xs ${profile.role === 'Parent' ? 'text-indigo-700' : 'text-green-700'}`}>
                   {profile.role}
                 </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}