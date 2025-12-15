import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, StatusBar, Alert, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { calendarService } from '../../services/calendarService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../contexts/SocketContext';
import { SOCKET_EVENTS, TaskUpdatedEvent, MemberPointsUpdatedEvent, HouseholdUpdatedEvent } from '../../constants/socketEvents';
import { DashboardData, Member, Event } from '../../types';
import { bentoPalette, spacing } from '../../theme/bentoTokens';
import { Settings } from 'lucide-react-native';

// Components
import TimelineCard from './components/TimelineCard';
import RosterGrid from './components/RosterGrid';
import EnvironmentColumn from './components/EnvironmentColumn';
import PINEntryModal from '../../components/pin/PINEntryModal';
import PINSetupModal from '../../components/pin/PINSetupModal';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function FamilyBentoScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { currentTheme: theme } = useTheme();

    // Data State
    const [data, setData] = useState<DashboardData | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [todaysMeal, setTodaysMeal] = useState<{ main: string; side: string } | null>(null);
    const [questProgress, setQuestProgress] = useState(0); // placeholder
    const [questTitle, setQuestTitle] = useState("Loading Quest...");

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // PIN State
    const [isPinEntryModalVisible, setIsPinEntryModalVisible] = useState(false);
    const [isPinSetupModalVisible, setIsPinSetupModalVisible] = useState(false);
    const [pinSetupCompleted, setPinSetupCompleted] = useState(false);

    // Responsive Layout
    const isTablet = width >= 768; // Standard tablet breakpoint
    const isLandscape = width > 500; // General landscape check if needed, but tablet check is better for layout switch

    const loadData = async () => {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const [dashboardResponse, mealsResponse, calendarEvents] = await Promise.all([
                api.getDashboardData(),
                api.getMeals(),
                calendarService.getEvents(startOfDay, endOfDay)
                // Note: calendarService.getEvents returns local calendar events usually, 
                // but we might want Backend Synced events from dashboardResponse if available.
                // dashboardResponse.data.events might contain the synced events.
                // For now, let's use what we have or dashboard events.
            ]);

            if (dashboardResponse.data) {
                setData(dashboardResponse.data);

                // If dashboard returns events, use them (synced source of truth), else fall back to service
                // Assuming dashboardResponse.data.events is populated as per type definition
                if (dashboardResponse.data.events) {
                    setEvents(dashboardResponse.data.events);
                } else {
                    // Fallback to local calendar service if implemented, but likely we want backend events
                    setEvents([]);
                }

                // Placeholder for Quest logic - grab from first active quest if available
                if (dashboardResponse.data.quests && dashboardResponse.data.quests.length > 0) {
                    const activeQuest = dashboardResponse.data.quests[0];
                    setQuestTitle(activeQuest.title);
                    // Calculate progress based on claims vs requirements? 
                    // Simplified: 60% hardcoded or based on something real
                    setQuestProgress(60);
                } else {
                    setQuestTitle("No Active Quest");
                    setQuestProgress(0);
                }
            }

            if (mealsResponse.data && mealsResponse.data.recipes && mealsResponse.data.recipes.length > 0) {
                const meal = mealsResponse.data.recipes[0];
                setTodaysMeal({
                    main: meal.name,
                    side: meal.description || 'No side dish'
                });
            } else {
                setTodaysMeal({ main: 'No Meal Planned', side: 'Tap to plan' });
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
            checkPinStatus();
        }, [])
    );

    const checkPinStatus = async () => {
        try {
            const response = await api.getPinStatus();
            setPinSetupCompleted(response.data?.pinSetupCompleted || false);
        } catch (error) {
            console.log('PIN status check failed:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // WebSocket Listeners
    const { on, off } = useSocket();
    useEffect(() => {
        const handleUpdates = () => loadData();

        on(SOCKET_EVENTS.TASK_UPDATED, handleUpdates);
        on(SOCKET_EVENTS.MEMBER_POINTS_UPDATED, handleUpdates);
        on(SOCKET_EVENTS.HOUSEHOLD_UPDATED, handleUpdates);

        return () => {
            off(SOCKET_EVENTS.TASK_UPDATED, handleUpdates);
            off(SOCKET_EVENTS.MEMBER_POINTS_UPDATED, handleUpdates);
            off(SOCKET_EVENTS.HOUSEHOLD_UPDATED, handleUpdates);
        };
    }, [on, off]);

    // Handlers
    const handleMemberPress = (member: Member) => {
        navigation.navigate('MemberDetail', {
            memberId: member.id,
            userId: member.userId,
            memberName: member.firstName,
            memberColor: member.profileColor,
            memberPoints: member.pointsTotal || 0
        });
    };

    const handleSettingsPress = () => {
        const members = data?.household?.members || [];
        const parentMember = members.find(m => m.role === 'Parent');

        if (!parentMember) {
            Alert.alert('Error', 'No parent account found.');
            return;
        }

        if (!pinSetupCompleted) {
            Alert.alert(
                'Set Up PIN?',
                'Secure the Parent Dashboard with a 4-digit PIN.',
                [
                    { text: 'Skip', onPress: () => navigation.navigate('Parent'), style: 'cancel' },
                    { text: 'Set Up PIN', onPress: () => setIsPinSetupModalVisible(true) },
                ]
            );
        } else {
            setIsPinEntryModalVisible(true);
        }
    };

    const handlePinSuccess = async (pin?: string) => {
        if (pin) {
            // Setup case
            try {
                await api.setupPin(pin);
                setPinSetupCompleted(true);
                setIsPinSetupModalVisible(false);
                navigation.navigate('Parent');
            } catch (error) {
                Alert.alert('Error', 'Failed to set up PIN.');
            }
        } else {
            // Verify case
            setIsPinEntryModalVisible(false);
            navigation.navigate('Parent');
        }
    };

    if (isLoading && !data) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: bentoPalette.canvas }]}>
                <ActivityIndicator size="large" color={bentoPalette.brandPrimary} />
            </View>
        );
    }

    const members = data?.household?.members || [];
    const tasks = data?.tasks || [];
    const householdName = data?.household?.name || 'Momentum Family';

    return (
        <View style={[styles.container, { backgroundColor: bentoPalette.canvas }]}>
            <StatusBar barStyle="dark-content" backgroundColor={bentoPalette.canvas} />

            {/* Header - Minimalist */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
                <Text style={styles.headerTitle}>{householdName}</Text>
                <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
                    <Settings color={bentoPalette.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.contentContainer,
                    isTablet ? styles.tabletLayout : styles.mobileLayout,
                    { paddingBottom: insets.bottom + spacing.xl }
                ]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Zone 1: Timeline (40% on tablet) */}
                <View style={[styles.zone, isTablet && styles.zone1]}>
                    <TimelineCard events={events} members={members} />
                </View>

                {/* Zone 2: Squad Status (35% on tablet) */}
                <View style={[styles.zone, isTablet && styles.zone2]}>
                    <RosterGrid members={members} tasks={tasks} onMemberPress={handleMemberPress} />
                </View>

                {/* Zone 3: Environment (25% on tablet) */}
                <View style={[styles.zone, isTablet && styles.zone3]}>
                    <EnvironmentColumn
                        todaysMeal={todaysMeal}
                        questProgress={questProgress}
                        questTitle={questTitle}
                    />
                </View>
            </ScrollView>

            {/* PIN Modals */}
            <PINEntryModal
                visible={isPinEntryModalVisible}
                onClose={() => setIsPinEntryModalVisible(false)}
                onSuccess={() => handlePinSuccess()}
                memberId={members.find(m => m.role === 'Parent')?.id || ''}
                householdId={data?.household?.id || ''}
                title="Enter Parent PIN"
            />
            <PINSetupModal
                visible={isPinSetupModalVisible}
                onClose={() => setIsPinSetupModalVisible(false)}
                onSuccess={handlePinSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Fredoka-Bold', // Assuming font is available
        color: bentoPalette.textPrimary,
    },
    settingsButton: {
        padding: spacing.sm,
    },
    contentContainer: {
        paddingHorizontal: spacing.xl,
        gap: spacing.xl,
    },
    mobileLayout: {
        flexDirection: 'column',
    },
    tabletLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if needed, but intended as columns
        alignItems: 'flex-start',
    },
    zone: {
        marginBottom: spacing.lg,
    },
    // Tablet width distributions
    zone1: {
        flex: 0.40, // 40%
        marginRight: spacing.lg,
        marginBottom: 0,
    },
    zone2: {
        flex: 0.35, // 35%
        marginRight: spacing.lg,
        marginBottom: 0,
    },
    zone3: {
        flex: 0.25, // 25%
        marginBottom: 0,
    },
});
