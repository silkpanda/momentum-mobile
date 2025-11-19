import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';

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
            'one-time': { label: 'One-Time', color: 'bg-blue-100 text-blue-700' },
            'limited': { label: 'Limited', color: 'bg-purple-100 text-purple-700' },
            'unlimited': { label: 'Unlimited', color: 'bg-green-100 text-green-700' },
        };

        const typeInfo = typeLabels[quest.questType] || typeLabels['one-time'];

        return (
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-3">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                        <Text className="text-lg font-bold text-gray-900 mb-1">{quest.title}</Text>
                        {quest.description && (
                            <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
                                {quest.description}
                            </Text>
                        )}

                        <View className="flex-row items-center flex-wrap gap-2">
                            <View className="bg-yellow-100 px-2 py-1 rounded-lg flex-row items-center">
                                <Ionicons name="trophy" size={12} color="#CA8A04" />
                                <Text className="text-yellow-800 text-xs font-bold ml-1">{quest.pointsValue} pts</Text>
                            </View>

                            <View className={`${typeInfo.color.split(' ')[0]} px-2 py-1 rounded-lg`}>
                                <Text className={`${typeInfo.color.split(' ')[1]} text-xs font-bold`}>
                                    {typeInfo.label}
                                </Text>
                            </View>

                            {quest.recurrence && (
                                <View className="bg-orange-100 px-2 py-1 rounded-lg flex-row items-center">
                                    <Ionicons name="repeat" size={10} color="#C2410C" />
                                    <Text className="text-orange-700 text-xs font-bold ml-1 capitalize">
                                        {quest.recurrence.frequency}
                                    </Text>
                                </View>
                            )}

                            {quest.questType === 'limited' && (
                                <View className="bg-gray-100 px-2 py-1 rounded-lg">
                                    <Text className="text-gray-600 text-xs font-bold">
                                        {quest.currentClaims} / {quest.maxClaims} claimed
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <Pressable
                        onPress={() => handleDeleteQuest(quest)}
                        className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                    >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-500">Loading quests...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="p-6 border-b border-gray-200 bg-white">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full mr-4">
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </Pressable>
                        <View>
                            <Text className="text-xl font-bold text-gray-900">Quest Board</Text>
                            <Text className="text-gray-500 text-xs">{quests?.length || 0} active quests</Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => router.push('/admin/quests/create')}
                        className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-md shadow-indigo-200 active:bg-indigo-700"
                    >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-bold ml-1">New</Text>
                    </Pressable>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            >
                {quests?.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-10">
                        <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="game-controller-outline" size={32} color="#4F46E5" />
                        </View>
                        <Text className="text-gray-500 font-medium mb-1">No quests yet</Text>
                        <Text className="text-gray-400 text-xs text-center mb-4">
                            Create a quest for anyone to claim!
                        </Text>
                        <Pressable
                            onPress={() => router.push('/admin/quests/create')}
                            className="bg-indigo-600 px-6 py-3 rounded-xl active:bg-indigo-700"
                        >
                            <Text className="text-white font-bold">Create Quest</Text>
                        </Pressable>
                    </View>
                ) : (
                    quests?.map(quest => <QuestItem key={quest._id} quest={quest} />)
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
