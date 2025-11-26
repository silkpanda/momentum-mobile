import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useData } from '../../contexts/DataContext';
import { Task } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonList } from '../../components/SkeletonLoader';
import { CheckCircle, Clock, Target, Plus } from 'lucide-react-native';
import TaskIcon from '../../components/TaskIcon';
import CreateTaskModal from '../../components/parent/CreateTaskModal';

type TaskFilter = 'all' | 'pending' | 'completed' | 'approved';

export default function TasksTab() {
    const { currentTheme: theme } = useTheme();

    // Get data from global cache
    const { tasks, members, isInitialLoad, isRefreshing, refresh } = useData();

    const [filter, setFilter] = useState<TaskFilter>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Filter tasks based on selected filter
    const filteredTasks = useMemo(() => {
        switch (filter) {
            case 'pending':
                return tasks.filter(t => t.status === 'Pending');
            case 'completed':
                return tasks.filter(t => t.status === 'PendingApproval');
            case 'approved':
                return tasks.filter(t => t.status === 'Approved');
            default:
                return tasks;
        }
    }, [tasks, filter]);

    const handleTaskPress = (task: Task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    const handleCreateNew = () => {
        setSelectedTask(null);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedTask(null);
    };

    const renderTaskItem = ({ item }: { item: Task }) => {
        const assignedMember = item.assignedTo && item.assignedTo.length > 0
            ? members.find(m =>
                (m.id && item.assignedTo.includes(m.id)) ||
                (m._id && item.assignedTo.includes(m._id))
            )
            : null;

        return (
            <TouchableOpacity
                style={[styles.taskCard, { backgroundColor: theme.colors.bgSurface }]}
                onPress={() => handleTaskPress(item)}
            >
                {item.icon && (
                    <TaskIcon iconName={item.icon} size={32} showBackground />
                )}
                <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                        {item.title}
                    </Text>
                    {item.description && (
                        <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    <View style={styles.taskMeta}>
                        <Text style={[styles.taskPoints, { color: theme.colors.actionPrimary }]}>
                            {item.pointsValue || item.value || 0} pts
                        </Text>
                        {assignedMember && (
                            <Text style={[styles.taskAssigned, { color: theme.colors.textSecondary }]}>
                                → {assignedMember.firstName}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + '20' }
                ]}>
                    {getStatusIcon(item.status, getStatusColor(item.status))}
                </View>
            </TouchableOpacity>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return '#10B981';
            case 'PendingApproval': return '#F59E0B';
            case 'Pending': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status: string, color: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={20} color={color} />;
            case 'PendingApproval': return <Clock size={20} color={color} />;
            case 'Pending': return <Target size={20} color={color} />;
            default: return <Target size={20} color={color} />;
        }
    };

    if (isInitialLoad) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                <SkeletonList count={5} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Target size={24} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Tasks
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={handleCreateNew}
                >
                    <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['all', 'pending', 'completed', 'approved'] as TaskFilter[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterTab,
                            filter === f && { backgroundColor: theme.colors.actionPrimary }
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filter === f ? '#FFFFFF' : theme.colors.textSecondary }
                        ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tasks List */}
            <FlatList
                data={filteredTasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id || item._id || ''}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor={theme.colors.actionPrimary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Target size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No tasks found
                        </Text>
                    </View>
                }
            />

            {/* Combined Create/Edit Modal */}
            <CreateTaskModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onTaskCreated={refresh}
                members={members}
                initialTask={selectedTask}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 8,
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    taskCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        gap: 12,
    },
    taskInfo: {
        flex: 1,
        gap: 4,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    taskDescription: {
        fontSize: 14,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    taskPoints: {
        fontSize: 14,
        fontWeight: '600',
    },
    taskAssigned: {
        fontSize: 13,
    },
    statusBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
    },
});
