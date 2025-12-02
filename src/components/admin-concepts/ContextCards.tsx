// =========================================================
// Context Cards - Job-Focused Card Stack
// =========================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { CheckSquare, Shield, UtensilsCrossed, DollarSign, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

type CardId = 'tasks' | 'approvals' | 'meals' | 'bank';

interface ContextCard {
    id: CardId;
    title: string;
    icon: React.ReactNode;
    color: string;
    urgent?: boolean;
}

export default function ContextCards() {
    const { currentTheme: theme } = useTheme();
    const { tasks, members } = useData();
    const [activeCard, setActiveCard] = useState<CardId | null>(null);

    // Calculate urgency
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval').length;
    const incompleteTasks = tasks.filter(t => t.status === 'Pending').length;

    const cards: ContextCard[] = [
        {
            id: 'tasks',
            title: 'Tasks & Chores',
            icon: <CheckSquare size={24} color="#FFF" />,
            color: '#6366f1'
        },
        {
            id: 'approvals',
            title: 'Approvals',
            icon: <Shield size={24} color="#FFF" />,
            color: pendingApprovals > 0 ? '#F59E0B' : '#8B5CF6',
            urgent: pendingApprovals > 0
        },
        {
            id: 'meals',
            title: 'Meal Planner',
            icon: <UtensilsCrossed size={24} color="#FFF" />,
            color: '#10B981'
        },
        {
            id: 'bank',
            title: 'Bank & Store',
            icon: <DollarSign size={24} color="#FFF" />,
            color: '#F59E0B'
        },
    ];

    // Sort cards - urgent ones float to top
    const sortedCards = [...cards].sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return 0;
    });

    const renderCardContent = (cardId: CardId) => {
        switch (cardId) {
            case 'tasks':
                return (
                    <View style={styles.cardContent}>
                        <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>
                            Active Tasks ({incompleteTasks})
                        </Text>
                        <TouchableOpacity style={[styles.quickAddButton, { backgroundColor: theme.colors.actionPrimary }]}>
                            <Text style={styles.quickAddText}>+ Quick Add Task</Text>
                        </TouchableOpacity>
                        {tasks.slice(0, 6).map((task) => (
                            <View key={task._id} style={[styles.taskItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                    {task.title}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: task.status === 'Completed' ? '#10B981' : '#6366f1' }]}>
                                    <Text style={styles.statusText}>{task.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                );
            case 'approvals':
                return (
                    <View style={styles.cardContent}>
                        <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>
                            Pending Approvals ({pendingApprovals})
                        </Text>
                        {pendingApprovals === 0 ? (
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                All caught up! 🎉
                            </Text>
                        ) : (
                            tasks.filter(t => t.status === 'PendingApproval').map((task) => (
                                <View key={task._id} style={[styles.approvalItem, { borderBottomColor: theme.colors.borderSubtle }]}>
                                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                                        {task.title}
                                    </Text>
                                    <View style={styles.approvalActions}>
                                        <TouchableOpacity style={[styles.approveButton, { backgroundColor: '#10B981' }]}>
                                            <Text style={styles.buttonText}>Approve</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.rejectButton, { backgroundColor: '#EF4444' }]}>
                                            <Text style={styles.buttonText}>Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                );
            case 'meals':
                return (
                    <View style={styles.cardContent}>
                        <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>
                            This Week's Menu
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Meal planning coming soon...
                        </Text>
                    </View>
                );
            case 'bank':
                return (
                    <View style={styles.cardContent}>
                        <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>
                            Family Bank
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Points ledger and store management coming soon...
                        </Text>
                    </View>
                );
        }
    };

    // If a card is active, show it full screen
    if (activeCard) {
        const card = cards.find(c => c.id === activeCard)!;
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                {/* Active Card */}
                <View style={[styles.activeCardContainer, { backgroundColor: card.color }]}>
                    {/* Card Header */}
                    <View style={styles.activeCardHeader}>
                        <View style={styles.headerLeft}>
                            {card.icon}
                            <Text style={styles.activeCardTitle}>{card.title}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setActiveCard(null)} style={styles.closeButton}>
                            <X size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Card Content */}
                    <View style={[styles.activeCardBody, { backgroundColor: theme.colors.bgSurface }]}>
                        <ScrollView style={styles.scrollContent}>
                            {renderCardContent(activeCard)}
                        </ScrollView>
                    </View>
                </View>
            </View>
        );
    }

    // Resting state - show card stack at bottom
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
            {/* Empty state message */}
            <View style={styles.emptyState}>
                <Text style={[styles.emptyStateTitle, { color: theme.colors.textPrimary }]}>
                    Select a card to get started
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                    Tap any card below to open it
                </Text>
            </View>

            {/* Card Stack at Bottom */}
            <View style={styles.cardStack}>
                {sortedCards.map((card, index) => (
                    <TouchableOpacity
                        key={card.id}
                        style={[
                            styles.cardPeek,
                            {
                                backgroundColor: card.color,
                                bottom: index * 60,
                                zIndex: sortedCards.length - index,
                            }
                        ]}
                        onPress={() => setActiveCard(card.id)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.cardPeekContent}>
                            {card.icon}
                            <Text style={styles.cardPeekTitle}>{card.title}</Text>
                            {card.urgent && (
                                <View style={styles.urgentBadge}>
                                    <Text style={styles.urgentText}>!</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    cardStack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    cardPeek: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 60,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cardPeekContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 12,
    },
    cardPeekTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    urgentBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    urgentText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activeCardContainer: {
        flex: 1,
    },
    activeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: 50,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    activeCardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    closeButton: {
        padding: 8,
    },
    activeCardBody: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: 12,
    },
    scrollContent: {
        flex: 1,
    },
    cardContent: {
        padding: 20,
    },
    contentTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
    quickAddButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    quickAddText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    taskTitle: {
        flex: 1,
        fontSize: 15,
        marginRight: 12,
    },
    statusBadge: {
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
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});
