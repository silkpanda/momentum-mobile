// =========================================================
// Mission Control - Command Panel Interface
// =========================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CheckSquare, Shield, Users, ShoppingBag, UtensilsCrossed, Settings } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

type PanelId = 'tasks' | 'approvals' | 'crew' | 'rewards' | 'meals' | 'settings';

interface Panel {
    id: PanelId;
    title: string;
    icon: React.ReactNode;
    color: string;
    count?: number;
    urgent?: boolean;
}

export default function MissionControl() {
    const { currentTheme: theme } = useTheme();
    const { tasks, members } = useData();
    const [activePanel, setActivePanel] = useState<PanelId>('tasks');

    // Calculate stats
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval').length;
    const incompleteTasks = tasks.filter(t => t.status === 'Pending').length;

    // Overall system status
    const getSystemStatus = () => {
        if (pendingApprovals > 0) return { color: '#EF4444', text: 'URGENT', icon: '🔴' };
        if (incompleteTasks > 5) return { color: '#F59E0B', text: 'ATTENTION NEEDED', icon: '🟡' };
        return { color: '#10B981', text: 'NOMINAL', icon: '🟢' };
    };

    const systemStatus = getSystemStatus();

    const panels: Panel[] = [
        {
            id: 'tasks',
            title: 'TASKS',
            icon: <CheckSquare size={20} color="#FFF" />,
            color: '#6366f1',
            count: incompleteTasks,
        },
        {
            id: 'approvals',
            title: 'APPROVALS',
            icon: <Shield size={20} color="#FFF" />,
            color: '#8B5CF6',
            count: pendingApprovals,
            urgent: pendingApprovals > 0,
        },
        {
            id: 'crew',
            title: 'CREW',
            icon: <Users size={20} color="#FFF" />,
            color: '#10B981',
            count: members.length,
        },
        {
            id: 'rewards',
            title: 'REWARDS',
            icon: <ShoppingBag size={20} color="#FFF" />,
            color: '#F59E0B',
        },
        {
            id: 'meals',
            title: 'MEALS',
            icon: <UtensilsCrossed size={20} color="#FFF" />,
            color: '#14B8A6',
        },
        {
            id: 'settings',
            title: 'SETTINGS',
            icon: <Settings size={20} color="#FFF" />,
            color: '#6B7280',
        },
    ];

    const renderPanelContent = (panelId: PanelId) => {
        switch (panelId) {
            case 'tasks':
                return (
                    <View style={styles.panelContent}>
                        <TouchableOpacity style={[styles.createButton, { backgroundColor: '#6366f1' }]}>
                            <Text style={styles.createButtonText}>+ CREATE TASK</Text>
                        </TouchableOpacity>
                        {tasks.slice(0, 8).map((task) => (
                            <View key={task._id} style={[styles.listItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                <Text style={[styles.listItemText, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                    {task.title}
                                </Text>
                                <View style={[styles.taskStatusBadge, { backgroundColor: task.status === 'Completed' ? '#10B981' : '#6366f1' }]}>
                                    <Text style={styles.statusText}>{task.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                );
            case 'approvals':
                return (
                    <View style={styles.panelContent}>
                        <Text style={[styles.panelTitle, { color: theme.colors.textPrimary }]}>
                            Pending Approvals ({pendingApprovals})
                        </Text>
                        {pendingApprovals === 0 ? (
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                All systems clear! 🎯
                            </Text>
                        ) : (
                            tasks.filter(t => t.status === 'PendingApproval').map((task) => (
                                <View key={task._id} style={[styles.approvalItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                    <Text style={[styles.listItemText, { color: theme.colors.textPrimary }]}>
                                        {task.title}
                                    </Text>
                                    <View style={styles.approvalActions}>
                                        <TouchableOpacity style={[styles.approveButton, { backgroundColor: '#10B981' }]}>
                                            <Text style={styles.buttonText}>APPROVE</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.rejectButton, { backgroundColor: '#EF4444' }]}>
                                            <Text style={styles.buttonText}>REJECT</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                );
            case 'crew':
                return (
                    <View style={styles.panelContent}>
                        <Text style={[styles.panelTitle, { color: theme.colors.textPrimary }]}>
                            Crew Members ({members.length})
                        </Text>
                        {members.map((member) => (
                            <View key={member._id} style={[styles.listItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                <Text style={[styles.listItemText, { color: theme.colors.textPrimary }]}>
                                    {member.firstName} {member.lastName}
                                </Text>
                                <Text style={[styles.pointsText, { color: theme.colors.textSecondary }]}>
                                    {(member as any).points || 0} pts
                                </Text>
                            </View>
                        ))}
                    </View>
                );
            default:
                return (
                    <View style={styles.panelContent}>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            {panelId.charAt(0).toUpperCase() + panelId.slice(1)} panel coming soon...
                        </Text>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: '#1F2937' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>MISSION CONTROL</Text>
                <View style={[styles.statusBadge, { backgroundColor: systemStatus.color }]}>
                    <Text style={styles.statusBadgeText}>
                        {systemStatus.icon} {systemStatus.text}
                    </Text>
                </View>
            </View>

            {/* Control Panels */}
            <View style={styles.panelGrid}>
                {panels.map((panel) => (
                    <TouchableOpacity
                        key={panel.id}
                        style={[
                            styles.panel,
                            {
                                backgroundColor: activePanel === panel.id ? panel.color : '#374151',
                                borderColor: activePanel === panel.id ? panel.color : '#4B5563',
                            }
                        ]}
                        onPress={() => setActivePanel(panel.id)}
                    >
                        <View style={styles.panelIcon}>
                            {panel.icon}
                        </View>
                        <Text style={styles.panelLabel}>{panel.title}</Text>
                        {panel.count !== undefined && (
                            <View style={[
                                styles.countBadge,
                                { backgroundColor: panel.urgent ? '#EF4444' : 'rgba(255,255,255,0.2)' }
                            ]}>
                                <Text style={styles.countText}>{panel.count}</Text>
                            </View>
                        )}
                        {panel.urgent && (
                            <View style={styles.pulseIndicator} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Active Panel View */}
            <View style={[styles.activeView, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={styles.activeViewHeader}>
                    <Text style={[styles.activeViewTitle, { color: theme.colors.textPrimary }]}>
                        {panels.find(p => p.id === activePanel)?.title}
                    </Text>
                </View>
                <ScrollView style={styles.activeViewContent}>
                    {renderPanelContent(activePanel)}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    panelGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    panel: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 2,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    panelIcon: {
        marginBottom: 8,
    },
    panelLabel: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    countBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    countText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    pulseIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    activeView: {
        flex: 1,
        marginTop: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    activeViewHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    activeViewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    activeViewContent: {
        flex: 1,
    },
    panelContent: {
        padding: 20,
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    createButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    listItemText: {
        flex: 1,
        fontSize: 15,
        marginRight: 12,
    },
    taskStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    approvalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    approvalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    approveButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});
