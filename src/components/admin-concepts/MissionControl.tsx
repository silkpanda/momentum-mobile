// =========================================================
// Mission Control - System Status UI
// =========================================================
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import {
    Activity,
    CheckCircle,
    Users,
    Package,
    Calendar,
    Settings,
    Inbox,
    ClipboardList,
    BarChart3,
} from 'lucide-react-native';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

// Import Manager Modals
import StoreManagerModal from './bento/modals/StoreManagerModal';
import RoutineManagerModal from './bento/modals/RoutineManagerModal';
import MemberManagerModal from './bento/modals/MemberManagerModal';
import TaskManagerModal from './bento/modals/TaskManagerModal';
import ThemeSelectorModal from './bento/modals/ThemeSelectorModal';

export default function MissionControl() {
    const { members, tasks, refresh, routines } = useData();
    const { currentTheme: theme } = useTheme();

    // Modal States
    const [showTasks, setShowTasks] = useState(false);
    const [showInbox, setShowInbox] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [showRoutines, setShowRoutines] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // --- System Status Logic ---
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval');
    const activeTasks = tasks.filter(t => t.status === 'Pending');

    let systemStatus = 'NOMINAL';
    let statusColor = theme.colors.signalSuccess;
    let statusMessage = 'All systems functioning normally.';

    if (pendingApprovals.length > 0) {
        systemStatus = 'ATTENTION';
        statusColor = theme.colors.signalWarning;
        statusMessage = `${pendingApprovals.length} items require approval.`;
    }

    // --- Components ---

    const StatusHeader = () => (
        <View style={[styles.header, { backgroundColor: theme.colors.bgSurface, borderLeftColor: statusColor }]}>
            <View style={styles.headerContent}>
                <Text style={[styles.statusLabel, { color: statusColor }]}>SYSTEM {systemStatus}</Text>
                <Text style={[styles.statusMessage, { color: theme.colors.textSecondary }]}>{statusMessage}</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        </View>
    );

    const DashboardStats = () => (
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{activeTasks.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Active Tasks</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.borderSubtle }]} />
            <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{members.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Members</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.borderSubtle }]} />
            <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>98%</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Efficiency</Text>
            </View>
        </View>
    );

    const ControlModule = ({
        title,
        icon: Icon,
        onPress,
        badge,
        accent = theme.colors.actionPrimary
    }: {
        title: string;
        icon: any;
        onPress: () => void;
        badge?: number;
        accent?: string;
    }) => (
        <TouchableOpacity
            style={[styles.module, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.moduleHeader}>
                <Icon size={24} color={theme.colors.textSecondary} />
                {badge ? (
                    <View style={[styles.badge, { backgroundColor: accent }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.textInverse }]}>{badge}</Text>
                    </View>
                ) : null}
            </View>
            <Text style={[styles.moduleTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            <View style={styles.content}>
                <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Mission Control</Text>

                <StatusHeader />
                <DashboardStats />

                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>COMMAND DECK</Text>
                <View style={styles.grid}>
                    <ControlModule
                        title="Tasks"
                        icon={ClipboardList}
                        onPress={() => setShowTasks(true)}
                    />
                    <ControlModule
                        title="Inbox"
                        icon={Inbox}
                        badge={pendingApprovals.length > 0 ? pendingApprovals.length : undefined}
                        accent={theme.colors.signalWarning}
                        onPress={() => setShowInbox(true)}
                    />
                    <ControlModule
                        title="Members"
                        icon={Users}
                        onPress={() => setShowMembers(true)}
                    />
                    <ControlModule
                        title="Store"
                        icon={Package}
                        onPress={() => setShowStore(true)}
                    />
                    <ControlModule
                        title="Routines"
                        icon={Calendar}
                        onPress={() => setShowRoutines(true)}
                    />
                    <ControlModule
                        title="Settings"
                        icon={Settings}
                        onPress={() => setShowSettings(true)}
                    />
                </View>
            </View>

            {/* Modals */}
            <TaskManagerModal visible={showTasks || showInbox} onClose={() => { setShowTasks(false); setShowInbox(false); }} />
            <MemberManagerModal visible={showMembers} onClose={() => setShowMembers(false)} />
            <StoreManagerModal visible={showStore} onClose={() => setShowStore(false)} />
            <RoutineManagerModal visible={showRoutines} onClose={() => setShowRoutines(false)} />
            <ThemeSelectorModal visible={showSettings} onClose={() => setShowSettings(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    content: {
        padding: 24,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    // Header
    header: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    headerContent: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
    },
    statusMessage: {
        fontSize: 14,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 16,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 20,
        marginBottom: 32,
        alignItems: 'center',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 32,
    },
    // Grid
    sectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    module: {
        width: '48%',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
