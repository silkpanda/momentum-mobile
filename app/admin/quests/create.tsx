import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';

type QuestType = 'one-time' | 'limited' | 'unlimited';
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export default function CreateQuestScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pointsValue, setPointsValue] = useState('');
    const [questType, setQuestType] = useState<QuestType>('one-time');
    const [maxClaims, setMaxClaims] = useState('3');

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('daily');

    const createQuestMutation = useMutation({
        mutationFn: async (newQuest: any) => {
            return api.post('/api/v1/admin/quests', newQuest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quests'] });
            Alert.alert('Success', 'Quest created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create quest');
        },
    });

    const handleCreate = () => {
        if (!title.trim() || !pointsValue) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const points = parseInt(pointsValue);
        if (isNaN(points) || points < 1) {
            Alert.alert('Error', 'Points must be a positive number');
            return;
        }

        const payload: any = {
            title: title.trim(),
            description: description.trim(),
            pointsValue: points,
            questType,
            recurrence: isRecurring ? recurrenceFrequency : undefined,
        };

        if (questType === 'limited') {
            const claims = parseInt(maxClaims);
            if (isNaN(claims) || claims < 1) {
                Alert.alert('Error', 'Max claims must be at least 1');
                return;
            }
            payload.maxClaims = claims;
        }

        createQuestMutation.mutate(payload);
    };

    const QuestTypeOption = ({ type, label, icon, desc }: { type: QuestType, label: string, icon: any, desc: string }) => (
        <Pressable
            onPress={() => setQuestType(type)}
            className={`p-4 rounded-xl border-2 mb-3 flex-row items-center ${questType === type ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'
                }`}
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${questType === type ? 'bg-indigo-200' : 'bg-gray-100'
                }`}>
                <Ionicons name={icon} size={20} color={questType === type ? '#4F46E5' : '#6B7280'} />
            </View>
            <View className="flex-1">
                <Text className={`font-bold ${questType === type ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {label}
                </Text>
                <Text className="text-xs text-gray-500">{desc}</Text>
            </View>
            {questType === type && (
                <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
            )}
        </Pressable>
    );

    const FrequencyOption = ({ type, label }: { type: RecurrenceFrequency, label: string }) => (
        <Pressable
            onPress={() => setRecurrenceFrequency(type)}
            className={`flex-1 py-3 rounded-xl border items-center justify-center mr-2 ${recurrenceFrequency === type ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'
                }`}
        >
            <Text className={`font-bold ${recurrenceFrequency === type ? 'text-white' : 'text-gray-600'}`}>
                {label}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="p-6 border-b border-gray-200 bg-white">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full mr-4">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </Pressable>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">New Quest</Text>
                        <Text className="text-gray-500 text-xs">Create a shared task</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerClassName="p-6">
                {/* Basic Info */}
                <View className="bg-white p-4 rounded-2xl border border-gray-200 mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Quest Title *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                        placeholder="e.g., Organize the Garage"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                        placeholder="Optional details..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Points Value *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                        placeholder="e.g., 100"
                        value={pointsValue}
                        onChangeText={setPointsValue}
                        keyboardType="numeric"
                    />
                </View>

                {/* Quest Type */}
                <Text className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">
                    Quest Type
                </Text>

                <QuestTypeOption
                    type="one-time"
                    label="One-Time Quest"
                    icon="flash"
                    desc="Disappears after one person completes it."
                />

                <QuestTypeOption
                    type="limited"
                    label="Limited Claims"
                    icon="people"
                    desc="Available to a specific number of people."
                />

                <QuestTypeOption
                    type="unlimited"
                    label="Unlimited"
                    icon="infinite"
                    desc="Anyone can complete this, anytime."
                />

                {/* Conditional Fields */}
                {questType === 'limited' && (
                    <View className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 mt-2">
                        <Text className="text-sm font-bold text-gray-700 mb-2">Max Claims</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                            placeholder="e.g., 3"
                            value={maxClaims}
                            onChangeText={setMaxClaims}
                            keyboardType="numeric"
                        />
                        <Text className="text-xs text-gray-500 mt-2">
                            This quest will disappear after {maxClaims} people complete it.
                        </Text>
                    </View>
                )}

                {/* Recurrence Section */}
                <View className="mt-6 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Recurrence
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                Should this quest reset automatically?
                            </Text>
                        </View>
                        <Switch
                            value={isRecurring}
                            onValueChange={setIsRecurring}
                            trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                            thumbColor={'white'}
                        />
                    </View>

                    {isRecurring && (
                        <View className="flex-row">
                            <FrequencyOption type="daily" label="Daily" />
                            <FrequencyOption type="weekly" label="Weekly" />
                            <FrequencyOption type="monthly" label="Monthly" />
                        </View>
                    )}
                </View>

                {/* Create Button */}
                <Pressable
                    onPress={handleCreate}
                    disabled={createQuestMutation.isPending}
                    className="bg-indigo-600 py-4 rounded-xl items-center shadow-md shadow-indigo-200 active:bg-indigo-700 mt-4 mb-10"
                >
                    {createQuestMutation.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="font-bold text-white text-lg">Create Quest</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
