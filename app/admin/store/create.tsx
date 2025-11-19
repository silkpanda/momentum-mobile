import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';

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
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-gray-500 text-base">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">New Reward</Text>
          <Pressable onPress={handleSave} disabled={createRewardMutation.isPending}>
            {createRewardMutation.isPending ? (
               <ActivityIndicator color="#EA580C" /> // Orange to match store theme
            ) : (
               <Text className="text-orange-600 text-base font-bold">Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView className="p-6">
          {/* Icon Placeholder (Visual Polish) */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center border border-orange-200">
              <Ionicons name="gift" size={40} color="#EA580C" />
            </View>
          </View>

          {/* Item Name */}
          <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Item Name</Text>
            <TextInput 
              className="text-lg font-medium text-gray-900"
              placeholder="e.g. Roblox Gift Card"
              placeholderTextColor="#9CA3AF"
              value={itemName}
              onChangeText={setItemName}
              autoFocus
            />
          </View>

           {/* Description (Optional) */}
           <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Description (Optional)</Text>
            <TextInput 
              className="text-base text-gray-900"
              placeholder="e.g. $10 Value"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Cost Selector */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Cost (Points)</Text>
            <View className="flex-row gap-3">
              {['50', '100', '250', '500'].map((val) => (
                <Pressable 
                  key={val}
                  onPress={() => setCost(val)}
                  className={`flex-1 py-3 rounded-lg items-center border ${
                    cost === val 
                      ? 'bg-orange-600 border-orange-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-bold ${cost === val ? 'text-white' : 'text-gray-600'}`}>
                    {val}
                  </Text>
                </Pressable>
              ))}
            </View>
             {/* Custom Cost Input */}
             <View className="mt-3 bg-white p-3 rounded-lg border border-gray-200 flex-row items-center">
                <Text className="text-gray-500 mr-2 text-sm">Custom Cost:</Text>
                <TextInput 
                  className="flex-1 text-right font-bold text-gray-900"
                  keyboardType="numeric"
                  value={cost}
                  onChangeText={setCost}
                />
             </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}