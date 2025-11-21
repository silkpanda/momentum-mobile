import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import { CheckCircle, XCircle, Clock, Users, Target, Bell } from 'lucide-react-native';
import MemberAvatar from '../../components/family/MemberAvatar';

import { useSocket } from '../../contexts/SocketContext';

export default function DashboardTab() {
    const { user } = useAuth();
    const { on, off } = useSocket();
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = themes.calmLight;

    const loadData = async () => {
        try {
            const [tasksResponse, dashboardResponse] = await Promise.all([
                api.getTasks(),
                api.getDashboardData()
            ]);

            // Get pending approval tasks
            if (tasksResponse.data && tasksResponse.data.tasks) {
                const pendingApproval = tasksResponse.data.tasks.filter(
                    (task: any) => task.status === 'PendingApproval'
                );
                setPendingTasks(pendingApproval);
            } else {
                setPendingTasks([]);
            }

            // Get family members
            if ((dashboardResponse as any).household && (dashboardResponse as any).household.members) {
                setMembers((dashboardResponse as any).household.members);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
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
            console.log('🔄 Received real-time update, refreshing dashboard...');
            loadData();
        };

        on('task_updated', handleUpdate);
        on('member_points_updated', handleUpdate);
        on('quest_updated', handleUpdate);

        return () => {
            off('task_updated', handleUpdate);
            off('member_points_updated', handleUpdate);
            off('quest_updated', handleUpdate);
        };
    }, [on, off]);

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
            'The child will need to complete it again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
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

    const toggleFocusMode = (memberId: string) => {
        Alert.alert('Focus Mode', `Focus Mode toggle for member ${memberId} - Coming soon!`);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Dashboard</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Quick actions & overview
                </Text>
            </View>

            {/* Pending Approvals Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Bell size={20} color={theme.colors.actionPrimary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        Pending Approvals
                    </Text>
                    {pendingTasks.length > 0 && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.signalAlert }]}>
                            <Text style={styles.badgeText}>{pendingTasks.length}</Text>
                        </View>
                    )}
                </View>

                {pendingTasks.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <CheckCircle size={32} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            All caught up! No tasks waiting for approval.
                        </Text>
                    </View>
                ) : (
                    pendingTasks.map((task) => (
                        <View key={task._id || task.id} style={[styles.approvalCard, { backgroundColor: theme.colors.bgSurface }]}>
                            <View style={styles.approvalInfo}>
                                <Text style={[styles.approvalTitle, { color: theme.colors.textPrimary }]}>
                                    {task.title}
                                </Text>
                                <View style={styles.approvalMeta}>
                                    <Text style={[styles.approvalPoints, { color: theme.colors.actionPrimary }]}>
                                        +{task.pointsValue} pts
                                    </Text>
                                    <View style={styles.statusBadge}>
                                        <Clock size={12} color="#F59E0B" />
                                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>Pending</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.approvalActions}>
                                <TouchableOpacity
                                    style={[styles.iconButton, { backgroundColor: theme.colors.signalAlert + '20' }]}
                                    onPress={() => handleReject(task._id || task.id)}
                                >
                                    <XCircle size={20} color={theme.colors.signalAlert} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.iconButton, { backgroundColor: theme.colors.signalSuccess + '20' }]}
                                    onPress={() => handleApprove(task._id || task.id)}
                                >
                                    <CheckCircle size={20} color={theme.colors.signalSuccess} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Family Members Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Users size={20} color={theme.colors.actionPrimary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        Family Members
                    </Text>
                </View>

                {members.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <Users size={32} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No family members found
                        </Text>
                    </View>
                ) : (
                    <View style={styles.membersGrid}>
                        {members.map((member) => (
                            <View key={member.id} style={[styles.memberCard, { backgroundColor: theme.colors.bgSurface }]}>
                                <MemberAvatar name={member.firstName} color={member.profileColor} size={48} />
                                <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                                    {member.firstName}
                                </Text>
                                <Text style={[styles.memberPoints, { color: theme.colors.textSecondary }]}>
                                    {member.pointsTotal || 0} pts
                                </Text>
                                <TouchableOpacity
                                    style={[styles.focusButton, { borderColor: theme.colors.actionPrimary }]}
                                    onPress={() => toggleFocusMode(member.id)}
                                >
                                    <Target size={16} color={theme.colors.actionPrimary} />
                                    <Text style={[styles.focusButtonText, { color: theme.colors.actionPrimary }]}>
                                        Focus Mode
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
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
    section: {
        padding: 16,
        paddingTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyCard: {
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    approvalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    approvalInfo: {
        flex: 1,
    },
    approvalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    approvalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    approvalPoints: {
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
    approvalActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    memberCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    memberPoints: {
        fontSize: 14,
        marginTop: 2,
        marginBottom: 12,
    },
    focusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    focusButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
