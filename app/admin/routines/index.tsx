import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';

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
        <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-3">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${routine.color}20` }}
                    >
                        <Ionicons name={routine.icon as any || 'list'} size={24} color={routine.color} />
                    </View>

                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900">{routine.title}</Text>
                        <Text className="text-sm text-gray-500">
                            {routine.steps.length} steps • {routine.pointsReward} pts
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => handleDeleteRoutine(routine)}
                    className="p-2 bg-gray-100 rounded-lg active:bg-gray-200 ml-2"
                >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-500">Loading routines...</Text>
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
                            <Text className="text-xl font-bold text-gray-900">Routines</Text>
                            <Text className="text-gray-500 text-xs">Manage daily flows</Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => router.push('/admin/routines/create')}
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
                {routines?.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-10">
                        <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="list" size={32} color="#4F46E5" />
                        </View>
                        <Text className="text-gray-500 font-medium mb-1">No routines yet</Text>
                        <Text className="text-gray-400 text-xs text-center mb-4">
                            Create a morning or evening routine to help your child stay on track.
                        </Text>
                        <Pressable
                            onPress={() => router.push('/admin/routines/create')}
                            className="bg-indigo-600 px-6 py-3 rounded-xl active:bg-indigo-700"
                        >
                            <Text className="text-white font-bold">Create Routine</Text>
                        </Pressable>
                    </View>
                ) : (
                    routines?.map(routine => <RoutineItem key={routine._id} routine={routine} />)
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
