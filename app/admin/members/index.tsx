import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Auth } from '../../../src/lib/auth';

// --- TYPES ---
interface MemberProfile {
    _id: string;
    familyMemberId: string;
    displayName: string;
    profileColor: string;
    role: 'Parent' | 'Child';
    pointsTotal: number;
}

interface Task {
    _id: string;
    assignedTo: string[];
    status: string;
}

// Available colors for child profiles
const PROFILE_COLORS = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
];

export default function FamilyMembersScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);

    // Form state for add/edit
    const [displayName, setDisplayName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);

    // --- FETCH DATA ---
    const { data: household, isLoading: isHouseholdLoading, refetch: refetchHousehold } = useQuery({
        queryKey: ['household'],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            return response.data.data;
        },
    });

    const { data: tasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/api/v1/tasks');
            return response.data.data.tasks as Task[];
        },
    });

    const memberProfiles = household?.memberProfiles || [];
    const parentProfiles = memberProfiles.filter((m: MemberProfile) => m.role === 'Parent');
    const childProfiles = memberProfiles.filter((m: MemberProfile) => m.role === 'Child');

    // Get used colors
    const usedColors = memberProfiles
        .map((m: MemberProfile) => m.profileColor)
        .filter(Boolean);

    // Get task count for a member
    const getTaskCount = (memberId: string) => {
        return tasks?.filter((t: Task) =>
            t.assignedTo.includes(memberId) && t.status !== 'Approved'
        ).length || 0;
    };

    // --- MUTATIONS ---
    const addMemberMutation = useMutation({
        mutationFn: async (data: { displayName: string; profileColor: string }) => {
            const hhId = await Auth.getHouseholdId();
            return api.post(`/api/v1/admin/households/${hhId}/members`, data);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Family member added!');
            queryClient.invalidateQueries({ queryKey: ['household'] });
            setIsAddModalOpen(false);
            setDisplayName('');
            setSelectedColor(PROFILE_COLORS[0]);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add member');
        },
    });

    const updateMemberMutation = useMutation({
        mutationFn: async (data: { memberId: string; displayName: string; profileColor: string }) => {
            const hhId = await Auth.getHouseholdId();
            return api.put(`/api/v1/admin/households/${hhId}/members/${data.memberId}`, {
                displayName: data.displayName,
                profileColor: data.profileColor,
            });
        },
        onSuccess: () => {
            Alert.alert('Success', 'Member updated!');
            queryClient.invalidateQueries({ queryKey: ['household'] });
            setIsEditModalOpen(false);
            setSelectedMember(null);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update member');
        },
    });

    const deleteMemberMutation = useMutation({
        mutationFn: async (memberId: string) => {
            const hhId = await Auth.getHouseholdId();
            return api.delete(`/api/v1/admin/households/${hhId}/members/${memberId}`);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Member removed!');
            queryClient.invalidateQueries({ queryKey: ['household'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
        },
    });

    // --- HANDLERS ---
    const handleAddMember = () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        addMemberMutation.mutate({ displayName: displayName.trim(), profileColor: selectedColor });
    };

    const handleEditMember = () => {
        if (!selectedMember || !displayName.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        updateMemberMutation.mutate({
            memberId: selectedMember._id,
            displayName: displayName.trim(),
            profileColor: selectedColor,
        });
    };

    const handleDeleteMember = (member: MemberProfile) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${member.displayName}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => deleteMemberMutation.mutate(member._id),
                },
            ]
        );
    };

    const openEditModal = (member: MemberProfile) => {
        setSelectedMember(member);
        setDisplayName(member.displayName);
        setSelectedColor(member.profileColor || PROFILE_COLORS[0]);
        setIsEditModalOpen(true);
    };

    const openAddModal = () => {
        setDisplayName('');
        setSelectedColor(PROFILE_COLORS.find(c => !usedColors.includes(c)) || PROFILE_COLORS[0]);
        setIsAddModalOpen(true);
    };

    // --- MEMBER ITEM COMPONENT ---
    const MemberItem = ({ member }: { member: MemberProfile }) => {
        const taskCount = getTaskCount(member._id);

        return (
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        {/* Avatar */}
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: member.profileColor || '#94A3B8' }}
                        >
                            {member.profileColor ? (
                                <Text className="text-white font-bold text-lg">
                                    {member.displayName.charAt(0).toUpperCase()}
                                </Text>
                            ) : (
                                <Ionicons name="person" size={24} color="white" />
                            )}
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900">{member.displayName}</Text>
                            <Text className="text-xs text-gray-500">
                                {member.role === 'Parent' ? 'Parent' : 'Child Profile'}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View className="flex-row items-center space-x-4 mr-2">
                        {/* Points */}
                        <View className="items-center w-14">
                            <Text className="text-lg font-bold text-indigo-600">{member.pointsTotal}</Text>
                            <Text className="text-xs text-gray-400">pts</Text>
                        </View>

                        {/* Tasks */}
                        <View className="flex-row items-center">
                            <Ionicons name="trophy" size={16} color="#9CA3AF" />
                            <Text className="text-lg font-bold text-gray-900 ml-1">{taskCount}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row space-x-2">
                        <Pressable
                            onPress={() => openEditModal(member)}
                            className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                        >
                            <Ionicons name="pencil" size={16} color="#6B7280" />
                        </Pressable>

                        {member.role === 'Child' && (
                            <Pressable
                                onPress={() => handleDeleteMember(member)}
                                className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                            >
                                <Ionicons name="trash-outline" size={16} color="#6B7280" />
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    // --- MODAL COMPONENT ---
    const MemberModal = ({ visible, onClose, isEdit }: { visible: boolean; onClose: () => void; isEdit: boolean }) => (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">
                            {isEdit ? 'Edit Member' : 'Add New Member'}
                        </Text>
                        <Pressable onPress={onClose} className="p-2">
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Name Input */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">Display Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                            placeholder="Enter name"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoFocus
                        />

                        {/* Color Picker */}
                        <Text className="text-sm font-bold text-gray-700 mb-3">Profile Color</Text>
                        <View className="flex-row flex-wrap gap-3 mb-6">
                            {PROFILE_COLORS.map((color) => {
                                const isUsed = usedColors.includes(color) && color !== selectedMember?.profileColor;
                                const isSelected = color === selectedColor;

                                return (
                                    <Pressable
                                        key={color}
                                        onPress={() => !isUsed && setSelectedColor(color)}
                                        disabled={isUsed}
                                        className="relative"
                                    >
                                        <View
                                            className={`w-14 h-14 rounded-full items-center justify-center ${isSelected ? 'border-4 border-gray-900' : 'border-2 border-gray-200'
                                                } ${isUsed ? 'opacity-30' : ''}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {isSelected && <Ionicons name="checkmark" size={24} color="white" />}
                                            {isUsed && !isSelected && (
                                                <View className="absolute inset-0 items-center justify-center">
                                                    <Ionicons name="close" size={24} color="white" />
                                                </View>
                                            )}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={onClose}
                                className="flex-1 bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
                            >
                                <Text className="font-bold text-gray-600">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={isEdit ? handleEditMember : handleAddMember}
                                disabled={addMemberMutation.isPending || updateMemberMutation.isPending}
                                className="flex-1 bg-indigo-600 py-4 rounded-xl items-center active:bg-indigo-700 shadow-md shadow-indigo-200"
                            >
                                {(addMemberMutation.isPending || updateMemberMutation.isPending) ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="font-bold text-white">
                                        {isEdit ? 'Update' : 'Add Member'}
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    if (isHouseholdLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-500">Loading family members...</Text>
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
                            <Text className="text-xl font-bold text-gray-900">Family Members</Text>
                            <Text className="text-gray-500 text-xs">
                                {memberProfiles.length} Total Member{memberProfiles.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={openAddModal}
                        className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-md shadow-indigo-200 active:bg-indigo-700"
                    >
                        <Ionicons name="person-add" size={18} color="white" />
                        <Text className="text-white font-bold ml-2">Add</Text>
                    </Pressable>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={
                    <RefreshControl refreshing={isHouseholdLoading} onRefresh={refetchHousehold} />
                }
            >
                {/* Parents Section */}
                {parentProfiles.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="people" size={20} color="#6B7280" />
                            <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
                                Parents ({parentProfiles.length})
                            </Text>
                        </View>
                        {parentProfiles.map((member: MemberProfile) => (
                            <MemberItem key={member._id} member={member} />
                        ))}
                    </View>
                )}

                {/* Children Section */}
                <View>
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="people" size={20} color="#6B7280" />
                        <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
                            Children ({childProfiles.length})
                        </Text>
                    </View>

                    {childProfiles.length > 0 ? (
                        childProfiles.map((member: MemberProfile) => (
                            <MemberItem key={member._id} member={member} />
                        ))
                    ) : (
                        <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center">
                            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-500 font-medium mb-1">No children yet</Text>
                            <Text className="text-gray-400 text-xs text-center">
                                Tap "Add" to create child profiles
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modals */}
            <MemberModal visible={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} isEdit={false} />
            <MemberModal visible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isEdit={true} />
        </SafeAreaView>
    );
}
