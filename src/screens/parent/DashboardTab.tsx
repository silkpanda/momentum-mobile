import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';
import { CheckCircle, Bell, Target } from 'lucide-react-native';
import { Member, QuestClaim } from '../../types';
import { DashboardSkeleton } from '../../components/SkeletonLoader';
import TaskSelectionModal from '../../components/modals/TaskSelectionModal';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import PendingTaskCard from '../../components/dashboard/PendingTaskCard';
import PendingQuestCard from '../../components/dashboard/PendingQuestCard';
import FamilyMemberCard from '../../components/dashboard/FamilyMemberCard';
import { RootStackParamList } from '../../navigation/types';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList>;

export default function DashboardTab() {
    const { user } = useAuth();
    const { currentTheme: theme } = useTheme();
    const { execute: executeOptimistic } = useOptimisticUpdate();
    const navigation = useNavigation<DashboardNavigationProp>();

    // Get ALL data from global cache
    const {
        tasks: allTasks,
        quests: allQuests,
        members,
        householdId,
        isInitialLoad,
        isRefreshing,
        refresh,
        updateTask,
        updateQuest,
        updateMember,
    } = useData();

    // Focus Mode State
    const [taskSelectionVisible, setTaskSelectionVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // Compute derived data
    const pendingTasks = useMemo(() =>
        allTasks.filter(task => task.status === 'PendingApproval'),
        [allTasks]
    );

    const pendingQuests = useMemo(() =>
        allQuests.filter(quest =>
            quest.claims && quest.claims.some((claim: QuestClaim) => claim.status === 'completed')
        ),
        [allQuests]
    );

    // Focus Mode Handlers
    const handleSetFocusTask = async (taskId: string) => {
        if (!selectedMember || !householdId) return;

        const targetId = selectedMember.id || selectedMember._id;
        if (!targetId) {
            logger.error('Selected member has no ID');
            return;
        }

        setTaskSelectionVisible(false);
        const memberToUpdate = selectedMember;
        setSelectedMember(null);

        const previousMember = members.find(m => (m.id === targetId || m._id === targetId));

        await executeOptimistic({
            optimisticUpdate: () => {
                updateMember(targetId, { focusedTaskId: taskId });
            },
            rollback: () => {
                if (previousMember) {
                    updateMember(targetId, { focusedTaskId: previousMember.focusedTaskId });
                }
                Alert.alert('Error', 'Failed to set focus task. Please try again.');
            },
            apiCall: () => api.setFocusTask(householdId, targetId, taskId),
            successMessage: `Focus task set for ${memberToUpdate.firstName}`,
        });
    };

    const handleClearFocusTask = async (member: Member) => {
        if (!householdId) return;

        const targetId = member.id || member._id;
        if (!targetId) return;

        await executeOptimistic({
            optimisticUpdate: () => {
                updateMember(targetId, { focusedTaskId: undefined });
            },
            rollback: () => {
                updateMember(targetId, { focusedTaskId: member.focusedTaskId });
                Alert.alert('Error', 'Failed to clear focus mode. Please try again.');
            },
            apiCall: () => api.setFocusTask(householdId, targetId, null),
            successMessage: `Focus mode cleared for ${member.firstName}`,
        });
    };

    // Task Approval Handlers
    const handleApprove = async (taskId: string) => {
        const taskToUpdate = allTasks.find(t => (t._id || t.id) === taskId);

        await executeOptimistic({
            optimisticUpdate: () => {
                updateTask(taskId, { status: 'Approved' });
            },
            rollback: () => {
                if (taskToUpdate) {
                    updateTask(taskId, { status: taskToUpdate.status });
                }
                Alert.alert('Error', 'Failed to approve task. Please try again.');
            },
            apiCall: () => api.approveTask(taskId),
            successMessage: 'Task approved!',
        });
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
                        const taskToUpdate = allTasks.find(t => (t._id || t.id) === taskId);

                        await executeOptimistic({
                            optimisticUpdate: () => {
                                updateTask(taskId, { status: 'Pending', completedBy: null });
                            },
                            rollback: () => {
                                if (taskToUpdate) {
                                    updateTask(taskId, {
                                        status: taskToUpdate.status,
                                        completedBy: taskToUpdate.completedBy
                                    });
                                }
                                Alert.alert('Error', 'Failed to reject task. Please try again.');
                            },
                            apiCall: () => api.updateTask(taskId, { status: 'Pending', completedBy: null }),
                            successMessage: 'Task rejected',
                        });
                    }
                }
            ]
        );
    };

    // Quest Approval Handlers
    const handleApproveQuest = async (questId: string, memberId: string) => {
        const questToUpdate = allQuests.find(q => (q._id || q.id) === questId);

        await executeOptimistic({
            optimisticUpdate: () => {
                if (questToUpdate) {
                    const updatedClaims = questToUpdate.claims.map(c =>
                        c.memberId === memberId
                            ? { ...c, status: 'approved' as const }
                            : c
                    );
                    updateQuest(questId, { claims: updatedClaims });
                }
            },
            rollback: () => {
                if (questToUpdate) {
                    updateQuest(questId, { claims: questToUpdate.claims });
                }
                Alert.alert('Error', 'Failed to approve quest. Please try again.');
            },
            apiCall: () => api.approveQuest(questId, memberId),
            successMessage: 'Quest approved!',
        });
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
                        const quest = pendingQuests.find(q => (q._id || q.id) === questId);
                        if (!quest) return;

                        const claim = quest.claims.find((c: QuestClaim) => c.memberId === memberId);
                        if (!claim) return;

                        await executeOptimistic({
                            optimisticUpdate: () => {
                                const updatedClaims = quest.claims.map(c =>
                                    c.memberId === memberId
                                        ? { ...c, status: 'claimed' as const, completedAt: undefined }
                                        : c
                                );
                                updateQuest(questId, { claims: updatedClaims });
                            },
                            rollback: () => {
                                updateQuest(questId, { claims: quest.claims });
                                Alert.alert('Error', 'Failed to reject quest. Please try again.');
                            },
                            apiCall: async () => {
                                claim.status = 'claimed';
                                claim.completedAt = undefined;
                                return api.updateQuest(questId, { claims: quest.claims });
                            },
                            successMessage: 'Quest rejected',
                        });
                    }
                }
            ]
        );
    };

    if (isInitialLoad) {
        return <DashboardSkeleton />;
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
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
                        {pendingTasks.map((task) => {
                            const completedByMember = members.find(m => (m.id === task.completedBy || m._id === task.completedBy));
                            return (
                                <PendingTaskCard
                                    key={task._id || task.id}
                                    task={task}
                                    completedByMember={completedByMember}
                                    onApprove={() => handleApprove(task._id || task.id)}
                                    onReject={() => handleReject(task._id || task.id)}
                                />
                            );
                        })}

                        {/* Pending Quests */}
                        {pendingQuests.map((quest) => {
                            const completedClaim = quest.claims.find((c: QuestClaim) => c.status === 'completed');
                            if (!completedClaim) return null;

                            const memberName = members.find(m => m.id === completedClaim.memberId)?.firstName || 'Member';

                            return (
                                <PendingQuestCard
                                    key={quest._id || quest.id}
                                    quest={quest}
                                    memberName={memberName}
                                    memberId={completedClaim.memberId}
                                    onApprove={() => handleApproveQuest(quest._id || quest.id, completedClaim.memberId)}
                                    onReject={() => handleRejectQuest(quest._id || quest.id, completedClaim.memberId)}
                                />
                            );
                        })}
                    </>
                )}
            </View>

            {/* Family Members Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Target size={20} color={theme.colors.actionPrimary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        Family Members
                    </Text>
                </View>

                <View style={styles.membersGrid}>
                    {members.map((member) => {
                        const focusedTask = member.focusedTaskId
                            ? allTasks.find(t => (t.id === member.focusedTaskId || t._id === member.focusedTaskId))
                            : undefined;

                        return (
                            <FamilyMemberCard
                                key={member.id || member._id}
                                member={member}
                                focusedTask={focusedTask}
                                onPress={() => navigation.navigate('MemberDetail', {
                                    memberId: member.id || member._id || '',
                                    userId: member.userId,
                                    memberName: member.firstName,
                                    memberColor: member.profileColor,
                                    memberPoints: member.pointsTotal
                                })}
                                onSetFocus={() => {
                                    setSelectedMember(member);
                                    setTaskSelectionVisible(true);
                                }}
                                onClearFocus={() => handleClearFocusTask(member)}
                            />
                        );
                    })}
                </View>
            </View>

            {/* Task Selection Modal */}
            <TaskSelectionModal
                visible={taskSelectionVisible}
                onClose={() => setTaskSelectionVisible(false)}
                onSelect={handleSetFocusTask}
                tasks={allTasks.filter(t => t.status === 'Pending')}
                memberName={selectedMember?.firstName || ''}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
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
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyCard: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
});
