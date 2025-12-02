// =========================================================
// Morning Briefing - The "Disney Adult" Daily Digest
// =========================================================
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Modal,
} from 'react-native';
import {
    CloudSun,
    AlertCircle,
    Coffee,
    Menu,
    X,
    ChevronRight,
    Star,
    Calendar as CalendarIcon,
    Utensils,
    ShoppingBag,
    Users,
    ListTodo,
    Settings,
    Map,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/api';

// Import Manager Modals
import RoutineManagerModal from './bento/modals/RoutineManagerModal';
import MemberManagerModal from './bento/modals/MemberManagerModal';
import TaskManagerModal from './bento/modals/TaskManagerModal';
import ThemeSelectorModal from './bento/modals/ThemeSelectorModal';

// Import Themed Briefing Modals
import BriefingStoreModal from './briefing/modals/BriefingStoreModal';
import BriefingQuestModal from './briefing/modals/BriefingQuestModal';

export default function MorningBriefing() {
    const { currentTheme: theme } = useTheme();
    const { members, tasks, refresh, routines, meals } = useData();

    // Modal States
    const [showMenu, setShowMenu] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [showRoutines, setShowRoutines] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showTasks, setShowTasks] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [showQuests, setShowQuests] = useState(false);

    // --- Data Derivation ---

    // 1. Urgent: Pending Approvals
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval');

    // 2. Overnight Wire: Recently Completed Tasks (Last 24h)
    const recentActivity = tasks
        .filter(t => t.status === 'Completed' && t.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 3); // Top 3 most recent

    // 3. Forecast: Routines & Meals
    // Sort routines by timeOfDay (Morning -> Afternoon -> Evening)
    const timeOrder = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3 };
    const sortedRoutines = [...routines].sort((a, b) => {
        return (timeOrder[a.timeOfDay as keyof typeof timeOrder] || 4) - (timeOrder[b.timeOfDay as keyof typeof timeOrder] || 4);
    });

    // Get today's meal (assuming first one for now, or logic to pick today's)
    const todaysMeal = meals.length > 0 ? meals[0] : null;

    const handleQuickApprove = async (taskId: string) => {
        try {
            await api.approveTask(taskId);
            await refresh();
            Alert.alert('Magic Made! ✨', 'Reward approved.');
        } catch (error) {
            Alert.alert('Error', 'Could not approve task.');
        }
    };

    // --- Components ---

    const Masthead = () => (
        <View style={styles.masthead}>
            <View style={[styles.mastheadTop, { borderBottomColor: theme.colors.textPrimary }]}>
                <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                </Text>
                <View style={styles.weatherContainer}>
                    <CloudSun size={16} color={theme.colors.textPrimary} />
                    <Text style={[styles.weatherText, { color: theme.colors.textPrimary }]}>72° Partly Cloudy</Text>
                </View>
            </View>
            <Text style={[styles.greetingTitle, { color: theme.colors.textPrimary }]}>Good Morning, Parent.</Text>
            <Text style={[styles.subGreeting, { color: theme.colors.textSecondary }]}>Here is your daily dispatch.</Text>
            <View style={[styles.separator, { backgroundColor: theme.colors.actionPrimary }]} />
        </View>
    );

    const UrgentFold = () => {
        if (pendingApprovals.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <AlertCircle size={18} color={theme.colors.signalAlert} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.signalAlert }]}>URGENT ATTENTION</Text>
                </View>
                {pendingApprovals.map(task => (
                    <View key={task._id} style={[styles.urgentCard, { backgroundColor: theme.colors.bgSurface, borderLeftColor: theme.colors.signalAlert, shadowColor: theme.colors.textPrimary }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.urgentTitle, { color: theme.colors.textPrimary }]}>{task.title}</Text>
                            <Text style={[styles.urgentSubtitle, { color: theme.colors.textSecondary }]}>
                                {members.find(m => m.id === task.assignedTo)?.firstName} is waiting
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.resolveButton, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.signalAlert }]}
                            onPress={() => handleQuickApprove(task._id)}
                        >
                            <Text style={[styles.resolveButtonText, { color: theme.colors.signalAlert }]}>APPROVE</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    const OvernightWire = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Coffee size={18} color={theme.colors.textPrimary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>THE OVERNIGHT WIRE</Text>
            </View>

            {recentActivity.length > 0 ? (
                recentActivity.map(task => {
                    const timeString = task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'RECENTLY';
                    const memberName = members.find(m => m.id === task.assignedTo)?.firstName || 'Someone';

                    return (
                        <View key={task._id} style={styles.wireItem}>
                            <View style={[styles.wireTime, { borderRightColor: theme.colors.borderSubtle }]}>
                                <Text style={[styles.wireTimeText, { color: theme.colors.textTertiary }]}>{timeString}</Text>
                            </View>
                            <View style={styles.wireContent}>
                                <Text style={[styles.wireText, { color: theme.colors.textPrimary }]}>
                                    {memberName} finished <Text style={{ fontWeight: 'bold' }}>{task.title}</Text>.
                                </Text>
                            </View>
                        </View>
                    );
                })
            ) : (
                <View style={styles.wireItem}>
                    <View style={[styles.wireTime, { borderRightColor: theme.colors.borderSubtle }]}>
                        <Text style={[styles.wireTimeText, { color: theme.colors.textTertiary }]}>NOW</Text>
                    </View>
                    <View style={styles.wireContent}>
                        <Text style={[styles.wireText, { color: theme.colors.textPrimary }]}>System is ready for the day.</Text>
                    </View>
                </View>
            )}
        </View>
    );

    const Forecast = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <CalendarIcon size={18} color={theme.colors.textPrimary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>THE FORECAST</Text>
            </View>

            {/* Timeline - Routines */}
            {sortedRoutines.length > 0 ? (
                sortedRoutines.map(routine => (
                    <View key={routine._id} style={styles.forecastRow}>
                        <Text style={[styles.forecastTime, { color: theme.colors.textSecondary }]}>{routine.timeOfDay}</Text>
                        <View style={[styles.forecastLine, { backgroundColor: theme.colors.borderSubtle }]} />
                        <Text style={[styles.forecastEvent, { color: theme.colors.textPrimary }]}>{routine.title}</Text>
                    </View>
                ))
            ) : (
                <Text style={{ color: theme.colors.textSecondary, fontStyle: 'italic', marginBottom: 16 }}>No routines scheduled.</Text>
            )}

            {/* Meal Plan */}
            {todaysMeal && (
                <View style={[styles.mealCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}>
                    <Utensils size={16} color={theme.colors.textPrimary} />
                    <Text style={[styles.mealText, { color: theme.colors.textPrimary }]}>
                        <Text style={{ fontWeight: 'bold' }}>Dinner:</Text> {todaysMeal.name}
                    </Text>
                </View>
            )}

            {/* Manage Button */}
            <TouchableOpacity
                style={styles.inlineAction}
                onPress={() => setShowRoutines(true)}
            >
                <Text style={[styles.inlineActionText, { color: theme.colors.actionPrimary }]}>Manage Today's Schedule</Text>
                <ChevronRight size={14} color={theme.colors.actionPrimary} />
            </TouchableOpacity>
        </View>
    );

    const ConciergeMenu = () => (
        <Modal
            visible={showMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
        >
            <TouchableOpacity
                style={[styles.menuOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                activeOpacity={1}
                onPress={() => setShowMenu(false)}
            >
                <View style={[styles.menuContainer, { backgroundColor: theme.colors.bgSurface }]}>
                    <Text style={[styles.menuTitle, { color: theme.colors.textPrimary }]}>Concierge Services</Text>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.borderSubtle }]} onPress={() => { setShowMenu(false); setShowTasks(true); }}>
                        <ListTodo size={20} color={theme.colors.textPrimary} />
                        <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>Task Manager</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.borderSubtle }]} onPress={() => { setShowMenu(false); setShowQuests(true); }}>
                        <Map size={20} color={theme.colors.textPrimary} />
                        <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>Quest Board</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.borderSubtle }]} onPress={() => { setShowMenu(false); setShowStore(true); }}>
                        <ShoppingBag size={20} color={theme.colors.textPrimary} />
                        <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>The Bank & Store</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.borderSubtle }]} onPress={() => { setShowMenu(false); setShowMembers(true); }}>
                        <Users size={20} color={theme.colors.textPrimary} />
                        <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>Family Members</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.borderSubtle }]} onPress={() => { setShowMenu(false); setShowRoutines(true); }}>
                        <CalendarIcon size={20} color={theme.colors.textPrimary} />
                        <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>Routines</Text>
                    </TouchableOpacity>

                    <View style={styles.menuSeparator} />

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.borderSubtle }]} onPress={() => { setShowMenu(false); setShowThemes(true); }}>
                        <Settings size={20} color={theme.colors.textPrimary} />
                        <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>System Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.closeMenuButton, { backgroundColor: theme.colors.textPrimary }]} onPress={() => setShowMenu(false)}>
                        <X size={24} color={theme.colors.bgSurface} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Masthead />
                <UrgentFold />
                <OvernightWire />
                <Forecast />

                <View style={styles.footer}>
                    <Star size={16} color={theme.colors.actionPrimary} />
                    <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>You are all caught up.</Text>
                    <Star size={16} color={theme.colors.actionPrimary} />
                </View>
            </ScrollView>

            {/* Concierge FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.textPrimary }]}
                onPress={() => setShowMenu(true)}
                activeOpacity={0.9}
            >
                <Menu size={24} color={theme.colors.bgSurface} />
                <Text style={[styles.fabText, { color: theme.colors.bgSurface }]}>MENU</Text>
            </TouchableOpacity>

            {/* Modals */}
            <ConciergeMenu />
            <BriefingStoreModal visible={showStore} onClose={() => setShowStore(false)} />
            <BriefingQuestModal visible={showQuests} onClose={() => setShowQuests(false)} />

            <RoutineManagerModal visible={showRoutines} onClose={() => setShowRoutines(false)} />
            <MemberManagerModal visible={showMembers} onClose={() => setShowMembers(false)} />
            <TaskManagerModal visible={showTasks} onClose={() => setShowTasks(false)} />
            <ThemeSelectorModal visible={showThemes} onClose={() => setShowThemes(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    // Masthead
    masthead: {
        marginBottom: 32,
        alignItems: 'center',
    },
    mastheadTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    dateText: {
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontSize: 12,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    weatherText: {
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontSize: 12,
    },
    greetingTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    subGreeting: {
        fontFamily: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif',
        fontStyle: 'italic',
        fontSize: 16,
        marginBottom: 24,
    },
    separator: {
        width: 40,
        height: 2,
    },
    // Sections
    section: {
        marginBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    // Urgent
    urgentCard: {
        padding: 16,
        borderRadius: 2, // Sharp corners for paper feel
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
    },
    urgentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    urgentSubtitle: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    resolveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 4,
    },
    resolveButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Wire
    wireItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    wireTime: {
        width: 60,
        alignItems: 'flex-end',
        paddingRight: 12,
        borderRightWidth: 1,
    },
    wireTimeText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    wireContent: {
        flex: 1,
        paddingLeft: 12,
    },
    wireText: {
        fontSize: 15,
        lineHeight: 22,
    },
    // Forecast
    forecastRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    forecastTime: {
        width: 70,
        fontSize: 14,
        fontWeight: '500',
    },
    forecastLine: {
        flex: 1,
        height: 1,
        marginHorizontal: 12,
    },
    forecastEvent: {
        fontSize: 15,
    },
    mealCard: {
        marginTop: 16,
        padding: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    mealText: {
        fontSize: 15,
    },
    inlineAction: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    inlineActionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        opacity: 0.6,
    },
    footerText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    // Menu Modal
    menuOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    menuContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    menuTitle: {
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
        textAlign: 'center',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontSize: 16,
        letterSpacing: 0.5,
    },
    menuSeparator: {
        height: 24,
    },
    closeMenuButton: {
        marginTop: 24,
        alignSelf: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
