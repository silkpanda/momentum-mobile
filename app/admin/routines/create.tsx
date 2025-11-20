import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Step {
    title: string;
    durationMinutes?: number;
}

export default function CreateRoutineScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<Step[]>([]);
    const [currentStep, setCurrentStep] = useState('');
    const [currentDuration, setCurrentDuration] = useState('');
    const [pointsReward, setPointsReward] = useState('10');
    const [isMorning, setIsMorning] = useState(true);

    const createRoutineMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/api/v1/routines', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            Alert.alert('Success', 'Routine created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            Alert.alert('Error', 'Failed to create routine');
            console.error(error);
        }
    });

    const handleAddStep = () => {
        if (!currentStep.trim()) return;
        setSteps([...steps, {
            title: currentStep,
            durationMinutes: currentDuration ? parseInt(currentDuration) : undefined
        }]);
        setCurrentStep('');
        setCurrentDuration('');
    };

    const handleRemoveStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a routine title');
            return;
        }
        if (steps.length === 0) {
            Alert.alert('Error', 'Please add at least one step');
            return;
        }

        createRoutineMutation.mutate({
            title,
            description,
            steps,
            pointsReward: parseInt(pointsReward) || 0,
            type: isMorning ? 'morning' : 'evening'
        });
    };

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient colors={['#1e1b4b', '#312e81']} style={StyleSheet.absoluteFill} />
            <SafeAreaView className="flex-1">
                <View className="p-6 border-b border-white/10">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </Pressable>
                            <Text className="text-2xl font-bold text-white">New Routine</Text>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <BlurView intensity={20} tint="light" style={styles.section} className="border border-white/10">
                        <Text className="text-sm font-bold text-indigo-200 uppercase mb-4">Basic Info</Text>

                        <View className="mb-4">
                            <Text className="text-white mb-2 font-medium">Routine Title</Text>
                            <TextInput
                                className="bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base"
                                placeholder="e.g., Morning Routine"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-white mb-2 font-medium">Description (Optional)</Text>
                            <TextInput
                                className="bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base h-24"
                                placeholder="Briefly describe this routine..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View className="flex-row items-center justify-between mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isMorning ? 'bg-orange-500/20' : 'bg-indigo-500/20'}`}>
                                    <Ionicons name={isMorning ? 'sunny' : 'moon'} size={20} color={isMorning ? '#F59E0B' : '#818cf8'} />
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-base">{isMorning ? 'Morning Routine' : 'Evening Routine'}</Text>
                                    <Text className="text-white/40 text-xs">When should this happen?</Text>
                                </View>
                            </View>
                            <Switch
                                value={isMorning}
                                onValueChange={setIsMorning}
                                trackColor={{ false: '#312e81', true: '#F59E0B' }}
                                thumbColor={'white'}
                            />
                        </View>

                        <View>
                            <Text className="text-white mb-2 font-medium">Points Reward</Text>
                            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-xl px-4">
                                <Ionicons name="star" size={20} color="#F59E0B" />
                                <TextInput
                                    className="flex-1 p-4 text-white text-base font-bold"
                                    value={pointsReward}
                                    onChangeText={setPointsReward}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </BlurView>

                    <BlurView intensity={20} tint="light" style={styles.section} className="border border-white/10">
                        <Text className="text-sm font-bold text-indigo-200 uppercase mb-4">Steps</Text>

                        <View className="flex-row gap-3 mb-4">
                            <View className="flex-1">
                                <TextInput
                                    className="bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base"
                                    placeholder="Step title..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={currentStep}
                                    onChangeText={setCurrentStep}
                                />
                            </View>
                            <View className="w-24">
                                <TextInput
                                    className="bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base text-center"
                                    placeholder="Min"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={currentDuration}
                                    onChangeText={setCurrentDuration}
                                    keyboardType="numeric"
                                />
                            </View>
                            <Pressable
                                onPress={handleAddStep}
                                className="bg-indigo-600 w-14 rounded-xl items-center justify-center active:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                            >
                                <Ionicons name="add" size={28} color="white" />
                            </Pressable>
                        </View>

                        {steps.length > 0 ? (
                            <View className="gap-2">
                                {steps.map((step, index) => (
                                    <View key={index} className="flex-row items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                        <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-3">
                                            <Text className="text-white font-bold">{index + 1}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-medium">{step.title}</Text>
                                            {step.durationMinutes && (
                                                <Text className="text-indigo-200 text-xs">{step.durationMinutes} min</Text>
                                            )}
                                        </View>
                                        <Pressable
                                            onPress={() => handleRemoveStep(index)}
                                            className="p-2 bg-white/5 rounded-full active:bg-white/10"
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="items-center py-8 border border-white/10 border-dashed rounded-xl bg-white/5">
                                <Text className="text-white/40">No steps added yet</Text>
                            </View>
                        )}
                    </BlurView>

                    <Pressable
                        onPress={handleSave}
                        className="bg-indigo-600 py-4 rounded-xl shadow-lg shadow-indigo-500/30 active:bg-indigo-700 mb-10"
                    >
                        <Text className="text-white text-center font-bold text-lg">Create Routine</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        gap: 24,
    },
    section: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
