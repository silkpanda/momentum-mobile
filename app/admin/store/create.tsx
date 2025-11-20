import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function CreateRewardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- FORM STATE ---
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('50'); // Default cost

  // --- CREATE MUTATION ---
  const createRewardMutation = useMutation({
    mutationFn: async () => {
      if (!itemName || !cost) throw new Error('Item Name and Cost are required');

      // POST to the Admin Store Items endpoint to match BFF/API structure
      return api.post('/api/v1/admin/store-items', {
        itemName,
        description, // Optional
        cost: parseInt(cost),
      });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Reward added to store!');
      queryClient.invalidateQueries({ queryKey: ['store-items'] });
      router.back();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create reward';
      Alert.alert('Error', msg);
    }
  });

  const handleSave = () => {
    createRewardMutation.mutate();
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['#1e1b4b', '#312e81']} style={StyleSheet.absoluteFill} />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="p-6 border-b border-white/10">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              <Text className="text-2xl font-bold text-white">New Reward</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Icon Placeholder (Visual Polish) */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-orange-500/20 rounded-full items-center justify-center border border-orange-500/30">
              <Ionicons name="gift" size={48} color="#F97316" />
            </View>
          </View>

          <BlurView intensity={20} tint="light" style={styles.section} className="border border-white/10">
            <Text className="text-sm font-bold text-indigo-200 uppercase mb-4">Reward Details</Text>

            {/* Item Name */}
            <View className="mb-4">
              <Text className="text-white mb-2 font-medium">Reward Name *</Text>
              <TextInput
                className="bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base"
                placeholder="e.g., Extra Screen Time"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={itemName}
                onChangeText={setItemName}
                autoFocus
              />
            </View>

            {/* Description (Optional) */}
            <View className="mb-4">
              <Text className="text-white mb-2 font-medium">Description (Optional)</Text>
              <TextInput
                className="bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base h-24"
                placeholder="Briefly describe this reward..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </BlurView>

          <BlurView intensity={20} tint="light" style={styles.section} className="border border-white/10">
            <Text className="text-sm font-bold text-indigo-200 uppercase mb-4">Cost (Points)</Text>

            {/* Quick Select Buttons */}
            <View className="flex-row gap-3 mb-4">
              {['50', '100', '250', '500'].map((val) => (
                <Pressable
                  key={val}
                  onPress={() => setCost(val)}
                  className="flex-1 py-3 rounded-xl items-center border"
                  style={{
                    backgroundColor: cost === val ? '#EA580C' : 'rgba(255,255,255,0.05)',
                    borderColor: cost === val ? '#EA580C' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text className={`font-bold ${cost === val ? 'text-white' : 'text-white/60'}`}>
                    {val}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Custom Cost Input */}
            <View className="bg-black/40 border border-white/10 rounded-xl p-4 flex-row items-center">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <TextInput
                className="flex-1 ml-3 text-white text-base font-bold"
                placeholder="Custom amount"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                value={cost}
                onChangeText={setCost}
              />
            </View>
          </BlurView>

          <Pressable
            onPress={handleSave}
            disabled={createRewardMutation.isPending}
            className="bg-indigo-600 py-4 rounded-xl shadow-lg shadow-indigo-500/30 active:bg-indigo-700 mb-10"
          >
            {createRewardMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">Create Reward</Text>
            )}
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