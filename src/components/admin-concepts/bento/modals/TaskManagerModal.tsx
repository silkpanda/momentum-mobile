// =========================================================
// TaskManagerModal - Full Task List with CRUD Operations
// =========================================================
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Search, X, Plus, Edit2, Trash2, CheckCircle, Filter } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { useOptimisticUpdate } from '../../../../hooks/useOptimisticUpdate';
import { api } from '../../../../services/api';
import { Task } from '../../../../types';
import EditTaskModal from './EditTaskModal';

interface TaskManagerModalProps {
    visible: boolean;
    onClose: () => void;
}

type FilterType = 'all' | 'pending' | 'approval' | 'completed';

const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Active' },
    { id: 'approval', label: 'Pending Approval' },
    { id: 'completed', label: 'Completed' },
];

export default function TaskManagerModal({ visible, onClose }: TaskManagerModalProps) {
    const { currentTheme: theme } = useTheme();
    const { tasks, members, refresh, isRefreshing } = useData();
    const { execute } = useOptimisticUpdate();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Filter and search tasks
    const filteredTasks = useMemo(() => {
        return tasks
            .filter((task) => {
                // Apply status filter
                if (activeFilter === 'pending') return task.status === 'Pending';
                if (activeFilter === 'approval') return task.status === 'PendingApproval';
                if (activeFilter === 'completed') return task.status === 'Completed';
                return true;
            })
            .filter((task) => {
                // Apply search
                if (!searchQuery) return true;
                return task.title.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
                // Sort: Pending Approval first, then Pending, then Completed
                const statusOrder: Record<string, number> = { PendingApproval: 0, Pending: 1, Completed: 2 };
                return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
            });
    }, [tasks, activeFilter, searchQuery]);

    // Toggle task selection for batch operations
    const toggleTaskSelection = (taskId: string) => {
        setSelectedTasks((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    // Clear selection
    const clearSelection = () => setSelectedTasks([]);

    // Batch approve
    const handleBatchApprove = async () => {
        if (selectedTasks.length === 0) return;

        try {
            await Promise.all(selectedTasks.map((id) => api.approveTask(id)));
            await refresh();
            clearSelection();
            Alert.alert('Success', `Approved ${selectedTasks.length} task(s)!`);
        } catch (error) {
            console.error('Batch approve error:', error);
            Alert.alert('Error', 'Failed to approve some tasks');
        }
    };

    // Batch delete
    const handleBatchDelete = async () => {
        if (selectedTasks.length === 0) return;

        Alert.alert(
            'Delete Tasks',
            `Are you sure you want to delete ${selectedTasks.length} task(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await Promise.all(selectedTasks.map((id) => api.deleteTask(id)));
                            await refresh();
                            clearSelection();
                            Alert.alert('Deleted', 'Tasks removed successfully');
                        } catch (error) {
                            console.error('Batch delete error:', error);
                            Alert.alert('Error', 'Failed to delete some tasks');
                        }
                    },
                },
            ]
        );
    };

    // Quick approve single task
    const handleQuickApprove = async (taskId: string) => {
        const task = tasks.find((t) => t._id === taskId);
        if (!task) return;

        await execute({
            optimisticUpdate: () => {
                // Update will be handled by refresh
            },
            rollback: () => {
                // Rollback handled by refresh
            },
            apiCall: () => api.approveTask(taskId),
            onSuccess: () => refresh(),
        });
    };

    // Delete single task
    const handleDeleteTask = (taskId: string) => {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteTask(taskId);
                        await refresh();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete task');
                    }
                },
            },
        ]);
    };

    // Open edit modal
    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    // Close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingTask(null);
    };

    // Render task item
    const renderTask = ({ item: task }: { item: Task }) => {
        const isSelected = selectedTasks.includes(task._id || '');
        const assignedMember = members.find((m) => task.assignedTo.includes(m.id || m._id || ''));

        return (
            <View
                style={[
                    styles.taskRow,
                    { borderBottomColor: theme.colors.borderSubtle },
                    isSelected && { backgroundColor: theme.colors.actionPrimary + '10' },
                ]}
            >
                {/* Checkbox */}
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        { borderColor: theme.colors.borderSubtle },
                        isSelected && {
                            backgroundColor: theme.colors.actionPrimary,
                            borderColor: theme.colors.actionPrimary,
                        },
                    ]}
                    onPress={() => toggleTaskSelection(task._id || '')}
                >
                    {isSelected && <CheckCircle size={16} color="#FFF" />}
                </TouchableOpacity>

                {/* Task info */}
                <TouchableOpacity style={styles.taskContent} onPress={() => handleEditTask(task)}>
                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                        {task.title}
                    </Text>
                    <Text style={[styles.taskMeta, { color: theme.colors.textSecondary }]}>
                        {assignedMember?.firstName || 'Unassigned'} • {task.pointsValue} pts
                    </Text>
                </TouchableOpacity>

                {/* Status badge */}
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                task.status === 'Completed'
                                    ? '#10B981'
                                    : task.status === 'PendingApproval'
                                        ? '#F59E0B'
                                        : theme.colors.actionPrimary,
                        },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {task.status === 'PendingApproval' ? 'Review' : task.status}
                    </Text>
                </View>

                {/* Quick actions */}
                <View style={styles.quickActions}>
                    {task.status === 'PendingApproval' && (
                        <TouchableOpacity
                            style={[styles.quickButton, { backgroundColor: '#10B981' }]}
                            onPress={() => handleQuickApprove(task._id || '')}
                        >
                            <CheckCircle size={16} color="#FFF" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.quickButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={() => handleEditTask(task)}
                    >
                        <Edit2 size={16} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleDeleteTask(task._id || '')}
                    >
                        <Trash2 size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <>
            <BaseModal
                visible={visible}
                onClose={onClose}
                title="Task Manager"
                headerRight={
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={() => {
                            setEditingTask(null);
                            setShowEditModal(true);
                        }}
                    >
                        <Plus size={18} color="#FFF" />
                        <Text style={styles.addButtonText}>New</Text>
                    </TouchableOpacity>
                }
                scrollable={false}
            >
                <View style={styles.container}>
                    {/* Search bar */}
                    <View style={[styles.searchBox, { backgroundColor: theme.colors.bgCanvas }]}>
                        <Search size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                            placeholder="Search tasks..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter chips */}
                    <View style={styles.filterRow}>
                        {FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.chip,
                                    { borderColor: theme.colors.borderSubtle },
                                    activeFilter === filter.id && {
                                        backgroundColor: theme.colors.actionPrimary,
                                        borderColor: theme.colors.actionPrimary,
                                    },
                                ]}
                                onPress={() => setActiveFilter(filter.id)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        {
                                            color:
                                                activeFilter === filter.id ? '#FFF' : theme.colors.textPrimary,
                                        },
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Batch actions bar */}
                    {selectedTasks.length > 0 && (
                        <View style={[styles.batchBar, { backgroundColor: theme.colors.actionPrimary }]}>
                            <Text style={styles.batchText}>{selectedTasks.length} selected</Text>
                            <View style={styles.batchActions}>
                                <TouchableOpacity
                                    style={[styles.batchButton, { backgroundColor: '#10B981' }]}
                                    onPress={handleBatchApprove}
                                >
                                    <CheckCircle size={16} color="#FFF" />
                                    <Text style={styles.batchButtonText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.batchButton, { backgroundColor: '#EF4444' }]}
                                    onPress={handleBatchDelete}
                                >
                                    <Trash2 size={16} color="#FFF" />
                                    <Text style={styles.batchButtonText}>Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.batchButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                                    onPress={clearSelection}
                                >
                                    <X size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Task list */}
                    <FlatList
                        data={filteredTasks}
                        renderItem={renderTask}
                        keyExtractor={(item) => item._id || ''}
                        contentContainerStyle={styles.listContent}
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Filter size={48} color={theme.colors.borderSubtle} />
                                <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                                    {searchQuery ? 'No tasks match your search' : 'No tasks found'}
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                    {searchQuery
                                        ? 'Try adjusting your search or filters'
                                        : 'Create a new task to get started'}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </BaseModal>

            {/* Edit/Create Task Modal */}
            <EditTaskModal
                visible={showEditModal}
                onClose={handleCloseEditModal}
                task={editingTask}
                onSaved={() => {
                    refresh();
                    handleCloseEditModal();
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    batchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    batchText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    batchActions: {
        flexDirection: 'row',
        gap: 8,
    },
    batchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    batchButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        flexGrow: 1,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskMeta: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 6,
    },
    quickButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
