import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { Auth } from '../../src/lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface StoreItem {
    _id: string;
    itemName: string;
    description?: string;
    cost: number;
    isAvailable: boolean;
    image?: string;
}

export default function KioskStore() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const memberId = params.memberId as string;
    const queryClient = useQueryClient();

    // --- FETCH DATA ---
    const { data: storeItems, isLoading: isStoreLoading, refetch } = useQuery({
        queryKey: ['store-items'],
        queryFn: async () => {
            const response = await api.get('/api/v1/store-items');
            return response.data.data.storeItems as StoreItem[];
        },
    });

    const { data: member, isLoading: isMemberLoading } = useQuery({
        queryKey: ['member', memberId],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            const profiles = response.data.data.memberProfiles;
            return profiles.find((p: any) => p._id === memberId);
        },
        enabled: !!memberId,
    });

    // --- MUTATIONS ---
    const redeemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            // Assuming this endpoint exists, otherwise this is a placeholder
            return api.post(`/api/v1/store-items/${itemId}/redeem`, { memberId });
        },
        onSuccess: () => {
            Alert.alert('Redemption Requested!', 'Your parent will review this request.');
            queryClient.invalidateQueries({ queryKey: ['member'] }); // Refresh points
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to request redemption');
        },
    });

    const handleRedeem = (item: StoreItem) => {
        if (!member) return;

        if (member.pointsTotal < item.cost) {
            Alert.alert('Not enough points', `You need ${item.cost - member.pointsTotal} more points to get this!`);
            return;
        }

        Alert.alert(
            'Redeem Reward',
            `Are you sure you want to spend ${item.cost} points on "${item.itemName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, I want it!', onPress: () => redeemMutation.mutate(item._id) }
            ]
        );
    };

    const isLoading = isStoreLoading || isMemberLoading;

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-indigo-900">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    const availableItems = storeItems?.filter(item => item.isAvailable) || [];

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient
                colors={['#4338ca', '#3b82f6', '#06b6d4']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="p-6 pb-4">
                        <View className="flex-row items-center justify-between mb-6">
                            <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full backdrop-blur-sm active:bg-white/20">
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </Pressable>
                            <View className="items-end">
                                <Text className="text-lg font-bold text-white">{member?.displayName}</Text>
                                <View className="flex-row items-center bg-black/20 px-3 py-1 rounded-full border border-white/10">
                                    <Ionicons name="star" size={14} color="#FBBF24" />
                                    <Text className="text-white font-bold ml-1">{member?.pointsTotal} XP</Text>
                                </View>
                            </View>
                        </View>
                        <Text className="text-4xl font-black text-white mb-1">Rewards Store</Text>
                        <Text className="text-indigo-200 text-lg">Spend your hard-earned points!</Text>
                    </View>

                    <ScrollView
                        contentContainerClassName="p-6 pt-0"
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="white" />}
                    >
                        <View className="flex-row flex-wrap justify-between">
                            {availableItems.length > 0 ? (
                                availableItems.map(item => (
                                    <BlurView
                                        key={item._id}
                                        intensity={40}
                                        tint="dark"
                                        className="w-[48%] overflow-hidden rounded-3xl mb-4 border border-white/10"
                                    >
                                        <Pressable
                                            onPress={() => handleRedeem(item)}
                                            className="p-4 active:bg-white/5 transition-colors"
                                        >
                                            <View className="w-full h-28 bg-white/5 rounded-2xl mb-4 items-center justify-center border border-white/5">
                                                <Ionicons name="gift-outline" size={48} color="rgba(255,255,255,0.8)" />
                                            </View>
                                            <Text className="font-bold text-white text-lg leading-tight mb-1 h-12" numberOfLines={2}>
                                                {item.itemName}
                                            </Text>
                                            <Text className="text-yellow-400 font-black text-xl mb-3">{item.cost} XP</Text>

                                            {member && member.pointsTotal >= item.cost ? (
                                                <View className="bg-indigo-500 py-3 rounded-xl items-center shadow-lg shadow-indigo-500/40">
                                                    <Text className="text-white font-bold text-sm uppercase tracking-wide">Redeem</Text>
                                                </View>
                                            ) : (
                                                <View className="bg-white/10 py-3 rounded-xl items-center border border-white/5">
                                                    <Text className="text-white/40 font-bold text-xs uppercase">Need Points</Text>
                                                </View>
                                            )}
                                        </Pressable>
                                    </BlurView>
                                ))
                            ) : (
                                <View className="w-full items-center py-20 opacity-60">
                                    <Ionicons name="basket-outline" size={64} color="white" />
                                    <Text className="text-white mt-4 font-medium text-lg">The store is empty right now.</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
