import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Auth } from '../../../src/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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

  // --- FETCH MEMBERS ---
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ['household-members'],
    queryFn: async () => {
      const hhId = await Auth.getHouseholdId();
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
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#ffffff" />
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
          <View className="p-4 border-b border-white/10 flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} className="p-2">
              <Text className="text-indigo-200 text-base">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-bold text-white">New Task</Text>
            <Pressable onPress={handleSave} disabled={createTaskMutation.isPending} className="p-2">
              {createTaskMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-indigo-400 text-base font-bold">Save</Text>
              )}
            </Pressable>
          </View>

          <ScrollView className="p-6">
            {/* Task Name */}
            <BlurView intensity={20} tint="light" className="overflow-hidden rounded-xl mb-6 border border-white/10">
              <View className="p-4 bg-white/5">
                <Text className="text-xs font-bold text-indigo-200 uppercase mb-2">Task Name</Text>
                <TextInput
                  className="text-lg font-medium text-white"
                  placeholder="e.g. Clean Room"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
              </View>
            </BlurView>

            {/* Points Selector */}
            <View className="mb-8">
              <Text className="text-xs font-bold text-indigo-200 uppercase mb-3 ml-1">Points Value</Text>
              <View className="flex-row gap-3">
                {['10', '20', '50', '100'].map((val) => {
                  const isSelected = points === val;
                  return (
                    <Pressable
                      key={val}
                      onPress={() => setPoints(val)}
                      className="flex-1 py-3 rounded-lg items-center border"
                      style={{
                        backgroundColor: isSelected ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                        borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Text
                        className="font-bold"
                        style={{ color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
                      >
                        {val}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {/* Custom Point Input */}
              <BlurView intensity={20} tint="light" className="mt-3 overflow-hidden rounded-lg border border-white/10">
                <View className="bg-white/5 p-3 flex-row items-center">
                  <Text className="text-indigo-200 mr-2 text-sm">Custom Amount:</Text>
                  <TextInput
                    className="flex-1 text-right font-bold text-white"
                    keyboardType="numeric"
                    value={points}
                    onChangeText={setPoints}
                  />
                </View>
              </BlurView>
            </View>

            {/* Assign To */}
            <View>
              <Text className="text-xs font-bold text-indigo-200 uppercase mb-3 ml-1">Assign To</Text>
              <View className="gap-3">
                {members?.map((member) => {
                  const isSelected = assignedTo.includes(member._id);
                  return (
                    <BlurView
                      key={member._id}
                      intensity={isSelected ? 40 : 20}
                      tint="light"
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Pressable
                        onPress={() => toggleMember(member._id)}
                        className="p-3 flex-row items-center justify-between"
                        style={{
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <View className="flex-row items-center">
                          <View
                            className="w-8 h-8 rounded-full justify-center items-center mr-3 border-2 border-white/20"
                            style={{ backgroundColor: member.profileColor }}
                          >
                            <Text className="text-white font-bold text-xs shadow-sm">{member.displayName[0]}</Text>
                          </View>
                          <Text
                            className="font-medium text-base"
                            style={{ color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                          >
                            {member.displayName}
                          </Text>
                        </View>

                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={22} color="#818cf8" />
                        )}
                      </Pressable>
                    </BlurView>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}