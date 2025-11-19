import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { Auth } from '../../../src/lib/auth';

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
            Pending: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'time-outline' as const },
            PendingApproval: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'hourglass-outline' as const },
            Approved: { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' as const },
        };

        const status = statusColors[task.status];

        return (
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-3">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                        <Text className="text-lg font-bold text-gray-900 mb-1">{task.title}</Text>
                        {task.description && (
                            <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
                                {task.description}
                            </Text>
                        )}
                        <View className="flex-row items-center flex-wrap gap-2">
                            <View className="bg-indigo-100 px-2 py-1 rounded-lg">
                                <Text className="text-indigo-700 text-xs font-bold">{task.pointsValue} pts</Text>
                            </View>
                            <View className={`${status.bg} px-2 py-1 rounded-lg flex-row items-center`}>
                                <Ionicons name={status.icon} size={12} color={status.text.replace('text-', '#')} />
                                <Text className={`${status.text} text-xs font-bold ml-1`}>{task.status}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row space-x-2">
                        <Pressable
                            onPress={() => openEditModal(task)}
                            className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                        >
                            <Ionicons name="pencil" size={18} color="#6B7280" />
                        </Pressable>
                        <Pressable
                            onPress={() => handleDeleteTask(task)}
                            className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </Pressable>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1">
                        Assigned to: {getMemberNames(task.assignedTo)}
                    </Text>
                </View>
            </View>
        );
    };

    // --- EDIT MODAL ---
    const EditModal = () => (
        <Modal visible={isEditModalOpen} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Edit Task</Text>
                        <Pressable onPress={() => { setIsEditModalOpen(false); resetForm(); }} className="p-2">
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">Task Title *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                            placeholder="e.g., Clean your room"
                            value={title}
                            onChangeText={setTitle}
                        />

                        {/* Description */}
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

                        {/* Points */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">Points Value *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                            placeholder="e.g., 10"
                            value={pointsValue}
                            onChangeText={setPointsValue}
                            keyboardType="numeric"
                        />

                        {/* Assign To */}
                        <Text className="text-sm font-bold text-gray-700 mb-3">Assign To</Text>
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {memberProfiles.map((member: MemberProfile) => {
                                const isSelected = selectedMembers.includes(member._id);
                                return (
                                    <Pressable
                                        key={member._id}
                                        onPress={() => toggleMemberSelection(member._id)}
                                        className={`px-4 py-2 rounded-xl border-2 ${isSelected
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <Text
                                            className={`font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-600'
                                                }`}
                                        >
                                            {member.displayName}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="flex-1 bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
                            >
                                <Text className="font-bold text-gray-600">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleUpdateTask}
                                disabled={updateTaskMutation.isPending}
                                className="flex-1 bg-indigo-600 py-4 rounded-xl items-center active:bg-indigo-700 shadow-md shadow-indigo-200"
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
    );

    if (isTasksLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-500">Loading tasks...</Text>
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
                            <Text className="text-xl font-bold text-gray-900">Manage Tasks</Text>
                            <Text className="text-gray-500 text-xs">{tasks?.length || 0} total tasks</Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => router.push('/admin/tasks/create')}
                        className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-md shadow-indigo-200 active:bg-indigo-700"
                    >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-bold ml-1">New</Text>
                    </Pressable>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} />}
            >
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="time-outline" size={20} color="#3B82F6" />
                            <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
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
                            <Ionicons name="hourglass-outline" size={20} color="#F59E0B" />
                            <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
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
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
                                Completed ({approvedTasks.length})
                            </Text>
                        </View>
                        {approvedTasks.map(task => <TaskItem key={task._id} task={task} />)}
                    </View>
                )}

                {/* Empty State */}
                {tasks?.length === 0 && (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-10">
                        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="checkbox-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-500 font-medium mb-1">No tasks yet</Text>
                        <Text className="text-gray-400 text-xs text-center mb-4">
                            Create your first task to get started
                        </Text>
                        <Pressable
                            onPress={() => router.push('/admin/tasks/create')}
                            className="bg-indigo-600 px-6 py-3 rounded-xl active:bg-indigo-700"
                        >
                            <Text className="text-white font-bold">Create Task</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <EditModal />
        </SafeAreaView>
    );
}
