import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
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

// Member Modal Component
const MemberModal = ({
    visible,
    onClose,
    isEdit,
    displayName,
    setDisplayName,
    selectedColor,
    setSelectedColor,
    usedColors,
    currentMemberColor,
    role,
    setRole,
    onSubmit,
    isSubmitting
}: {
    visible: boolean;
    onClose: () => void;
    isEdit: boolean;
    displayName: string;
    setDisplayName: (text: string) => void;
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    usedColors: string[];
    currentMemberColor?: string;
    role: 'Parent' | 'Child';
    setRole: (role: 'Parent' | 'Child') => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}) => (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <View className="flex-1 justify-center items-center bg-black/80 px-4">
                <BlurView intensity={80} tint="dark" className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20">
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        className="p-6"
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-white">
                                {isEdit ? 'Edit Profile' : 'New Child Profile'}
                            </Text>
                            <Pressable onPress={onClose} className="bg-white/10 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="white" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-indigo-200 font-bold text-xs uppercase mb-2 ml-1">Display Name</Text>
                            <TextInput
                                className="bg-black/40 border border-white/20 rounded-2xl p-4 text-white mb-6 text-lg placeholder:text-white/30"
                                placeholder="e.g. Mom, Dad, Sarah"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoFocus
                            />

                            {isEdit && (
                                <>
                                    <Text className="text-indigo-200 font-bold text-xs uppercase mb-3 ml-1">Role</Text>
                                    <View className="flex-row gap-3 mb-6">
                                        <Pressable
                                            onPress={() => setRole('Parent')}
                                            className={`flex-1 p-4 rounded-2xl border ${role === 'Parent' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10'}`}
                                        >
                                            <View className="items-center">
                                                <Ionicons name="person" size={24} color={role === 'Parent' ? 'white' : '#94a3b8'} />
                                                <Text className={`font-bold mt-2 ${role === 'Parent' ? 'text-white' : 'text-slate-400'}`}>Parent</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => setRole('Child')}
                                            className={`flex-1 p-4 rounded-2xl border ${role === 'Child' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10'}`}
                                        >
                                            <View className="items-center">
                                                <Ionicons name="happy" size={24} color={role === 'Child' ? 'white' : '#94a3b8'} />
                                                <Text className={`font-bold mt-2 ${role === 'Child' ? 'text-white' : 'text-slate-400'}`}>Child</Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                </>
                            )}

                            <Text className="text-indigo-200 font-bold text-xs uppercase mb-3 ml-1">Avatar Color</Text>
                            <View className="flex-row flex-wrap gap-3 mb-8">
                                {PROFILE_COLORS.map((color) => {
                                    const isUsed = usedColors.includes(color) && color !== currentMemberColor;
                                    const isSelected = color === selectedColor;
                                    return (
                                        <Pressable
                                            key={color}
                                            onPress={() => !isUsed && setSelectedColor(color)}
                                            disabled={isUsed}
                                            className={`w-12 h-12 rounded-full items-center justify-center ${isUsed ? 'opacity-20' : ''}`}
                                            style={{
                                                backgroundColor: color,
                                                borderWidth: isSelected ? 4 : 1,
                                                borderColor: isSelected ? 'white' : 'rgba(255,255,255,0.1)',
                                                transform: isSelected ? [{ scale: 1.1 }] : []
                                            }}
                                        >
                                            {isSelected && <Ionicons name="checkmark" size={24} color="white" />}
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={onClose}
                                    className="flex-1 bg-white/10 py-4 rounded-2xl items-center active:bg-white/20"
                                >
                                    <Text className="font-bold text-white">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={onSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-indigo-500 py-4 rounded-2xl items-center active:bg-indigo-600 shadow-lg shadow-indigo-500/30"
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="font-bold text-white">{isEdit ? 'Save Changes' : 'Create Profile'}</Text>
                                    )}
                                </Pressable>
                            </View>
                        </ScrollView>
                    </LinearGradient>
                </BlurView>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);

export default function FamilyMembersScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);

    // Form state for add/edit
    const [displayName, setDisplayName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);
    const [role, setRole] = useState<'Parent' | 'Child'>('Child');

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
        mutationFn: async (data: { displayName: string; profileColor: string; role: 'Parent' | 'Child' }) => {
            const hhId = await Auth.getHouseholdId();
            return api.post(`/api/v1/admin/households/${hhId}/members`, {
                ...data,
                firstName: data.displayName, // Map displayName to firstName as required by API
            });
        },
        onSuccess: () => {
            Alert.alert('Success', 'Family member added!');
            queryClient.invalidateQueries({ queryKey: ['household'] });
            setIsAddModalOpen(false);
            setDisplayName('');
            setRole('Child');
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
        addMemberMutation.mutate({
            displayName: displayName.trim(),
            profileColor: selectedColor,
            role: role
        });
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
        setRole(member.role);
        setIsEditModalOpen(true);
    };

    const openAddModal = () => {
        setDisplayName('');
        setRole('Child');
        setSelectedColor(PROFILE_COLORS.find(c => !usedColors.includes(c)) || PROFILE_COLORS[0]);
        setIsAddModalOpen(true);
    };

    // --- MEMBER ITEM COMPONENT ---
    const MemberItem = ({ member }: { member: MemberProfile }) => {
        const taskCount = getTaskCount(member._id);

        return (
            <BlurView intensity={20} tint="light" className="bg-white/10 p-4 rounded-2xl border border-white/10 mb-3 overflow-hidden">
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
                            <Text className="text-lg font-bold text-white">{member.displayName}</Text>
                            <Text className="text-xs text-indigo-200 font-medium">
                                {member.role === 'Parent' ? 'Parent' : 'Child Profile'}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View className="flex-row items-center space-x-4 mr-2">
                        {/* Points */}
                        <View className="items-center w-14">
                            <Text className="text-lg font-bold text-indigo-300">{member.pointsTotal}</Text>
                            <Text className="text-xs text-white/50">pts</Text>
                        </View>

                        {/* Tasks */}
                        <View className="flex-row items-center">
                            <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.5)" />
                            <Text className="text-lg font-bold text-white ml-1">{taskCount}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row space-x-2">
                        <Pressable
                            onPress={() => openEditModal(member)}
                            className="p-2 bg-white/10 rounded-lg active:bg-white/20"
                        >
                            <Ionicons name="pencil" size={16} color="white" />
                        </Pressable>

                        {member.role === 'Child' && (
                            <Pressable
                                onPress={() => handleDeleteMember(member)}
                                className="p-2 bg-red-500/20 rounded-lg active:bg-red-500/30"
                            >
                                <Ionicons name="trash-outline" size={16} color="#F87171" />
                            </Pressable>
                        )}
                    </View>
                </View>
            </BlurView>
        );
    };

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="p-6">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                                    <Ionicons name="arrow-back" size={24} color="white" />
                                </Pressable>
                                <View>
                                    <Text className="text-2xl font-bold text-white">Family Members</Text>
                                    <Text className="text-indigo-200 text-xs font-medium">
                                        {memberProfiles.length} Total Member{memberProfiles.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={openAddModal}
                                className="bg-indigo-500 px-5 py-3 rounded-2xl flex-row items-center shadow-lg shadow-indigo-500/30 active:bg-indigo-600"
                            >
                                <Ionicons name="person-add" size={20} color="white" />
                                <Text className="text-white font-bold ml-2">Add New</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        contentContainerClassName="p-6"
                        refreshControl={
                            <RefreshControl refreshing={isHouseholdLoading} onRefresh={refetchHousehold} tintColor="white" />
                        }
                    >
                        {/* Parents Section */}
                        {parentProfiles.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="people" size={20} color="#818cf8" />
                                    <Text className="text-sm font-bold text-indigo-200 uppercase ml-2 tracking-wider">
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
                                <Ionicons name="people" size={20} color="#818cf8" />
                                <Text className="text-sm font-bold text-indigo-200 uppercase ml-2 tracking-wider">
                                    Children ({childProfiles.length})
                                </Text>
                            </View>

                            {childProfiles.length > 0 ? (
                                childProfiles.map((member: MemberProfile) => (
                                    <MemberItem key={member._id} member={member} />
                                ))
                            ) : (
                                <View className="bg-white/5 p-8 rounded-2xl border border-white/10 items-center">
                                    <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="people-outline" size={32} color="rgba(255,255,255,0.5)" />
                                    </View>
                                    <Text className="text-white/70 font-medium mb-1">No children yet</Text>
                                    <Text className="text-white/40 text-xs text-center">
                                        Tap "Add New" to create child profiles
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Modals */}
                    <MemberModal
                        visible={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        isEdit={false}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        role={role}
                        setRole={setRole}
                        usedColors={usedColors}
                        onSubmit={handleAddMember}
                        isSubmitting={addMemberMutation.isPending}
                    />
                    <MemberModal
                        visible={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        isEdit={true}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        role={role}
                        setRole={setRole}
                        usedColors={usedColors}
                        currentMemberColor={selectedMember?.profileColor}
                        onSubmit={handleEditMember}
                        isSubmitting={updateMemberMutation.isPending}
                    />
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
