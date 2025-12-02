// =========================================================
// Morning Briefing - Curated Daily Overview
// =========================================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle, Star, Plus, UtensilsCrossed, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export default function MorningBriefing() {
    const { currentTheme: theme } = useTheme();
    const { tasks, members } = useData();
    const { user } = useAuth();

    // Calculate stats
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval').length;
    const incompleteTasks = tasks.filter(t => t.status === 'Pending').length;
    const completedToday = tasks.filter(t => t.status === 'Completed').length;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <View style={[styles.container, { backgroundColor: '#F5F1E8' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>{getGreeting()}, {user?.firstName}</Text>
                <Text style={styles.subtitle}>Here's your household briefing</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Urgent Section */}
                {(pendingApprovals > 0 || incompleteTasks > 5) && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertCircle size={20} color="#EF4444" />
                            <Text style={styles.sectionTitle}>URGENT</Text>
                        </View>

                        {pendingApprovals > 0 && (
                            <TouchableOpacity style={[styles.urgentCard, { backgroundColor: '#FEE2E2' }]}>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.cardTitle, { color: '#991B1B' }]}>
                                        {pendingApprovals} Approval{pendingApprovals > 1 ? 's' : ''} Waiting
                                    </Text>
                                    <Text style={[styles.cardSubtitle, { color: '#7F1D1D' }]}>
                                        Tap to review →
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {incompleteTasks > 5 && (
                            <TouchableOpacity style={[styles.urgentCard, { backgroundColor: '#FEF3C7' }]}>
                                <View style={styles.cardContent}>
                                    <UtensilsCrossed size={24} color="#92400E" />
                                    <Text style={[styles.cardTitle, { color: '#92400E' }]}>
                                        Dinner plan needed for tonight
                                    </Text>
                                    <Text style={[styles.cardSubtitle, { color: '#78350F' }]}>
                                        Tap to plan →
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Today's Snapshot */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <CheckCircle size={20} color="#6366f1" />
                        <Text style={styles.sectionTitle}>TODAY'S SNAPSHOT</Text>
                    </View>

                    <View style={[styles.snapshotCard, { backgroundColor: '#FFF' }]}>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Tasks in progress
                            </Text>
                            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                                {incompleteTasks}
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Completed today
                            </Text>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>
                                {completedToday} ⭐
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Family members
                            </Text>
                            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                                {members.length}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Activity Feed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Star size={20} color="#F59E0B" />
                        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
                    </View>

                    {tasks.slice(0, 5).map((task) => (
                        <View key={task._id} style={[styles.activityItem, { backgroundColor: '#FFF' }]}>
                            <View style={styles.activityIcon}>
                                {task.status === 'Completed' ? (
                                    <CheckCircle size={16} color="#10B981" />
                                ) : (
                                    <AlertCircle size={16} color="#6366f1" />
                                )}
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={[styles.activityTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                    {task.title}
                                </Text>
                                <Text style={[styles.activitySubtitle, { color: theme.colors.textSecondary }]}>
                                    {task.status === 'Completed' ? 'Completed' : 'In progress'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}>
                <Plus size={24} color="#FFF" />
                <Text style={styles.fabText}>Quick Actions</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 1,
    },
    urgentCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        gap: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    snapshotCard: {
        borderRadius: 12,
        padding: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 15,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        gap: 12,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
