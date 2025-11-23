// =========================================================
// momentum-mobile/src/screens/family/FamilyScreen.tsx
// Family View - The Primary Interface (Mobile Kiosk)
// =========================================================
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, StatusBar, Alert, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import MemberAvatar from '../../components/family/MemberAvatar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Settings, Utensils, Bell, CheckCircle, Target, Star } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../contexts/SocketContext';
import { SOCKET_EVENTS, TaskUpdatedEvent, MemberPointsUpdatedEvent, HouseholdUpdatedEvent } from '../../constants/socketEvents';
import { DashboardData, Member, Task } from '../../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function FamilyScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = themes.calmLight;

    // Detect Tablet/Landscape Mode
    const isLandscape = width > 600;

    const loadData = async () => {
        try {
            const response = await api.getDashboardData();
            if (response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error loading family view:', error);
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

    // WebSocket Listeners
    const { on, off } = useSocket();

    React.useEffect(() => {
        const handleTaskUpdate = (data: TaskUpdatedEvent) => {
            console.log('[FamilyScreen] Task updated:', data);
            loadData();
        };

        const handlePointsUpdate = (data: MemberPointsUpdatedEvent) => {
            console.log('[FamilyScreen] Points updated:', data);
            loadData();
        };

        const handleHouseholdUpdate = (data: HouseholdUpdatedEvent) => {
            console.log('[FamilyScreen] Household updated:', data);
            loadData();
        };

        on(SOCKET_EVENTS.TASK_UPDATED, handleTaskUpdate);
        on(SOCKET_EVENTS.MEMBER_POINTS_UPDATED, handlePointsUpdate);
        on(SOCKET_EVENTS.HOUSEHOLD_UPDATED, handleHouseholdUpdate);

        return () => {
            off(SOCKET_EVENTS.TASK_UPDATED, handleTaskUpdate);
            off(SOCKET_EVENTS.MEMBER_POINTS_UPDATED, handlePointsUpdate);
            off(SOCKET_EVENTS.HOUSEHOLD_UPDATED, handleHouseholdUpdate);
        };
    }, [on, off]);

    const handleRemindParent = () => {
        Alert.alert(
            "Sent!",
            "We've pinged your parent to come help you.",
            [{ text: "OK" }]
        );
    };

    const isParent = user?.role === 'Parent';

    if (isLoading && !data) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    const householdName = data?.household?.name || 'My Family';
    const members = data?.household?.members || [];
    const allTasks = data?.tasks || [];

    const todaysMeal = {
        main: 'Taco Tuesday 🌮',
        side: 'Guacamole & Chips',
    };

    const renderMemberColumn = (member: Member) => {
        const memberTasks = allTasks.filter((t: Task) =>
            t.assignedTo && t.assignedTo.includes(member.id) && (t.status === 'Pending' || t.status === 'PendingApproval')
        );

        const isFocusMode = false;

        return (
            <TouchableOpacity
                key={member.id}
                style={[styles.memberColumn, { backgroundColor: theme.colors.bgSurface }]}
                onPress={() => navigation.navigate('MemberDetail', {
                    memberId: member.id,
                    userId: member.userId,
                    memberName: member.firstName,
                    memberColor: member.profileColor,
                    memberPoints: member.pointsTotal || 0
                })}
                activeOpacity={0.9}
            >
                <View style={styles.columnHeader}>
                    <MemberAvatar
                        name={member.firstName + ' ' + member.lastName}
                        color={member.profileColor}
                        size={56}
                    />
                    <View style={styles.headerInfo}>
                        <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                            {member.firstName}
                        </Text>
                        <View style={styles.pointsRow}>
                            <Star size={12} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                            <Text style={[styles.memberPoints, { color: theme.colors.textSecondary }]}>
                                {member.pointsTotal || 0}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tasksContainer}>
                    {isFocusMode && memberTasks.length > 0 ? (
                        <View style={[styles.focusCard, { borderColor: member.profileColor }]}>
                            <View style={styles.focusHeader}>
                                <Target size={16} color={member.profileColor} />
                                <Text style={[styles.focusLabel, { color: member.profileColor }]}>FOCUS MODE</Text>
                            </View>
                            <Text style={[styles.focusTaskTitle, { color: theme.colors.textPrimary }]}>
                                {memberTasks[0].title}
                            </Text>
                            <Text style={[styles.focusPoints, { color: theme.colors.actionPrimary }]}>
                                +{memberTasks[0].value} pts
                            </Text>
                        </View>
                    ) : (
                        <>
                            {memberTasks.slice(0, 3).map((task: Task) => (
                                <View key={task._id || task.id} style={styles.taskItem}>
                                    <View style={[styles.taskBullet, { borderColor: member.profileColor }]} />
                                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                        {task.title}
                                    </Text>
                                </View>
                            ))}
                            {memberTasks.length > 3 && (
                                <Text style={[styles.moreTasks, { color: theme.colors.textSecondary }]}>
                                    + {memberTasks.length - 3} more
                                </Text>
                            )}
                            {memberTasks.length === 0 && (
                                <View style={styles.emptyTasks}>
                                    <CheckCircle size={24} color={theme.colors.borderSubtle} />
                                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>All Done!</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Render Content based on Layout Mode
    const renderContent = () => {
        if (isLandscape) {
            return (
                <View style={[
                    styles.landscapeContainer,
                    {
                        paddingLeft: Math.max(insets.left, 24),
                        paddingRight: Math.max(insets.right, 24),
                        paddingBottom: Math.max(insets.bottom, 24)
                    }
                ]}>
                    <View style={styles.landscapeLeftCol}>
                        <View style={[styles.mealCard, { backgroundColor: theme.colors.bgSurface }]}>
                            <View style={styles.mealHeader}>
                                <Utensils size={24} color={theme.colors.signalSuccess} />
                                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Today's Menu</Text>
                            </View>
                            <View style={styles.mealContent}>
                                <Text style={[styles.mealMain, { color: theme.colors.textPrimary }]}>{todaysMeal.main}</Text>
                                <Text style={[styles.mealSide, { color: theme.colors.textSecondary }]}>{todaysMeal.side}</Text>
                            </View>
                            <TouchableOpacity style={styles.rateMealButton}>
                                <Text style={[styles.rateMealText, { color: theme.colors.actionPrimary }]}>Rate Meal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.landscapeRightCol}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>WHO IS CHECKING IN?</Text>
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.columnsContainer}
                            >
                                {members.map((member: Member) => renderMemberColumn(member))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.sectionContainer}>
                    <View style={[styles.mealCard, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.mealHeader}>
                            <Utensils size={20} color={theme.colors.signalSuccess} />
                            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Today's Menu</Text>
                        </View>
                        <View style={styles.mealContent}>
                            <Text style={[styles.mealMain, { color: theme.colors.textPrimary }]}>{todaysMeal.main}</Text>
                            <Text style={[styles.mealSide, { color: theme.colors.textSecondary }]}>{todaysMeal.side}</Text>
                        </View>
                        <TouchableOpacity style={styles.rateMealButton}>
                            <Text style={[styles.rateMealText, { color: theme.colors.actionPrimary }]}>Rate Meal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>WHO IS CHECKING IN?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columnsContainer}>
                        {members.map((member: Member) => renderMemberColumn(member))}
                    </ScrollView>
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bgSurface} />

            <View style={[
                styles.header,
                {
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: theme.colors.borderSubtle,
                    paddingTop: insets.top + 16,
                    paddingLeft: insets.left + 24,
                    paddingRight: insets.right + 24
                }
            ]}>
                <View>
                    <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    <Text style={[styles.householdName, { color: theme.colors.textPrimary }]}>{householdName}</Text>
                </View>

                {isParent ? (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: theme.colors.bgCanvas }]}
                        onPress={() => navigation.navigate('Parent')}
                    >
                        <Settings size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                ) : isLandscape ? (
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={handleRemindParent}
                    >
                        <Bell size={20} color="#FFFFFF" />
                        <Text style={styles.headerButtonText}>Remind Parent</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {renderContent()}

            {!isParent && !isLandscape && (
                <TouchableOpacity
                    style={[
                        styles.fab,
                        {
                            backgroundColor: theme.colors.actionPrimary,
                            right: 24 + insets.right,
                            bottom: 32 + insets.bottom
                        }
                    ]}
                    onPress={handleRemindParent}
                >
                    <Bell size={24} color="#FFFFFF" />
                    <Text style={styles.fabText}>Remind Parent</Text>
                </TouchableOpacity>
            )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24, // Fallback
        paddingBottom: 20,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
    },
    headerButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    householdName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 10,
        borderRadius: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    sectionContainer: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    landscapeContainer: {
        flex: 1, // Ensure it takes full height
        flexDirection: 'row',
        padding: 24,
        gap: 24,
    },
    landscapeLeftCol: {
        flex: 0.35,
    },
    landscapeRightCol: {
        flex: 0.65,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 1,
    },
    mealCard: {
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    mealContent: {
        marginBottom: 16,
    },
    mealMain: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 6,
    },
    mealSide: {
        fontSize: 16,
    },
    rateMealButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    rateMealText: {
        fontSize: 16,
        fontWeight: '600',
    },
    columnsContainer: {
        paddingRight: 24,
        paddingBottom: 24,
        gap: 16,
    },
    memberColumn: {
        width: 240,
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        minHeight: 220,
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    headerInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberPoints: {
        fontSize: 12,
        fontWeight: '600',
    },
    tasksContainer: {
        flex: 1,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    taskBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 2,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    moreTasks: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
        marginLeft: 18,
    },
    emptyTasks: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
    },
    focusCard: {
        borderWidth: 2,
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
    },
    focusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    focusLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    focusTaskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    focusPoints: {
        fontSize: 14,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    fabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
});
