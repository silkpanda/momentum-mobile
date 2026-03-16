// =========================================================
// ApprovalsModal - Swipeable Card Stack for Task/Quest Approvals
// =========================================================
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Animated,
    PanResponder,
} from 'react-native';
import { CheckCircle, X, Users, DollarSign } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { api } from '../../../../services/api';
import { Task } from '../../../../types';

interface ApprovalsModalProps {
    visible: boolean;
    onClose: () => void;
}

type TabType = 'tasks' | 'quests';

export default function ApprovalsModal({ visible, onClose }: ApprovalsModalProps) {
    const { currentTheme: theme } = useTheme();
    const { tasks, quests, members, refresh } = useData();
    const [activeTab, setActiveTab] = useState<TabType>('tasks');
    const [isProcessing, setIsProcessing] = useState(false);

    // Get pending items
    const pendingTasks = tasks.filter((t) => t.status === 'PendingApproval');
    const pendingQuests = quests.filter((q) =>
        q.claims?.some((c) => c.status === 'completed')
    );

    const currentItems = activeTab === 'tasks' ? pendingTasks : [];
    const hasItems = currentItems.length > 0;

    // Handle approve
    const handleApprove = async (taskId: string) => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            await api.approveTask(taskId);
            await refresh();

            // Show success feedback
            if (currentItems.length === 1) {
                Alert.alert('All Done! 🎉', 'No more approvals pending!');
            }
        } catch (error) {
            console.error('Approve error:', error);
            Alert.alert('Error', 'Failed to approve task');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle reject (delete)
    const handleReject = async (taskId: string) => {
        if (isProcessing) return;

        Alert.alert(
            'Reject Task',
            'Are you sure? This will delete the task.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            await api.deleteTask(taskId);
                            await refresh();
                        } catch (error) {
                            console.error('Reject error:', error);
                            Alert.alert('Error', 'Failed to reject task');
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    // Render approval card
    const renderApprovalCard = (task: Task, index: number) => {
        const assignedMember = members.find((m) =>
            task.assignedTo.includes(m.id || m._id || '')
        );

        return (
            <View
                key={task._id}
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.bgSurface,
                        borderColor: theme.colors.borderSubtle,
                    },
                    index > 0 && styles.stackedCard,
                ]}
            >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.memberInfo}>
                        <View
                            style={[
                                styles.memberAvatar,
                                { backgroundColor: theme.colors.actionPrimary + '20' },
                            ]}
                        >
                            <Text style={[styles.memberInitial, { color: theme.colors.actionPrimary }]}>
                                {assignedMember?.firstName.charAt(0) || '?'}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                                {assignedMember?.firstName || 'Unknown'}
                            </Text>
                            <Text style={[styles.memberSubtext, { color: theme.colors.textSecondary }]}>
                                Completed a task
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Task Details */}
                <View style={styles.cardBody}>
                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                        {task.title}
                    </Text>
                    {task.description && (
                        <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                            {task.description}
                        </Text>
                    )}

                    {/* Points Badge */}
                    <View style={styles.pointsBadge}>
                        <DollarSign size={16} color={theme.colors.actionPrimary} />
                        <Text style={[styles.pointsText, { color: theme.colors.actionPrimary }]}>
                            {task.pointsValue} points
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.rejectButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleReject(task._id || '')}
                        disabled={isProcessing}
                    >
                        <X size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.approveButton, { backgroundColor: '#10B981' }]}
                        onPress={() => handleApprove(task._id || '')}
                        disabled={isProcessing}
                    >
                        <CheckCircle size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title="Approvals"
            headerRight={
                <View style={styles.tabSelector}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            { borderColor: theme.colors.borderSubtle },
                            activeTab === 'tasks' && {
                                backgroundColor: theme.colors.actionPrimary,
                                borderColor: theme.colors.actionPrimary,
                            },
                        ]}
                        onPress={() => setActiveTab('tasks')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === 'tasks' ? '#FFF' : theme.colors.textPrimary },
                            ]}
                        >
                            Tasks ({pendingTasks.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            { borderColor: theme.colors.borderSubtle },
                            activeTab === 'quests' && {
                                backgroundColor: theme.colors.actionPrimary,
                                borderColor: theme.colors.actionPrimary,
                            },
                        ]}
                        onPress={() => setActiveTab('quests')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === 'quests' ? '#FFF' : theme.colors.textPrimary },
                            ]}
                        >
                            Quests ({pendingQuests.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            }
            scrollable={false}
        >
            <View style={styles.container}>
                {hasItems ? (
                    <View style={styles.cardStack}>
                        {currentItems.slice(0, 3).map((task, index) => renderApprovalCard(task, index))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <CheckCircle size={64} color={theme.colors.actionPrimary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                            All Caught Up! 🎉
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            {activeTab === 'tasks'
                                ? 'No tasks waiting for approval'
                                : 'No quests waiting for approval'}
                        </Text>
                    </View>
                )}
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    tabSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardStack: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    stackedCard: {
        position: 'absolute',
        opacity: 0.5,
        transform: [{ scale: 0.95 }],
    },
    cardHeader: {
        marginBottom: 20,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberInitial: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    memberSubtext: {
        fontSize: 13,
        marginTop: 2,
    },
    cardBody: {
        marginBottom: 24,
        gap: 12,
    },
    taskTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    taskDescription: {
        fontSize: 15,
        lineHeight: 22,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    pointsText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
    },
    approveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    emptySubtext: {
        fontSize: 15,
        textAlign: 'center',
    },
});
