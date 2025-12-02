// =========================================================
// Bento Command Center - Widget-based Admin Dashboard
// =========================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CheckCircle, AlertCircle, Users, Calendar, DollarSign, Plus, Zap, Trophy, Settings, Clock, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/api';
import BentoCreateTaskModal from './bento/modals/BentoCreateTaskModal';
import TaskManagerModal from './bento/modals/TaskManagerModal';
import ApprovalsModal from './bento/modals/ApprovalsModal';
import MemberDetailModal from './bento/modals/MemberDetailModal';
import StoreManagerModal from './bento/modals/StoreManagerModal';
import RoutineManagerModal from './bento/modals/RoutineManagerModal';
import MemberManagerModal from './bento/modals/MemberManagerModal';
import ThemeSelectorModal from './bento/modals/ThemeSelectorModal';

export default function BentoCommandCenter() {
    const navigation = useNavigation();
    const { currentTheme: theme } = useTheme();
    const { members, tasks, quests, refresh } = useData();

    // Modal states
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showApprovals, setShowApprovals] = useState(false);
    const [showTaskManager, setShowTaskManager] = useState(false);
    const [showMemberDetail, setShowMemberDetail] = useState(false);
    const [showStoreManager, setShowStoreManager] = useState(false);
    const [showRoutineManager, setShowRoutineManager] = useState(false);
    const [showMemberManager, setShowMemberManager] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);

    // Calculate stats
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval');
    const activeTasks = tasks.filter(t => t.status === 'Pending').length;
    const totalPoints = members.reduce((sum, m) => sum + ((m as any).points || 0), 0);
    const activeQuests = quests.filter(q => q.isActive).length;

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning! ☀️';
        if (hour < 18) return 'Good Afternoon! 👋';
        return 'Good Evening! 🌙';
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Dashboard</Text>
                    <TouchableOpacity
                        style={[styles.settingsButton, { backgroundColor: theme.colors.bgCanvas }]}
                        onPress={() => setShowThemeSelector(true)}
                    >
                        <Settings size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.grid}>
                    {/* Hero Brief - Large Widget */}
                    <TouchableOpacity
                        style={[styles.widgetLarge, { backgroundColor: theme.colors.actionPrimary }]}
                        activeOpacity={0.8}
                        onPress={() => setShowCreateTask(true)}
                    >
                        <Text style={styles.heroGreeting}>{getGreeting()}</Text>
                        <Text style={styles.heroStat}>{activeTasks} Active Tasks</Text>
                        <Text style={styles.heroSubtext}>Tap to create a new task</Text>
                    </TouchableOpacity>

                    {/* Approvals Widget */}
                    <TouchableOpacity
                        style={[styles.widgetStandard, { backgroundColor: pendingApprovals.length > 0 ? '#F59E0B' : theme.colors.bgCanvas, borderWidth: pendingApprovals.length === 0 ? 1 : 0, borderColor: theme.colors.borderSubtle }]}
                        activeOpacity={0.8}
                        onPress={() => setShowApprovals(true)}
                    >
                        <View style={styles.widgetHeader}>
                            <AlertCircle size={24} color={pendingApprovals.length > 0 ? '#FFF' : theme.colors.textPrimary} />
                            <Text style={[styles.widgetTitle, { color: pendingApprovals.length > 0 ? '#FFF' : theme.colors.textPrimary }]}>
                                Approvals
                            </Text>
                        </View>
                        <Text style={[styles.widgetValue, { color: pendingApprovals.length > 0 ? '#FFF' : theme.colors.textPrimary }]}>
                            {pendingApprovals.length}
                        </Text>
                        <Text style={[styles.widgetSubtext, { color: pendingApprovals.length > 0 ? '#FFF' : theme.colors.textSecondary }]}>
                            {pendingApprovals.length > 0 ? 'Needs attention' : 'All caught up'}
                        </Text>
                    </TouchableOpacity>

                    {/* The Bank Widget */}
                    <TouchableOpacity
                        style={[styles.widgetStandard, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                        activeOpacity={0.8}
                        onPress={() => setShowStoreManager(true)}
                    >
                        <View style={styles.widgetHeader}>
                            <DollarSign size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>The Bank</Text>
                        </View>
                        <Text style={[styles.widgetValue, { color: theme.colors.textPrimary }]}>{totalPoints}</Text>
                        <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary }]}>Total points</Text>
                    </TouchableOpacity>

                    {/* Routines Widget */}
                    <TouchableOpacity
                        style={[styles.widgetStandard, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                        activeOpacity={0.8}
                        onPress={() => setShowRoutineManager(true)}
                    >
                        <View style={styles.widgetHeader}>
                            <Clock size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Routines</Text>
                        </View>
                        <Text style={[styles.widgetValue, { color: theme.colors.textPrimary }]}>
                            {useData().routines.length}
                        </Text>
                        <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary }]}>Active routines</Text>
                    </TouchableOpacity>

                    {/* Members Widget */}
                    <TouchableOpacity
                        style={[styles.widgetStandard, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                        activeOpacity={0.8}
                        onPress={() => setShowMemberManager(true)}
                    >
                        <View style={styles.widgetHeader}>
                            <Users size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Members</Text>
                        </View>
                        <Text style={[styles.widgetValue, { color: theme.colors.textPrimary }]}>{members.length}</Text>
                        <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary }]}>Family members</Text>
                    </TouchableOpacity>

                    {/* Calendar Widget - Full Width */}
                    <TouchableOpacity
                        style={[styles.widgetLarge, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle, height: 120, marginBottom: 0 }]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('ParentCalendar' as never)}
                    >
                        <View style={styles.widgetHeader}>
                            <Calendar size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Family Calendar</Text>
                        </View>
                        <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                            View and manage the family schedule.
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                            <Text style={{ color: theme.colors.actionPrimary, fontWeight: '600' }}>Open Calendar</Text>
                            <ArrowRight size={16} color={theme.colors.actionPrimary} style={{ marginLeft: 4 }} />
                        </View>
                    </TouchableOpacity>

                    {/* Task Master Widget - Tall */}
                    <View
                        style={[styles.widgetTall, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                    >
                        <TouchableOpacity
                            style={styles.widgetHeader}
                            onPress={() => setShowTaskManager(true)}
                            activeOpacity={0.7}
                        >
                            <CheckCircle size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Recent Tasks</Text>
                        </TouchableOpacity>
                        <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                            {tasks.slice(0, 6).map((task) => (
                                <View key={task._id} style={[styles.taskItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                    <Text style={[styles.taskText, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                        {task.title}
                                    </Text>
                                    <View style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                task.status === 'Completed' ? '#10B981' :
                                                    task.status === 'PendingApproval' ? '#F59E0B' :
                                                        theme.colors.actionPrimary
                                        }
                                    ]}>
                                        <Text style={styles.statusText}>{task.status}</Text>
                                    </View>
                                </View>
                            ))}
                            {tasks.length === 0 && (
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No tasks yet. Tap the + button to create one!
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Quests Widget - Tall */}
                    <TouchableOpacity
                        style={[styles.widgetTall, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                        activeOpacity={0.8}
                    >
                        <View style={styles.widgetHeader}>
                            <Trophy size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Active Quests</Text>
                        </View>
                        <Text style={[styles.widgetValue, { color: theme.colors.textPrimary }]}>{activeQuests}</Text>
                        <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary }]}>
                            {activeQuests === 0 ? 'No active quests' : `${activeQuests} available`}
                        </Text>
                    </TouchableOpacity>



                    {/* Family Pulse Widget - Wide */}
                    <View style={[styles.widgetWide, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}>
                        <View style={styles.widgetHeader}>
                            <Zap size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Family Pulse</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.memberScrollContent}
                        >
                            {members.map((member) => {
                                const memberTasks = tasks.filter(t =>
                                    t.assignedTo.includes(member.id || member._id || '') &&
                                    t.status === 'Pending'
                                );
                                const focusTask = member.focusedTaskId
                                    ? tasks.find(t => t._id === member.focusedTaskId)
                                    : null;

                                return (
                                    <TouchableOpacity
                                        key={member.id || member._id}
                                        style={[styles.memberCard, { backgroundColor: theme.colors.bgSurface }]}
                                        onPress={() => {
                                            setSelectedMember(member);
                                            setShowMemberDetail(true);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        {/* Member Avatar */}
                                        <View style={[
                                            styles.memberAvatarLarge,
                                            { backgroundColor: member.profileColor || theme.colors.actionPrimary }
                                        ]}>
                                            <Text style={styles.memberAvatarText}>
                                                {member.firstName.charAt(0)}
                                            </Text>
                                            {focusTask && (
                                                <View style={[styles.focusBadge, { backgroundColor: '#F59E0B' }]}>
                                                    <Zap size={10} color="#FFF" />
                                                </View>
                                            )}
                                        </View>

                                        {/* Member Name */}
                                        <Text style={[styles.memberCardName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                            {member.firstName}
                                        </Text>

                                        {/* Stats */}
                                        <View style={styles.memberCardStats}>
                                            <View style={styles.memberCardStat}>
                                                <Text style={[styles.memberCardStatValue, { color: theme.colors.actionPrimary }]}>
                                                    {memberTasks.length}
                                                </Text>
                                                <Text style={[styles.memberCardStatLabel, { color: theme.colors.textSecondary }]}>
                                                    tasks
                                                </Text>
                                            </View>
                                            <View style={styles.memberCardStat}>
                                                <Text style={[styles.memberCardStatValue, { color: theme.colors.actionPrimary }]}>
                                                    {member.pointsTotal || 0}
                                                </Text>
                                                <Text style={[styles.memberCardStatLabel, { color: theme.colors.textSecondary }]}>
                                                    pts
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Focus Task Indicator */}
                                        {focusTask && (
                                            <View style={[styles.focusIndicator, { backgroundColor: '#FEF3C7' }]}>
                                                <Zap size={12} color="#F59E0B" />
                                                <Text style={[styles.focusText, { color: '#92400E' }]} numberOfLines={1}>
                                                    {focusTask.title}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}
                onPress={() => setShowCreateTask(true)}
            >
                <Plus size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Modals */}
            <BentoCreateTaskModal
                visible={showCreateTask}
                onClose={() => setShowCreateTask(false)}
                onTaskCreated={async () => {
                    await refresh();
                    setShowCreateTask(false);
                }}
                members={members}
            />

            {/* Approvals Modal */}
            <ApprovalsModal
                visible={showApprovals}
                onClose={() => setShowApprovals(false)}
            />

            {/* Task Manager Modal */}
            <TaskManagerModal
                visible={showTaskManager}
                onClose={() => setShowTaskManager(false)}
            />

            {/* Store Manager Modal */}
            <StoreManagerModal
                visible={showStoreManager}
                onClose={() => setShowStoreManager(false)}
            />

            {/* Routine Manager Modal */}
            <RoutineManagerModal
                visible={showRoutineManager}
                onClose={() => setShowRoutineManager(false)}
            />

            {/* Member Manager Modal */}
            <MemberManagerModal
                visible={showMemberManager}
                onClose={() => setShowMemberManager(false)}
            />

            {/* Theme Selector Modal */}
            <ThemeSelectorModal
                visible={showThemeSelector}
                onClose={() => setShowThemeSelector(false)}
            />

            {/* Member Detail Modal */}
            <MemberDetailModal
                visible={showMemberDetail}
                onClose={() => {
                    setShowMemberDetail(false);
                    setSelectedMember(null);
                }}
                member={selectedMember}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    settingsButton: {
        padding: 10,
        borderRadius: 12,
    },
    grid: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    widgetLarge: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        padding: 20,
        justifyContent: 'center',
    },
    widgetStandard: {
        width: '48%',
        height: 140,
        borderRadius: 16,
        padding: 16,
    },
    widgetTall: {
        width: '48%',
        height: 300,
        borderRadius: 16,
        padding: 16,
    },
    widgetWide: {
        width: '100%',
        minHeight: 200,
        borderRadius: 16,
        padding: 16,
    },
    memberScrollContent: {
        gap: 12,
        paddingRight: 16,
    },
    memberCard: {
        width: 140,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        gap: 8,
    },
    memberAvatarLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    memberAvatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    focusBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberCardName: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    memberCardStats: {
        flexDirection: 'row',
        gap: 12,
    },
    memberCardStat: {
        alignItems: 'center',
    },
    memberCardStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    memberCardStatLabel: {
        fontSize: 11,
    },
    focusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        width: '100%',
    },
    focusText: {
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    },
    heroGreeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    heroStat: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    heroSubtext: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    widgetTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    widgetValue: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    widgetSubtext: {
        fontSize: 12,
    },
    taskList: {
        flex: 1,
        marginTop: 8,
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    taskText: {
        flex: 1,
        fontSize: 13,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    approvalsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    approvalsModal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        padding: 20,
    },
    approvalsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    approvalsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    approvalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    approvalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    approvalPoints: {
        fontSize: 13,
    },
    approvalActions: {
        flexDirection: 'row',
        gap: 8,
    },
    approveButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyApprovals: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});
