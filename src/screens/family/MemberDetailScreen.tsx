// =========================================================
// momentum-mobile/src/screens/family/MemberDetailScreen.tsx
// Individual Member View - For children to check their tasks
// =========================================================
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Star, Trophy, Settings } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';
import TaskCard from '../../components/shared/TaskCard';
import MemberAvatar from '../../components/family/MemberAvatar';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MemberDetailRouteProp = RouteProp<RootStackParamList, 'MemberDetail'>;

export default function MemberDetailScreen() {
    const route = useRoute<MemberDetailRouteProp>();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // Safety check for params
    const { memberId, memberName = 'Member', memberColor, memberPoints = 0 } = route.params || {};
    const theme = themes.calmLight;

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // In a real implementation, we would fetch tasks specifically for this member
    // For now, we'll fetch family data and filter, or use the tasks endpoint if it supports filtering
    const loadMemberData = async () => {
        try {
            // Fetching all tasks for the household to filter for this member
            // This assumes the logged-in user (Parent) has access to see these tasks
            const response = await api.getTasks();

            if (response.data && Array.isArray(response.data.tasks)) {
                const memberTasks = response.data.tasks.filter((t: any) =>
                    t.assignees && Array.isArray(t.assignees) && t.assignees.some((a: any) => a._id === memberId || a.id === memberId)
                );
                setTasks(memberTasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error loading member data:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        loadMemberData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadMemberData();
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await api.completeTask(taskId, memberId);
            loadMemberData(); // Refresh after completion
        } catch (error) {
            console.error('Error completing task:', error);
            // Use Alert instead of alert for React Native
            // Alert.alert('Error', 'Failed to complete task');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
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
                {/* Profile Hero */}
                <View style={styles.heroSection}>
                    <MemberAvatar name={memberName} color={memberColor} size={80} />
                    <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
                        Ready to crush it today?
                    </Text>
                </View>

                {/* Stats Row (Placeholder) */}
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

                {/* Tasks List */}
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
        </View>
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
});
