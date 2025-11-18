import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// --- TYPES ---
interface KioskData {
  household: {
    _id: string;
    householdName: string;
    memberProfiles: any[];
  };
  tasks: any[];
  rewards: any[];
}

export default function KioskDashboard() {
  const router = useRouter();

  // 1. Fetch the Aggregated Kiosk Data
  const { data, isLoading, error } = useQuery({
    queryKey: ['kiosk-data'],
    queryFn: async () => {
      const response = await api.get('/api/v1/kiosk-data');
      return response.data.data as KioskData;
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 font-medium">Loading Momentum...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50 p-6">
        <Text className="text-red-600 font-bold">Error loading kiosk</Text>
        <Text className="text-gray-400 text-xs mt-2">{(error as Error).message}</Text>
      </SafeAreaView>
    );
  }

  const { household, tasks, rewards } = data!;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="p-6 pb-20">
        
        {/* Header */}
        <View className="mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 text-sm font-medium uppercase tracking-wider">
              {household?.householdName}
            </Text>
            <Text className="text-3xl font-bold text-slate-900">
              Kiosk Dashboard
            </Text>
          </View>
          <Pressable 
            onPress={() => router.back()}
            className="bg-slate-200 px-4 py-2 rounded-full"
          >
            <Text className="font-bold text-slate-600">Switch Profile</Text>
          </Pressable>
        </View>

        {/* Tasks Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-slate-800 mb-4">
            Available Tasks ({tasks.length})
          </Text>
          {tasks.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl border border-slate-100 items-center">
              <Text className="text-slate-400">No tasks available right now!</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <View key={task._id} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate-900">{task.title}</Text>
                  <Text className="text-slate-500 text-sm">{task.description || 'No description'}</Text>
                </View>
                <View className="bg-indigo-50 px-3 py-1 rounded-lg">
                   <Text className="text-indigo-700 font-bold">+{task.pointsValue} pts</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Rewards Section */}
        <View>
          <Text className="text-xl font-bold text-slate-800 mb-4">
            Reward Store ({rewards.length})
          </Text>
          <View className="flex-row flex-wrap gap-3">
             {rewards.map((item) => (
               <View key={item._id} className="bg-white p-4 rounded-2xl border border-slate-100 w-[48%] shadow-sm">
                  <Text className="font-bold text-slate-900 mb-1">{item.itemName}</Text>
                  <Text className="text-slate-500 text-xs mb-3">{item.cost} points</Text>
                  <Pressable className="bg-green-50 py-2 rounded-lg items-center">
                    <Text className="text-green-700 font-bold text-xs">Purchase</Text>
                  </Pressable>
               </View>
             ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}