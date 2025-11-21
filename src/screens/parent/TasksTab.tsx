import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import TaskCard from '../../components/shared/TaskCard';
import { Plus } from 'lucide-react-native';
import CreateTaskModal from '../../components/parent/CreateTaskModal';

type FilterType = 'ALL' | 'Pending' | 'Approved';

import { useSocket } from '../../contexts/SocketContext';

export default function TasksScreen() {
    const { user } = useAuth();
    const { on, off } = useSocket();
    const [tasks, setTasks] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [filter, setFilter] = useState<FilterType>('Pending');
    const theme = themes.calmLight;

    const loadData = async () => {
        try {
            const [tasksResponse, dashboardResponse] = await Promise.all([
                api.getTasks(),
                api.getDashboardData()
            ]);

            if (tasksResponse.data && tasksResponse.data.tasks) {
                setTasks(tasksResponse.data.tasks);
            } else {
                setTasks([]);
            }

            if ((dashboardResponse as any).household && (dashboardResponse as any).household.members) {
                setMembers((dashboardResponse as any).household.members);
            }
        } catch (error) {
            console.error('Error loading tasks data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Real-time updates
    React.useEffect(() => {
        const handleUpdate = () => {
            console.log('🔄 Received real-time update, refreshing tasks...');
            loadData();
        };

        on('task_updated', handleUpdate);

        return () => {
            off('task_updated', handleUpdate);
        };
    }, [on, off]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleCompleteTask = async (taskId: string) => {
        if (!user?._id) return;
        try {
            await api.completeTask(taskId, user._id);
            loadData();
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'ALL') return true;
        if (filter === 'Pending') {
            // Show both Pending and PendingApproval as "To Do"
            return task.status === 'Pending' || task.status === 'PendingApproval';
        }
        return task.status === filter;
    });

    const renderFilterButton = (type: FilterType, label: string) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === type && { backgroundColor: theme.colors.actionPrimary },
                filter !== type && { backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderSubtle }
            ]}
            onPress={() => setFilter(type)}
        >
            <Text style={[
                styles.filterText,
                filter === type ? { color: '#FFFFFF' } : { color: theme.colors.textSecondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading && !tasks.length) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Tasks</Text>
            </View>

            <View style={styles.filterContainer}>
                {renderFilterButton('Pending', 'To Do')}
                {renderFilterButton('Approved', 'Completed')}
                {renderFilterButton('ALL', 'All')}
            </View>

            <FlatList
                data={filteredTasks}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onComplete={() => handleCompleteTask(item._id || item.id)}
                    />
                )}
                keyExtractor={(item) => item._id || item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.textSecondary }}>No tasks found</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}
                onPress={() => setIsCreateModalVisible(true)}
            >
                <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <CreateTaskModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onTaskCreated={() => {
                    loadData();
                    setIsCreateModalVisible(false);
                }}
                members={members}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
