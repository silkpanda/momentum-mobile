import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';

interface RoutineStep {
    title: string;
    description?: string;
    durationSeconds?: number;
    icon?: string;
}

interface Routine {
    _id: string;
    title: string;
    steps: RoutineStep[];
    pointsReward: number;
    icon: string;
    color: string;
}

export default function RoutinePlayerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, memberId } = params;
    const queryClient = useQueryClient();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // --- FETCH ROUTINE ---
    const { data: routine, isLoading } = useQuery({
        queryKey: ['routine', id],
        queryFn: async () => {
            // We can reuse the member routines endpoint and filter, or add a specific get endpoint.
            // For now, let's fetch all member routines and find this one (efficient enough for MVP)
            const response = await api.get(`/api/v1/routines/member/${memberId}`);
            const routines = response.data.data.routines as Routine[];
            return routines.find(r => r._id === id);
        },
        enabled: !!id && !!memberId,
    });

    // --- COMPLETE MUTATION ---
    const completeRoutineMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/api/v1/routines/${id}/complete`, { memberId });
        },
        onSuccess: () => {
            setIsCompleted(true);
            queryClient.invalidateQueries({ queryKey: ['member'] });
            // Auto-close after 3 seconds
            setTimeout(() => {
                router.back();
            }, 3000);
        },
        onError: (error: any) => {
            Alert.alert('Error', 'Failed to complete routine. Please try again.');
        },
    });

    const handleNextStep = () => {
        if (!routine) return;

        if (currentStepIndex < routine.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Finished!
            completeRoutineMutation.mutate();
        }
    };

    if (isLoading || !routine) {
        return (
            <SafeAreaView className="flex-1 bg-indigo-600 justify-center items-center">
                <ActivityIndicator size="large" color="white" />
            </SafeAreaView>
        );
    }

    // --- SUCCESS SCREEN ---
    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-green-500 justify-center items-center">
                <View className="bg-white p-10 rounded-full mb-8">
                    <Ionicons name="checkmark" size={80} color="#22C55E" />
                </View>
                <Text className="text-white text-4xl font-black mb-4">Routine Complete!</Text>
                <Text className="text-green-100 text-xl font-bold">+{routine.pointsReward} Points Awarded</Text>
            </SafeAreaView>
        );
    }

    const currentStep = routine.steps[currentStepIndex];
    const progress = ((currentStepIndex) / routine.steps.length) * 100;

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            {/* Header / Progress */}
            <View className="px-6 pt-4 pb-2">
                <View className="flex-row justify-between items-center mb-4">
                    <Pressable onPress={() => router.back()} className="bg-slate-800 p-2 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </Pressable>
                    <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Step {currentStepIndex + 1} of {routine.steps.length}
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${((currentStepIndex + 1) / routine.steps.length) * 100}%` }}
                    />
                </View>
            </View>

            {/* Main Content (Focus Area) */}
            <View className="flex-1 justify-center items-center px-8">
                <View
                    className="w-40 h-40 rounded-full items-center justify-center mb-10 shadow-2xl shadow-indigo-500/50"
                    style={{ backgroundColor: routine.color }}
                >
                    <Ionicons name={currentStep.icon as any || 'checkbox'} size={80} color="white" />
                </View>

                <Text className="text-white text-4xl font-black text-center mb-4 leading-tight">
                    {currentStep.title}
                </Text>

                {currentStep.description && (
                    <Text className="text-slate-400 text-xl text-center">
                        {currentStep.description}
                    </Text>
                )}
            </View>

            {/* Footer / Controls */}
            <View className="p-8 pb-10">
                <Pressable
                    onPress={handleNextStep}
                    disabled={completeRoutineMutation.isPending}
                    className="bg-white py-5 rounded-2xl items-center shadow-lg active:bg-gray-100"
                >
                    {completeRoutineMutation.isPending ? (
                        <ActivityIndicator color="#4F46E5" />
                    ) : (
                        <Text className="text-slate-900 text-2xl font-black">
                            {currentStepIndex === routine.steps.length - 1 ? 'Finish Routine' : 'Next Step'}
                        </Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
