// =========================================================
// momentum-mobile/src/screens/family/MemberDetailScreen.tsx
// Individual Member View - For children to check their tasks
// =========================================================
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Star, Trophy, Settings, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';
import TaskCard from '../../components/shared/TaskCard';
import MemberAvatar from '../../components/family/MemberAvatar';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MemberDetailRouteProp = RouteProp<RootStackParamList, 'MemberDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

import { useSocket } from '../../contexts/SocketContext';

export default function MemberDetailScreen() {
    const route = useRoute<MemberDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { on, off } = useSocket();

    const { memberId, userId, memberName = 'Member', memberColor, memberPoints: initialPoints = 0 } = route.params || {};
    const theme = themes.calmLight;

    const [tasks, setTasks] = useState<any[]>([]);
    const [memberPoints, setMemberPoints] = useState(initialPoints);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMemberData = async () => {
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

            // Load fresh member data (points)
            const familyResponse = await api.getFamilyData();
            if (familyResponse.data && familyResponse.data.household && familyResponse.data.household.members) {
                const member = familyResponse.data.household.members.find((m: any) => m.id === memberId || m._id === memberId);
                if (member) {
                    setMemberPoints(member.pointsTotal || 0);
                }
            }

        } catch (error) {
            console.error('Error loading member data:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadMemberData();
        }, [])
    );

    // Real-time updates
    React.useEffect(() => {
        const handleUpdate = () => {
            console.log('🔄 Received real-time update, refreshing member data...');
            loadMemberData();
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
