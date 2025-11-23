import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { Task } from '../../types';

export default function ApprovalsTab() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = themes.calmLight;

    const loadData = async () => {
        try {
            const tasksResponse = await api.getTasks();

            if (tasksResponse.data && tasksResponse.data.tasks) {
                // Filter for tasks that are pending approval
                const pendingApproval = tasksResponse.data.tasks.filter(
                    (task: Task) => task.status === 'PendingApproval'
                );
                setTasks(pendingApproval);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error loading approvals:', error);
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

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleApprove = async (taskId: string) => {
        try {
            await api.approveTask(taskId);
            loadData();
        } catch (error) {
            console.error('Error approving task:', error);
            Alert.alert('Error', 'Failed to approve task');
        }
    };

    const handleReject = async (taskId: string) => {
        Alert.alert(
            'Reject Task',
            'Are you sure you want to reject this task? The child will need to complete it again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Reset task to Pending status
                            await api.updateTask(taskId, { status: 'Pending', completedBy: null });
                            loadData();
                        } catch (error) {
                            console.error('Error rejecting task:', error);
                            Alert.alert('Error', 'Failed to reject task');
                        }
                    }
                }
            ]
        );
    };

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
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Approvals</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Review completed tasks
                </Text>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.taskInfo}>
                                <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                                    {item.title}
                                </Text>
                                {item.description && (
                                    <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                                <View style={styles.metaRow}>
                                    <View style={styles.pointsBadge}>
                                        <Text style={[styles.pointsText, { color: theme.colors.actionPrimary }]}>
                                            +{item.value} pts
                                        </Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Clock size={14} color="#F59E0B" />
                                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                                            Pending Approval
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.rejectButton, { borderColor: theme.colors.signalAlert }]}
                                onPress={() => handleReject(item._id || item.id)}
                            >
                                <XCircle size={20} color={theme.colors.signalAlert} />
                                <Text style={[styles.buttonText, { color: theme.colors.signalAlert }]}>
                                    Reject
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.approveButton, { backgroundColor: theme.colors.signalSuccess }]}
                                onPress={() => handleApprove(item._id || item.id)}
                            >
                                <CheckCircle size={20} color="#FFFFFF" />
                                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                    Approve
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <CheckCircle size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No tasks waiting for approval
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Tasks will appear here when children mark them complete
                        </Text>
                    </View>
                }
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
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: 16,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    pointsBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    rejectButton: {
        borderWidth: 1,
    },
    approveButton: {
        // backgroundColor set inline
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
