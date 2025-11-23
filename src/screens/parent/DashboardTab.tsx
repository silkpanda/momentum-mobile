import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Clock, Users, Target, Bell, Map as MapIcon } from 'lucide-react-native';
import MemberAvatar from '../../components/family/MemberAvatar';
import { Task, Quest, Member, QuestClaim } from '../../types';

import { useSocket } from '../../contexts/SocketContext';

export default function DashboardTab() {
    const { user } = useAuth();
    const { currentTheme: theme } = useTheme();
    const { on, off } = useSocket();
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [pendingQuests, setPendingQuests] = useState<Quest[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [tasksResponse, questsResponse, dashboardResponse] = await Promise.all([
                api.getTasks(),
                api.getQuests(),
                api.getDashboardData()
            ]);

            // Get pending approval tasks
            if (tasksResponse.data && tasksResponse.data.tasks) {
                const pendingApproval = tasksResponse.data.tasks.filter(
                    (task: Task) => task.status === 'PendingApproval'
                );
                setPendingTasks(pendingApproval);
            } else {
                setPendingTasks([]);
            }

            // Get pending approval quests
            if (questsResponse.data && questsResponse.data.quests) {
                const pendingApproval = questsResponse.data.quests.filter((quest: Quest) => {
                    // Check if any claim is in 'completed' status (waiting for approval)
                    return quest.claims && quest.claims.some((claim: QuestClaim) => claim.status === 'completed');
                });
                setPendingQuests(pendingApproval);
            } else {
                setPendingQuests([]);
            }

            // Get family members
            if (dashboardResponse.data && dashboardResponse.data.household && dashboardResponse.data.household.members) {
                setMembers(dashboardResponse.data.household.members);
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

    const handleApproveQuest = async (questId: string, memberId: string) => {
        try {
            await api.approveQuest(questId, memberId);
            loadData();
        } catch (error) {
            console.error('Error approving quest:', error);
            Alert.alert('Error', 'Failed to approve quest');
        }
    };

    const handleRejectQuest = async (questId: string, memberId: string) => {
        Alert.alert(
            'Reject Quest',
            'The member will need to complete it again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Reset the claim status back to 'claimed'
                            const quest = pendingQuests.find(q => (q._id || q.id) === questId);
                            if (quest) {
                                const claim = quest.claims.find((c: QuestClaim) => c.memberId === memberId);
                                if (claim) {
                                    claim.status = 'claimed';
                                    claim.completedAt = undefined;
                                    await api.updateQuest(questId, { claims: quest.claims });
                                    loadData();
                                }
                            }
                        } catch (error) {
                            console.error('Error rejecting quest:', error);
                            Alert.alert('Error', 'Failed to reject quest');
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
                    {(pendingTasks.length + pendingQuests.length) > 0 && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.signalAlert }]}>
                            <Text style={styles.badgeText}>{pendingTasks.length + pendingQuests.length}</Text>
                        </View>
                    )}
                </View>

                {(pendingTasks.length === 0 && pendingQuests.length === 0) ? (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <CheckCircle size={32} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            All caught up! No tasks or quests waiting for approval.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Pending Tasks */}
                        {pendingTasks.map((task) => (
                            <View key={task._id || task.id} style={[styles.approvalCard, { backgroundColor: theme.colors.bgSurface }]}>
                                <View style={styles.approvalInfo}>
                                    <View style={styles.typeRow}>
                                        <Target size={14} color={theme.colors.textSecondary} />
                                        <Text style={[styles.typeLabel, { color: theme.colors.textSecondary }]}>TASK</Text>
                                    </View>
                                    <Text style={[styles.approvalTitle, { color: theme.colors.textPrimary }]}>
                                        {task.title}
                                    </Text>
                                    <View style={styles.approvalMeta}>
                                        <Text style={[styles.approvalPoints, { color: theme.colors.actionPrimary }]}>
                                            +{task.value} pts
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
                        ))}

                        {/* Pending Quests */}
                        {pendingQuests.map((quest) => {
                            const completedClaim = quest.claims.find((c: QuestClaim) => c.status === 'completed');
                            if (!completedClaim) return null;

                            const memberName = members.find(m => m.id === completedClaim.memberId)?.firstName || 'Member';

                            return (
                                <View key={quest._id || quest.id} style={[styles.approvalCard, { backgroundColor: theme.colors.bgSurface }]}>
                                    <View style={styles.approvalInfo}>
                                        <View style={styles.typeRow}>
                                            <MapIcon size={14} color={theme.colors.actionPrimary} />
                                            <Text style={[styles.typeLabel, { color: theme.colors.actionPrimary }]}>QUEST</Text>
                                        </View>
                                        <Text style={[styles.approvalTitle, { color: theme.colors.textPrimary }]}>
                                            {quest.title}
                                        </Text>
                                        <Text style={[styles.approvalMemberName, { color: theme.colors.textSecondary }]}>
                                            by {memberName}
                                        </Text>
                                        <View style={styles.approvalMeta}>
                                            <Text style={[styles.approvalPoints, { color: theme.colors.actionPrimary }]}>
                                                +{quest.pointsValue} pts
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
                                            onPress={() => handleRejectQuest(quest._id || quest.id, completedClaim.memberId)}
                                        >
                                            <XCircle size={20} color={theme.colors.signalAlert} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iconButton, { backgroundColor: theme.colors.signalSuccess + '20' }]}
                                            onPress={() => handleApproveQuest(quest._id || quest.id, completedClaim.memberId)}
                                        >
                                            <CheckCircle size={20} color={theme.colors.signalSuccess} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </>
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
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    typeLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    approvalMemberName: {
        fontSize: 12,
        marginBottom: 4,
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
