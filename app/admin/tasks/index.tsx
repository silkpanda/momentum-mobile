import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Auth } from '../../../src/lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// --- TYPES ---
interface Task {
    _id: string;
    title: string;
    description?: string;
    pointsValue: number;
    status: 'Pending' | 'PendingApproval' | 'Approved';
    assignedTo: string[];
    dueDate?: string;
    isRecurring: boolean;
}

interface MemberProfile {
    _id: string;
    displayName: string;
    profileColor: string;
    role: 'Parent' | 'Child';
}

export default function TaskListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pointsValue, setPointsValue] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    // --- FETCH DATA ---
    const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/api/v1/tasks');
            return response.data.data.tasks as Task[];
        },
    });

    const { data: household } = useQuery({
        queryKey: ['household'],
        queryFn: async () => {
            const hhId = await Auth.getHouseholdId();
            const response = await api.get(`/api/v1/household/${hhId}`);
            return response.data.data;
        },
    });

    const memberProfiles = household?.memberProfiles || [];

    // Filter tasks by status
    const pendingTasks = tasks?.filter(t => t.status === 'Pending') || [];
    const pendingApprovalTasks = tasks?.filter(t => t.status === 'PendingApproval') || [];
    const approvedTasks = tasks?.filter(t => t.status === 'Approved') || [];

    // Get member names
    const getMemberNames = (memberIds: string[]) => {
        return memberIds
            .map(id => memberProfiles.find((m: MemberProfile) => m._id === id)?.displayName)
            .filter(Boolean)
            .join(', ') || 'Unassigned';
    };

    // --- MUTATIONS ---
    const updateTaskMutation = useMutation({
        mutationFn: async (data: { taskId: string; updates: Partial<Task> }) => {
            return api.put(`/api/v1/admin/tasks/${data.taskId}`, data.updates);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Task updated!');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsEditModalOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            return api.delete(`/api/v1/admin/tasks/${taskId}`);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Task deleted!');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete task');
        },
    });

    // --- HANDLERS ---
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPointsValue('');
        setSelectedMembers([]);
        setSelectedTask(null);
    };

    const openEditModal = (task: Task) => {
        setSelectedTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setPointsValue(task.pointsValue.toString());
        setSelectedMembers(task.assignedTo);
        setIsEditModalOpen(true);
    };

    const handleUpdateTask = () => {
        if (!selectedTask || !title.trim() || !pointsValue) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const points = parseInt(pointsValue);
        if (isNaN(points) || points < 1) {
            Alert.alert('Error', 'Points must be a positive number');
            return;
        }

        updateTaskMutation.mutate({
            taskId: selectedTask._id,
            updates: {
                title: title.trim(),
                description: description.trim(),
                pointsValue: points,
                assignedTo: selectedMembers,
            },
        });
    };

    const handleDeleteTask = (task: Task) => {
        Alert.alert(
            'Delete Task',
            `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteTaskMutation.mutate(task._id),
                },
            ]
        );
    };

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    // --- TASK ITEM COMPONENT ---
    const TaskItem = ({ task }: { task: Task }) => {
        const statusColors = {
            Pending: { bg: 'bg-blue-500/20', text: 'text-blue-200', icon: 'time-outline' as const, border: 'border-blue-500/30' },
            PendingApproval: { bg: 'bg-yellow-500/20', text: 'text-yellow-200', icon: 'hourglass-outline' as const, border: 'border-yellow-500/30' },
            Approved: { bg: 'bg-green-500/20', text: 'text-green-200', icon: 'checkmark-circle' as const, border: 'border-green-500/30' },
        };

        const status = statusColors[task.status];

        return (
            <BlurView intensity={20} tint="light" className="overflow-hidden rounded-2xl mb-3 border border-white/10">
                <View className="p-4 bg-white/5">
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1 mr-3">
                            <Text className="text-lg font-bold text-white mb-1">{task.title}</Text>
                            {task.description && (
                                <Text className="text-sm text-indigo-200 mb-2" numberOfLines={2}>
                                    {task.description}
                                </Text>
                            )}
                            <View className="flex-row items-center flex-wrap gap-2">
                                <View className="bg-indigo-500/30 px-2 py-1 rounded-lg border border-indigo-500/30">
                                    <Text className="text-indigo-200 text-xs font-bold">{task.pointsValue} pts</Text>
                                </View>
                                <View className={`${status.bg} px-2 py-1 rounded-lg flex-row items-center border ${status.border}`}>
                                    <Ionicons name={status.icon} size={12} color="white" />
                                    <Text className={`${status.text} text-xs font-bold ml-1`}>{task.status}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row space-x-2">
                            <Pressable
                                onPress={() => openEditModal(task)}
                                className="p-2 bg-white/10 rounded-lg active:bg-white/20"
                            >
                                <Ionicons name="pencil" size={18} color="white" />
                            </Pressable>
                            <Pressable
                                onPress={() => handleDeleteTask(task)}
                                className="p-2 bg-red-500/20 rounded-lg active:bg-red-500/30"
                            >
                                <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.5)" />
                        <Text className="text-xs text-white/50 ml-1">
                            Assigned to: {getMemberNames(task.assignedTo)}
                        </Text>
                    </View>
                </View>
            </BlurView>
        );
    };

    // --- EDIT MODAL ---
    const editModalContent = useMemo(() => (
        <Modal visible={isEditModalOpen} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View className="bg-slate-900/90 rounded-t-3xl p-6 max-h-[85%] border-t border-white/10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-white">Edit Task</Text>
                        <Pressable onPress={() => { setIsEditModalOpen(false); resetForm(); }} className="p-2 bg-white/10 rounded-full">
                            <Ionicons name="close" size={24} color="white" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <Text className="text-sm font-bold text-indigo-200 mb-2 uppercase">Task Title *</Text>
                        <TextInput
                            className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 text-white"
                            placeholder="e.g., Clean your room"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={title}
                            onChangeText={setTitle}
                        />

                        {/* Description */}
                        <Text className="text-sm font-bold text-indigo-200 mb-2 uppercase">Description</Text>
                        <TextInput
                            className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 text-white"
                            placeholder="Optional details..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        {/* Points */}
                        <Text className="text-sm font-bold text-indigo-200 mb-2 uppercase">Points Value *</Text>
                        <TextInput
                            className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 text-white"
                            placeholder="e.g., 10"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={pointsValue}
                            onChangeText={setPointsValue}
                            keyboardType="numeric"
                        />

                        {/* Assign To */}
                        <Text className="text-sm font-bold text-indigo-200 mb-3 uppercase">Assign To</Text>
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {memberProfiles.map((member: MemberProfile) => {
                                const isSelected = selectedMembers.includes(member._id);
                                return (
                                    <Pressable
                                        key={member._id}
                                        onPress={() => toggleMemberSelection(member._id)}
                                        className="px-4 py-2 rounded-xl border"
                                        style={{
                                            borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <Text
                                            className="font-bold"
                                            style={{ color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
                                        >
                                            {member.displayName}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 pb-8">
                            <Pressable
                                onPress={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="flex-1 bg-white/10 py-4 rounded-xl items-center active:bg-white/20"
                            >
                                <Text className="font-bold text-white">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleUpdateTask}
                                disabled={updateTaskMutation.isPending}
                                className="flex-1 bg-indigo-600 py-4 rounded-xl items-center active:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                            >
                                {updateTaskMutation.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="font-bold text-white">Update Task</Text>
                                )}
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    ), [isEditModalOpen, title, description, pointsValue, selectedMembers, memberProfiles, updateTaskMutation.isPending]);

    if (isTasksLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-900">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="mt-4 text-indigo-200">Loading tasks...</Text>
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
                    <View className="p-6 border-b border-white/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                                    <Ionicons name="arrow-back" size={24} color="white" />
                                </Pressable>
                                <View>
                                    <Text className="text-2xl font-bold text-white">Manage Tasks</Text>
                                    <Text className="text-indigo-200 text-xs">{tasks?.length || 0} total tasks</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => router.push('/admin/tasks/create')}
                                className="bg-indigo-600 px-4 py-3 rounded-xl flex-row items-center shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text className="text-white font-bold ml-1">New</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        contentContainerClassName="p-6"
                        refreshControl={<RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} tintColor="white" />}
                    >
                        {/* Pending Tasks */}
                        {pendingTasks.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="time-outline" size={20} color="#60A5FA" />
                                    <Text className="text-sm font-bold text-indigo-200 uppercase ml-2 tracking-wider">
                                        Active Tasks ({pendingTasks.length})
                                    </Text>
                                </View>
                                {pendingTasks.map(task => <TaskItem key={task._id} task={task} />)}
                            </View>
                        )}

                        {/* Pending Approval */}
                        {pendingApprovalTasks.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="hourglass-outline" size={20} color="#FBBF24" />
                                    <Text className="text-sm font-bold text-indigo-200 uppercase ml-2 tracking-wider">
                                        Pending Approval ({pendingApprovalTasks.length})
                                    </Text>
                                </View>
                                {pendingApprovalTasks.map(task => <TaskItem key={task._id} task={task} />)}
                            </View>
                        )}

                        {/* Approved Tasks */}
                        {approvedTasks.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="checkmark-circle" size={20} color="#34D399" />
                                    <Text className="text-sm font-bold text-indigo-200 uppercase ml-2 tracking-wider">
                                        Completed ({approvedTasks.length})
                                    </Text>
                                </View>
                                {approvedTasks.map(task => <TaskItem key={task._id} task={task} />)}
                            </View>
                        )}

                        {/* Empty State */}
                        {tasks?.length === 0 && (
                            <BlurView intensity={20} tint="light" className="p-8 rounded-2xl border border-white/10 items-center mt-10 border-dashed">
                                <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="checkbox-outline" size={40} color="rgba(255,255,255,0.3)" />
                                </View>
                                <Text className="text-white font-bold text-lg mb-1">No tasks yet</Text>
                                <Text className="text-indigo-200 text-sm text-center mb-6">
                                    Create your first task to get started
                                </Text>
                                <Pressable
                                    onPress={() => router.push('/admin/tasks/create')}
                                    className="bg-indigo-600 px-8 py-3 rounded-xl active:bg-indigo-700"
                                >
                                    <Text className="text-white font-bold">Create Task</Text>
                                </Pressable>
                            </BlurView>
                        )}
                    </ScrollView>

                    {/* Edit Modal */}
                    {editModalContent}
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
