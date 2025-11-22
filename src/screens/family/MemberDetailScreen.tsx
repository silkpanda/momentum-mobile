// =========================================================
// momentum-mobile/src/screens/family/MemberDetailScreen.tsx
// Individual Member View - For children to check their tasks
// =========================================================
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, DeviceEventEmitter } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Star, Trophy, Settings, ShoppingBag, Map } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';
import TaskCard from '../../components/shared/TaskCard';
import QuestCard from '../../components/shared/QuestCard';
import MemberAvatar from '../../components/family/MemberAvatar';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../contexts/SocketContext';

type MemberDetailRouteProp = RouteProp<RootStackParamList, 'MemberDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function MemberDetailScreen() {
    const route = useRoute<MemberDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { on, off } = useSocket();

    const { memberId, userId, memberName = 'Member', memberColor, memberPoints: initialPoints = 0 } = route.params || {};
    const theme = themes.calmLight;

    const [tasks, setTasks] = useState<any[]>([]);
    const [quests, setQuests] = useState<any[]>([]);
    const [memberPoints, setMemberPoints] = useState(initialPoints);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [lastUpdated, setLastUpdated] = useState(0);

    // Listen for direct updates from other screens (like Store)
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('update_member_points', (event) => {
            if (event.memberId === memberId) {
                console.log(`[MemberDetail] Received event update for points: ${event.points}`);
                setMemberPoints(event.points);
                setLastUpdated(Date.now());
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
            setLastUpdated(Date.now());
        }
    }, [route.params?.memberPoints]);

    const loadMemberData = useCallback(async () => {
        console.log('📥 [MemberDetail] Loading member data...');
        try {
            // Load tasks
            const tasksResponse = await api.getTasks();
            if (tasksResponse.data && Array.isArray(tasksResponse.data.tasks)) {
                const memberTasks = tasksResponse.data.tasks.filter((t: any) => {
                    const isAssigned = t.assignedTo && Array.isArray(t.assignedTo) &&
                        t.assignedTo.some((assigneeId: string) => assigneeId === memberId);
                    const isPending = t.status === 'Pending' || t.status === 'PendingApproval';
                    return isAssigned && isPending;
                });
                setTasks(memberTasks);
            } else {
                setTasks([]);
            }

            // Load quests
            const questsResponse = await api.getQuests();
            if (questsResponse.data && Array.isArray(questsResponse.data.quests)) {
                setQuests(questsResponse.data.quests);
            } else {
                setQuests([]);
            }

            // Load fresh member data (points)
            const familyResponse = await api.getFamilyData();
            if (familyResponse.data && familyResponse.data.household && familyResponse.data.household.members) {
                console.log(`[MemberDetail] Searching for memberId: ${memberId} in ${familyResponse.data.household.members.length} members`);
                const member = familyResponse.data.household.members.find((m: any) => m.id === memberId || m._id === memberId);

                if (member) {
                    // Check if we have a recent local update (within 2 seconds)
                    const timeSinceLastUpdate = Date.now() - lastUpdated;
                    if (timeSinceLastUpdate < 2000) {
                        console.log(`[MemberDetail] Skipping API point update (Grace Period Active). Local: ${memberPoints}, API: ${member.pointsTotal}`);
                    } else {
                        console.log(`✅ [MemberDetail] Found member ${member.firstName}. Old Points: ${memberPoints}, New Points: ${member.pointsTotal}`);
                        setMemberPoints(member.pointsTotal || 0);
                    }
                } else {
                    console.warn(`⚠️ [MemberDetail] Member not found in family data. IDs available:`, familyResponse.data.household.members.map((m: any) => m.id || m._id));
                }
            }

        } catch (error) {
            console.error('Error loading member data:', error);
            setTasks([]);
            setQuests([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [memberId, memberName, lastUpdated, memberPoints]);

    useFocusEffect(
        useCallback(() => {
            console.log('👀 [MemberDetail] Screen focused, loading data...');
            loadMemberData();
        }, [loadMemberData])
    );

    // Real-time updates
    useEffect(() => {
        const handleUpdate = (data: any) => {
            console.log('🔄 [MemberDetail] Received real-time update:', data);

            // Check if this is a points update for the current member
            if (data && data.memberId === memberId && typeof data.pointsTotal === 'number') {
                console.log(`✅ [MemberDetail] Socket update points: ${data.pointsTotal}`);
                setMemberPoints(data.pointsTotal);
                setLastUpdated(Date.now()); // Protect against stale fetches
            } else {
                // For other events (tasks, quests), reload data
                loadMemberData();
            }
        };

        on('task_updated', handleUpdate);
        on('member_points_updated', handleUpdate);
        on('quest_updated', handleUpdate);

        return () => {
            off('task_updated', handleUpdate);
            off('member_points_updated', handleUpdate);
            off('quest_updated', handleUpdate);
        };
    }, [on, off, memberId, loadMemberData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadMemberData();
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await api.completeTask(taskId, memberId);
            loadMemberData();
        } catch (error: any) {
            console.error('Error completing task:', error);
            alert(`Failed to complete task: ${error.message || 'Unknown error'}`);
        }
    };

    const handleClaimQuest = async (questId: string) => {
        try {
            await api.claimQuest(questId, memberId);
            loadMemberData();
        } catch (error: any) {
            console.error('Error claiming quest:', error);
            alert(`Failed to claim quest: ${error.message || 'Unknown error'}`);
        }
    };

    const handleCompleteQuest = async (questId: string) => {
        try {
            await api.completeQuest(questId, memberId);
            loadMemberData();
        } catch (error: any) {
            console.error('Error completing quest:', error);
            alert(`Failed to complete quest: ${error.message || 'Unknown error'}`);
        }
    };

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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                    <View style={[styles.statCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <Trophy size={20} color={theme.colors.signalSuccess} />
                        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>--</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
                    </View>
                </View>

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

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={{ marginTop: 20 }} />
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
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

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={{ marginTop: 20 }} />
                ) : quests.filter(q => {
                    // Show quests that are active and not yet claimed by this member
                    const hasClaim = q.claims && q.claims.some((c: any) => c.memberId === memberId);
                    return q.isActive && !hasClaim;
                }).length > 0 ? (
                    quests.filter(q => {
                        const hasClaim = q.claims && q.claims.some((c: any) => c.memberId === memberId);
                        return q.isActive && !hasClaim;
                    }).map((quest) => (
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

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={{ marginTop: 20 }} />
                ) : quests.filter(q => {
                    // Show quests claimed by this member that are not yet completed
                    const myClaim = q.claims && q.claims.find((c: any) => c.memberId === memberId);
                    return myClaim && myClaim.status === 'claimed';
                }).length > 0 ? (
                    quests.filter(q => {
                        const myClaim = q.claims && q.claims.find((c: any) => c.memberId === memberId);
                        return myClaim && myClaim.status === 'claimed';
                    }).map((quest) => (
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
