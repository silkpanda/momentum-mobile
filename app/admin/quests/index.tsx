import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Quest {
    _id: string;
    title: string;
    description?: string;
    pointsValue: number;
    questType: 'one-time' | 'limited' | 'unlimited';
    maxClaims?: number;
    currentClaims: number;
    isActive: boolean;
    recurrence?: {
        frequency: 'daily' | 'weekly' | 'monthly';
    };
}

export default function QuestListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // --- FETCH DATA ---
    const { data: quests, isLoading, refetch } = useQuery({
        queryKey: ['quests'],
        queryFn: async () => {
            const response = await api.get('/api/v1/quests');
            return response.data.data.quests as Quest[];
        },
    });

    // --- MUTATIONS ---
    const deleteQuestMutation = useMutation({
        mutationFn: async (questId: string) => {
            return api.delete(`/api/v1/admin/quests/${questId}`);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Quest deleted!');
            queryClient.invalidateQueries({ queryKey: ['quests'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete quest');
        },
    });

    const handleDeleteQuest = (quest: Quest) => {
        Alert.alert(
            'Delete Quest',
            `Are you sure you want to delete "${quest.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteQuestMutation.mutate(quest._id),
                },
            ]
        );
    };

    // --- RENDER ITEM ---
    const QuestItem = ({ quest }: { quest: Quest }) => {
        const typeLabels = {
            'one-time': { label: 'One-Time', color: 'bg-blue-500/20 text-blue-200 border-blue-500/30' },
            'limited': { label: 'Limited', color: 'bg-purple-500/20 text-purple-200 border-purple-500/30' },
            'unlimited': { label: 'Unlimited', color: 'bg-green-500/20 text-green-200 border-green-500/30' },
        };

        const typeInfo = typeLabels[quest.questType] || typeLabels['one-time'];

        return (
            <BlurView intensity={20} tint="light" className="overflow-hidden rounded-2xl border border-white/10 mb-3">
                <View className="p-4 bg-white/5">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-3">
                            <Text className="text-lg font-bold text-white mb-1">{quest.title}</Text>
                            {quest.description && (
                                <Text className="text-sm text-indigo-200 mb-2" numberOfLines={2}>
                                    {quest.description}
                                </Text>
                            )}

                            <View className="flex-row items-center flex-wrap gap-2">
                                <View className="bg-yellow-500/20 border border-yellow-500/30 px-2 py-1 rounded-lg flex-row items-center">
                                    <Ionicons name="trophy" size={12} color="#FBBF24" />
                                    <Text className="text-yellow-400 text-xs font-bold ml-1">{quest.pointsValue} pts</Text>
                                </View>

                                <View className={`${typeInfo.color.split(' ')[0]} border ${typeInfo.color.split(' ')[2]} px-2 py-1 rounded-lg`}>
                                    <Text className={`${typeInfo.color.split(' ')[1]} text-xs font-bold`}>
                                        {typeInfo.label}
                                    </Text>
                                </View>

                                {quest.recurrence && (
                                    <View className="bg-orange-500/20 border border-orange-500/30 px-2 py-1 rounded-lg flex-row items-center">
                                        <Ionicons name="repeat" size={10} color="#FB923C" />
                                        <Text className="text-orange-300 text-xs font-bold ml-1 capitalize">
                                            {quest.recurrence.frequency}
                                        </Text>
                                    </View>
                                )}

                                {quest.questType === 'limited' && (
                                    <View className="bg-white/10 border border-white/10 px-2 py-1 rounded-lg">
                                        <Text className="text-white/60 text-xs font-bold">
                                            {quest.currentClaims} / {quest.maxClaims} claimed
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <Pressable
                            onPress={() => handleDeleteQuest(quest)}
                            className="p-2 bg-white/10 rounded-lg active:bg-white/20 border border-white/5"
                        >
                            <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                        </Pressable>
                    </View>
                </View>
            </BlurView>
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-900">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="mt-4 text-indigo-200">Loading quests...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="p-6 border-b border-white/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                                    <Ionicons name="arrow-back" size={24} color="white" />
                                </Pressable>
                                <View>
                                    <Text className="text-xl font-bold text-white">Quest Board</Text>
                                    <Text className="text-indigo-200 text-xs">{quests?.length || 0} active quests</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => router.push('/admin/quests/create')}
                                className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                            >
                                <Ionicons name="add" size={18} color="white" />
                                <Text className="text-white font-bold ml-1">New</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        contentContainerClassName="p-6"
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="white" />}
                    >
                        {quests?.length === 0 ? (
                            <BlurView intensity={20} tint="light" className="p-8 rounded-2xl border border-white/10 border-dashed items-center mt-10">
                                <View className="w-16 h-16 bg-indigo-500/20 rounded-full items-center justify-center mb-4 border border-indigo-500/30">
                                    <Ionicons name="game-controller-outline" size={32} color="#818cf8" />
                                </View>
                                <Text className="text-white font-medium mb-1">No quests yet</Text>
                                <Text className="text-white/40 text-xs text-center mb-4">
                                    Create a quest for anyone to claim!
                                </Text>
                                <Pressable
                                    onPress={() => router.push('/admin/quests/create')}
                                    className="bg-indigo-600 px-6 py-3 rounded-xl active:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                                >
                                    <Text className="text-white font-bold">Create Quest</Text>
                                </Pressable>
                            </BlurView>
                        ) : (
                            quests?.map(quest => <QuestItem key={quest._id} quest={quest} />)
                        )}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
