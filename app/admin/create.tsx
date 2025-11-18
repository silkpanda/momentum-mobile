import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { Auth } from '../../src/lib/auth';
import { Ionicons } from '@expo/vector-icons';

interface MemberProfile {
  _id: string;
  displayName: string;
  profileColor: string;
  role: 'Parent' | 'Child';
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- FORM STATE ---
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('10');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH MEMBERS ---
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ['household-members'],
    queryFn: async () => {
      const hhId = await Auth.getHouseholdId();
      // Using singular route consistent with BFF fix
      const response = await api.get(`/api/v1/household/${hhId}`);
      return response.data.data.memberProfiles as MemberProfile[];
    },
  });

  // --- CREATE MUTATION ---
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      if (!title || assignedTo.length === 0) throw new Error('Please fill all fields');
      
      return api.post('/api/v1/admin/tasks', {
        title,
        pointsValue: parseInt(points),
        assignedTo,
        description: '', 
        dueDate: null 
      });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to create task');
    }
  });

  const toggleMember = (id: string) => {
    if (assignedTo.includes(id)) {
      setAssignedTo(assignedTo.filter(m => m !== id));
    } else {
      setAssignedTo([...assignedTo, id]);
    }
  };

  const handleSave = () => {
    createTaskMutation.mutate();
  };

  if (isMembersLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-gray-500 text-base">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">New Task</Text>
          <Pressable onPress={handleSave} disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? (
               <ActivityIndicator color="#4F46E5" />
            ) : (
               <Text className="text-indigo-600 text-base font-bold">Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView className="p-6">
          {/* Task Name */}
          <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Task Name</Text>
            <TextInput 
              className="text-lg font-medium text-gray-900"
              placeholder="e.g. Clean Room"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Points Selector */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Points Value</Text>
            <View className="flex-row gap-3">
              {['10', '20', '50', '100'].map((val) => (
                <Pressable 
                  key={val}
                  onPress={() => setPoints(val)}
                  className={`flex-1 py-3 rounded-lg items-center border ${
                    points === val 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-bold ${points === val ? 'text-white' : 'text-gray-600'}`}>
                    {val}
                  </Text>
                </Pressable>
              ))}
            </View>
             {/* Custom Point Input */}
             <View className="mt-3 bg-white p-3 rounded-lg border border-gray-200 flex-row items-center">
                <Text className="text-gray-500 mr-2 text-sm">Custom Amount:</Text>
                <TextInput 
                  className="flex-1 text-right font-bold text-gray-900"
                  keyboardType="numeric"
                  value={points}
                  onChangeText={setPoints}
                />
             </View>
          </View>

          {/* Assign To */}
          <View>
            <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Assign To</Text>
            <View className="gap-3">
              {members?.map((member) => {
                const isSelected = assignedTo.includes(member._id);
                return (
                  <Pressable 
                    key={member._id}
                    onPress={() => toggleMember(member._id)}
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${
                      isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View 
                        className="w-8 h-8 rounded-full justify-center items-center mr-3"
                        style={{ backgroundColor: member.profileColor }}
                      >
                        <Text className="text-white font-bold text-xs">{member.displayName[0]}</Text>
                      </View>
                      <Text className={`font-medium text-base ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {member.displayName}
                      </Text>
                    </View>
                    
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color="#4F46E5" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}