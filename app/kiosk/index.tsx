import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert, RefreshControl, useWindowDimensions, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// --- TYPES ---
interface Task {
  _id: string;
  title: string;
  pointsValue: number;
  assignedTo: string[];
  status: 'Pending' | 'PendingApproval' | 'Approved';
}

interface StoreItem {
  _id: string;
  itemName: string;
  cost: number;
  isAvailable: boolean;
}

interface MemberProfile {
  _id: string;
  displayName: string;
  profileColor: string;
  pointsTotal: number;
  role: 'Parent' | 'Child';
}

interface Routine {
  _id: string;
  title: string;
  icon: string;
  color: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const memberId = params.memberId as string;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'quests' | 'store'>('tasks');

  // --- FETCH DATA ---
  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const hhId = (await import('../../src/lib/auth')).Auth.getHouseholdId();
      const response = await api.get(`/api/v1/household/${await hhId}`);
      const profiles = response.data.data.memberProfiles as MemberProfile[];
      return profiles.find((p) => p._id === memberId);
    },
    refetchInterval: 3000,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', memberId],
    queryFn: async () => {
      const response = await api.get('/api/v1/tasks');
      const allTasks = response.data.data.tasks as Task[];
      return allTasks.filter(
        (t) => t.assignedTo.includes(memberId) && t.status === 'Pending'
      );
    },
    refetchInterval: 3000,
  });

  const { data: storeData } = useQuery({
    queryKey: ['store-items'],
    queryFn: async () => {
      const response = await api.get('/api/v1/store-items');
      return response.data.data.storeItems as StoreItem[];
    },
  });

  const { data: routinesData } = useQuery({
    queryKey: ['routines'],
    queryFn: async () => {
      const response = await api.get('/api/v1/routines');
      return response.data.data.routines as Routine[];
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // Corrected endpoint to match BFF
      await api.post(`/api/v1/tasks/${taskId}/complete`, { memberId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      Alert.alert('Nice work!', 'Task marked as complete. Waiting for approval!');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
      console.error(error);
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['member'] }),
      queryClient.refetchQueries({ queryKey: ['tasks'] }),
      queryClient.refetchQueries({ queryKey: ['store-items'] }),
      queryClient.refetchQueries({ queryKey: ['routines'] }),
    ]);
    setIsRefreshing(false);
  };

  const tasks = tasksData || [];
  const storeItems = (storeData || []).filter(item => item.isAvailable);
  const routines = routinesData || [];

  // Gamification Logic
  const currentLevel = member ? Math.floor(member.pointsTotal / 100) + 1 : 1;
  const pointsToNextLevel = 100 - ((member?.pointsTotal || 0) % 100);
  const progressPercent = ((member?.pointsTotal || 0) % 100);

  if (isMemberLoading || !member) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-indigo-200 font-medium">Loading Profile...</Text>
      </View>
    );
  }

  // --- RENDER HELPERS ---

  const renderXPBar = () => (
    <View className="w-full mt-2">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs font-bold text-indigo-200">LVL {currentLevel}</Text>
        <Text className="text-xs font-bold text-indigo-200">LVL {currentLevel + 1}</Text>
      </View>
      <View className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/10">
        <View
          className="h-full bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </View>
      <Text className="text-xs text-center text-indigo-200 mt-1 font-medium">
        {pointsToNextLevel} XP to next level
      </Text>
    </View>
  );

  const renderTaskCard = (task: Task) => (
    <BlurView
      key={task._id}
      intensity={40}
      tint="dark"
      className="overflow-hidden rounded-2xl mb-3 border border-white/10"
    >
      <Pressable
        className="p-4 bg-white/5 active:bg-white/10 transition-colors"
        onPress={() => {
          Alert.alert(
            'Complete Mission?',
            `Did you finish "${task.title}"?`,
            [
              { text: 'Not yet', style: 'cancel' },
              { text: 'YES!', onPress: () => completeTaskMutation.mutate(task._id) },
            ]
          );
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mr-3 border border-indigo-500/30">
              <Ionicons name="checkbox-outline" size={24} color="#818cf8" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-0.5">{task.title}</Text>
              <Text className="text-xs text-yellow-400 font-bold">+{task.pointsValue} XP</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
        </View>
      </Pressable>
    </BlurView>
  );

  // --- PHONE LAYOUT ---
  const renderPhoneLayout = () => (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#4f46e5', '#818cf8']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* Compact Header */}
          <View className="px-6 pt-2 pb-4">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => router.back()} className="p-2 -ml-2 bg-white/10 rounded-full">
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              <View className="flex-row items-center bg-black/20 rounded-full px-3 py-1 border border-white/10">
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text className="ml-1 font-bold text-white">{member.pointsTotal}</Text>
              </View>
            </View>
            <View className="flex-row items-center mt-6">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4 shadow-lg border-2 border-white/20"
                style={{ backgroundColor: member.profileColor }}
              >
                <Text className="text-3xl font-bold text-white">
                  {member.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-black text-white shadow-sm">
                  Hi, {member.displayName.split(' ')[0]}!
                </Text>
                {renderXPBar()}
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-4 pt-2"
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="white" />}
          >
            <Text className="text-sm font-bold text-indigo-200 mb-4 uppercase tracking-wider mt-4">
              Today's Missions
            </Text>

            {tasks.length > 0 ? (
              tasks.map(renderTaskCard)
            ) : (
              <View className="items-center py-10 opacity-50">
                <Ionicons name="rocket-outline" size={64} color="rgba(255,255,255,0.5)" />
                <Text className="text-white/50 mt-4 font-medium text-lg">All caught up!</Text>
              </View>
            )}

            <View className="h-20" />
          </ScrollView>

          {/* Bottom Nav for Phone */}
          <BlurView intensity={80} tint="dark" className="flex-row border-t border-white/10 pb-6 pt-4 px-6 justify-between">
            <Pressable className="items-center">
              <View className="bg-indigo-500/20 p-1.5 rounded-xl mb-1">
                <Ionicons name="list" size={24} color="#818cf8" />
              </View>
              <Text className="text-xs font-bold text-white">Tasks</Text>
            </Pressable>
            <Pressable className="items-center opacity-60" onPress={() => router.push('/kiosk/quests')}>
              <Ionicons name="trophy-outline" size={24} color="white" />
              <Text className="text-xs font-medium text-white mt-1">Quests</Text>
            </Pressable>
            <Pressable className="items-center opacity-60" onPress={() => router.push('/kiosk/store')}>
              <Ionicons name="gift-outline" size={24} color="white" />
              <Text className="text-xs font-medium text-white mt-1">Store</Text>
            </Pressable>
          </BlurView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  // --- TABLET LAYOUT ---
  const renderTabletLayout = () => (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#4338ca', '#3b82f6', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 flex-row"
      >
        <SafeAreaView className="flex-1 flex-row">
          {/* LEFT SIDEBAR */}
          <BlurView intensity={40} tint="dark" className="w-1/3 border-r border-white/10 p-8 flex-col">
            <Pressable onPress={() => router.back()} className="mb-8 self-start bg-white/10 px-4 py-2 rounded-full">
              <View className="flex-row items-center">
                <Ionicons name="arrow-back" size={20} color="white" />
                <Text className="ml-2 font-bold text-white">Switch User</Text>
              </View>
            </Pressable>

            <View className="items-center mb-10">
              <View
                className="w-28 h-28 rounded-3xl items-center justify-center mb-6 shadow-2xl border-4 border-white/20"
                style={{ backgroundColor: member.profileColor }}
              >
                <Text className="text-6xl font-black text-white">
                  {member.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-4xl font-black text-white text-center mb-2">
                {member.displayName}
              </Text>
              <View className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                <Text className="text-indigo-200 font-bold">Level {currentLevel} Explorer</Text>
              </View>
            </View>

            {renderXPBar()}

            <View className="mt-auto space-y-4">
              <Pressable className="flex-row items-center bg-indigo-500/20 p-4 rounded-2xl border border-indigo-500/30">
                <Ionicons name="list" size={24} color="#818cf8" />
                <Text className="text-white font-bold text-lg ml-3">My Missions</Text>
              </Pressable>
              <Pressable className="flex-row items-center bg-white/5 p-4 rounded-2xl border border-white/10" onPress={() => router.push('/kiosk/quests')}>
                <Ionicons name="trophy-outline" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-3">Quests</Text>
              </Pressable>
              <Pressable className="flex-row items-center bg-white/5 p-4 rounded-2xl border border-white/10" onPress={() => router.push('/kiosk/store')}>
                <Ionicons name="gift-outline" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-3">Rewards Store</Text>
              </Pressable>
            </View>
          </BlurView>

          {/* RIGHT CONTENT */}
          <View className="flex-1 bg-black/20">
            <View className="p-8">
              <Text className="text-3xl font-black text-white mb-6 uppercase tracking-wider">
                Today's Missions
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="white" />}
              >
                {tasks.length > 0 ? (
                  <View className="flex-row flex-wrap gap-4">
                    {tasks.map(task => (
                      <View key={task._id} className="w-full">
                        {renderTaskCard(task)}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="items-center justify-center py-20 opacity-50">
                    <Ionicons name="rocket-outline" size={80} color="white" />
                    <Text className="text-white text-xl font-bold mt-4">All Missions Complete!</Text>
                    <Text className="text-indigo-200 mt-2">Great job today!</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  return isTablet ? renderTabletLayout() : renderPhoneLayout();
}