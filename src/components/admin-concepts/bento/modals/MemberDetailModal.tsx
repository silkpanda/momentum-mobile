// =========================================================
// MemberDetailModal - Member Profile with Focus Mode Management
// =========================================================
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Target, CheckCircle, DollarSign, Zap, TrendingUp } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { api } from '../../../../services/api';
import { Member, Task } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';

interface MemberDetailModalProps {
    visible: boolean;
    onClose: () => void;
    member: Member | null;
}

export default function MemberDetailModal({ visible, onClose, member }: MemberDetailModalProps) {
    const { currentTheme: theme } = useTheme();
    const { tasks, members, updateMember } = useData();
    const { householdId } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!member) return null;

    // Get latest member data from context to ensure updates are reflected immediately
    const currentMember = members.find(m => (m.id === member.id) || (m._id && member._id && m._id === member._id)) || member;

    // Get member's tasks
    const memberTasks = tasks.filter((t) =>
        t.assignedTo.includes(currentMember.id || currentMember._id || '')
    );
    const activeTasks = memberTasks.filter((t) => t.status === 'Pending');
    const completedTasks = memberTasks.filter((t) => t.status === 'Completed');
    const focusTask = currentMember.focusedTaskId
        ? tasks.find((t) => t._id === currentMember.focusedTaskId)
        : null;

    // Handle set focus
    const handleSetFocus = async (taskId: string) => {
        if (!householdId || !currentMember.id && !currentMember._id) {
            Alert.alert('Error', 'Missing required data');
            return;
        }

        const memberId = currentMember.id || currentMember._id || '';
        const previousFocus = currentMember.focusedTaskId;

        // Optimistic Update
        updateMember(memberId, { focusedTaskId: taskId });

        setIsProcessing(true);
        try {
            await api.setFocusTask(householdId, memberId, taskId);
            Alert.alert('Focus Set', 'Focus task has been set!');
        } catch (error) {
            console.error('Set focus error:', error);
            // Revert on error
            updateMember(memberId, { focusedTaskId: previousFocus });
            Alert.alert('Error', 'Failed to set focus task');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle clear focus
    const handleClearFocus = async () => {
        if (!householdId || !currentMember.id && !currentMember._id) {
            Alert.alert('Error', 'Missing required data');
            return;
        }

        const memberId = currentMember.id || currentMember._id || '';
        const previousFocus = currentMember.focusedTaskId;

        // Optimistic Update
        updateMember(memberId, { focusedTaskId: undefined });

        setIsProcessing(true);
        try {
            await api.setFocusTask(householdId, memberId, null);
            Alert.alert('Focus Cleared', 'Focus mode has been cleared');
        } catch (error) {
            console.error('Clear focus error:', error);
            // Revert on error
            updateMember(memberId, { focusedTaskId: previousFocus });
            Alert.alert('Error', 'Failed to clear focus');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <BaseModal visible={visible} onClose={onClose} title={`${currentMember.firstName}'s Profile`}>
            <View style={styles.container}>
                {/* Member Header */}
                <View style={styles.header}>
                    <View
                        style={[
                            styles.avatar,
                            { backgroundColor: currentMember.profileColor || theme.colors.actionPrimary },
                        ]}
                    >
                        <Text style={styles.avatarText}>{currentMember.firstName.charAt(0)}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                            {currentMember.firstName} {currentMember.lastName}
                        </Text>
                        <Text style={[styles.memberRole, { color: theme.colors.textSecondary }]}>
                            {currentMember.role}
                        </Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <DollarSign size={24} color={theme.colors.actionPrimary} />
                        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                            {currentMember.pointsTotal || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Total Points
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <CheckCircle size={24} color="#10B981" />
                        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                            {activeTasks.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Active Tasks
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <TrendingUp size={24} color="#3B82F6" />
                        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                            {currentMember.currentStreak || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Day Streak
                        </Text>
                    </View>
                </View>

                {/* Focus Mode Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Zap size={20} color={theme.colors.actionPrimary} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                            Focus Mode
                        </Text>
                    </View>

                    {focusTask ? (
                        <View
                            style={[
                                styles.focusCard,
                                { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
                            ]}
                        >
                            <View style={styles.focusCardHeader}>
                                <Target size={20} color="#F59E0B" />
                                <Text style={[styles.focusTaskTitle, { color: '#92400E' }]}>
                                    {focusTask.title}
                                </Text>
                            </View>
                            {focusTask.description && (
                                <Text style={[styles.focusTaskDescription, { color: '#78350F' }]}>
                                    {focusTask.description}
                                </Text>
                            )}
                            <TouchableOpacity
                                style={[styles.clearFocusButton, { backgroundColor: '#F59E0B' }]}
                                onPress={handleClearFocus}
                                disabled={isProcessing}
                            >
                                <Text style={styles.clearFocusButtonText}>Clear Focus</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.noFocusCard, { backgroundColor: theme.colors.bgSurface }]}>
                            <Text style={[styles.noFocusText, { color: theme.colors.textSecondary }]}>
                                No focus task set
                            </Text>
                            <Text style={[styles.noFocusSubtext, { color: theme.colors.textSecondary }]}>
                                Select a task below to set as focus
                            </Text>
                        </View>
                    )}
                </View>

                {/* Active Tasks Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        Active Tasks ({activeTasks.length})
                    </Text>

                    {activeTasks.length > 0 ? (
                        activeTasks.map((task) => (
                            <TouchableOpacity
                                key={task._id}
                                style={[
                                    styles.taskCard,
                                    { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle },
                                ]}
                                onPress={() => handleSetFocus(task._id || '')}
                                disabled={isProcessing || task._id === currentMember.focusedTaskId}
                            >
                                <View style={styles.taskCardContent}>
                                    <Text style={[styles.taskCardTitle, { color: theme.colors.textPrimary }]}>
                                        {task.title}
                                    </Text>
                                    <Text style={[styles.taskCardPoints, { color: theme.colors.actionPrimary }]}>
                                        {task.pointsValue} pts
                                    </Text>
                                </View>
                                {task._id === currentMember.focusedTaskId && (
                                    <View style={[styles.focusedBadge, { backgroundColor: '#F59E0B' }]}>
                                        <Zap size={12} color="#FFF" />
                                        <Text style={styles.focusedBadgeText}>Focused</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No active tasks
                        </Text>
                    )}
                </View>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
    },
    headerInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    focusCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 12,
    },
    focusCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    focusTaskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    focusTaskDescription: {
        fontSize: 14,
    },
    clearFocusButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearFocusButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    noFocusCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        gap: 4,
    },
    noFocusText: {
        fontSize: 15,
        fontWeight: '600',
    },
    noFocusSubtext: {
        fontSize: 13,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    taskCardContent: {
        flex: 1,
        gap: 4,
    },
    taskCardTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    taskCardPoints: {
        fontSize: 13,
        fontWeight: '600',
    },
    focusedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    focusedBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});
