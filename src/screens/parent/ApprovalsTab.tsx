import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Clock, Settings, ArrowRight } from 'lucide-react-native';
import { Task } from '../../types';
import { useData } from '../../contexts/DataContext';

export default function ApprovalsTab() {
    const { user } = useAuth();
    const { householdId } = useData();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currentTheme: theme } = useTheme();

    const loadData = async () => {
        try {
            const [tasksResponse, linksResponse] = await Promise.all([
                api.getTasks(),
                api.getHouseholdLinks().catch(err => ({ data: { links: [] } }))
            ]);

            if (tasksResponse.data && tasksResponse.data.tasks) {
                // Filter for tasks that are pending approval
                const pendingApproval = tasksResponse.data.tasks.filter(
                    (task: Task) => task.status === 'PendingApproval'
                );
                setTasks(pendingApproval);
            } else {
                setTasks([]);
            }

            // Process Proposals
            if (linksResponse.data && linksResponse.data.links) {
                const allProposals: any[] = [];
                linksResponse.data.links.forEach((link: any) => {
                    if (link.pendingChanges) {
                        const pending = link.pendingChanges.filter((change: any) =>
                            change.status === 'pending' &&
                            change.proposedByHousehold !== householdId
                        );
                        // Add linkId and childName to the change object for context
                        pending.forEach((p: any) => {
                            allProposals.push({
                                ...p,
                                linkId: link._id,
                                childName: link.childId?.firstName || 'Child',
                                otherHousehold: link.household1._id === householdId ? link.household2?.householdName : link.household1?.householdName
                            });
                        });
                    }
                });
                setProposals(allProposals);
            } else {
                setProposals([]);
            }
        } catch (error) {
            console.error('Error loading approvals:', error);
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

    const handleApprove = async (taskId: string) => {
        try {
            await api.approveTask(taskId);
            loadData();
        } catch (error) {
            console.error('Error approving task:', error);
            Alert.alert('Error', 'Failed to approve task');
        }
    };

    const handleReject = async (taskId: string) => {
        Alert.alert(
            'Reject Task',
            'Are you sure you want to reject this task? The child will need to complete it again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Reset task to Pending status
                            await api.updateTask(taskId, { status: 'Pending', completedBy: null });
                            loadData();
                        } catch (error) {
                            console.error('Error rejecting task:', error);
                            Alert.alert('Error', 'Failed to reject task');
                        }
                    }
                }
            ]
        );
    };

    const handleApproveProposal = async (linkId: string, changeId: string) => {
        try {
            await api.approveChange(linkId, changeId);
            Alert.alert('Success', 'Setting change approved');
            loadData();
        } catch (error) {
            console.error('Error approving proposal:', error);
            Alert.alert('Error', 'Failed to approve change');
        }
    };

    const handleRejectProposal = async (linkId: string, changeId: string) => {
        try {
            await api.rejectChange(linkId, changeId);
            loadData();
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            Alert.alert('Error', 'Failed to reject change');
        }
    };

    if (isLoading && !tasks.length) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Approvals</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Review completed tasks
                </Text>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        {proposals.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Household Proposals</Text>
                                {proposals.map((proposal, index) => (
                                    <View key={index} style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.taskInfo}>
                                                <View style={styles.proposalHeader}>
                                                    <Settings size={20} color={theme.colors.actionPrimary} />
                                                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                                                        {proposal.setting.charAt(0).toUpperCase() + proposal.setting.slice(1)} Settings
                                                    </Text>
                                                </View>
                                                <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                                                    {proposal.otherHousehold || 'Other Household'} proposes to change {proposal.setting} to:
                                                </Text>
                                                <View style={styles.changeRow}>
                                                    <Text style={[styles.valueText, { color: theme.colors.textSecondary, textDecorationLine: 'line-through' }]}>
                                                        {proposal.currentValue}
                                                    </Text>
                                                    <ArrowRight size={16} color={theme.colors.textSecondary} />
                                                    <Text style={[styles.valueText, { color: theme.colors.actionPrimary, fontWeight: 'bold' }]}>
                                                        {proposal.proposedValue}
                                                    </Text>
                                                </View>
                                                <Text style={[styles.childName, { color: theme.colors.textTertiary }]}>
                                                    For: {proposal.childName}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={[styles.button, styles.rejectButton, { borderColor: theme.colors.signalAlert }]}
                                                onPress={() => handleRejectProposal(proposal.linkId, proposal._id)}
                                            >
                                                <XCircle size={20} color={theme.colors.signalAlert} />
                                                <Text style={[styles.buttonText, { color: theme.colors.signalAlert }]}>
                                                    Reject
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.button, styles.approveButton, { backgroundColor: theme.colors.signalSuccess }]}
                                                onPress={() => handleApproveProposal(proposal.linkId, proposal._id)}
                                            >
                                                <CheckCircle size={20} color="#FFFFFF" />
                                                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                                    Approve
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 24, marginBottom: 8 }]}>Task Approvals</Text>
                            </View>
                        )}
                    </>
                }
                data={tasks}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.taskInfo}>
                                <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                                    {item.title}
                                </Text>
                                {item.description && (
                                    <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                                <View style={styles.metaRow}>
                                    <View style={styles.pointsBadge}>
                                        <Text style={[styles.pointsText, { color: theme.colors.actionPrimary }]}>
                                            +{item.value} pts
                                        </Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Clock size={14} color="#F59E0B" />
                                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                                            Pending Approval
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.rejectButton, { borderColor: theme.colors.signalAlert }]}
                                onPress={() => handleReject(item._id || item.id)}
                            >
                                <XCircle size={20} color={theme.colors.signalAlert} />
                                <Text style={[styles.buttonText, { color: theme.colors.signalAlert }]}>
                                    Reject
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.approveButton, { backgroundColor: theme.colors.signalSuccess }]}
                                onPress={() => handleApprove(item._id || item.id)}
                            >
                                <CheckCircle size={20} color="#FFFFFF" />
                                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                    Approve
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <CheckCircle size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No tasks waiting for approval
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Tasks will appear here when children mark them complete
                        </Text>
                    </View>
                }
            />
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
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: 16,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    pointsBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    rejectButton: {
        borderWidth: 1,
    },
    approveButton: {
        // backgroundColor set inline
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    proposalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    changeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '500',
    },
    childName: {
        fontSize: 12,
        marginTop: 4,
    },
});
