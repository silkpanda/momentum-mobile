import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Routine {
    _id: string;
    title: string;
    description?: string;
    steps: { title: string }[];
    pointsReward: number;
    icon: string;
    color: string;
    isActive: boolean;
}

export default function RoutineListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // --- FETCH DATA ---
    const { data: routines, isLoading, refetch } = useQuery({
        queryKey: ['routines'],
        queryFn: async () => {
            const response = await api.get('/api/v1/routines');
            return response.data.data.routines as Routine[];
        },
    });

    // --- MUTATIONS ---
    const deleteRoutineMutation = useMutation({
        mutationFn: async (routineId: string) => {
            return api.delete(`/api/v1/admin/routines/${routineId}`);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Routine deleted!');
            queryClient.invalidateQueries({ queryKey: ['routines'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete routine');
        },
    });

    const handleDeleteRoutine = (routine: Routine) => {
        Alert.alert(
            'Delete Routine',
            `Are you sure you want to delete "${routine.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteRoutineMutation.mutate(routine._id),
                },
            ]
        );
    };

    // --- RENDER ITEM ---
    const RoutineItem = ({ routine }: { routine: Routine }) => (
        <BlurView intensity={20} tint="light" className="overflow-hidden rounded-2xl border border-white/10 mb-3">
            <View className="p-4 bg-white/5">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-3 border border-white/10"
                            style={{ backgroundColor: `${routine.color}30` }}
                        >
                            <Ionicons name={routine.icon as any || 'list'} size={24} color={routine.color} />
                        </View>

                        <View className="flex-1">
                            <Text className="text-lg font-bold text-white">{routine.title}</Text>
                            <Text className="text-sm text-indigo-200">
                                {routine.steps.length} steps • {routine.pointsReward} pts
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => handleDeleteRoutine(routine)}
                        className="p-2 bg-white/10 rounded-lg active:bg-white/20 ml-2 border border-white/5"
                    >
                        <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                    </Pressable>
                </View>
            </View>
        </BlurView>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-900">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="mt-4 text-indigo-200">Loading routines...</Text>
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
                                    <Text className="text-xl font-bold text-white">Routines</Text>
                                    <Text className="text-indigo-200 text-xs">Manage daily flows</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => router.push('/admin/routines/create')}
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
                        {routines?.length === 0 ? (
                            <BlurView intensity={20} tint="light" className="p-8 rounded-2xl border border-white/10 border-dashed items-center mt-10">
                                <View className="w-16 h-16 bg-indigo-500/20 rounded-full items-center justify-center mb-4 border border-indigo-500/30">
                                    <Ionicons name="list" size={32} color="#818cf8" />
                                </View>
                                <Text className="text-white font-medium mb-1">No routines yet</Text>
                                <Text className="text-white/40 text-xs text-center mb-4">
                                    Create a morning or evening routine to help your child stay on track.
                                </Text>
                                <Pressable
                                    onPress={() => router.push('/admin/routines/create')}
                                    className="bg-indigo-600 px-6 py-3 rounded-xl active:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                                >
                                    <Text className="text-white font-bold">Create Routine</Text>
                                </Pressable>
                            </BlurView>
                        ) : (
                            routines?.map(routine => <RoutineItem key={routine._id} routine={routine} />)
                        )}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
