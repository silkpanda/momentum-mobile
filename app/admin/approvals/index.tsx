import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';

// --- TYPES ---
interface Task {
    _id: string;
    title: string;
    pointsValue: number;
    status: 'Pending' | 'PendingApproval' | 'Approved';
    completedBy?: string; // ID of the member who did it
    assignedTo: string[];
}

interface MemberProfile {
    _id: string;
    displayName: string;
    profileColor: string;
}

interface HouseholdData {
    memberProfiles: MemberProfile[];
}

export default function ApprovalsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // --- 1. FETCH DATA ---
    const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/api/v1/tasks');
            return response.data.data.tasks as Task[];
        },
    });

    // We need member names to show WHO completed the task
    // In a real app, we might fetch this from a local cache or context
    const { data: household } = useQuery({
        queryKey: ['household-context'], // Assuming this is cached from previous screens
        queryFn: async () => {
            // Fallback: fetch current household if not in cache
            // For now, we'll just try to get it from the auth/session if needed
            // But simpler: just fetch the household again or rely on what we have.
            // Let's assume we can get member details from the task or a separate call.
            // For MVP: We will just show the task. 
            return null;
        },
        enabled: false, // Don't auto-fetch for now
    });

    // Filter for PendingApproval
    const pendingTasks = tasks?.filter(t => t.status === 'PendingApproval') || [];

    // --- 2. ACTIONS ---
    const approveMutation = useMutation({
        mutationFn: async (taskId: string) => {
            // Call the BFF Admin Endpoint
            return api.post(`/api/v1/admin/tasks/${taskId}/approve`);
        },
        onSuccess: () => {
            Alert.alert('Approved!', 'Points have been awarded.');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['member'] }); // Update points
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Could not approve task.');
        }
    });

    const handleApprove = (task: Task) => {
        approveMutation.mutate(task._id);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-6 border-b border-gray-200 bg-white">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full mr-4">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </Pressable>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">Approvals</Text>
                        <Text className="text-gray-500 text-xs">Verify completed missions</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} />}
            >
                {isTasksLoading ? (
                    <ActivityIndicator size="large" color="#4F46E5" />
                ) : pendingTasks.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="checkmark-done" size={40} color="#16A34A" />
                        </View>
                        <Text className="text-gray-500 font-medium">All caught up!</Text>
                        <Text className="text-gray-400 text-xs mt-1">No tasks waiting for approval.</Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {pendingTasks.map((task) => (
                            <View key={task._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 mb-1">{task.title}</Text>
                                        <View className="flex-row items-center">
                                            <View className="bg-indigo-100 px-2 py-1 rounded-md mr-2">
                                                <Text className="text-indigo-700 text-xs font-bold">{task.pointsValue} pts</Text>
                                            </View>
                                            {/* Placeholder for Member Name until we have the lookup */}
                                            <Text className="text-gray-400 text-xs">Completed by Member</Text>
                                        </View>
                                    </View>
                                    <View className="bg-yellow-100 p-2 rounded-full">
                                        <Ionicons name="time" size={20} color="#CA8A04" />
                                    </View>
                                </View>

                                <View className="flex-row gap-3">
                                    <Pressable
                                        className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
                                        onPress={() => Alert.alert('Not Implemented', 'Reject functionality coming soon!')}
                                    >
                                        <Text className="font-bold text-gray-600">Reject</Text>
                                    </Pressable>

                                    <Pressable
                                        className="flex-1 bg-indigo-600 py-3 rounded-xl items-center active:bg-indigo-700 shadow-md shadow-indigo-200"
                                        onPress={() => handleApprove(task)}
                                        disabled={approveMutation.isPending}
                                    >
                                        {approveMutation.isPending ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text className="font-bold text-white">Approve</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
