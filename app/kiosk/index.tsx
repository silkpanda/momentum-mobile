import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function MemberDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const memberId = params.memberId as string;

  const [activeTab, setActiveTab] = useState<'Tasks' | 'Rewards'>('Tasks');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 1. FETCH DATA ---

  const { data: member, isLoading: isMemberLoading, refetch: refetchMember } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      console.log(`[Kiosk] 🔍 Fetching member data for memberId: ${memberId}`);
      const hhId = (await import('../../src/lib/auth')).Auth.getHouseholdId();
      const response = await api.get(`/api/v1/household/${await hhId}`);
      const profiles = response.data.data.memberProfiles as MemberProfile[];
      const foundProfile = profiles.find(p => p._id === memberId);
      console.log(`[Kiosk] 📊 Member data fetched:`, {
        displayName: foundProfile?.displayName,
        pointsTotal: foundProfile?.pointsTotal,
        role: foundProfile?.role
      });
      return foundProfile;
    },
    enabled: !!memberId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // 🔄 Auto-poll every 3 seconds - works over ngrok!
  });

  const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/api/v1/tasks');
      return response.data.data.tasks as Task[];
    },
    enabled: !!memberId,
    refetchInterval: 3000, // Also poll tasks
  });

  const { data: storeItems, isLoading: isStoreLoading } = useQuery({
    queryKey: ['store-items'],
    queryFn: async () => {
      const response = await api.get('/api/v1/store-items');
      return response.data.data.storeItems as StoreItem[];
    },
    enabled: !!memberId,
  });

  // Combined refetch function for pull-to-refresh
  const handleRefresh = async () => {
    console.log('[Kiosk] 🔄 Manual refresh triggered');
    setIsRefreshing(true);
    try {
      await Promise.all([refetchTasks(), refetchMember()]);
      console.log('[Kiosk] ✅ Manual refresh completed');
    } catch (error) {
      console.error('[Kiosk] ❌ Error during manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- 2. MUTATIONS ---

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return api.post(`/api/v1/tasks/${taskId}/complete`, { memberId });
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], (old) =>
          old?.map(t => t._id === taskId ? { ...t, status: 'PendingApproval' } : t) || []
        );
      }
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      Alert.alert('Oops', 'Failed to complete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const purchaseItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return api.post(`/api/v1/store-items/${itemId}/purchase`, { memberId });
    },
    onSuccess: () => {
      Alert.alert('Success!', 'Reward purchased!');
      queryClient.invalidateQueries({ queryKey: ['member'] });
      queryClient.invalidateQueries({ queryKey: ['store-items'] });
    },
    onError: (error: any) => {
      Alert.alert('Purchase Failed', error.response?.data?.message || 'Could not buy item');
    }
  });

  // --- 3. ADMIN ACCESS HANDLER ---
  const handleAdminAccess = () => {
    router.push('/admin');
  };

  // --- 4. FILTERING ---
  const myTasks = tasks?.filter(t => t.assignedTo.includes(memberId)) || [];

  if (isMemberLoading || isTasksLoading || isStoreLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 pb-4 bg-white border-b border-slate-100">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={() => router.back()} className="bg-slate-100 p-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </Pressable>

          <View className="items-center">
            <Text className="text-xl font-bold text-slate-900">{member?.displayName}</Text>
            <Text className="text-slate-500 text-xs uppercase tracking-wider">{member?.role}</Text>
          </View>

          {/* ADMIN TOGGLE: Only visible for Parents */}
          {member?.role === 'Parent' ? (
            <Pressable onPress={handleAdminAccess} className="bg-slate-100 p-2 rounded-full border border-slate-200">
              <Ionicons name="settings-sharp" size={24} color="#475569" />
            </Pressable>
          ) : (
            <View className="w-10" />
          )}
        </View>

        {/* Points Card */}
        <View className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-200 mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-indigo-200 font-medium mb-1">Current Balance</Text>
            <Text className="text-4xl font-black text-white">{member?.pointsTotal}</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-xl">
            <Ionicons name="trophy" size={32} color="white" />
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-slate-100 rounded-xl p-1">
          {['Tasks', 'Rewards'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 rounded-lg items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${activeTab === tab ? 'text-slate-900' : 'text-slate-400'}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerClassName="p-6 gap-4"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {activeTab === 'Tasks' ? (
          <>
            {myTasks.length === 0 && (
              <Text className="text-center text-slate-400 mt-10">No tasks assigned to you.</Text>
            )}
            {myTasks.map((task) => {
              const isDone = task.status === 'PendingApproval' || task.status === 'Approved';
              return (
                <Pressable
                  key={task._id}
                  disabled={isDone}
                  onPress={() => completeTaskMutation.mutate(task._id)}
                  className={`p-4 rounded-2xl border shadow-sm flex-row justify-between items-center ${isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100'
                    }`}
                >
                  <View className="flex-1 pr-4">
                    <Text className={`text-lg font-bold mb-1 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </Text>
                    <Text className="text-slate-500 text-xs">
                      {isDone ? 'Waiting for approval' : `${task.pointsValue} points`}
                    </Text>
                  </View>
                  <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${isDone ? 'bg-green-500 border-green-500' : 'border-slate-300'
                    }`}>
                    {isDone && <Ionicons name="checkmark" size={20} color="white" />}
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          <>
            {storeItems?.length === 0 && (
              <Text className="text-center text-slate-400 mt-10">The store is empty.</Text>
            )}
            <View className="flex-row flex-wrap justify-between">
              {storeItems?.map((item) => (
                <Pressable
                  key={item._id}
                  onPress={() => purchaseItemMutation.mutate(item._id)}
                  className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm"
                >
                  <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="gift" size={20} color="#ea580c" />
                  </View>
                  <Text className="font-bold text-slate-900 mb-1">{item.itemName}</Text>
                  <Text className="text-slate-500 text-xs mb-3">{item.cost} pts</Text>
                  <View className="bg-slate-50 py-2 rounded-lg items-center">
                    <Text className="text-slate-600 font-bold text-xs">Buy Now</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}