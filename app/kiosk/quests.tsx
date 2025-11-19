import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { Auth } from '../../src/lib/auth';

interface Quest {
    _id: string;
    title: string;
    description?: string;
    pointsValue: number;
    questType: 'one-time' | 'limited' | 'unlimited' | 'recurring';
    maxClaims?: number;
    currentClaims: number;
    isClaimable: boolean; // Virtual from API
    claims: {
        memberId: string;
        status: 'claimed' | 'completed' | 'approved';
    }[];
}

export default function KioskQuestBoard() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const memberId = params.memberId as string;
    const queryClient = useQueryClient();

    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

    // --- FETCH DATA ---
    const { data: quests, isLoading, refetch } = useQuery({
        queryKey: ['quests'],
        queryFn: async () => {
            const response = await api.get('/api/v1/quests');
            return response.data.data.quests as Quest[];
        },
    });

    const { data: member } = useQuery({
        queryKey: ['member', memberId],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            const profiles = response.data.data.memberProfiles;
            return profiles.find((p: any) => p._id === memberId);
        },
        enabled: !!memberId,
    });

    // --- FILTER QUESTS ---
    // 1. Available Quests: Not claimed by me, and is claimable globally
    const availableQuests = quests?.filter(q => {
        const myClaim = q.claims.find(c => c.memberId === memberId);
        // If I haven't claimed it AND it's claimable (or unlimited)
        return !myClaim && (q.isClaimable || q.questType === 'unlimited');
    }) || [];

    // 2. My Active Quests: Claimed by me, not yet completed
    const myActiveQuests = quests?.filter(q => {
        const myClaim = q.claims.find(c => c.memberId === memberId);
        return myClaim && myClaim.status === 'claimed';
    }) || [];

    // 3. Pending Approval: Completed by me, waiting for approval
    const myPendingQuests = quests?.filter(q => {
        const myClaim = q.claims.find(c => c.memberId === memberId);
        return myClaim && myClaim.status === 'completed';
    }) || [];

    // --- MUTATIONS ---
    const claimQuestMutation = useMutation({
        mutationFn: async (questId: string) => {
            return api.post(`/api/v1/quests/${questId}/claim`, { memberId });
        },
        onSuccess: () => {
            Alert.alert('Quest Claimed!', 'Good luck on your quest!');
            queryClient.invalidateQueries({ queryKey: ['quests'] });
            setSelectedQuest(null);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to claim quest');
        },
    });

    const completeQuestMutation = useMutation({
        mutationFn: async (questId: string) => {
            return api.post(`/api/v1/quests/${questId}/complete`, { memberId });
        },
        onSuccess: () => {
            Alert.alert('Quest Completed!', 'Great job! Points will be awarded after approval.');
            queryClient.invalidateQueries({ queryKey: ['quests'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to complete quest');
        },
    });

    // --- HANDLERS ---
    const handleClaim = (quest: Quest) => {
        claimQuestMutation.mutate(quest._id);
    };

    const handleComplete = (quest: Quest) => {
        Alert.alert(
            'Complete Quest',
            'Are you sure you have finished this quest?',
            [
                { text: 'Not yet', style: 'cancel' },
                { text: 'Yes, I finished!', onPress: () => completeQuestMutation.mutate(quest._id) }
            ]
        );
    };

    // --- COMPONENTS ---
    const QuestCard = ({ quest, type }: { quest: Quest, type: 'available' | 'active' | 'pending' }) => {
        const isAvailable = type === 'available';
        const isActive = type === 'active';

        return (
            <Pressable
                onPress={() => isAvailable ? setSelectedQuest(quest) : null}
                className={`p-4 rounded-2xl border mb-3 shadow-sm ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
                    }`}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-3">
                        <Text className="text-lg font-bold text-gray-900 mb-1">{quest.title}</Text>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-yellow-100 px-2 py-1 rounded-lg flex-row items-center">
                                <Ionicons name="trophy" size={12} color="#CA8A04" />
                                <Text className="text-yellow-800 text-xs font-bold ml-1">{quest.pointsValue} pts</Text>
                            </View>
                            {quest.questType === 'limited' && (
                                <Text className="text-xs text-gray-500">
                                    {quest.currentClaims}/{quest.maxClaims} claimed
                                </Text>
                            )}
                        </View>
                    </View>

                    {isActive && (
                        <Pressable
                            onPress={() => handleComplete(quest)}
                            className="bg-green-500 p-2 rounded-full shadow-sm active:bg-green-600"
                        >
                            <Ionicons name="checkmark" size={20} color="white" />
                        </Pressable>
                    )}

                    {type === 'pending' && (
                        <View className="bg-gray-100 p-2 rounded-full">
                            <Ionicons name="hourglass" size={20} color="#9CA3AF" />
                        </View>
                    )}

                    {isAvailable && (
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    )}
                </View>
            </Pressable>
        );
    };

    const DetailModal = () => (
        <Modal visible={!!selectedQuest} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 mb-2">{selectedQuest?.title}</Text>
                            <View className="flex-row gap-2">
                                <View className="bg-yellow-100 px-3 py-1 rounded-full self-start flex-row items-center">
                                    <Ionicons name="trophy" size={14} color="#CA8A04" />
                                    <Text className="text-yellow-800 font-bold ml-1">{selectedQuest?.pointsValue} Points</Text>
                                </View>
                                <View className="bg-blue-100 px-3 py-1 rounded-full self-start">
                                    <Text className="text-blue-800 font-bold text-xs capitalize">
                                        {selectedQuest?.questType.replace('-', ' ')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Pressable onPress={() => setSelectedQuest(null)} className="p-2 bg-gray-100 rounded-full">
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </Pressable>
                    </View>

                    <ScrollView className="mb-6">
                        <Text className="text-gray-600 text-lg leading-relaxed">
                            {selectedQuest?.description || 'No description provided.'}
                        </Text>
                    </ScrollView>

                    <Pressable
                        onPress={() => selectedQuest && handleClaim(selectedQuest)}
                        disabled={claimQuestMutation.isPending}
                        className="bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-200 active:bg-indigo-700"
                    >
                        {claimQuestMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-bold text-white text-lg">Claim Quest</Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </Modal>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="p-6 pb-4 bg-white border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                    <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </Pressable>
                    <View className="items-end">
                        <Text className="text-lg font-bold text-gray-900">{member?.displayName}</Text>
                        <Text className="text-indigo-600 font-bold">{member?.pointsTotal} pts</Text>
                    </View>
                </View>
                <Text className="text-3xl font-extrabold text-gray-900">Quest Board</Text>
                <Text className="text-gray-500">Find extra tasks to earn points!</Text>
            </View>

            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            >
                {/* Active Quests Section */}
                {myActiveQuests.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">
                            My Active Quests
                        </Text>
                        {myActiveQuests.map(q => <QuestCard key={q._id} quest={q} type="active" />)}
                    </View>
                )}

                {/* Available Quests Section */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">
                        Available Quests
                    </Text>
                    {availableQuests.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center">
                            <Ionicons name="search" size={32} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-2">No new quests available</Text>
                        </View>
                    ) : (
                        availableQuests.map(q => <QuestCard key={q._id} quest={q} type="available" />)
                    )}
                </View>

                {/* Pending Quests Section */}
                {myPendingQuests.length > 0 && (
                    <View>
                        <Text className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">
                            Pending Approval
                        </Text>
                        {myPendingQuests.map(q => <QuestCard key={q._id} quest={q} type="pending" />)}
                    </View>
                )}
            </ScrollView>

            <DetailModal />
        </SafeAreaView>
    );
}
