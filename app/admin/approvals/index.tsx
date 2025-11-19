import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Auth } from '../../../src/lib/auth';

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

    // Fetch household data to get member names
    const { data: household } = useQuery({
        queryKey: ['household'],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            return response.data.data as HouseholdData;
        },
    });

    // Filter for PendingApproval
    const pendingTasks = tasks?.filter(t => t.status === 'PendingApproval') || [];

    // Helper to get member name
    const getMemberName = (memberId?: string) => {
        if (!memberId || !household) return 'Unknown';
        const member = household.memberProfiles.find(m => m._id === memberId);
        return member?.displayName || 'Unknown';
    };

    // Helper to get member color
    const getMemberColor = (memberId?: string) => {
        if (!memberId || !household) return '#94A3B8';
        const member = household.memberProfiles.find(m => m._id === memberId);
        return member?.profileColor || '#94A3B8';
    };

    // --- 2. ACTIONS ---
    const approveMutation = useMutation({
        mutationFn: async (taskId: string) => {
            return api.post(`/api/v1/admin/tasks/${taskId}/approve`);
        },
        onSuccess: () => {
            Alert.alert('Approved!', 'Points have been awarded.');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['member'] });
            queryClient.invalidateQueries({ queryKey: ['household'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Could not approve task.');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (taskId: string) => {
            // Reset task status back to Pending
            return api.patch(`/api/v1/admin/tasks/${taskId}`, { status: 'Pending' });
        },
        onSuccess: () => {
            Alert.alert('Rejected', 'Task has been sent back.');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Could not reject task.');
        }
    });

    const handleApprove = (task: Task) => {
        approveMutation.mutate(task._id);
    };

    const handleReject = (task: Task) => {
        Alert.alert(
            'Reject Task',
            `Send "${task.title}" back to ${getMemberName(task.completedBy)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => rejectMutation.mutate(task._id),
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-6 border-b border-gray-200 bg-white">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full mr-4">
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </Pressable>
                        <View>
                            <Text className="text-xl font-bold text-gray-900">Approvals</Text>
                            <Text className="text-gray-500 text-xs">
                                {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} waiting
                            </Text>
                        </View>
                    </View>

                    {pendingTasks.length > 0 && (
                        <View className="bg-yellow-100 px-3 py-1 rounded-full">
                            <Text className="text-yellow-700 font-bold text-sm">{pendingTasks.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} />}
            >
                {isTasksLoading ? (
                    <View className="items-center justify-center mt-20">
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text className="mt-4 text-gray-500">Loading approvals...</Text>
                    </View>
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
                        {pendingTasks.map((task) => {
                            const memberName = getMemberName(task.completedBy);
                            const memberColor = getMemberColor(task.completedBy);

                            return (
                                <View key={task._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-1">
                                            <Text className="text-lg font-bold text-gray-900 mb-2">{task.title}</Text>

                                            {/* Member Info */}
                                            <View className="flex-row items-center mb-2">
                                                <View
                                                    className="w-6 h-6 rounded-full items-center justify-center mr-2"
                                                    style={{ backgroundColor: memberColor }}
                                                >
                                                    <Text className="text-white text-xs font-bold">
                                                        {memberName.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-600 text-sm">
                                                    Completed by <Text className="font-bold">{memberName}</Text>
                                                </Text>
                                            </View>

                                            {/* Points Badge */}
                                            <View className="bg-indigo-100 px-3 py-1.5 rounded-lg self-start">
                                                <Text className="text-indigo-700 text-xs font-bold">
                                                    +{task.pointsValue} points
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="bg-yellow-100 p-2 rounded-full">
                                            <Ionicons name="time" size={20} color="#CA8A04" />
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="flex-row gap-3">
                                        <Pressable
                                            className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
                                            onPress={() => handleReject(task)}
                                            disabled={rejectMutation.isPending}
                                        >
                                            {rejectMutation.isPending ? (
                                                <ActivityIndicator color="#6B7280" size="small" />
                                            ) : (
                                                <View className="flex-row items-center">
                                                    <Ionicons name="close-circle-outline" size={18} color="#6B7280" />
                                                    <Text className="font-bold text-gray-600 ml-1">Reject</Text>
                                                </View>
                                            )}
                                        </Pressable>

                                        <Pressable
                                            className="flex-1 bg-indigo-600 py-3 rounded-xl items-center active:bg-indigo-700 shadow-md shadow-indigo-200"
                                            onPress={() => handleApprove(task)}
                                            disabled={approveMutation.isPending}
                                        >
                                            {approveMutation.isPending ? (
                                                <ActivityIndicator color="white" size="small" />
                                            ) : (
                                                <View className="flex-row items-center">
                                                    <Ionicons name="checkmark-circle" size={18} color="white" />
                                                    <Text className="font-bold text-white ml-1">Approve</Text>
                                                </View>
                                            )}
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
