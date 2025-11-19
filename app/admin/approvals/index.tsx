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
    completedBy?: string;
    assignedTo: string[];
    type: 'task'; // Discriminator
}

interface QuestClaim {
    memberId: string;
    status: 'claimed' | 'completed' | 'approved';
}

interface Quest {
    _id: string;
    title: string;
    pointsValue: number;
    claims: QuestClaim[];
    type: 'quest'; // Discriminator
}

interface ApprovalItem {
    id: string;
    title: string;
    pointsValue: number;
    completedBy: string;
    type: 'task' | 'quest';
    originalObject: Task | Quest;
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

    const { data: quests, isLoading: isQuestsLoading, refetch: refetchQuests } = useQuery({
        queryKey: ['quests'],
        queryFn: async () => {
            const response = await api.get('/api/v1/quests');
            return response.data.data.quests as Quest[];
        },
    });

    const { data: household } = useQuery({
        queryKey: ['household'],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            return response.data.data as HouseholdData;
        },
    });

    // --- 2. PROCESS DATA ---
    const pendingTasks: ApprovalItem[] = (tasks || [])
        .filter(t => t.status === 'PendingApproval')
        .map(t => ({
            id: t._id,
            title: t.title,
            pointsValue: t.pointsValue,
            completedBy: t.completedBy || '',
            type: 'task',
            originalObject: { ...t, type: 'task' }
        }));

    const pendingQuests: ApprovalItem[] = (quests || [])
        .flatMap(q =>
            q.claims
                .filter(c => c.status === 'completed')
                .map(c => ({
                    id: q._id,
                    title: q.title,
                    pointsValue: q.pointsValue,
                    completedBy: c.memberId,
                    type: 'quest',
                    originalObject: { ...q, type: 'quest' }
                }))
        );

    const allPendingItems = [...pendingTasks, ...pendingQuests];
    const isLoading = isTasksLoading || isQuestsLoading;

    const handleRefresh = () => {
        refetchTasks();
        refetchQuests();
    };

    // --- 3. HELPERS ---
    const getMemberName = (memberId?: string) => {
        if (!memberId || !household) return 'Unknown';
        const member = household.memberProfiles.find(m => m._id === memberId);
        return member?.displayName || 'Unknown';
    };

    const getMemberColor = (memberId?: string) => {
        if (!memberId || !household) return '#94A3B8';
        const member = household.memberProfiles.find(m => m._id === memberId);
        return member?.profileColor || '#94A3B8';
    };

    // --- 4. ACTIONS ---
    const approveTaskMutation = useMutation({
        mutationFn: async (taskId: string) => api.post(`/api/v1/admin/tasks/${taskId}/approve`),
        onSuccess: () => {
            Alert.alert('Approved!', 'Points awarded.');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['member'] });
        }
    });

    const approveQuestMutation = useMutation({
        mutationFn: async ({ questId, memberId }: { questId: string, memberId: string }) =>
            api.post(`/api/v1/admin/quests/${questId}/approve`, { memberId }),
        onSuccess: () => {
            Alert.alert('Approved!', 'Points awarded.');
            queryClient.invalidateQueries({ queryKey: ['quests'] });
            queryClient.invalidateQueries({ queryKey: ['member'] });
        }
    });

    const rejectTaskMutation = useMutation({
        mutationFn: async (taskId: string) => api.patch(`/api/v1/admin/tasks/${taskId}`, { status: 'Pending' }),
        onSuccess: () => {
            Alert.alert('Rejected', 'Task sent back.');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    // Note: Quest rejection logic might need to be added to API if we want to support it properly.
    // For now, we'll just not implement it or maybe set status back to 'claimed'? 
    // Let's assume for now we can't easily reject quests without an API update, so I'll disable it or show an alert.

    const handleApprove = (item: ApprovalItem) => {
        if (item.type === 'task') {
            approveTaskMutation.mutate(item.id);
        } else {
            approveQuestMutation.mutate({ questId: item.id, memberId: item.completedBy });
        }
    };

    const handleReject = (item: ApprovalItem) => {
        if (item.type === 'task') {
            Alert.alert(
                'Reject Task',
                `Send "${item.title}" back?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => rejectTaskMutation.mutate(item.id) },
                ]
            );
        } else {
            Alert.alert('Not Supported', 'Rejecting quests is not yet supported.');
        }
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
                                {allPendingItems.length} item{allPendingItems.length !== 1 ? 's' : ''} waiting
                            </Text>
                        </View>
                    </View>
                    {allPendingItems.length > 0 && (
                        <View className="bg-yellow-100 px-3 py-1 rounded-full">
                            <Text className="text-yellow-700 font-bold text-sm">{allPendingItems.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color="#4F46E5" className="mt-20" />
                ) : allPendingItems.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="checkmark-done" size={40} color="#16A34A" />
                        </View>
                        <Text className="text-gray-500 font-medium">All caught up!</Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {allPendingItems.map((item, index) => {
                            const memberName = getMemberName(item.completedBy);
                            const memberColor = getMemberColor(item.completedBy);
                            const isQuest = item.type === 'quest';

                            return (
                                <View key={`${item.type}-${item.id}-${index}`} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                {isQuest && (
                                                    <View className="bg-purple-100 px-2 py-0.5 rounded mr-2">
                                                        <Text className="text-purple-700 text-[10px] font-bold uppercase">Quest</Text>
                                                    </View>
                                                )}
                                                <Text className="text-lg font-bold text-gray-900 flex-1">{item.title}</Text>
                                            </View>

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

                                            <View className="bg-indigo-100 px-3 py-1.5 rounded-lg self-start">
                                                <Text className="text-indigo-700 text-xs font-bold">
                                                    +{item.pointsValue} points
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="bg-yellow-100 p-2 rounded-full">
                                            <Ionicons name="time" size={20} color="#CA8A04" />
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <Pressable
                                            className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
                                            onPress={() => handleReject(item)}
                                        >
                                            <View className="flex-row items-center">
                                                <Ionicons name="close-circle-outline" size={18} color="#6B7280" />
                                                <Text className="font-bold text-gray-600 ml-1">Reject</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            className="flex-1 bg-indigo-600 py-3 rounded-xl items-center active:bg-indigo-700 shadow-md shadow-indigo-200"
                                            onPress={() => handleApprove(item)}
                                        >
                                            <View className="flex-row items-center">
                                                <Ionicons name="checkmark-circle" size={18} color="white" />
                                                <Text className="font-bold text-white ml-1">Approve</Text>
                                            </View>
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
