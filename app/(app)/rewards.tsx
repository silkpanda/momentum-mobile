// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/app/(app)/member/[id].tsx
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
// FIX: Path updated
import { useAuthAndHousehold } from "../../context/AuthAndHouseholdContext"; 
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import useSWR from "swr";
import { ITask } from "../../lib/types"; // <-- FIX: Path updated

// This will be the Task List component
const TaskList = ({ profileId }: { profileId: string }) => {
  // Fetch tasks assigned to this profile
  const { data: tasks, error, isLoading } = useSWR<ITask[]>(
    `/tasks/assigned/${profileId}`
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="small" />
      </View>
    );
  }
  
  if (error) {
    return <Text className="font-inter text-text-danger">{error.message}</Text>
  }

  if (!tasks || tasks.length === 0) {
    return (
      <View className="flex-1 justify-center items-center border border-dashed border-border-default rounded-lg">
        <Text className="font-inter text-text-secondary">
          No tasks assigned for today.
        </Text>
      </View>
    );
  }
  
  // TODO: Build the actual task list UI
  return (
    <View>
      {tasks.map((task) => (
        <View key={task._id} className="p-4 border-b border-border-default">
          <Text className="font-inter-medium text-text-primary">{task.name}</Text>
           <Text className="font-inter text-text-secondary">{task.points} points</Text>
        </View>
      ))}
    </View>
  )
};


export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { 
    currentMemberProfile, 
    selectMemberProfile,  
  } = useAuthAndHousehold();

  // On unmount, clear the selected profile
  useEffect(() => {
    return () => {
      selectMemberProfile(null);
    };
  }, [selectMemberProfile]);

  if (!currentMemberProfile || currentMemberProfile._id !== id) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-bg-canvas p-6">
        <Text className="font-inter-semibold text-xl text-text-primary mb-4 text-center">
          Loading Profile...
        </Text>
        <ActivityIndicator size="large" color={colors.primary} />
        <TouchableOpacity
          className="mt-8 h-12 flex-row items-center justify-center rounded-lg bg-action-primary py-3 px-5 shadow-sm"
          onPress={() => router.replace("/(app)")}
        >
          <Text className="text-center font-inter-medium text-base text-white">
            Back to Kiosk
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Main screen content
  return (
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: currentMemberProfile.profileColor }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        {/* Back Button */}
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={() => router.replace("/(app)")}
        >
          <Octicons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Profile Info */}
        <View className="flex-1 items-center">
          <Text className="font-inter-semibold text-2xl text-white">
            {currentMemberProfile.displayName}
          </Text>
          <Text className="font-inter-medium text-base text-white opacity-80">
            Points: {currentMemberProfile.pointsTotal}
          </Text>
        </View>

        {/* Placeholder for right-side icon (e.g., settings) */}
        <View className="h-10 w-10" />
      </View>

      {/* Main Content Area (for tasks) */}
      <View className="flex-1 bg-bg-canvas rounded-t-2xl p-6">
        <Text className="font-inter-semibold text-2xl text-text-primary mb-4">
          Today's Focus
        </Text>
        <TaskList profileId={currentMemberProfile._id} />
      </View>
    </SafeAreaView>
  );
}