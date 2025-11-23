// =========================================================
// momentum-mobile/src/screens/family/FamilyScreen.tsx
// Family View - The Primary Interface (Mobile Kiosk)
// =========================================================
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, StatusBar, Alert, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../contexts/SocketContext';
import { SOCKET_EVENTS, TaskUpdatedEvent, MemberPointsUpdatedEvent, HouseholdUpdatedEvent } from '../../constants/socketEvents';
import { DashboardData, Member } from '../../types';

// Components
import MealCard from '../../components/family/MealCard';
import MemberColumn from '../../components/family/MemberColumn';
import FamilyHeader from '../../components/family/FamilyHeader';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function FamilyScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currentTheme: theme } = useTheme();

    // Detect Tablet/Landscape Mode
    const isLandscape = width > 600;

    const [todaysMeal, setTodaysMeal] = useState<{ main: string; side: string } | null>(null);

    const loadData = async () => {
        try {
            const [dashboardResponse, mealsResponse] = await Promise.all([
                api.getDashboardData(),
                api.getMeals()
            ]);

            if (dashboardResponse.data) {
                setData(dashboardResponse.data);
            }

            if (mealsResponse.data && mealsResponse.data.recipes && mealsResponse.data.recipes.length > 0) {
                const meal = mealsResponse.data.recipes[0];
                setTodaysMeal({
                    main: meal.name,
                    side: meal.description || 'No side dish'
                });
            } else {
                setTodaysMeal({
                    main: 'No Meal Planned',
                    side: 'Tap to add a meal plan'
                });
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

    const handleMemberPress = (member: Member) => {
        navigation.navigate('MemberDetail', {
            memberId: member.id,
            userId: member.userId,
            memberName: member.firstName,
            memberColor: member.profileColor,
            memberPoints: member.pointsTotal || 0
        });
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
                        <MealCard todaysMeal={todaysMeal} />
                    </View>

                    <View style={styles.landscapeRightCol}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>WHO IS CHECKING IN?</Text>
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.columnsContainer}
                            >
                                {members.map((member: Member) => (
                                    <MemberColumn
                                        key={member.id}
                                        member={member}
                                        allTasks={allTasks}
                                        onPress={handleMemberPress}
                                    />
                                ))}
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
                    <MealCard todaysMeal={todaysMeal} />
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>WHO IS CHECKING IN?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columnsContainer}>
                        {members.map((member: Member) => (
                            <MemberColumn
                                key={member.id}
                                member={member}
                                allTasks={allTasks}
                                onPress={handleMemberPress}
                            />
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bgSurface} />

            <FamilyHeader
                householdName={householdName}
                isParent={isParent}
                isLandscape={isLandscape}
                insets={insets}
                onSettingsPress={() => navigation.navigate('Parent')}
                onRemindParent={handleRemindParent}
            />

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
    columnsContainer: {
        paddingRight: 24,
        paddingBottom: 24,
        gap: 16,
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
