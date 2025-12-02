// =========================================================
// Bento Command Center - Widget-based Admin Dashboard
// =========================================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Users, Calendar, DollarSign } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

export default function BentoCommandCenter() {
    const { currentTheme: theme } = useTheme();
    const { members, tasks, quests } = useData();

    // Calculate stats
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval').length;
    const activeTasks = tasks.filter(t => t.status === 'Pending').length;
    const totalPoints = members.reduce((sum, m) => sum + ((m as any).points || 0), 0);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={styles.grid}>
                {/* Hero Brief - Large Widget */}
                <TouchableOpacity
                    style={[styles.widgetLarge, { backgroundColor: theme.colors.actionPrimary }]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.heroGreeting}>Good Morning! 👋</Text>
                    <Text style={styles.heroStat}>{activeTasks} Active Tasks</Text>
                    <Text style={styles.heroSubtext}>Everything's on track</Text>
                </TouchableOpacity>

                {/* Approvals Widget */}
                <TouchableOpacity
                    style={[styles.widgetStandard, { backgroundColor: pendingApprovals > 0 ? '#F59E0B' : theme.colors.bgCanvas }]}
                    activeOpacity={0.8}
                >
                    <View style={styles.widgetHeader}>
                        <AlertCircle size={24} color={pendingApprovals > 0 ? '#FFF' : theme.colors.textPrimary} />
                        <Text style={[styles.widgetTitle, { color: pendingApprovals > 0 ? '#FFF' : theme.colors.textPrimary }]}>
                            Approvals
                        </Text>
                    </View>
                    <Text style={[styles.widgetValue, { color: pendingApprovals > 0 ? '#FFF' : theme.colors.textPrimary }]}>
                        {pendingApprovals}
                    </Text>
                    <Text style={[styles.widgetSubtext, { color: pendingApprovals > 0 ? '#FFF' : theme.colors.textSecondary }]}>
                        {pendingApprovals > 0 ? 'Needs attention' : 'All caught up'}
                    </Text>
                </TouchableOpacity>

                {/* The Bank Widget */}
                <TouchableOpacity
                    style={[styles.widgetStandard, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                    activeOpacity={0.8}
                >
                    <View style={styles.widgetHeader}>
                        <DollarSign size={24} color={theme.colors.actionPrimary} />
                        <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>The Bank</Text>
                    </View>
                    <Text style={[styles.widgetValue, { color: theme.colors.textPrimary }]}>{totalPoints}</Text>
                    <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary }]}>Total points</Text>
                </TouchableOpacity>

                {/* Task Master Widget - Tall */}
                <TouchableOpacity
                    style={[styles.widgetTall, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                    activeOpacity={0.8}
                >
                    <View style={styles.widgetHeader}>
                        <CheckCircle size={24} color={theme.colors.actionPrimary} />
                        <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Task Master</Text>
                    </View>
                    <View style={styles.taskList}>
                        {tasks.slice(0, 5).map((task, index) => (
                            <View key={task._id} style={[styles.taskItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                <Text style={[styles.taskText, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                    {task.title}
                                </Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: task.status === 'Completed' ? '#10B981' : theme.colors.actionPrimary }
                                ]}>
                                    <Text style={styles.statusText}>{task.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>

                {/* Meal Planner Widget - Wide */}
                <TouchableOpacity
                    style={[styles.widgetWide, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                    activeOpacity={0.8}
                >
                    <View style={styles.widgetHeader}>
                        <Calendar size={24} color={theme.colors.actionPrimary} />
                        <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Meal Planner</Text>
                    </View>
                    <Text style={[styles.mealText, { color: theme.colors.textSecondary }]}>Tonight's Dinner</Text>
                    <Text style={[styles.mealName, { color: theme.colors.textPrimary }]}>Tap to decide</Text>
                </TouchableOpacity>

                {/* Members Widget */}
                <TouchableOpacity
                    style={[styles.widgetStandard, { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }]}
                    activeOpacity={0.8}
                >
                    <View style={styles.widgetHeader}>
                        <Users size={24} color={theme.colors.actionPrimary} />
                        <Text style={[styles.widgetTitle, { color: theme.colors.textPrimary }]}>Members</Text>
                    </View>
                    <Text style={[styles.widgetValue, { color: theme.colors.textPrimary }]}>{members.length}</Text>
                    <Text style={[styles.widgetSubtext, { color: theme.colors.textSecondary }]}>Family members</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        height: 120,
        borderRadius: 16,
        padding: 16,
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
        textTransform: 'capitalize',
    },
    mealText: {
        fontSize: 12,
        marginBottom: 4,
    },
    mealName: {
        fontSize: 18,
        fontWeight: '600',
    },
});
