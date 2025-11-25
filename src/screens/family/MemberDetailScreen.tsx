// =========================================================
// momentum-mobile/src/screens/family/MemberDetailScreen.tsx
// Individual Member View - For children to check their tasks
// =========================================================
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, DeviceEventEmitter } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Star, Trophy, Settings, ShoppingBag, Map } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import TaskCard from '../../components/shared/TaskCard';
import QuestCard from '../../components/shared/QuestCard';
import MemberAvatar from '../../components/family/MemberAvatar';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../contexts/SocketContext';
import { Task, Quest, Member, QuestClaim } from '../../types';
import { MemberPointsUpdatedEvent, TaskUpdatedEvent, QuestUpdatedEvent } from '../../constants/socketEvents';
import FocusModeView from '../../components/focus/FocusModeView';
import { useData } from '../../contexts/DataContext';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import StreakBadge from '../../components/streaks/StreakBadge';
import MultiplierBadge from '../../components/streaks/MultiplierBadge';
import StreakProgress from '../../components/streaks/StreakProgress';

type MemberDetailRouteProp = RouteProp<RootStackParamList, 'MemberDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function MemberDetailScreen() {
    const route = useRoute<MemberDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { on, off } = useSocket();

    const { memberId, userId, memberName = 'Member', memberColor, memberPoints: initialPoints = 0 } = route.params || {};
    const { currentTheme: theme } = useTheme();

    const { tasks: allTasks, quests: allQuests, members, refresh, updateTask, updateQuest, isRefreshing } = useData();
    const { execute } = useOptimisticUpdate();

    // Derived State
    const memberData = useMemo(() =>
        members.find(m => m.id === memberId || m._id === memberId),
        [members, memberId]
    );

    const [memberPoints, setMemberPoints] = useState(initialPoints);

    // Update local points state when member data changes
    useEffect(() => {
        if (memberData) {
            setMemberPoints(memberData.pointsTotal || 0);
        }
    }, [memberData?.pointsTotal]);

    const memberTasks = useMemo(() =>
        allTasks.filter(t => {
            const isAssigned = t.assignedTo && Array.isArray(t.assignedTo) &&
                t.assignedTo.some((assigneeId: string) => assigneeId === memberId);
            const isPending = t.status === 'Pending' || t.status === 'PendingApproval';
            return isAssigned && isPending;
        }),
        [allTasks, memberId]
    );

    const availableQuests = useMemo(() =>
        allQuests.filter(q => {
            const hasClaim = q.claims && q.claims.some((c: QuestClaim) => c.memberId === memberId);
            return q.isActive && !hasClaim;
        }),
        [allQuests, memberId]
    );

    const activeQuests = useMemo(() =>
        allQuests.filter(q => {
            const myClaim = q.claims && q.claims.find((c: QuestClaim) => c.memberId === memberId);
            return myClaim && myClaim.status === 'claimed';
        }),
        [allQuests, memberId]
    );

    const focusedTask = useMemo(() => {
        if (memberData?.focusedTaskId) {
            return allTasks.find(t => (t._id || t.id) === memberData.focusedTaskId) || null;
        }
        return null;
    }, [memberData?.focusedTaskId, allTasks]);

    // Listen for direct updates from other screens (like Store)
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('update_member_points', (event) => {
            if (event.memberId === memberId) {
                console.log(`[MemberDetail] Received event update for points: ${event.points}`);
                setMemberPoints(event.points);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [memberId]);

    // Update state if params change (e.g. returning from Store with new points)
    useEffect(() => {
        if (route.params?.memberPoints !== undefined) {
            console.log(`[MemberDetail] Route params changed, updating points to: ${route.params.memberPoints}`);
            setMemberPoints(route.params.memberPoints);
        }
    }, [route.params?.memberPoints]);

    const onRefresh = () => {
        refresh();
    };

    const handleCompleteTask = async (taskId: string) => {
        await execute({
            optimisticUpdate: () => {
                updateTask(taskId, { status: 'PendingApproval' });
            },
            apiCall: () => api.completeTask(taskId, memberId),
            rollback: () => {
                updateTask(taskId, { status: 'Pending' });
            },
            successMessage: 'Task completed! 🎉'
        });
    };

    const handleClaimQuest = async (questId: string) => {
        const quest = allQuests.find(q => (q.id || q._id) === questId);
        if (!quest) return;

        const newClaim = {
            memberId,
            status: 'claimed',
            claimedAt: new Date().toISOString()
        };

        await execute({
            optimisticUpdate: () => {
                updateQuest(questId, {
                    claims: [...(quest.claims || []), newClaim]
                });
            },
            apiCall: () => api.claimQuest(questId, memberId),
            rollback: () => {
                updateQuest(questId, { claims: quest.claims });
            },
            successMessage: 'Quest claimed! 🗺️'
        });
    };

    const handleCompleteQuest = async (questId: string) => {
        const quest = allQuests.find(q => (q.id || q._id) === questId);
        if (!quest) return;

        await execute({
            optimisticUpdate: () => {
                const updatedClaims = quest.claims?.map(c =>
                    c.memberId === memberId ? { ...c, status: 'completed' } : c
                );
                updateQuest(questId, { claims: updatedClaims });
            },
            apiCall: () => api.completeQuest(questId, memberId),
            rollback: () => {
                updateQuest(questId, { claims: quest.claims });
            },
            successMessage: 'Quest completed! 🏆'
        });
    };

    // Focus Mode Check
    if (memberData?.focusedTaskId && focusedTask) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                <FocusModeView
                    task={focusedTask}
                    currentIndex={1} // Single task view
                    totalTasks={1}
                    onComplete={() => handleCompleteTask(focusedTask._id || focusedTask.id)}
                    onRequestHelp={() => {
                        Alert.alert(
                            'Request Help',
                            'A notification has been sent to your parent.',
                            [{ text: 'OK' }]
                        );
                    }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={[
                styles.header,
                {
                    backgroundColor: theme.colors.bgSurface,
                    borderBottomColor: theme.colors.borderSubtle,
                    paddingTop: insets.top + 16
                }
            ]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    {memberName}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Parent' as never)}>
                    <Settings size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.content}
            >
                <View style={styles.heroSection}>
                    <MemberAvatar name={memberName} color={memberColor} size={80} />
                    <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
                        Ready to crush it today?
                    </Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <Star size={20} color={theme.colors.actionPrimary} />
                        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{memberPoints}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points</Text>
                    </View>
                    <StreakBadge streak={memberData?.currentStreak || 0} size="medium" />
                    <MultiplierBadge multiplier={memberData?.streakMultiplier || 1.0} size="medium" />
                </View>

                {/* Streak Progress */}
                <StreakProgress currentStreak={memberData?.currentStreak || 0} />

                <TouchableOpacity
                    style={[styles.storeButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={() => navigation.navigate('MemberStore', {
                        memberId,
                        userId,
                        memberName,
                        memberColor,
                        memberPoints
                    })}
                >
                    <ShoppingBag size={20} color="#FFFFFF" />
                    <Text style={styles.storeButtonText}>Visit Rewards Store</Text>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>My Tasks</Text>

                {memberTasks.length > 0 ? (
                    memberTasks.map((task) => (
                        <TaskCard
                            key={task._id || task.id}
                            task={task}
                            onComplete={() => handleCompleteTask(task._id || task.id)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.textSecondary }}>No tasks assigned yet!</Text>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 24 }]}>Available Quests</Text>

                {availableQuests.length > 0 ? (
                    availableQuests.map((quest) => (
                        <QuestCard
                            key={quest._id || quest.id}
                            quest={quest}
                            onClaim={() => handleClaimQuest(quest._id || quest.id)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.textSecondary }}>No quests available right now!</Text>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 24 }]}>My Active Quests</Text>

                {activeQuests.length > 0 ? (
                    activeQuests.map((quest) => (
                        <QuestCard
                            key={quest._id || quest.id}
                            quest={quest}
                            onComplete={() => handleCompleteQuest(quest._id || quest.id)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.textSecondary }}>No active quests. Claim one above!</Text>
                    </View>
                )}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
        gap: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    storeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    storeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
