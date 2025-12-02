import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListTodo, Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import BentoCard from '../BentoCard';
import { useData } from '../../../contexts/DataContext';
import { bentoPalette, spacing, typography } from '../../../theme/bentoTokens';

export default function TaskMasterWidget() {
    const { tasks } = useData();

    // Filter for pending tasks and sort by due date (or creation date)
    const pendingTasks = tasks
        .filter(t => t.status === 'Pending')
        .sort((a, b) => {
            // Sort by due date if available, otherwise creation date
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first for now, or use due date logic
        })
        .slice(0, 5); // Top 5

    return (
        <BentoCard
            size="tall"
            mode="parent"
            onPress={() => console.log('Navigate to Tasks')}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <ListTodo size={24} color={bentoPalette.brandPrimary} />
                    </View>
                    <Text style={styles.count}>{tasks.filter(t => t.status === 'Pending').length}</Text>
                </View>

                <Text style={styles.title}>Task Master</Text>

                <View style={styles.list}>
                    {pendingTasks.length > 0 ? (
                        pendingTasks.map((task) => (
                            <View key={task.id || task._id} style={styles.taskRow}>
                                <View style={styles.dot} />
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                    {task.value > 0 && (
                                        <Text style={styles.taskPoints}>{task.value} pts</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No active tasks</Text>
                    )}
                </View>
            </View>
        </BentoCard>
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
        marginBottom: spacing.md,
    },
    iconContainer: {
        backgroundColor: bentoPalette.brandLight + '20',
        padding: spacing.sm,
        borderRadius: 999,
    },
    count: {
        ...typography.widgetTitle,
        color: bentoPalette.textSecondary,
    },
    title: {
        ...typography.widgetTitle,
        marginBottom: spacing.md,
    },
    list: {
        gap: spacing.sm,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: bentoPalette.brandLight,
    },
    taskInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskTitle: {
        ...typography.body,
        fontSize: 13,
        flex: 1,
        color: bentoPalette.textSecondary,
    },
    taskPoints: {
        ...typography.caption,
        color: bentoPalette.brandPrimary,
        fontWeight: '600',
    },
    emptyText: {
        ...typography.caption,
        color: bentoPalette.textTertiary,
        fontStyle: 'italic',
    },
});
