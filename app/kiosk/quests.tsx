import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, Modal, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
            <BlurView intensity={20} tint="light" style={styles.card} className="border border-white/10">
                <Pressable
                    onPress={() => isAvailable ? setSelectedQuest(quest) : null}
                    className="p-4"
                >
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-3">
                            <Text className="text-lg font-bold text-white mb-1">{quest.title}</Text>
                            <View className="flex-row items-center gap-2">
                                <View className="bg-yellow-500/20 px-2 py-1 rounded-lg flex-row items-center border border-yellow-500/30">
                                    <Ionicons name="trophy" size={12} color="#F59E0B" />
                                    <Text className="text-yellow-400 text-xs font-bold ml-1">{quest.pointsValue} pts</Text>
                                </View>
                                {quest.questType === 'limited' && (
                                    <Text className="text-xs text-indigo-200">
                                        {quest.currentClaims}/{quest.maxClaims} claimed
                                    </Text>
                                )}
                            </View>
                        </View>

                        {isActive && (
                            <Pressable
                                onPress={() => handleComplete(quest)}
                                className="bg-green-500 p-2 rounded-full shadow-lg shadow-green-500/30 active:bg-green-600"
                            >
                                <Ionicons name="checkmark" size={20} color="white" />
                            </Pressable>
                        )}

                        {type === 'pending' && (
                            <View className="bg-white/10 p-2 rounded-full border border-white/10">
                                <Ionicons name="hourglass" size={20} color="#94a3b8" />
                            </View>
                        )}

                        {isAvailable && (
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        )}
                    </View>
                </Pressable>
            </BlurView>
        );
    };

    const DetailModal = () => (
        <Modal visible={!!selectedQuest} animationType="slide" transparent={true}>
            <BlurView intensity={40} tint="dark" className="flex-1 justify-end">
                <View className="bg-slate-900/90 rounded-t-3xl p-6 max-h-[80%] border-t border-white/10">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-white mb-2">{selectedQuest?.title}</Text>
                            <View className="flex-row gap-2">
                                <View className="bg-yellow-500/20 px-3 py-1 rounded-full self-start flex-row items-center border border-yellow-500/30">
                                    <Ionicons name="trophy" size={14} color="#F59E0B" />
                                    <Text className="text-yellow-400 font-bold ml-1">{selectedQuest?.pointsValue} Points</Text>
                                </View>
                                <View className="bg-indigo-500/20 px-3 py-1 rounded-full self-start border border-indigo-500/30">
                                    <Text className="text-indigo-300 font-bold text-xs capitalize">
                                        {selectedQuest?.questType.replace('-', ' ')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Pressable onPress={() => setSelectedQuest(null)} className="p-2 bg-white/10 rounded-full">
                            <Ionicons name="close" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    <ScrollView className="mb-6">
                        <Text className="text-indigo-100 text-lg leading-relaxed">
                            {selectedQuest?.description || 'No description provided.'}
                        </Text>
                    </ScrollView>

                    <Pressable
                        onPress={() => selectedQuest && handleClaim(selectedQuest)}
                        disabled={claimQuestMutation.isPending}
                        className="bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                    >
                        {claimQuestMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-bold text-white text-lg">Claim Quest</Text>
                        )}
                    </Pressable>
                </View>
            </BlurView>
        </Modal>
    );

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-900">
                <ActivityIndicator size="large" color="#818cf8" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient colors={['#1e1b4b', '#312e81']} style={StyleSheet.absoluteFill} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="p-6 pb-4 border-b border-white/10">
                    <View className="flex-row items-center justify-between mb-2">
                        <Pressable onPress={() => router.back()} className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </Pressable>
                        <View className="items-end">
                            <Text className="text-lg font-bold text-white">{member?.displayName}</Text>
                            <Text className="text-indigo-300 font-bold">{member?.pointsTotal} pts</Text>
                        </View>
                    </View>
                    <Text className="text-3xl font-extrabold text-white">Quest Board</Text>
                    <Text className="text-indigo-200">Find extra tasks to earn points!</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="white" />}
                >
                    {/* Active Quests Section */}
                    {myActiveQuests.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-sm font-bold text-indigo-200 uppercase mb-3 tracking-wider">
                                My Active Quests
                            </Text>
                            {myActiveQuests.map(q => <QuestCard key={q._id} quest={q} type="active" />)}
                        </View>
                    )}

                    {/* Available Quests Section */}
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-indigo-200 uppercase mb-3 tracking-wider">
                            Available Quests
                        </Text>
                        {availableQuests.length === 0 ? (
                            <BlurView intensity={20} tint="light" className="p-8 rounded-2xl border border-white/10 border-dashed items-center">
                                <Ionicons name="search" size={32} color="rgba(255,255,255,0.3)" />
                                <Text className="text-white/40 mt-2">No new quests available</Text>
                            </BlurView>
                        ) : (
                            availableQuests.map(q => <QuestCard key={q._id} quest={q} type="available" />)
                        )}
                    </View>

                    {/* Pending Quests Section */}
                    {myPendingQuests.length > 0 && (
                        <View>
                            <Text className="text-sm font-bold text-indigo-200 uppercase mb-3 tracking-wider">
                                Pending Approval
                            </Text>
                            {myPendingQuests.map(q => <QuestCard key={q._id} quest={q} type="pending" />)}
                        </View>
                    )}
                </ScrollView>

                <DetailModal />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    card: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
