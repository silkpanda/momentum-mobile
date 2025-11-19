import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Auth } from '../../../src/lib/auth';

interface MemberProfile {
    _id: string;
    displayName: string;
    profileColor: string;
    role: 'Parent' | 'Child';
}

export default function CreateRoutineScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pointsValue, setPointsValue] = useState('10');
    const [assignedTo, setAssignedTo] = useState<string>('');

    // Step State
    const [steps, setSteps] = useState<{ title: string }[]>([]);
    const [currentStep, setCurrentStep] = useState('');

    // --- FETCH MEMBERS ---
    const { data: members } = useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            return (response.data.data.memberProfiles as MemberProfile[]).filter(m => m.role === 'Child');
        },
    });

    // --- MUTATION ---
    const createRoutineMutation = useMutation({
        mutationFn: async (newRoutine: any) => {
            return api.post('/api/v1/admin/routines', newRoutine);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            Alert.alert('Success', 'Routine created!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create routine');
        },
    });

    const handleAddStep = () => {
        if (!currentStep.trim()) return;
        setSteps([...steps, { title: currentStep.trim() }]);
        setCurrentStep('');
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);
    };

    const handleCreate = () => {
        if (!title.trim() || !assignedTo || steps.length === 0) {
            Alert.alert('Error', 'Please fill in title, assign a child, and add at least one step.');
            return;
        }

        const payload = {
            title: title.trim(),
            description: description.trim(),
            assignedTo,
            pointsReward: parseInt(pointsValue) || 10,
            steps,
            icon: 'list', // Default for now
            color: '#4F46E5', // Default for now
            schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] } // Default M-F
        };

        createRoutineMutation.mutate(payload);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="p-6 border-b border-gray-200 bg-white">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full mr-4">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </Pressable>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">New Routine</Text>
                        <Text className="text-gray-500 text-xs">Create a step-by-step flow</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerClassName="p-6">
                {/* Basic Info */}
                <View className="bg-white p-4 rounded-2xl border border-gray-200 mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Routine Title *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                        placeholder="e.g., Morning Routine"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Points Reward</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                        placeholder="10"
                        value={pointsValue}
                        onChangeText={setPointsValue}
                        keyboardType="numeric"
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Assign To *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
                        {members?.map((member) => (
                            <Pressable
                                key={member._id}
                                onPress={() => setAssignedTo(member._id)}
                                className={`mr-3 p-1 rounded-full border-2 ${assignedTo === member._id ? 'border-indigo-600' : 'border-transparent'
                                    }`}
                            >
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center"
                                    style={{ backgroundColor: member.profileColor }}
                                >
                                    <Text className="text-white font-bold text-lg">
                                        {member.displayName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text className={`text-center text-xs mt-1 font-medium ${assignedTo === member._id ? 'text-indigo-600' : 'text-gray-500'
                                    }`}>
                                    {member.displayName}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Steps Builder */}
                <View className="bg-white p-4 rounded-2xl border border-gray-200 mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-4">Routine Steps *</Text>

                    {/* Add Step Input */}
                    <View className="flex-row mb-4">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-l-xl p-4 text-gray-900"
                            placeholder="Add a step (e.g., Brush Teeth)"
                            value={currentStep}
                            onChangeText={setCurrentStep}
                            onSubmitEditing={handleAddStep}
                        />
                        <Pressable
                            onPress={handleAddStep}
                            className="bg-indigo-600 px-4 rounded-r-xl justify-center items-center active:bg-indigo-700"
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </Pressable>
                    </View>

                    {/* Steps List */}
                    {steps.length === 0 ? (
                        <Text className="text-center text-gray-400 py-4 italic">No steps added yet.</Text>
                    ) : (
                        <View className="gap-2">
                            {steps.map((step, index) => (
                                <View key={index} className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <View className="w-6 h-6 bg-indigo-100 rounded-full items-center justify-center mr-3">
                                        <Text className="text-indigo-700 font-bold text-xs">{index + 1}</Text>
                                    </View>
                                    <Text className="flex-1 text-gray-800 font-medium">{step.title}</Text>
                                    <Pressable onPress={() => handleRemoveStep(index)} className="p-1">
                                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Create Button */}
                <Pressable
                    onPress={handleCreate}
                    disabled={createRoutineMutation.isPending}
                    className="bg-indigo-600 py-4 rounded-xl items-center shadow-md shadow-indigo-200 active:bg-indigo-700 mb-10"
                >
                    {createRoutineMutation.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="font-bold text-white text-lg">Create Routine</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
