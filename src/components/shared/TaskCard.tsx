import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import { themes } from '../../theme/colors';

interface TaskCardProps {
    task: any;
    onPress?: () => void;
    onComplete?: () => void;
}

export default function TaskCard({ task, onPress, onComplete }: TaskCardProps) {
    const theme = themes.calmLight;
    const isCompleted = task.status === 'Approved';
    const isPendingApproval = task.status === 'PendingApproval';
    const isPending = task.status === 'Pending';

    const handleCardPress = () => {
        if (isPending && onComplete) {
            onComplete();
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}
            onPress={handleCardPress}
            activeOpacity={0.7}
            disabled={isPendingApproval}
        >
            <View style={styles.checkContainer}>
                {isCompleted ? (
                    <CheckCircle size={24} color={theme.colors.signalSuccess} />
                ) : isPendingApproval ? (
                    <Circle size={24} color="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                ) : (
                    <Circle size={24} color={theme.colors.borderSubtle} />
                )}
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        { color: theme.colors.textPrimary },
                        isCompleted && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
                    ]}
                >
                    {task.title}
                </Text>
                <View style={styles.bottomRow}>
                    {task.pointsValue && (
                        <Text style={[styles.points, { color: theme.colors.actionPrimary }]}>
                            +{task.pointsValue} pts
                        </Text>
                    )}
                    {isPendingApproval && (
                        <Text style={[styles.statusBadge, { color: '#F59E0B' }]}>
                            ⏳ Waiting for approval
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    checkContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    points: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: '500',
        fontStyle: 'italic',
    },
});
